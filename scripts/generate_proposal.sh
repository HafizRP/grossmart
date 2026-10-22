#!/usr/bin/env bash
set -u

START_TIME=$(date +%s)

# 1. Pastikan CWD selalu di root project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

TARGET_DIR="docs/Transformasi Digital"
DOCX_FILE="$TARGET_DIR/Proposal Transformasi Digital - Grossmart.docx"
TEMPLATE_FILE="$TARGET_DIR/Template proposal - Transformasi Digital.docx"
FIGURES_DIR="$TARGET_DIR/figures"
MD_FILE="$TARGET_DIR/PROPOSAL_FULL.md"
PLAN_FILE="$TARGET_DIR/PLAN-PROPOSAL.md"
LOG_FILE="$TARGET_DIR/generate.log"
SESSION_FILE="$TARGET_DIR/.generate_session"
SESSION_DIR="$TARGET_DIR/.omp_sessions_generate"

# Konfigurasi peran model keluarga Gemini 3.8 Flash (proporsional per beban kerja):
# - smol  : ag/gemini-3.8-flash-low    (inspeksi ringan, hitung kata, format)
# - model : ag/gemini-3.8-flash-medium (orkestrator loop sync & render)
# - plan  : ag/gemini-3.8-flash-medium (pencocokan struktur template)
# - slow  : ag/gemini-3.8-flash-high   (penalaran kritis & analitis mendalam)
export PI_SMOL_MODEL="ag/gemini-3.8-flash-low"
export PI_PLAN_MODEL="ag/gemini-3.8-flash-medium"
export PI_SLOW_MODEL="ag/gemini-3.8-flash-high"
OMP_MODEL_FLAGS="--model=ag/gemini-3.8-flash-medium --smol=ag/gemini-3.8-flash-low --plan=ag/gemini-3.8-flash-medium --slow=ag/gemini-3.8-flash-high"

format_elapsed_time() {
  local now=$(date +%s)
  local elapsed=$((now - START_TIME))
  local min=$((elapsed / 60))
  local sec=$((elapsed % 60))
  echo "${min}m ${sec}s"
}

strip_ansi() {
  sed -E $'s/\x1B\\[[0-9;]*[a-zA-Z]//g'
}

cleanup_on_interrupt() {
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] Proses generate dihentikan oleh pengguna (SIGINT/SIGTERM)." | tee -a "$LOG_FILE" 2>/dev/null || true
  exit 130
}
trap cleanup_on_interrupt INT TERM

AGENT_INPUT="${SYNC_AGENT:-${AGENT_TYPE:-auto}}"
RESET_FLAG=false
SYNC_ONLY=false

show_help() {
  cat << 'EOF'
Penggunaan:
  ./scripts/generate_proposal.sh [OPSI]
  ./scripts/sync.sh [OPSI]

Opsi:
  -a, --agent <tipe>   Pilih tipe agent untuk sinkronisasi.
                       Pilihan: auto (default), omp, claude, cursor, aider, gemini, codex, script
  --sync-only, -s      Hanya sinkronkan markdown (lewati kompilasi DOCX Word).
  -f, --reset, --force Bersihkan riwayat sesi dan berkas log sebelum mulai.
  -h, --help           Tampilkan panduan ini.

Variabel Lingkungan:
  SYNC_AGENT=<tipe>    Menentukan tipe agen (contoh: SYNC_AGENT=claude)
  AGENT_TYPE=<tipe>    Alternatif variabel lingkungan untuk tipe agen

Contoh Penggunaan:
  ./scripts/generate_proposal.sh                    # Auto-detect agen yang tersedia (omp/claude/cursor/aider/script)
  ./scripts/generate_proposal.sh --agent=claude     # Jalankan dengan Claude Code CLI
  ./scripts/generate_proposal.sh --agent=script     # Sinkronisasi deterministik cepat tanpa AI CLI
  ./scripts/sync.sh --agent=omp                     # Jalankan via OMP CLI
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent=*)
      AGENT_INPUT="${1#*=}"
      shift
      ;;
    -a|--agent)
      if [ -n "${2:-}" ] && [[ ! "$2" =~ ^- ]]; then
        AGENT_INPUT="$2"
        shift 2
      else
        echo "ERROR: Opsi $1 memerlukan nilai tipe agen." >&2
        exit 1
      fi
      ;;
    --sync-only|-s)
      SYNC_ONLY=true
      shift
      ;;
    --reset|-f|--force)
      RESET_FLAG=true
      shift
      ;;
    -h|--help)
      show_help
      ;;
    omp|claude|cursor|cursor-agent|aider|gemini|gemini-cli|codex|openai|script|python|direct|none|auto)
      AGENT_INPUT="$1"
      shift
      ;;
    *)
      echo "Peringatan: Argumen tidak dikenali '$1'. Gunakan -h untuk panduan." >&2
      shift
      ;;
  esac
