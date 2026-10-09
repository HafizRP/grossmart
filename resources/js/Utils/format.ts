/**
 * Formatting Utilities - Ramah Warung & Standar Rupiah Indonesia
 */

export function formatRupiah(amount: number): string {
  const safeAmount = Math.round(Number(amount) || 0);
  return 'Rp ' + safeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatRupiahShort(amount: number): string {
  const safe = Math.round(Number(amount) || 0);
  if (safe >= 1000000) {
    const jt = (safe / 1000000).toFixed(safe % 1000000 === 0 ? 0 : 1);
    return `${jt} Jt`;
  }
  if (safe >= 1000) {
    const rb = (safe / 1000).toFixed(0);
    return `${rb}rb`;
  }
  return String(safe);
}

export function formatTanggalWaktu(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
