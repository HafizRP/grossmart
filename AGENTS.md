# Aturan Proyek Grossmart (AI & Developer Guidelines)

## Sinkronisasi Kode vs Proposal Transformasi Digital
Setiap kali melakukan penambahan fitur, perubahan skema database, atau modifikasi alur kerja antarmuka pada direktori:
- `app/` (Controllers, Models, Services)
- `database/` (Migrations, Seeders)
- `resources/js/` (Pages, Components, Utils)
- `routes/` (web.php, api.php)

### Kewajiban Agen:
1. **Perbarui Klaim Teknis Dokumen:**
   - Sesuaikan klaim fungsional, matriks fitur, jumlah tabel database, dan arsitektur di `docs/Transformasi Digital/PROPOSAL_FULL.md` dan `docs/Transformasi Digital/PLAN-PROPOSAL.md`.
   - Pastikan tidak ada klaim palsu (*false claims*) antara status kode riil vs deskripsi proposal.
2. **Jalankan Pipeline Generate & Audit Proposal:**
   - Sebelum tugas diselesaikan, jalankan:
     ```bash
     ./scripts/generate_proposal.sh
     ./scripts/audit_proposal.sh
     ```
   - Pastikan `generate_proposal.sh` berhasil menyinkronkan kode ke markdown & merender DOCX, dan `audit_proposal.sh` meloloskan status `STATUS_CLEAR`.