done

# Opsi pembersihan sesi lama
if [ "$RESET_FLAG" = true ]; then
  echo "Membersihkan sesi generate lama..."
  rm -f "$SESSION_FILE"
  rm -rf "$SESSION_DIR"
  : > "$LOG_FILE"
  echo "Sesi di-reset."
fi

# 2. Resolusi dan Validasi Tipe Agen Sinkronisasi
RESOLVED_AGENT=""
AUTO_REASON=""
case "$AGENT_INPUT" in
  auto)
    if [ -n "${AGENT:-}" ] || [ -n "${GIT_INDEX_FILE:-}" ] || [ -n "${CI:-}" ]; then
      RESOLVED_AGENT="script"
      AUTO_REASON="sesi runtime agen/hook aktif - sinkronisasi langsung deterministik"
    elif command -v omp >/dev/null 2>&1; then
      RESOLVED_AGENT="omp"
      AUTO_REASON="binary omp ditemukan di PATH"
    elif command -v claude >/dev/null 2>&1; then
      RESOLVED_AGENT="claude"
      AUTO_REASON="binary claude ditemukan di PATH"
    elif command -v cursor-agent >/dev/null 2>&1; then
      RESOLVED_AGENT="cursor-agent"
      AUTO_REASON="binary cursor-agent ditemukan di PATH"
    elif command -v cursor >/dev/null 2>&1; then
      RESOLVED_AGENT="cursor"
      AUTO_REASON="binary cursor ditemukan di PATH"
    elif command -v aider >/dev/null 2>&1; then
      RESOLVED_AGENT="aider"
      AUTO_REASON="binary aider ditemukan di PATH"
    elif command -v gemini-cli >/dev/null 2>&1; then
      RESOLVED_AGENT="gemini-cli"
      AUTO_REASON="binary gemini-cli ditemukan di PATH"
    elif command -v gemini >/dev/null 2>&1; then
      RESOLVED_AGENT="gemini"
      AUTO_REASON="binary gemini ditemukan di PATH"
    elif command -v codex >/dev/null 2>&1; then
      RESOLVED_AGENT="codex"
      AUTO_REASON="binary codex ditemukan di PATH"
    else
      RESOLVED_AGENT="script"
      AUTO_REASON="engine Python deterministik (offline/fallback)"
    fi
    ;;
  omp)
    if ! command -v omp >/dev/null 2>&1; then
      echo "ERROR: Agen 'omp' dipilih tetapi binary 'omp' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
      echo "Saran: Install omp CLI atau gunakan agen lain: --agent=claude / --agent=script / --agent=auto" | tee -a "$LOG_FILE"
      exit 1
    fi
    RESOLVED_AGENT="omp"
    ;;
  claude)
    if ! command -v claude >/dev/null 2>&1; then
      echo "ERROR: Agen 'claude' dipilih tetapi binary 'claude' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
      echo "Saran: Install Claude Code CLI atau gunakan agen lain: --agent=omp / --agent=script / --agent=auto" | tee -a "$LOG_FILE"
      exit 1
    fi
    RESOLVED_AGENT="claude"
    ;;
  cursor|cursor-agent)
    if command -v cursor-agent >/dev/null 2>&1; then
      RESOLVED_AGENT="cursor-agent"
    elif command -v cursor >/dev/null 2>&1; then
      RESOLVED_AGENT="cursor"
    else
      echo "ERROR: Agen 'cursor' dipilih tetapi binary 'cursor-agent' / 'cursor' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
      exit 1
    fi
    ;;
  aider)
    if ! command -v aider >/dev/null 2>&1; then
      echo "ERROR: Agen 'aider' dipilih tetapi binary 'aider' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
      exit 1
    fi
    RESOLVED_AGENT="aider"
    ;;
  gemini|gemini-cli)
    if command -v gemini-cli >/dev/null 2>&1; then
      RESOLVED_AGENT="gemini-cli"
    elif command -v gemini >/dev/null 2>&1; then
      RESOLVED_AGENT="gemini"
    else
      echo "ERROR: Agen 'gemini' dipilih tetapi binary 'gemini' / 'gemini-cli' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
      exit 1
    fi
    ;;
  codex|openai)
    if command -v codex >/dev/null 2>&1; then
      RESOLVED_AGENT="codex"
    elif command -v openai >/dev/null 2>&1; then
      RESOLVED_AGENT="openai"
    else
      echo "ERROR: Agen 'codex'/'openai' dipilih tetapi binary tidak ditemukan di PATH." | tee -a "$LOG_FILE"
      exit 1
    fi
    ;;
  script|python|direct|none|builtin)
    RESOLVED_AGENT="script"
    ;;
  *)
    echo "ERROR: Tipe agen '$AGENT_INPUT' tidak dikenali." | tee -a "$LOG_FILE"
    echo "Pilihan yang didukung: auto, omp, claude, cursor, aider, gemini, codex, script" | tee -a "$LOG_FILE"
    exit 1
    ;;
