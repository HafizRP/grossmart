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
LOG_FILE="$TARGET_DIR/audit.log"
STATE_FILE="$TARGET_DIR/.audit_state"

format_elapsed_time() {
  local now=$(date +%s)
  local elapsed=$((now - START_TIME))
  local min=$((elapsed / 60))
  local sec=$((elapsed % 60))
  echo "${min}m ${sec}s"
}

# 2. Trap sinyal interupsi (Ctrl+C / SIGTERM)
cleanup_on_interrupt() {
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] Validasi dihentikan oleh pengguna (SIGINT/SIGTERM)." | tee -a "$LOG_FILE" 2>/dev/null || true
  exit 130
}
trap cleanup_on_interrupt INT TERM

# 3. Opsi argumen --reset / -f
if [ "${1:-}" = "--reset" ] || [ "${1:-}" = "-f" ] || [ "${1:-}" = "--force" ]; then
  echo "Membersihkan state validasi lama..."
  rm -f "$STATE_FILE"
  : > "$LOG_FILE"
  echo "State di-reset."
fi

echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Memulai Audit Validasi Proposal Grossmart ===" | tee -a "$LOG_FILE"

# 4. Validasi ketersediaan python3 dan modul python-docx
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: Perintah 'python3' tidak ditemukan di PATH." | tee -a "$LOG_FILE"
  exit 1
fi

if ! python3 -c "import docx" >/dev/null 2>&1; then
  echo "ERROR: Modul Python 'docx' (python-docx) tidak ditemukan." | tee -a "$LOG_FILE"
  exit 1
fi

# 5. Validasi keberadaan template acuan
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "ERROR: Berkas acuan '$TEMPLATE_FILE' tidak ditemukan." | tee -a "$LOG_FILE"
  exit 1
fi

# 6. Validasi kelengkapan 7 gambar pendukung di folder figures/
REQUIRED_FIGURES=(
  "architecture.png"
  "user_flow.png"
  "screen_login.png"
  "screen_pos.png"
  "screen_shift_close.png"
  "screen_dashboard.png"
  "screen_products.png"
)

for fig in "${REQUIRED_FIGURES[@]}"; do
  if [ ! -f "$FIGURES_DIR/$fig" ]; then
    echo "ERROR: Berkas gambar wajib '$FIGURES_DIR/$fig' tidak ditemukan." | tee -a "$LOG_FILE"
    exit 1
  fi
done

# 7. Cek berkas lock Word (~$*.docx)
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

# 8. JALANKAN VALIDATOR KEPATUHAN (VALIDASI MURNI)
echo "--> Menjalankan engine validasi (kode vs markdown vs template vs docx)..." | tee -a "$LOG_FILE"
TMP_OUT=$(mktemp)
python3 "$SCRIPT_DIR/validate_proposal.py" > "$TMP_OUT" 2>&1
VAL_EXIT=$?
cat "$TMP_OUT" | tee -a "$LOG_FILE"
rm -f "$TMP_OUT"

if [ $VAL_EXIT -ne 0 ]; then
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] VALIDASI GAGAL (Kode keluar: $VAL_EXIT)." | tee -a "$LOG_FILE"
  echo "Jalankan './scripts/generate_proposal.sh' terlebih dahulu untuk menyinkronkan kode dan merender dokumen." | tee -a "$LOG_FILE"
  exit 1
fi

echo "AUDIT_PASSED" > "$STATE_FILE"
echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] STATUS_CLEAR: Audit proposal tuntas dan 100% valid." | tee -a "$LOG_FILE"
echo "Durasi validasi: $(format_elapsed_time)." | tee -a "$LOG_FILE"
exit 0
