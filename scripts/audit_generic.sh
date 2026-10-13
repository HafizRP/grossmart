#!/usr/bin/env bash
set -u

START_TIME=$(date +%s)

# 1. Pastikan CWD selalu di root project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Bantuan / Cara Pakai
show_help() {
  cat << EOF
Penggunaan:
  ./scripts/audit_generic.sh <nama_tugas> "<instruksi_audit>" ["<challenge_skeptis>"] [--reset]

Contoh:
  ./scripts/audit_generic.sh database "Audit seluruh migration dan indexing database."
  ./scripts/audit_generic.sh frontend "Periksa accessibility WCAG dan styling tombol." "" --reset

Argumen:
  <nama_tugas>         Nama unik untuk tugas audit (misal: security, database, ui)
  <instruksi_audit>    Prompt instruksi audit lengkap yang dikirim ke omp
  <challenge_skeptis>  (Opsional) Prompt tantangan untuk iterasi berikutnya (default auto-generated)
  --reset / -f         Hapus riwayat sesi lama untuk nama tugas ini
EOF
  exit 0
}

if [ $# -lt 2 ]; then
  show_help
fi

TASK_NAME="$1"
INITIAL_PROMPT="$2"
CUSTOM_CHALLENGE="${3:-}"

# Cek flag reset di argumen mana pun
RESET_FLAG=false
for arg in "$@"; do
  if [ "$arg" = "--reset" ] || [ "$arg" = "-f" ] || [ "$arg" = "--force" ]; then
    RESET_FLAG=true
  fi
done

LOG_DIR=".audit_logs"
LOG_FILE="$LOG_DIR/${TASK_NAME}_audit.log"
STATE_FILE="$LOG_DIR/.${TASK_NAME}_state"
SESSION_FILE="$LOG_DIR/.${TASK_NAME}_session"
SESSION_DIR="$LOG_DIR/.omp_sessions_${TASK_NAME}"

# Konfigurasi peran model keluarga Gemini 3.8 Flash:
export PI_SMOL_MODEL="ag/gemini-3.8-flash-low"
export PI_PLAN_MODEL="ag/gemini-3.8-flash-medium"
export PI_SLOW_MODEL="ag/gemini-3.8-flash-high"
OMP_MODEL_FLAGS="--model=ag/gemini-3.8-flash-medium --smol=ag/gemini-3.8-flash-low --plan=ag/gemini-3.8-flash-medium --slow=ag/gemini-3.8-flash-high"

mkdir -p "$LOG_DIR" "$SESSION_DIR"

# Fungsi hitung durasi berjalan
format_elapsed_time() {
  local now=$(date +%s)
  local elapsed=$((now - START_TIME))
  local min=$((elapsed / 60))
  local sec=$((elapsed % 60))
  echo "${min}m ${sec}s"
}

# Fungsi pembersih ANSI escape code
strip_ansi() {
  sed -E $'s/\x1B\\[[0-9;]*[a-zA-Z]//g'
}

# Trap sinyal interupsi
cleanup_on_interrupt() {
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] Audit '$TASK_NAME' dihentikan pengguna. Durasi: $(format_elapsed_time)." | tee -a "$LOG_FILE" 2>/dev/null || true
  exit 130
}
trap cleanup_on_interrupt INT TERM

# Reset state jika diminta
if [ "$RESET_FLAG" = true ]; then
  echo "Membersihkan riwayat audit '$TASK_NAME'..."
  rm -f "$STATE_FILE" "$SESSION_FILE"
  rm -rf "$SESSION_DIR"
  : > "$LOG_FILE"
  echo "State '$TASK_NAME' di-reset."
fi

# Validasi binary omp
if ! command -v omp >/dev/null 2>&1; then
  echo "ERROR: Perintah 'omp' tidak ditemukan di PATH."
  exit 1
fi

# Cek apakah sudah lulus
if [ -f "$STATE_FILE" ] && grep -q "AUDIT_PASSED" "$STATE_FILE"; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Audit '$TASK_NAME' sudah tuntas sebelumnya (AUDIT_PASSED)." | tee -a "$LOG_FILE"
  echo "Gunakan argumen '--reset' untuk menjalankan ulang."
  exit 0
fi