esac

if [ -n "$AUTO_REASON" ]; then
  echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Memulai Pipeline Generate Proposal Grossmart [Auto-Detect Agent: $RESOLVED_AGENT ($AUTO_REASON) & Render DOCX] ===" | tee -a "$LOG_FILE"
else
  echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Memulai Pipeline Generate Proposal Grossmart [Sync Agent: $RESOLVED_AGENT & Render DOCX] ===" | tee -a "$LOG_FILE"
fi
# 3. Validasi python3 dan python-docx
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: Perintah 'python3' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
  exit 1
fi

if ! python3 -c "import docx" >/dev/null 2>&1; then
  echo "ERROR: Modul Python 'docx' (python-docx) tidak ditemukan." | tee -a "$LOG_FILE"
  exit 1
fi

# 4. Validasi keberadaan template acuan & naskah
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "ERROR: Berkas template acuan '$TEMPLATE_FILE' tidak ditemukan." | tee -a "$LOG_FILE"
  exit 1
fi

if [ ! -f "$MD_FILE" ]; then
  echo "ERROR: Berkas naskah markdown '$MD_FILE' tidak ditemukan." | tee -a "$LOG_FILE"
  exit 1
fi

# 5. Kelengkapan dan sinkronisasi gambar terbaru
REQUIRED_FIGURES=(
  "architecture.png"
  "user_flow.png"
  "screen_login.png"
  "screen_pos.png"
  "screen_shift_close.png"
  "screen_dashboard.png"
  "screen_products.png"
)

mkdir -p "$FIGURES_DIR" "$SESSION_DIR"

COVER_ICON="$FIGURES_DIR/cover_icon.png"
echo "--> Menyinkronkan dan mengekstrak icon cover terbaru dari template acuan..." | tee -a "$LOG_FILE"
python3 -c "
import zipfile
try:
    with zipfile.ZipFile('$TEMPLATE_FILE') as z:
        if 'word/media/image1.png' in z.namelist():
            with open('$COVER_ICON', 'wb') as f:
                f.write(z.read('word/media/image1.png'))
            print('  - cover_icon.png berhasil disinkronkan fresh dari template.')
except Exception as e:
    print(f'Peringatan: Gagal mengekstrak icon cover template: {e}')
" 2>&1 | tee -a "$LOG_FILE" || true

echo "--> Memuat dan memvalidasi aset visual terbaru (7 figur lampiran + cover):" | tee -a "$LOG_FILE"
for fig in "${REQUIRED_FIGURES[@]}"; do
  if [ ! -s "$FIGURES_DIR/$fig" ]; then
    echo "ERROR: Berkas gambar wajib '$FIGURES_DIR/$fig' tidak ditemukan atau kosong." | tee -a "$LOG_FILE"
    exit 1
  fi
  FIG_SIZE=$(wc -c < "$FIGURES_DIR/$fig" | tr -d ' ')
  FIG_MTIME=$(date -r "$FIGURES_DIR/$fig" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -c '%y' "$FIGURES_DIR/$fig" 2>/dev/null || echo "ok")
  echo "  [sync] $fig ($FIG_SIZE bytes, updated: $FIG_MTIME)" | tee -a "$LOG_FILE"
done

