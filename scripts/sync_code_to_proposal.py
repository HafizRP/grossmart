#!/usr/bin/env python3
"""
sync_code_to_proposal.py
Membaca metadata riil dari codebase Grossmart dan menyinkronkannya
ke dokumen markdown proposal (PROPOSAL_FULL.md dan PLAN-PROPOSAL.md).
"""
import os
import re
import sys
import json

def get_repo_root():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.dirname(script_dir)

def count_models(repo_root):
    models_dir = os.path.join(repo_root, "app", "Models")
    if not os.path.exists(models_dir):
        return 0, []
    models = sorted([f[:-4] for f in os.listdir(models_dir) if f.endswith(".php")])
    return len(models), models

def count_migrations_and_tables(repo_root):
    migrations_dir = os.path.join(repo_root, "database", "migrations")
    if not os.path.exists(migrations_dir):
        return 0, 0, 0, []
    
    files = [f for f in os.listdir(migrations_dir) if f.endswith(".php")]
    tables = []
    framework_tables = {
        'users', 'password_reset_tokens', 'sessions', 'failed_jobs',
        'cache', 'cache_locks', 'jobs', 'job_batches'
    }
    
    for f in files:
        path = os.path.join(migrations_dir, f)
        with open(path, "r", encoding="utf-8") as fp:
            content = fp.read()
            found = re.findall(r"Schema::create\(['\"]([^'\"]+)['\"]", content)
            tables.extend(found)
            
    tables_unique = sorted(list(set(tables)))
    domain_tables = [t for t in tables_unique if t not in framework_tables]
    return len(files), len(domain_tables), len(framework_tables), tables_unique

def get_framework_versions(repo_root):
    composer_path = os.path.join(repo_root, "composer.json")
    package_path = os.path.join(repo_root, "package.json")
    
    versions = {
        "laravel": "11",
        "php": "8.2",
        "react": "18",
        "typescript": "5",
        "inertia": "2",
        "vite": "6",
        "tailwind": "3"
    }
    
    if os.path.exists(composer_path):
        try:
            with open(composer_path, "r", encoding="utf-8") as fp:
                cdata = json.load(fp)
                req = cdata.get("require", {})
                if "laravel/framework" in req:
                    m = re.search(r"(\d+)", req["laravel/framework"])
                    if m:
                        versions["laravel"] = m.group(1)
                if "php" in req:
                    m = re.search(r"(\d+\.\d+)", req["php"])
                    if m:
                        versions["php"] = m.group(1)
        except Exception:
            pass

    if os.path.exists(package_path):
        try:
            with open(package_path, "r", encoding="utf-8") as fp:
                pdata = json.load(fp)
                deps = {**pdata.get("dependencies", {}), **pdata.get("devDependencies", {})}
                if "react" in deps:
                    m = re.search(r"(\d+)", deps["react"])
                    if m:
                        versions["react"] = m.group(1)
                if "typescript" in deps:
                    m = re.search(r"(\d+)", deps["typescript"])
                    if m:
                        versions["typescript"] = m.group(1)
                if "@inertiajs/react" in deps:
                    m = re.search(r"(\d+)", deps["@inertiajs/react"])
                    if m:
                        versions["inertia"] = m.group(1)
                if "vite" in deps:
                    m = re.search(r"(\d+)", deps["vite"])
                    if m:
                        versions["vite"] = m.group(1)
                if "tailwindcss" in deps:
                    m = re.search(r"(\d+)", deps["tailwindcss"])
                    if m:
                        versions["tailwind"] = m.group(1)
        except Exception:
            pass

    return versions

def count_controllers(repo_root):
    controllers_dir = os.path.join(repo_root, "app", "Http", "Controllers")
    if not os.path.exists(controllers_dir):
        return 0, []
    controllers = []
    for root, _, files in os.walk(controllers_dir):
        for f in files:
            if f.endswith(".php"):
                rel = os.path.relpath(os.path.join(root, f), controllers_dir)
                controllers.append(rel)
    return len(controllers), sorted(controllers)

