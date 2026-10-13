#!/usr/bin/env bash
set -u

START_TIME=$(date +%s)

# 1. Pastikan CWD selalu di root project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

LOG_DIR=".audit_logs"
LOG_FILE="$LOG_DIR/codebase_audit.log"
STATE_FILE="$LOG_DIR/.codebase_state"
SESSION_FILE="$LOG_DIR/.codebase_session"
SESSION_DIR="$LOG_DIR/.omp_sessions_codebase"

# Konfigurasi peran model keluarga Gemini 3.8 Flash (proporsional per beban kerja):
# - smol  : ag/gemini-3.8-flash-low    (subagent QA/Tests & verifikasi cepat)
# - model : ag/gemini-3.8-flash-medium (orkestrator loop audit codebase & frontend/ergonomi)
# - plan  : ag/gemini-3.8-flash-medium (analisis arsitektur PLAN.md)
# - slow  : ag/gemini-3.8-flash-high   (subagent backend/keamanan & challenge skeptis)
export PI_SMOL_MODEL="ag/gemini-3.8-flash-low"
export PI_PLAN_MODEL="ag/gemini-3.8-flash-medium"
export PI_SLOW_MODEL="ag/gemini-3.8-flash-high"
OMP_MODEL_FLAGS="--model=ag/gemini-3.8-flash-medium --smol=ag/gemini-3.8-flash-low --plan=ag/gemini-3.8-flash-medium --slow=ag/gemini-3.8-flash-high"

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

# 2. Trap sinyal interupsi (Ctrl+C / SIGTERM)
cleanup_on_interrupt() {
  echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] Audit codebase dihentikan oleh pengguna (SIGINT/SIGTERM). Durasi: $(format_elapsed_time)." | tee -a "$LOG_FILE" 2>/dev/null || true
  exit 130
}
trap cleanup_on_interrupt INT TERM

# 3. Opsi argumen --reset / -f untuk membersihkan riwayat lama
if [ "${1:-}" = "--reset" ] || [ "${1:-}" = "-f" ] || [ "${1:-}" = "--force" ]; then
  echo "Membersihkan riwayat audit codebase lama..."
  rm -f "$STATE_FILE" "$SESSION_FILE"
  rm -rf "$SESSION_DIR"
  : > "$LOG_FILE"
  echo "State di-reset. Audit codebase akan dimulai dari awal."
fi

# 4. Validasi ketersediaan binary 'omp'
if ! command -v omp >/dev/null 2>&1; then
  echo "ERROR: Perintah 'omp' tidak ditemukan di PATH. Pastikan CLI omp telah terinstal dan terdaftar di shell PATH."
  exit 1
fi

mkdir -p "$LOG_DIR" "$SESSION_DIR"

# 5. Cek apakah audit sebelumnya sudah tuntas (status tersimpan)
if [ -f "$STATE_FILE" ] && grep -q "AUDIT_PASSED" "$STATE_FILE"; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Riwayat audit codebase ditemukan: Status sebelumnya AUDIT_PASSED (100% bersih)." | tee -a "$LOG_FILE"
  echo "Codebase sudah tervalidasi bersih. Gunakan './scripts/audit_codebase.sh --reset' jika ingin audit ulang." | tee -a "$LOG_FILE"
  exit 0
fi

