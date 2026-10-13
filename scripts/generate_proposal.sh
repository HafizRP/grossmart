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

# Opsi argumen --reset / -f untuk membersihkan sesi lama
if [ "${1:-}" = "--reset" ] || [ "${1:-}" = "-f" ] || [ "${1:-}" = "--force" ]; then
  echo "Membersihkan sesi generate lama..."
  rm -f "$SESSION_FILE"
  rm -rf "$SESSION_DIR"
  : > "$LOG_FILE"
  echo "Sesi di-reset."
fi

echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Memulai Pipeline Generate Proposal Grossmart (Sync via OMP & Render DOCX) ===" | tee -a "$LOG_FILE"

# 2. Validasi ketersediaan binary 'omp'
if ! command -v omp >/dev/null 2>&1; then
  echo "ERROR: Perintah 'omp' tidak ditemukan di PATH. Pastikan CLI omp telah terinstal." | tee -a "$LOG_FILE"
  exit 1
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

# 8. SINKRONISASI KODE KE MARKDOWN MENGGUNAKAN OMP (AI AGENT)
echo -e "\n--> [Fase 1/2] Menjalankan OMP untuk sinkronisasi kode riil ke berkas markdown proposal..." | tee -a "$LOG_FILE"

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

TMP_OUTPUT=$(mktemp)
omp --session-dir="$SESSION_DIR" $OMP_MODEL_FLAGS --auto-approve --mode json -p "$SYNC_PROMPT" 2>&1 | python3 "$SCRIPT_DIR/omp_stream_formatter.py" -s "$SESSION_DIR" -o "$TMP_OUTPUT" -l "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}
OUTPUT=$(cat "$TMP_OUTPUT" 2>/dev/null || echo "")
rm -f "$TMP_OUTPUT"

# 9. Fallback & Render Docs Assurance
if [ ! -s "$DOCX_FILE" ]; then
  echo -e "\n--> Menjalankan fallback generator dokumen Word..." | tee -a "$LOG_FILE"
  python3 "$SCRIPT_DIR/generate_final_docx.py" 2>&1 | tee -a "$LOG_FILE" || true
fi

# 10. Validasi Fisik & Integritas Internal Berkas DOCX Pasca-Generate
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
