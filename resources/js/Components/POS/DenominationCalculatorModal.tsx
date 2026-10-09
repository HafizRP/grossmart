import React, { useState, useMemo } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface DenominationItem {
  id: string;
  nominal: number;
  label: string;
  type: 'lembar' | 'koin';
}

export type DenominationCounts = Record<string, number>;

export interface DenominationCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (total: number, counts: DenominationCounts) => void;
  initialCounts?: DenominationCounts;
  title?: string;
}

const denominations: DenominationItem[] = [
  { id: '100000', nominal: 100000, label: 'Rp 100.000', type: 'lembar' },
  { id: '50000', nominal: 50000, label: 'Rp 50.000', type: 'lembar' },
  { id: '20000', nominal: 20000, label: 'Rp 20.000', type: 'lembar' },
  { id: '10000', nominal: 10000, label: 'Rp 10.000', type: 'lembar' },
  { id: '5000', nominal: 5000, label: 'Rp 5.000', type: 'lembar' },
  { id: '2000', nominal: 2000, label: 'Rp 2.000', type: 'lembar' },
  { id: '1000_bill', nominal: 1000, label: 'Rp 1.000 (Lembar)', type: 'lembar' },
  { id: '1000_coin', nominal: 1000, label: 'Rp 1.000 (Koin)', type: 'koin' },
  { id: '500', nominal: 500, label: 'Rp 500 (Koin)', type: 'koin' },
  { id: '200', nominal: 200, label: 'Rp 200 (Koin)', type: 'koin' },
  { id: '100', nominal: 100, label: 'Rp 100 (Koin)', type: 'koin' },
];

export const DenominationCalculatorModal: React.FC<DenominationCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialCounts = {},
  title = 'Kalkulator Hitung Uang Lembar & Koin',
}) => {
  const [counts, setCounts] = useState<DenominationCounts>(initialCounts);

  const handleCountChange = (id: string, delta: number) => {
    sound.playClick();
    setCounts((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleDirectInput = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    const valid = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setCounts((prev) => ({ ...prev, [id]: valid }));
  };

  const handleReset = () => {
    sound.playClick();
    setCounts({});
  };

  const grandTotal = useMemo(() => {
    return denominations.reduce((acc, item) => {
      const qty = counts[item.id] || 0;
      return acc + qty * item.nominal;
    }, 0);
  }, [counts]);

  const handleSaveAndApply = () => {
    sound.playChime();
    onApply(grandTotal, counts);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <Button
            variant="danger"
            size="lg"
            soundFeedback="click"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Nolkan Semua (Reset)
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              soundFeedback="click"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              soundFeedback="chime"
              onClick={handleSaveAndApply}
              className="w-full sm:w-auto text-lg sm:text-xl font-black"
            >
              Pakai Total ({formatRupiah(grandTotal)})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Grand Total Jumbo */}
        <div className="bg-emerald-50 border-4 border-emerald-600 rounded-3xl p-5 text-center shadow-inner">
          <span className="block text-base sm:text-lg font-black text-emerald-900 uppercase tracking-wider">
            Total Hitungan Uang Fisik di Laci:
          </span>
          <span className="block text-3xl sm:text-5xl font-black text-emerald-700 mt-1">
            {formatRupiah(grandTotal)}
          </span>
        </div>

        {/* Tabel Pecahan Uang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {denominations.map((item) => {
            const count = counts[item.id] || 0;
            const subtotal = count * item.nominal;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-emerald-300 transition-colors"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-black rounded-md ${
                        item.type === 'lembar'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.type === 'lembar' ? 'LEMBAR' : 'KOIN'}
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                    Subtotal: {formatRupiah(subtotal)}
                  </div>
                </div>

                {/* Stepper Kontrol Jumbo */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCountChange(item.id, -1)}
                    disabled={count <= 0}
                    className="
                      w-12 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                      text-gray-900 text-2xl font-black flex items-center justify-center
                      disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation cursor-pointer
                    "
                    aria-label={`Kurang satu ${item.label}`}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => handleDirectInput(item.id, e.target.value)}
                    className="
                      w-16 h-12 text-center text-xl font-black text-gray-950 bg-white
                      border-2 border-gray-400 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() => handleCountChange(item.id, 1)}
                    className="
                      w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                      text-white text-2xl font-black flex items-center justify-center
                      touch-manipulation cursor-pointer
                    "
                    aria-label={`Tambah satu ${item.label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default DenominationCalculatorModal;