# 6. Sesi Lanjutan atau Sesi Baru
if [ -f "$SESSION_FILE" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Melanjutkan sesi audit codebase dari eksekusi sebelumnya..." | tee -a "$LOG_FILE"
  FIRST_RUN=false
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Memulai sesi audit codebase baru..." | tee -a "$LOG_FILE"
  FIRST_RUN=true
  touch "$SESSION_FILE"
fi

ROUND=1
CONSECUTIVE_FAILURES=0
MAX_FAILURES=5

while true; do
  echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Iterasi Audit Codebase $ROUND (Berjalan: $(format_elapsed_time)) ===" | tee -a "$LOG_FILE"

  if [ "$FIRST_RUN" = true ]; then
    PROMPT="Lakukan audit arsitektur, keamanan, dan kualitas kode menyeluruh pada proyek Grossmart (Laravel 11 + React Inertia + TypeScript).
Gunakan acuan 'PLAN.md' sebagai blueprint implementasi.
Wajib spawn subagents paralel lewat tool 'task' untuk 4 bidang independen:
1. Subagent Backend & Database:
   - Audit 31 migration files di database/migrations/ dan routes/web.php.
   - Cek integritas relasi foreign key, tipe data uang (integer cents/rupiah), indexing, dan transaksi database (ACID).
2. Subagent Frontend & Ergonomi Lansia:
   - Audit resources/js/Pages/ (POS, ShiftClose, Dashboard, Products).
   - Pastikan kepatuhan desain ramah lansia: target sentuh minimal 56px, tipografi 16px-44px, tombol uang pas, umpan balik audio, dan 100% Bahasa Indonesia ramah warung tanpa istilah teknis asing.
3. Subagent Keamanan Finansial & OWASP:
   - Audit alur Tutup Kasir Buta (Blind Cash-Up), Cash Drop, otorisasi PIN pembatalan transaksi, proteksi harga modal (HPP) server-side, CSRF, dan sanitasi input.
4. Subagent Pengujian & Keandalan (Tests & QA):
   - Periksa kelengkapan skenario pengujian di tests/Feature/ dan tests/Unit/.
   - Pastikan tidak ada celah logika atau penanganan error gantung saat koneksi server lokal bermasalah.

ATURAN AUDIT & SUBAGENTS:
- Pada tool 'task', gunakan keluarga Gemini 3.8 Flash sesuai kompleksitas:
  * Subagent Pengujian & Keandalan (Tests & QA): model="ag/gemini-3.8-flash-low"
  * Subagent Frontend & Ergonomi Lansia: model="ag/gemini-3.8-flash-medium"
  * Subagent Backend & Database: model="ag/gemini-3.8-flash-medium"
  * Subagent Keamanan Finansial & OWASP: model="ag/gemini-3.8-flash-high"
- Jika menemukan bug, celah logika, inkonsistensi tipe data, atau kekurangan implementasi, LANGSUNG perbaiki kode sumber menggunakan tool 'edit'/'write'.
- HANYA cetak satu baris string 'STATUS_CLEAR' persis jika dan hanya jika seluruh 4 bidang terverifikasi 100% bersih tanpa celah. Dilarang mencetak kata STATUS_CLEAR dalam kalimat penjelasan biasa."

    echo "--> Mengirim instruksi audit codebase awal (subagents menganalisis paralel)..."
    TMP_OUTPUT=$(mktemp)
    omp --session-dir="$SESSION_DIR" $OMP_MODEL_FLAGS --auto-approve --mode json -p "$PROMPT" 2>&1 | python3 "$SCRIPT_DIR/omp_stream_formatter.py" -s "$SESSION_DIR" -o "$TMP_OUTPUT" -l "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
    OUTPUT=$(cat "$TMP_OUTPUT")
    rm -f "$TMP_OUTPUT"
    FIRST_RUN=false
  else
    CHALLENGE="Yakin lu? Posisikan diri sebagai Lead Software Architect & Principal Security Engineer yang sangat skeptis.
Perintahkan subagents memeriksa ulang codebase Grossmart secara mendalam:
- Apakah ada potensi race condition / concurrency issue pada pengurangan stok dan pencatatan kas laci?
- Apakah ada kebocoran harga modal (HPP) ke antarmuka kasir?
- Apakah ada teks/label berbahasa Inggris yang belum dilokalisasi ke Bahasa Indonesia warung?
- Apakah ada TypeScript compilation errors atau unhandled exceptions di controller/frontend?
- Apakah kontrol transaksi (DB::transaction) sudah membungkus seluruh mutasi finansial?

ATURAN SUBAGENTS:
- Pada tool 'task', gunakan keluarga Gemini 3.8 Flash proporsional:
  * Cek testing / error logs / types: model="ag/gemini-3.8-flash-low"
  * Cek controllers / localized strings: model="ag/gemini-3.8-flash-medium"
  * Cek race conditions / security / DB transaction: model="ag/gemini-3.8-flash-high"

Jika masih ada kelemahan atau celah, LANGSUNG perbaiki berkas terkait.
HANYA cetak satu baris persis 'STATUS_CLEAR' jika tidak ada lagi satu pun bug atau celah tersisa. Jika masih ada perbaikan, jelaskan apa yang diperbaiki dan JANGAN cetak kata itu."

    echo "--> Mengirim challenge skeptis codebase (subagents mengecek ulang)..."
    TMP_OUTPUT=$(mktemp)
    omp --session-dir="$SESSION_DIR" $OMP_MODEL_FLAGS --auto-approve --mode json -c -p "$CHALLENGE" 2>&1 | python3 "$SCRIPT_DIR/omp_stream_formatter.py" -s "$SESSION_DIR" -o "$TMP_OUTPUT" -l "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
    OUTPUT=$(cat "$TMP_OUTPUT")
    rm -f "$TMP_OUTPUT"
  fi

  # Deteksi kegagalan eksekusi fatal
  if [ $EXIT_CODE -ne 0 ] || [ -z "$(echo "$OUTPUT" | tr -d '[:space:]')" ]; then
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
    echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] PERINGATAN: Eksekusi omp gagal ($CONSECUTIVE_FAILURES/$MAX_FAILURES). Kode keluar: $EXIT_CODE" | tee -a "$LOG_FILE"

    if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
      echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] FATAL: Terjadi $MAX_FAILURES kegagalan beruntun. Audit dihentikan untuk melindungi sistem." | tee -a "$LOG_FILE"
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
    echo -e "\n\a[$(date '+%Y-%m-%d %H:%M:%S')] SUKSES BESAR: Audit codebase lolos 100% di iterasi ke-$ROUND." | tee -a "$LOG_FILE"
    echo "Total durasi pengerjaan: $TOTAL_DURATION." | tee -a "$LOG_FILE"
    echo "AUDIT_PASSED" > "$STATE_FILE"

    # Ringkasan perubahan via git
    if command -v git >/dev/null 2>&1; then
      echo -e "\nRingkasan perubahan berkas:" | tee -a "$LOG_FILE"
      git diff --stat 2>/dev/null | tee -a "$LOG_FILE" || true
    fi

    # Notifikasi native macOS
    if command -v osascript >/dev/null 2>&1; then
      osascript -e 'display notification "Audit Codebase Grossmart tuntas 100% bersih!" with title "Audit Codebase Selesai"' 2>/dev/null || true
    fi
    exit 0
  fi

  ROUND=$((ROUND + 1))
  sleep 2
done
