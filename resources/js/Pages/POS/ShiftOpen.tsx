import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/UI/Button';
import { DenominationCalculatorModal, DenominationCounts } from '@/Components/POS/DenominationCalculatorModal';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { ToastProvider } from '@/Components/UI/Toast';

export interface ShiftOpenProps {
  cashierName: string;
}

export const ShiftOpen: React.FC<ShiftOpenProps> = ({ cashierName }) => {
  const [startingCash, setStartingCash] = useState<number>(100000);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [denominationCounts, setDenominationCounts] = useState<DenominationCounts>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (startingCash < 0) {
      sound.playError();
      return;
    }

    sound.playChime();
    setIsSubmitting(true);

    router.post('/shifts/open', {
      starting_cash: startingCash,
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
      <Head title="Buka Kasir Baru - Grossmart" />

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl border-4 border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header Buka Shift */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Buka Shift Kasir Baru
            </h2>
            <p className="text-base font-bold text-gray-600">
              Selamat bertugas, <strong>{cashierName}</strong>! Silakan hitung dan masukkan uang modal awal di laci kasir.
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-5">
            {/* Input Nominal Modal Awal */}
            <div>
              <label htmlFor="starting-cash-input" className="block text-base font-black text-gray-900 mb-2">
                Modal Awal Kas Laci:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-black text-gray-500">
                  Rp
                </span>
                <input
                  id="starting-cash-input"
                  type="number"
                  min="0"
                  step="500"
                  value={startingCash || ''}
                  onChange={(e) => setStartingCash(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full min-h-[64px] pl-16 pr-4 text-3xl font-black text-emerald-800 border-3 border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  autoFocus
                />
              </div>
              <p className="text-sm font-bold text-gray-500 mt-1">
                Terbilang: {formatRupiah(startingCash)}
              </p>
            </div>

            {/* Tombol Buka Denomination Calculator Modal */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              soundFeedback="click"
              onClick={() => setIsCalculatorOpen(true)}
              className="text-base sm:text-lg font-black border-2 border-emerald-400 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
            >
              Hitung dengan Kalkulator Lembar & Koin
            </Button>

            {/* Catatan Shift Opsional */}
            <div>
              <label htmlFor="shift-notes-input" className="block text-sm font-black text-gray-700 mb-1">
                Catatan Awal Shift (Opsional):
              </label>
              <textarea
                id="shift-notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kembalian pecahan 2.000 sudah disiapkan 50 lembar..."
                className="w-full p-3 text-base font-bold border-2 border-gray-300 rounded-xl focus:border-emerald-600"
              />
            </div>

            {/* Tombol Aksi Buka Kasir */}
            <Button
              type="submit"
              variant="primary"
              size="xl"
              fullWidth
              isLoading={isSubmitting}
              soundFeedback="chime"
              className="text-2xl font-black shadow-xl"
            >
              BUKA KASIR SEKARANG
            </Button>
          </form>
        </div>
      </div>

      {/* Kalkulator Pecahan Modal */}
      <DenominationCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Hitung Modal Awal Kasir"
        initialCounts={denominationCounts}
        onApply={(total, counts) => {
          setStartingCash(total);
          setDenominationCounts(counts);
        }}
      />
    </ToastProvider>
  );
};

export default ShiftOpen;
