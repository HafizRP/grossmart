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

  const modalPresets = [50000, 100000, 150000, 200000];

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

      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl border-4 border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header Buka Shift */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-3xl">
              💵
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Buka Shift Kasir Baru
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-600">
              Selamat bertugas, <strong className="text-slate-900">{cashierName}</strong>! Silakan hitung dan masukkan uang modal receh awal di laci kasir.
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-5">
            {/* Input Nominal Modal Awal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="starting-cash-input" className="block text-sm font-black text-slate-900 uppercase tracking-wider">
                  Modal Awal Kas Laci:
                </label>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsCalculatorOpen(true);
                  }}
                  className="text-xs font-black text-emerald-800 hover:text-emerald-950 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>🧮</span> Hitung Fisik Lembaran
                </button>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-black text-slate-400 select-none">
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
                  className="w-full min-h-[64px] pl-14 pr-4 text-3xl font-black text-slate-950 border-3 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 tabular-nums"
                />
              </div>

              {/* Tombol Cepat Pilihan Modal Umum Warung */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
                {modalPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setStartingCash(preset);
                    }}
                    className={`min-h-[46px] px-2 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      startingCash === preset
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {formatRupiah(preset)}
                  </button>
                ))}
              </div>

              {Object.keys(denominationCounts).length > 0 && (
                <p className="text-xs font-extrabold text-emerald-700 mt-2 flex items-center gap-1">
                  ✓ Rincian pecahan uang laci tersimpan ({Object.values(denominationCounts).reduce((a, b) => a + b, 0)} keping/lembar)
                </p>
              )}
            </div>

            {/* Catatan Buka Shift */}
            <div>
              <label htmlFor="notes-input" className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                Catatan Awal Shift (Opsional):
              </label>
              <textarea
                id="notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pecahan Rp 2.000 sebanyak 25 lembar, dll."
                className="w-full p-3 text-sm font-bold border-2 border-slate-300 rounded-xl focus:border-emerald-600"
              />
            </div>

            {/* Tombol Submit Buka Shift Jumbo */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="xl"
                fullWidth
                isLoading={isSubmitting}
                soundFeedback="chime"
                className="min-h-[64px] text-xl font-black uppercase tracking-wider rounded-2xl shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
              >
                MULAI SHIFT & BUKA KASIR ➔
              </Button>
            </div>
          </form>
        </div>

        {/* Modal Hitung Uang Fisik Lembar / Koin */}
        <DenominationCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          initialCounts={denominationCounts}
          title="Hitung Uang Modal Awal Kasir"
          onApply={(total, counts) => {
            setStartingCash(total);
            setDenominationCounts(counts);
          }}
        />
      </div>
    </ToastProvider>
  );
};

export default ShiftOpen;
