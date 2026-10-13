import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/UI/Button';
import { DenominationCalculatorModal, DenominationCounts } from '@/Components/POS/DenominationCalculatorModal';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { ToastProvider } from '@/Components/UI/Toast';

export interface ShiftCloseProps {
  shiftId: number;
  cashierName: string;
  startTime: string;
  isClosed?: boolean;
  expectedCashEnding?: number;
  actualCashEnding?: number;
  cashDifference?: number;
  totalSalesCount?: number;
}

export const ShiftClose: React.FC<ShiftCloseProps> = ({
  shiftId,
  cashierName,
  startTime,
  isClosed = false,
  expectedCashEnding,
  actualCashEnding,
  cashDifference,
  totalSalesCount = 0,
}) => {
  const [actualCash, setActualCash] = useState<number>(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [denominationCounts, setDenominationCounts] = useState<DenominationCounts>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualCash < 0) {
      sound.playError();
      return;
    }

    if (!window.confirm('Pastikan seluruh uang fisik laci sudah dihitung dengan benar. Lanjutkan tutup shift?')) {
      return;
    }

    sound.playChime();
    setIsSubmitting(true);

    router.post(`/shifts/${shiftId}/close`, {
      actual_cash_ending: actualCash,
      denomination_details: Object.keys(denominationCounts).length > 0 ? denominationCounts : null,
      notes: notes.trim() || null,
    }, {
      onError: () => {
        setIsSubmitting(false);
        sound.playError();
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <ToastProvider>
      <Head title="Tutup Shift Kasir (Tutup Kasir Buta) - Grossmart" />

      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl border-4 border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header Tutup Kasir Ergonomis */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-3xl">
              🔒
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {isClosed ? 'Shift Kasir Berhasil Ditutup' : 'Tutup Kasir (Tutup Buta / Blind Count)'}
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-600">
              Kasir: <strong className="text-slate-900">{cashierName}</strong> &bull; Mulai: {startTime}
            </p>
          </div>

          {!isClosed ? (
            <form onSubmit={handleCloseShift} className="space-y-5">
              {/* Box Edukasi Tutup Kasir Buta */}
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs sm:text-sm font-bold leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                  <span>ℹ️</span> Cara Menghitung Kas Tutup Kasir:
                </div>
                <p>
                  Hitung seluruh uang fisik (kertas & koin) yang ada di dalam laci kasir saat ini. Angka saldo sistem sengaja disembunyikan agar penghitungan murni objektif dan bebas manipulasi.
                </p>
              </div>

              {/* Input Uang Fisik Terhitung */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="actual-cash-input" className="block text-sm font-black text-slate-900 uppercase tracking-wider">
                    Total Uang Fisik di Laci:
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsCalculatorOpen(true);
                    }}
                    className="text-xs font-black text-emerald-700 hover:text-emerald-900 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🧮</span> Hitung Per Lembar Uang
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-black text-slate-400 select-none">
                    Rp
                  </span>
                  <input
                    id="actual-cash-input"
                    type="number"
                    min="0"
                    step="100"
                    value={actualCash || ''}
                    onChange={(e) => setActualCash(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-full min-h-[64px] pl-14 pr-4 text-3xl font-black text-slate-950 border-3 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 tabular-nums"
                  />
                </div>

                {Object.keys(denominationCounts).length > 0 && (
                  <p className="text-xs font-extrabold text-emerald-700 mt-2 flex items-center gap-1">
                    ✓ Rincian per lembar/koin tersimpan dari kalkulator fisik
                  </p>
                )}
              </div>

              {/* Catatan Tambahan Kasir */}
              <div>
                <label htmlFor="notes-input" className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Catatan / Keterangan Kasir (Opsional):
                </label>
                <textarea
                  id="notes-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Ada uang kembalian sobek Rp 5.000 disimpan terpisah, dll."
                  className="w-full p-3 text-sm font-bold border-2 border-slate-300 rounded-xl focus:border-emerald-600"
                />
              </div>

              {/* Tombol Aksi Tutup Shift */}
              <div className="pt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="danger"
                  size="xl"
                  fullWidth
                  isLoading={isSubmitting}
                  soundFeedback="chime"
                  className="min-h-[64px] text-xl font-black uppercase tracking-wider rounded-2xl shadow-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600"
                >
                  KUNCI & TUTUP SHIFT SEKARANG 🔒
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  soundFeedback="click"
                  onClick={() => router.visit('/pos')}
                  className="min-h-[50px] text-sm font-black text-slate-700 rounded-xl"
                >
                  ← Batal & Kembali ke Layar Kasir
                </Button>
              </div>
            </form>
          ) : (
            /* Tampilan Pasca Tutup Shift (Laporan Selesai) */
            <div className="space-y-5 text-center">
              <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>Total Transaksi Selesai:</span>
                  <span className="text-slate-900 font-extrabold text-base">{totalSalesCount} Struk</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>Uang Fisik Terhitung:</span>
                  <span className="text-slate-900 font-extrabold text-lg tabular-nums">
                    {formatRupiah(actualCashEnding || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>Ekspektasi Saldo Sistem:</span>
                  <span className="text-slate-900 font-extrabold text-lg tabular-nums">
                    {formatRupiah(expectedCashEnding || 0)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-black uppercase text-slate-800">Selisih Kas Laci:</span>
                  <span
                    className={`text-xl font-black tabular-nums ${
                      (cashDifference || 0) === 0
                        ? 'text-emerald-700'
                        : (cashDifference || 0) > 0
                        ? 'text-blue-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {(cashDifference || 0) === 0
                      ? 'PAS (Rp 0)'
                      : (cashDifference || 0) > 0
                      ? `Lebih ${formatRupiah(cashDifference || 0)}`
                      : `Kurang ${formatRupiah(Math.abs(cashDifference || 0))}`}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="xl"
                fullWidth
                soundFeedback="click"
                onClick={() => router.visit('/login')}
                className="min-h-[56px] text-lg font-black rounded-2xl"
              >
                Selesai & Keluar Sesi
              </Button>
            </div>
          )}
        </div>

        {/* Modal Hitung Uang Fisik Lembar / Koin */}
        <DenominationCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          initialCounts={denominationCounts}
          onApply={(total, counts) => {
            setActualCash(total);
            setDenominationCounts(counts);
          }}
        />
      </div>
    </ToastProvider>
  );
};

export default ShiftClose;