def sync_proposal_full(repo_root, stats):
    target_path = os.path.join(repo_root, "docs", "Transformasi Digital", "PROPOSAL_FULL.md")
    if not os.path.exists(target_path):
        print(f"Peringatan: {target_path} tidak ditemukan.", file=sys.stderr)
        return False
        
    with open(target_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    num_models = stats["num_models"]
    domain_tables = stats["domain_tables"]
    framework_tables = stats["framework_tables"]
    react_ver = stats["versions"]["react"]
    laravel_ver = stats["versions"]["laravel"]
    
    # 1. Update klaim tabel dan model di arsitektur
    content = re.sub(
        r"Menyimpan \d+ tabel kebutuhan domain warung \(plus \d+ tabel framework Laravel\)",
        f"Menyimpan {domain_tables} tabel kebutuhan domain warung (plus {framework_tables} tabel framework Laravel)",
        content
    )
    content = re.sub(
        r"Penyimpanan persisten \d+ tabel domain \(plus \d+ tabel framework\)",
        f"Penyimpanan persisten {domain_tables} tabel domain (plus {framework_tables} tabel framework)",
        content
    )
    content = re.sub(
        r"### Struktur \d+ Model Domain Bisnis",
        f"### Struktur {num_models} Model Domain Bisnis",
        content
    )
    content = re.sub(
        r"Sistem mengelola \d+ model Eloquent yang memetakan \d+ tabel (?:kebutuhan domain warung|domain bisnis) \(plus \d+ tabel framework Laravel\)",
        f"Sistem mengelola {num_models} model Eloquent yang memetakan {domain_tables} tabel kebutuhan domain warung (plus {framework_tables} tabel framework Laravel)",
        content
    )
    content = re.sub(
        r"kamus data, dan \*ERD\* \d+ tabel\.",
        f"kamus data, dan *ERD* {domain_tables + framework_tables} tabel.",
        content
    )
    content = re.sub(
        r"verifikasi \d+ model data\.",
        f"verifikasi {num_models} model data.",
        content
    )
    content = re.sub(
        r"klien React \d+",
        f"klien React {react_ver}",
        content
    )
    content = re.sub(
        r"React \d+ TypeScript",
        f"React {react_ver} TypeScript",
        content
    )
    content = re.sub(
        r"Laravel \d+",
        f"Laravel {laravel_ver}",
        content
    )

    if content != original:
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False

def sync_plan_proposal(repo_root, stats):
    target_path = os.path.join(repo_root, "docs", "Transformasi Digital", "PLAN-PROPOSAL.md")
    if not os.path.exists(target_path):
        return False
        
    with open(target_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    num_models = stats["num_models"]
    domain_tables = stats["domain_tables"]
    framework_tables = stats["framework_tables"]
    total_tables = domain_tables + framework_tables
    react_ver = stats["versions"]["react"]
    laravel_ver = stats["versions"]["laravel"]
    
    content = re.sub(
        r"skema data \d+ tabel \(\d+ model Eloquent\)",
        f"skema data {total_tables} tabel ({num_models} model Eloquent)",
        content
    )
    content = re.sub(
        r"Laravel \d+ \+ React \d+",
        f"Laravel {laravel_ver} + React {react_ver}",
        content
    )
    content = re.sub(
        r"React \d+",
        f"React {react_ver}",
        content
    )
    content = re.sub(
        r"Laravel \d+",
        f"Laravel {laravel_ver}",
        content
    )

    if content != original:
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False

def main():
    repo_root = get_repo_root()
    num_models, models = count_models(repo_root)
    num_migrations, domain_tables, framework_tables, tables = count_migrations_and_tables(repo_root)
    versions = get_framework_versions(repo_root)
    num_controllers, controllers = count_controllers(repo_root)
    
    stats = {
        "num_models": num_models,
        "domain_tables": domain_tables,
        "framework_tables": framework_tables,
        "total_tables": domain_tables + framework_tables,
        "num_migrations": num_migrations,
        "num_controllers": num_controllers,
        "versions": versions
    }
    
    print(f"=== Sinkronisasi Kode -> Dokumen Proposal ===")
    print(f"Status Riil Codebase:")
    print(f"  - Model Eloquent : {num_models} model (app/Models)")
    print(f"  - Tabel Database : {domain_tables} tabel domain + {framework_tables} tabel framework = {domain_tables + framework_tables} total")
    print(f"  - Migrasi        : {num_migrations} file migrasi")
    print(f"  - Controller     : {num_controllers} controller")
    print(f"  - Stack Versi    : Laravel {versions['laravel']}, React {versions['react']}, Inertia {versions['inertia']}, PHP {versions['php']}, TypeScript {versions['typescript']}")
    
    changed_full = sync_proposal_full(repo_root, stats)
    changed_plan = sync_plan_proposal(repo_root, stats)
    
    if changed_full or changed_plan:
        print("Klaim teknis dokumen proposal berhasil disinkronkan dengan status riil kode.")
    else:
        print("Dokumen proposal sudah 100% sinkron dengan status riil kode (tidak ada selisih klaim).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
