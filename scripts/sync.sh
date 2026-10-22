#!/usr/bin/env bash
# scripts/sync.sh
# Shortcut / command sinkronisasi multi-agent untuk Grossmart.
# Menjalankan sinkronisasi status kode riil ke proposal markdown & dokumen DOCX.
# Mendukung multi-agent: auto (default), omp, claude, cursor, aider, gemini, codex, script.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/generate_proposal.sh" "$@"
