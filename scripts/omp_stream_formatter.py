#!/usr/bin/env python3
import sys
import os
import glob
import time
import json
import argparse
import threading
import re

# ANSI escape codes for clean terminal styling
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
MAGENTA = "\033[35m"
RED = "\033[31m"

def start_subagent_watcher(session_dir, log_fn, stop_event):
    if not session_dir or not os.path.exists(session_dir):
        return None

    def worker():
        file_positions = {}
        while not stop_event.is_set():
            time.sleep(0.3)
            # Subagent JSONL disimpan di subfolder sesi: session_dir/*/*.jsonl
            pattern = os.path.join(session_dir, "*", "*.jsonl")
            pattern_sub = os.path.join(session_dir, "*", "*", "*.jsonl")
            candidates = glob.glob(pattern) + glob.glob(pattern_sub)
            for fpath in candidates:
                if fpath.endswith(".lock.os"):
                    continue
                if fpath not in file_positions:
                    # Mulai dari awal file agar event subagent baru terbaca utuh
                    file_positions[fpath] = 0

                try:
                    size = os.path.getsize(fpath)
                    if size > file_positions[fpath]:
                        with open(fpath, "r", encoding="utf-8", errors="replace") as fp:
                            fp.seek(file_positions[fpath])
                            for line in fp:
                                line = line.strip()
                                if not line:
                                    continue
                                try:
                                    ev = json.loads(line)
                                    data = ev.get("data", ev)
                                    tool_name = data.get("toolName")
                                    if tool_name and tool_name not in ("wait", "task"):
                                        intent = data.get("intent", "")
                                        args = data.get("args", {})
                                        if tool_name == "yield":
                                            desc = intent or "Menyerahkan laporan hasil audit ke parent agent"
                                            icon = f"{GREEN}🏁 [yield]{RESET}"
                                        else:
                                            desc = intent or (str(args) if args else "")
                                            icon = f"{YELLOW}⚙ [{tool_name}]{RESET}"
                                        if len(desc) > 100:
                                            desc = desc[:97] + "..."
                                        agent_name = os.path.basename(fpath).replace(".jsonl", "")
                                        log_fn(f"  {MAGENTA}🤖 [{agent_name}]{RESET} {icon} {CYAN}{desc}{RESET}")
                                    elif ev.get("type") == "custom" and ev.get("customType") == "session_exit":
                                        agent_name = os.path.basename(fpath).replace(".jsonl", "")
                                        log_fn(f"  {MAGENTA}🤖 [{agent_name}]{RESET} {GREEN}✔ Analisis tuntas.{RESET}")
                                except Exception:
                                    pass
                            file_positions[fpath] = fp.tell()
                except Exception:
                    pass

    t = threading.Thread(target=worker, daemon=True)
    t.start()
    return t

def main():
    parser = argparse.ArgumentParser(description="Format omp --mode json stream to human-readable terminal output")
    parser.add_argument("--output-file", "-o", help="File to save the final assistant text response")
    parser.add_argument("--log-file", "-l", help="File to append logs")
    parser.add_argument("--session-dir", "-s", help="Directory containing OMP sessions to watch subagents")
    args = parser.parse_args()

    out_file = open(args.output_file, "w", encoding="utf-8") if args.output_file else None
    log_file = open(args.log_file, "a", encoding="utf-8") if args.log_file else None

    def log(msg, raw=False):
        if not raw:
            print(msg, flush=True)
        else:
            sys.stdout.write(msg)
            sys.stdout.flush()
        if log_file:
            clean = re.sub(r'\x1B\[[0-9;]*[a-zA-Z]', '', msg)
            log_file.write(clean + ("\n" if not raw else ""))
            log_file.flush()

    stop_event = threading.Event()
    if args.session_dir:
        start_subagent_watcher(args.session_dir, log, stop_event)

    assistant_text_accum = []
    in_text_stream = False
    last_wait_time = 0

    try:
        for raw_line in sys.stdin:
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                event = json.loads(raw_line)
            except json.JSONDecodeError:
                log(f"{DIM}{raw_line}{RESET}")
                continue

            etype = event.get("type")

            # 1. Tool execution start di parent agent
            if etype in ("tool_execution_start", "custom") and (event.get("customType") == "tool_execution_start" or etype == "tool_execution_start"):
                data = event.get("data", event)
                tool_name = data.get("toolName", "unknown")
                intent = data.get("intent", "")
                targs = data.get("args", {})

                if tool_name == "wait":
                    now = time.time()
                    if now - last_wait_time > 4:
                        log(f"{YELLOW}⏳ [wait]{RESET} {CYAN}Menunggu subagents menyelesaikan analisis/perbaikan...{RESET}")
                        last_wait_time = now
                    continue

                desc = intent if intent else str(targs)
                if len(desc) > 120:
                    desc = desc[:117] + "..."
                log(f"{BOLD}{YELLOW}⚙ [{tool_name}]{RESET} {CYAN}{desc}{RESET}")

            # 2. Tool result (terutama task / subagent & wait)
            elif etype == "message" and event.get("message", {}).get("role") == "toolResult":
                msg = event.get("message", {})
                tname = msg.get("toolName", "")
                contents = msg.get("content", [])
                for c in contents:
                    text = c.get("text", "")
                    if tname == "task" and "Spawned" in text:
                        for subline in text.splitlines():
                            if subline.strip():
                                log(f"  {MAGENTA}↳ {subline.strip()}{RESET}")
                    elif tname == "wait" and "Completed" in text:
                        for subline in text.splitlines():
                            if "completed" in subline.lower() or "###" in subline:
                                log(f"  {GREEN}✔ {subline.strip()}{RESET}")

            # 3. Streaming assistant text & thinking preview
            elif etype == "message_update":
                ame = event.get("assistantMessageEvent", {})
                atype = ame.get("type")
                if atype == "text_delta":
                    delta = ame.get("delta", "")
                    if not in_text_stream:
                        log(f"\n{BOLD}{GREEN}--> Respons OMP:{RESET}\n")
                        in_text_stream = True
                    log(delta, raw=True)
                    assistant_text_accum.append(delta)
                    if out_file:
                        out_file.write(delta)
                        out_file.flush()
                elif atype == "thinking_start":
                    log(f"{DIM}💭 [analisis evaluasi dimulai...]{RESET}")

            # 4. Tangani error dari stream
            elif event.get("errorMessage"):
                err_msg = event.get("errorMessage")
                log(f"{RED}✖ [Error OMP]: {err_msg}{RESET}")
                if out_file:
                    out_file.write(f"\nERROR: {err_msg}\n")

            # 5. Fallback extract text jika text_delta terlewat
            elif etype == "message_end" and event.get("message", {}).get("role") == "assistant":
                msg = event.get("message", {})
                for c in msg.get("content", []):
                    if c.get("type") == "text":
                        full_text = c.get("text", "")
                        if not assistant_text_accum and full_text:
                            log(f"\n{BOLD}{GREEN}--> Respons OMP:{RESET}\n{full_text}\n")
                            assistant_text_accum.append(full_text)
                            if out_file:
                                out_file.write(full_text)
                                out_file.flush()

            # 6. Turn end / Agent end
            elif etype == "turn_end":
                if in_text_stream:
                    log("\n")
                    in_text_stream = False

    finally:
        stop_event.set()
        if out_file:
            out_file.close()
        if log_file:
            log_file.close()

if __name__ == "__main__":
    main()
