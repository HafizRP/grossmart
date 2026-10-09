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
  // Jika sudah disubmit (hasil penutupan shift)
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

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl border-4 border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header Tutup Kasir */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              {isClosed ? 'Shift Kasir Berhasil Ditutup' : 'Tutup Kasir (Tutup Buta / Blind Count)'}
            </h2>
            <p className="text-base font-bold text-gray-600">
              Kasir: <strong>{cashierName}</strong> &bull; Mulai: {startTime}
            </p>
          </div>

          {!isClosed ? (
            /* Formulir Tutup Kasir Buta (Angka Sistem Dirahasiakan) */
            <form onSubmit={handleCloseShift} className="space-y-5">
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 text-sm font-bold">
                <span className="block font-black text-base text-amber-900 mb-1">
                  Pemberitahuan Keamanan Finansial:
                </span>
                Sistem sengaja merahasiakan saldo sistem agar Anda menghitung fisik uang secara murni tanpa rekayasa.
                Keluarkan seluruh uang tunai dari laci kasir dan hitung secara teliti.
              </div>

              <div>
                <label htmlFor="actual-cash-input" className="block text-base font-black text-gray-900 mb-2">
                  Total Uang Fisik Hasil Hitungan di Laci:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-black text-gray-500">
                    Rp
                  </span>
                  <input
                    id="actual-cash-input"
                    type="number"
                    min="0"
                    value={actualCash || ''}
                    onChange={(e) => setActualCash(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-full min-h-[64px] pl-16 pr-4 text-3xl font-black text-emerald-800 border-3 border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    autoFocus
                  />
                </div>
                <p className="text-sm font-bold text-gray-500 mt-1">
                  Terbilang: {formatRupiah(actualCash)}
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                soundFeedback="click"
                onClick={() => setIsCalculatorOpen(true)}
                className="text-base sm:text-lg font-black border-2 border-emerald-400 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              >
                Gunakan Kalkulator Pecahan Lembar & Koin
              </Button>

              <div>
                <label htmlFor="close-notes-input" className="block text-sm font-black text-gray-700 mb-1">
                  Catatan Penutupan Kasir (Opsional):
                </label>
                <textarea
                  id="close-notes-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Ada uang kembalian 2.000 sobek sedikit..."
                  className="w-full p-3 text-base font-bold border-2 border-gray-300 rounded-xl focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="xl"
                  soundFeedback="click"
                  onClick={() => router.visit('/pos')}
                  className="w-1/3"
                >
                  Kembali
                </Button>

                <Button
                  type="submit"
                  variant="danger"
                  size="xl"
                  isLoading={isSubmitting}
                  soundFeedback="chime"
                  className="w-2/3 text-xl font-black shadow-xl"
                >
                  SIMPAN & TUTUP SHIFT
                </Button>
              </div>
            </form>
          ) : (
            /* Hasil Perhitungan Setelah Disimpan (Membuka Selisih Kas) */
            <div className="space-y-5">
              <div className="p-5 bg-gray-50 rounded-2xl border-3 border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-base font-bold text-gray-700">
                  <span>Total Transaksi Dilayani:</span>
                  <span className="text-gray-950 font-black text-lg">{totalSalesCount} Nota</span>
                </div>

                <div className="flex justify-between items-center text-base font-bold text-gray-700">
                  <span>Saldo Kas Seharusnya (Sistem):</span>
                  <span className="text-gray-950 font-black text-lg">{formatRupiah(expectedCashEnding || 0)}</span>
                </div>

                <div className="flex justify-between items-center text-base font-bold text-gray-700">
                  <span>Uang Fisik Dihitung Kasir:</span>
                  <span className="text-gray-950 font-black text-lg">{formatRupiah(actualCashEnding || 0)}</span>
                </div>

                {/* Selisih Kasir */}
                <div className="pt-3 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">
                    SELISIH KAS (DIFFERENCE):
                  </span>
                  <span
                    className={`text-2xl font-black px-3 py-1 rounded-xl ${
                      (cashDifference || 0) === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : (cashDifference || 0) > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(cashDifference || 0) === 0
                      ? 'PAS (NOL SELISIH)'
                      : (cashDifference || 0) > 0
                      ? `LEBIH +${formatRupiah(cashDifference || 0)}`
                      : `KURANG ${formatRupiah(cashDifference || 0)}`
                    }
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="info"
                  size="lg"
                  fullWidth
                  soundFeedback="click"
                  onClick={() => window.print()}
                >
                  Cetak Berita Acara Kasir
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  soundFeedback="click"
                  onClick={() => router.visit('/login')}
                >
                  Selesai & Keluar Akun
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DenominationCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Hitung Uang Fisik Penutupan Kasir"
        initialCounts={denominationCounts}
        onApply={(total, counts) => {
          setActualCash(total);
          setDenominationCounts(counts);
        }}
      />
    </ToastProvider>
  );
};

export default ShiftClose;