# Sesi Lanjutan atau Sesi Baru
if [ -f "$SESSION_FILE" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Melanjutkan sesi audit '$TASK_NAME' dari eksekusi sebelumnya..." | tee -a "$LOG_FILE"
  FIRST_RUN=false
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Memulai sesi audit baru untuk '$TASK_NAME'..." | tee -a "$LOG_FILE"
  FIRST_RUN=true
  touch "$SESSION_FILE"
fi

ROUND=1
CONSECUTIVE_FAILURES=0
MAX_FAILURES=5

FULL_INITIAL_PROMPT="$INITIAL_PROMPT

ATURAN REKURSIF:
- Jika spawn subagents lewat tool 'task', wajib gunakan keluarga Gemini 3.8 Flash (model='ag/gemini-3.8-flash-low' tugas ringan, model='ag/gemini-3.8-flash-medium' analisis, model='ag/gemini-3.8-flash-high' penalaran kritis).
- Periksa secara mendalam. Jika ada celah, bug, atau kekurangan, langsung perbaiki menggunakan tool terkait (edit/write/bash).
- HANYA cetak satu baris persis 'STATUS_CLEAR' jika dan hanya jika seluruh aspek terverifikasi 100% bersih tanpa celah tersisa. Dilarang mencetak kata STATUS_CLEAR dalam kalimat penjelasan biasa."

DEFAULT_CHALLENGE="Yakin lu? Posisikan diri sebagai reviewer skeptis terberat. Periksa ulang hasil tugas '$TASK_NAME' dari sudut pandang edge cases, kelemahan tersembunyi, performa, dan konsistensi. Jika masih ada celah sekecil apa pun, langsung perbaiki. HANYA cetak satu baris persis 'STATUS_CLEAR' jika sudah 100% yakin tidak ada cacat tersisa."
FINAL_CHALLENGE="${CUSTOM_CHALLENGE:-$DEFAULT_CHALLENGE}"

while true; do
  echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Iterasi Audit '$TASK_NAME' $ROUND (Berjalan: $(format_elapsed_time)) ===" | tee -a "$LOG_FILE"

  if [ "$FIRST_RUN" = true ]; then
    echo "--> Mengirim prompt audit awal..."
    TMP_OUTPUT=$(mktemp)
    omp --session-dir="$SESSION_DIR" $OMP_MODEL_FLAGS --auto-approve --mode json -p "$FULL_INITIAL_PROMPT" 2>&1 | python3 "$SCRIPT_DIR/omp_stream_formatter.py" -s "$SESSION_DIR" -o "$TMP_OUTPUT" -l "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
    OUTPUT=$(cat "$TMP_OUTPUT")
    rm -f "$TMP_OUTPUT"
    FIRST_RUN=false
  else
    echo "--> Mengirim challenge skeptis..."
    TMP_OUTPUT=$(mktemp)
    omp --session-dir="$SESSION_DIR" $OMP_MODEL_FLAGS --auto-approve --mode json -c -p "$FINAL_CHALLENGE" 2>&1 | python3 "$SCRIPT_DIR/omp_stream_formatter.py" -s "$SESSION_DIR" -o "$TMP_OUTPUT" -l "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
    OUTPUT=$(cat "$TMP_OUTPUT")
    rm -f "$TMP_OUTPUT"
  fi

  # Deteksi kegagalan eksekusi fatal
  if [ $EXIT_CODE -ne 0 ] || [ -z "$(echo "$OUTPUT" | tr -d '[:space:]')" ]; then
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
    echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] PERINGATAN: Eksekusi omp gagal ($CONSECUTIVE_FAILURES/$MAX_FAILURES). Kode keluar: $EXIT_CODE" | tee -a "$LOG_FILE"

    if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
      echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] FATAL: Terjadi $MAX_FAILURES kegagalan beruntun. Audit dihentikan." | tee -a "$LOG_FILE"
      exit 1
    fi
    sleep 5
    continue
  else
    CONSECUTIVE_FAILURES=0
  fi

  # Bersihkan kode ANSI sebelum pengecekan regex
  CLEAN_OUTPUT=$(echo "$OUTPUT" | strip_ansi)

  if echo "$CLEAN_OUTPUT" | grep -qE '^[[:space:]]*STATUS_CLEAR[[:space:]]*$'; then
    TOTAL_DURATION=$(format_elapsed_time)
    echo -e "\n\a[$(date '+%Y-%m-%d %H:%M:%S')] SUKSES BESAR: Audit '$TASK_NAME' lolos 100% di iterasi ke-$ROUND." | tee -a "$LOG_FILE"
    echo "Total durasi pengerjaan: $TOTAL_DURATION." | tee -a "$LOG_FILE"
    echo "AUDIT_PASSED" > "$STATE_FILE"

    # Ringkasan perubahan git
    if command -v git >/dev/null 2>&1; then
      echo -e "\nRingkasan perubahan berkas:" | tee -a "$LOG_FILE"
      git diff --stat 2>/dev/null | tee -a "$LOG_FILE" || true
    fi

    # Notifikasi native macOS
    if command -v osascript >/dev/null 2>&1; then
      osascript -e "display notification \"Audit '$TASK_NAME' tuntas 100% bersih!\" with title \"Audit Generic Selesai\"" 2>/dev/null || true
    fi
    exit 0
  fi

  ROUND=$((ROUND + 1))
  sleep 2
done
