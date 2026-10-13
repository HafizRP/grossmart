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

export interface CashDenominationBreakdown {
  value: number;
  label: string;
  count: number;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  isCoin?: boolean;
}

/**
 * Hitung rincian lembaran/koin fisik kembalian untuk panduan kasir lansia
 */
export function calculateChangeBreakdown(changeAmount: number): CashDenominationBreakdown[] {
  let remaining = Math.max(0, Math.round(Number(changeAmount) || 0));
  if (remaining <= 0) return [];

  const denominations = [
    { value: 100000, label: '100.000', colorBg: 'bg-rose-50', colorText: 'text-rose-900', colorBorder: 'border-rose-300' },
    { value: 50000, label: '50.000', colorBg: 'bg-blue-50', colorText: 'text-blue-900', colorBorder: 'border-blue-300' },
    { value: 20000, label: '20.000', colorBg: 'bg-emerald-50', colorText: 'text-emerald-900', colorBorder: 'border-emerald-300' },
    { value: 10000, label: '10.000', colorBg: 'bg-purple-50', colorText: 'text-purple-900', colorBorder: 'border-purple-300' },
    { value: 5000, label: '5.000', colorBg: 'bg-amber-50', colorText: 'text-amber-900', colorBorder: 'border-amber-300' },
    { value: 2000, label: '2.000', colorBg: 'bg-slate-100', colorText: 'text-slate-900', colorBorder: 'border-slate-300' },
    { value: 1000, label: '1.000', colorBg: 'bg-lime-50', colorText: 'text-lime-900', colorBorder: 'border-lime-300' },
    { value: 500, label: '500 (Koin)', colorBg: 'bg-zinc-100', colorText: 'text-zinc-800', colorBorder: 'border-zinc-300', isCoin: true },
    { value: 200, label: '200 (Koin)', colorBg: 'bg-zinc-100', colorText: 'text-zinc-800', colorBorder: 'border-zinc-300', isCoin: true },
    { value: 100, label: '100 (Koin)', colorBg: 'bg-zinc-100', colorText: 'text-zinc-800', colorBorder: 'border-zinc-300', isCoin: true },
  ];

  const breakdown: CashDenominationBreakdown[] = [];

  for (const denom of denominations) {
    if (remaining >= denom.value) {
      const count = Math.floor(remaining / denom.value);
      remaining %= denom.value;
      breakdown.push({
        ...denom,
        count,
      });
    }
  }

  return breakdown;
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