if [ -f "$COVER_ICON" ]; then
  COVER_SIZE=$(wc -c < "$COVER_ICON" | tr -d ' ')
  COVER_MTIME=$(date -r "$COVER_ICON" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -c '%y' "$COVER_ICON" 2>/dev/null || echo "ok")
  echo "  [sync] cover_icon.png ($COVER_SIZE bytes, updated: $COVER_MTIME)" | tee -a "$LOG_FILE"
fi

# 6. Cek berkas lock Word (~$*.docx)
if ls "$TARGET_DIR"/~\$*.docx 1>/dev/null 2>&1; then
  echo "PERINGATAN: Berkas Microsoft Word terdeteksi masih terbuka di folder '$TARGET_DIR'." | tee -a "$LOG_FILE"
  if [[ "$OSTYPE" == "darwin"* ]] && command -v osascript >/dev/null 2>&1; then
    osascript -e '
      try
        tell application "Microsoft Word"
          if exists document "Proposal Transformasi Digital - Grossmart.docx" then
            close document "Proposal Transformasi Digital - Grossmart.docx" saving no
          end if
        end tell
      end try
    ' 2>/dev/null || true
    sleep 0.5
  fi
  if ls "$TARGET_DIR"/~\$*.docx 1>/dev/null 2>&1; then
    echo "ERROR: Berkas Word masih terkunci (~$*.docx). Tutup Microsoft Word terlebih dahulu." | tee -a "$LOG_FILE"
    exit 1
  fi
fi

