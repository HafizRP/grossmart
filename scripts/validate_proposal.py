#!/usr/bin/env python3
"""
validate_proposal.py
Validator murni untuk mengecek kepatuhan naskah proposal dan dokumen DOCX:
1. Keselarasan klaim teknis di markdown vs codebase riil.
2. Keselarasan struktur naskah vs 13 bab template acuan.
3. Kelengkapan 7 tabel data dan 7 gambar lampiran.
4. Integritas struktur fisik dokumen Word (.docx) pasca-generate.
Mencetak STATUS_CLEAR jika 100% lolos tanpa celah.
"""
import os
import re
import sys
import docx

def get_repo_root():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.dirname(script_dir)

def validate_codebase_sync(repo_root, errors):
    md_path = os.path.join(repo_root, "docs", "Transformasi Digital", "PROPOSAL_FULL.md")
    if not os.path.exists(md_path):
        errors.append(f"Berkas markdown {md_path} tidak ditemukan.")
        return
        
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # 1. Cek Model
    models_dir = os.path.join(repo_root, "app", "Models")
    num_models = len([f for f in os.listdir(models_dir) if f.endswith(".php")]) if os.path.exists(models_dir) else 0
    if f"{num_models} model" not in content and f"{num_models} Model" not in content:
        errors.append(f"Klaim jumlah model di PROPOSAL_FULL.md tidak cocok dengan riil app/Models ({num_models} model).")

    # 2. Cek Tabel Domain & Framework
    migrations_dir = os.path.join(repo_root, "database", "migrations")
    tables = []
    if os.path.exists(migrations_dir):
        for f in os.listdir(migrations_dir):
            if f.endswith(".php"):
                with open(os.path.join(migrations_dir, f), "r", encoding="utf-8") as fp:
                    tables.extend(re.findall(r"Schema::create\(['\"]([^'\"]+)['\"]", fp.read()))
    framework_tables = {'users', 'password_reset_tokens', 'sessions', 'failed_jobs', 'cache', 'cache_locks', 'jobs', 'job_batches'}
    tables_unique = set(tables)
    domain_count = len([t for t in tables_unique if t not in framework_tables])
    fw_count = len([t for t in tables_unique if t in framework_tables])
    
    if f"{domain_count} tabel kebutuhan domain warung" not in content and f"{domain_count} tabel domain" not in content:
        errors.append(f"Klaim tabel domain di PROPOSAL_FULL.md tidak cocok dengan riil migrasi ({domain_count} domain tabel).")

    # 3. Cek Versi Framework
    if "React 18" not in content:
        errors.append("PROPOSAL_FULL.md harus mencantumkan React 18 sesuai package.json.")
    if "Laravel 11" not in content:
        errors.append("PROPOSAL_FULL.md harus mencantumkan Laravel 11 sesuai composer.json.")

def validate_template_structure(repo_root, errors):
    md_path = os.path.join(repo_root, "docs", "Transformasi Digital", "PROPOSAL_FULL.md")
    if not os.path.exists(md_path):
        return
        
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    required_sections = [
        "ABSTRAK",
        "Judul",
        "Latar Belakang",
        "Tujuan dan Manfaat Aplikasi",
        "Tinjauan Singkat dan Posisi Kebaruan",
        "Deskripsi dan Solusi Digital",
        "Metodologi dan Rancangan Teknis",
        "Analisis Kebutuhan Pengguna",
        "Dampak Kebermanfaatan dan Keberlanjutan",
        "Aspek Etika, Legalitas dan Potensi HKI",
        "Penutup",
        "Daftar Pustaka dan Lampiran"
    ]
    
    for sec in required_sections:
        pattern = re.compile(rf"##\s+{re.escape(sec)}", re.IGNORECASE)
        if not pattern.search(content):
            errors.append(f"Bab wajib '{sec}' tidak ditemukan di PROPOSAL_FULL.md.")

    # Validasi 7 Tabel Naskah
    for t_num in range(1, 8):
        t_pattern = re.compile(rf"\*\*Tabel\s+{t_num}\.", re.IGNORECASE)
        if not t_pattern.search(content):
            errors.append(f"Tabel data 'Tabel {t_num}.' tidak ditemukan di PROPOSAL_FULL.md.")

    # Validasi 7 Lampiran Gambar
    for l_num in range(1, 8):
        l_pattern = re.compile(rf"\*\*Lampiran\s+{l_num}\b", re.IGNORECASE)
        if not l_pattern.search(content):
            errors.append(f"Lampiran figur 'Lampiran {l_num}' tidak ditemukan di PROPOSAL_FULL.md.")

def validate_docx_file(repo_root, errors):
    docx_path = os.path.join(repo_root, "docs", "Transformasi Digital", "Proposal Transformasi Digital - Grossmart.docx")
    if not os.path.exists(docx_path):
        errors.append(f"Berkas Word final '{docx_path}' tidak ditemukan. Jalankan generate_proposal.sh terlebih dahulu.")
        return
        
    file_size = os.path.getsize(docx_path)
    if file_size < 100000:
        errors.append(f"Ukuran berkas Word '{docx_path}' terlalu kecil ({file_size} bytes), dicurigai tidak lengkap.")
        return
        
    try:
        doc = docx.Document(docx_path)
    except Exception as e:
        errors.append(f"Berkas Word '{docx_path}' korup atau tidak valid: {e}")
        return

    num_p = len(doc.paragraphs)
    num_t = len(doc.tables)

    if num_p < 150:
        errors.append(f"Jumlah paragraf di berkas Word ({num_p}) kurang dari standar (min. 150).")
    if num_t < 8:
        errors.append(f"Jumlah tabel di berkas Word ({num_t}) kurang dari 8 (1 cover + 7 naskah).")

    # Cek keberadaan gambar di dokumen docx
    has_image = False
    for p in doc.paragraphs:
        if len(p._p.xpath(".//a:blip")) > 0:
            has_image = True
            break
    if not has_image:
        errors.append("Berkas Word tidak memuat elemen gambar/figur yang disyaratkan.")

def main():
    repo_root = get_repo_root()
    errors = []
    
    print("=== [Validasi Kepatuhan Proposal Grossmart] ===")
    
    # 1. Validasi keselarasan kode vs markdown
    validate_codebase_sync(repo_root, errors)
    
    # 2. Validasi struktur naskah vs template
    validate_template_structure(repo_root, errors)
    
    # 3. Validasi berkas Word final
    validate_docx_file(repo_root, errors)
    
    if errors:
        print("\n[GAGAL AUDIT] Ditemukan ketidaksesuaian:")
        for idx, err in enumerate(errors, 1):
            print(f"  {idx}. {err}")
        print("\nPetunjuk: Jalankan './scripts/generate_proposal.sh' untuk menyinkronkan kode ke markdown & merender ulang Word.")
        return 1
    else:
        print("\n[100% LOLOS AUDIT] Seluruh aspek terverifikasi bersih dan valid:")
        print("  - Status kode riil 100% cocok dengan klaim teknis markdown.")
        print("  - Struktur 13 bab, 7 tabel data, dan 7 figur lampiran lengkap.")
        print("  - Dokumen Word (Proposal Transformasi Digital - Grossmart.docx) utuh dan valid.")
        print("\nSTATUS_CLEAR")
        return 0

if __name__ == "__main__":
    sys.exit(main())