# 7. Snapshot backup otomatis berkas markdown
BACKUP_DIR="$TARGET_DIR/.backup/$(date '+%Y%m%d_%H%M%S')"
mkdir -p "$BACKUP_DIR"
cp "$TARGET_DIR"/*.md "$BACKUP_DIR/" 2>/dev/null || true
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Snapshot cadangan markdown diamankan ke '$BACKUP_DIR'." | tee -a "$LOG_FILE"

# 8. SINKRONISASI KODE KE MARKDOWN MENGGUNAKAN MULTI-AGENT
echo -e "\n--> [Fase 1/2] Menjalankan sinkronisasi kode riil ke berkas markdown proposal..." | tee -a "$LOG_FILE"
echo "    Agen aktif: $RESOLVED_AGENT (permintaan: $AGENT_INPUT)" | tee -a "$LOG_FILE"

SYNC_PROMPT="Lakukan sinkronisasi penuh status kode riil ke berkas proposal markdown di folder '$TARGET_DIR'.
Instruksi Wajib:
1. Analisis status riil codebase Grossmart:
   - database/migrations/ (hitung jumlah tabel domain vs framework Laravel).
   - app/Models/ (hitung model Eloquent riil).
   - app/Http/Controllers/ dan routes/web.php (fitur kasir POS, tutup shift buta, konsinyasi, repack stok, bon utang).
   - composer.json dan package.json (versi framework Laravel, React, Inertia, TypeScript).
2. Perbarui 'PROPOSAL_FULL.md' dan 'PLAN-PROPOSAL.md' menggunakan tool 'edit' agar:
   - Klaim arsitektur, jumlah tabel database, jumlah model Eloquent, dan modul fungsional 100% cocok dengan kode riil tanpa ada selisih (*no false claims*).
   - Istilah bahasa tetap manusiawi dan ramah warung.
   - Jangan ubah identitas tim dan mitra yang sudah tervalidasi.
3. Setelah sinkronisasi markdown selesai, jalankan skrip kompilasi dokumen Word:
   python3 scripts/generate_final_docx.py
   Pastikan berkas '$DOCX_FILE' terbuat utuh dengan gambar dan icon cover terbaru.
HANYA cetak satu baris persis string 'SYNC_COMPLETE' jika sinkronisasi markdown dan render Word selesai tanpa celah."

case "$RESOLVED_AGENT" in
  omp)
    mkdir -p "$SESSION_DIR"
    TMP_OUTPUT=$(mktemp)
    omp --session-dir="$SESSION_DIR" $OMP_MODEL_FLAGS --auto-approve --mode json -p "$SYNC_PROMPT" 2>&1 | python3 "$SCRIPT_DIR/omp_stream_formatter.py" -s "$SESSION_DIR" -o "$TMP_OUTPUT" -l "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
    OUTPUT=$(cat "$TMP_OUTPUT" 2>/dev/null || echo "")
    rm -f "$TMP_OUTPUT"
    ;;
  claude)
    echo "  [claude] Mengirim prompt sinkronisasi ke Claude Code CLI..." | tee -a "$LOG_FILE"
    claude -p "$SYNC_PROMPT" --dangerously-skip-permissions 2>&1 | tee -a "$LOG_FILE" || claude -p "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  cursor-agent)
    echo "  [cursor-agent] Mengirim prompt sinkronisasi ke Cursor Agent..." | tee -a "$LOG_FILE"
    cursor-agent -p "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  cursor)
    echo "  [cursor] Mengirim prompt sinkronisasi ke Cursor CLI..." | tee -a "$LOG_FILE"
    cursor --print "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  aider)
    echo "  [aider] Mengirim prompt sinkronisasi ke Aider..." | tee -a "$LOG_FILE"
    aider --message "$SYNC_PROMPT" --yes-always --no-git 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  gemini-cli)
    echo "  [gemini-cli] Mengirim prompt sinkronisasi ke Gemini CLI..." | tee -a "$LOG_FILE"
    gemini-cli prompt "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  gemini)
    echo "  [gemini] Mengirim prompt sinkronisasi ke Gemini..." | tee -a "$LOG_FILE"
    gemini "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  codex)
    echo "  [codex] Mengirim prompt sinkronisasi ke Codex..." | tee -a "$LOG_FILE"
    codex exec "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  openai)
    echo "  [openai] Mengirim prompt sinkronisasi ke OpenAI CLI..." | tee -a "$LOG_FILE"
    openai api chat.completions.create -m gpt-4o -p "$SYNC_PROMPT" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
  script)
    echo "  [script] Menjalankan engine sinkronisasi Python deterministik..." | tee -a "$LOG_FILE"
    python3 "$SCRIPT_DIR/sync_code_to_proposal.py" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    ;;
esac

# 9. Rekonsiliasi & Penyelarasan Deterministik Pasca-Eksekusi Agen
echo "--> Memverifikasi dan menyelaraskan metrik deterministik kode (models, tables, versions)..." | tee -a "$LOG_FILE"
python3 "$SCRIPT_DIR/sync_code_to_proposal.py" 2>&1 | tee -a "$LOG_FILE"

# 10. Jika mode --sync-only aktif, lewati kompilasi DOCX
if [ "$SYNC_ONLY" = true ]; then
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] SUKSES: Sinkronisasi markdown proposal selesai (Mode --sync-only aktif, kompilasi DOCX dilewati)." | tee -a "$LOG_FILE"
  echo "Durasi sinkronisasi: $(format_elapsed_time)." | tee -a "$LOG_FILE"
  exit 0
fi

# 11. Render Dokumen Word (.docx)
echo -e "\n--> [Fase 2/2] Mengompilasi dokumen Word (.docx) dari naskah proposal terbaru..." | tee -a "$LOG_FILE"
python3 "$SCRIPT_DIR/generate_final_docx.py" 2>&1 | tee -a "$LOG_FILE" || true
# 12. Validasi Fisik & Integritas Internal Berkas DOCX Pasca-Generate
if [ -s "$DOCX_FILE" ]; then
  FILE_SIZE=$(wc -c < "$DOCX_FILE" | tr -d ' ')
  TOTAL_DURATION=$(format_elapsed_time)

  DOCX_CHECK=$(python3 -c "
import docx, sys
try:
    doc = docx.Document('$DOCX_FILE')
    print(f'Struktur valid: {len(doc.paragraphs)} paragraf, {len(doc.tables)} tabel.')
except Exception as e:
    print(f'CORRUPT: {e}', file=sys.stderr)
    sys.exit(1)
" 2>&1)
  DOCX_CHECK_EXIT=$?

  if [ $DOCX_CHECK_EXIT -eq 0 ]; then
    echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] SUKSES: Berkas '$DOCX_FILE' terverifikasi utuh ($FILE_SIZE bytes)." | tee -a "$LOG_FILE"
    echo "$DOCX_CHECK" | tee -a "$LOG_FILE"
    echo "Total durasi generate: $TOTAL_DURATION." | tee -a "$LOG_FILE"
    exit 0
  else
    echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] ERROR INTEGRITAS: Berkas DOCX rusak atau tidak valid." | tee -a "$LOG_FILE"
    echo "$DOCX_CHECK" | tee -a "$LOG_FILE"
    exit 1
  fi
else
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Berkas '$DOCX_FILE' gagal dibuat atau berukuran 0 byte." | tee -a "$LOG_FILE"
  exit 1
fi
