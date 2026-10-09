import React from 'react';
import { Button } from '@/Components/UI/Button';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface QuickCashButtonsProps {
  totalAmount: number;
  currentCashGiven?: number;
  onSelectAmount: (amount: number) => void;
  onAddAmount?: (amount: number) => void;
}

const standardBills = [10000, 20000, 50000, 100000, 200000, 500000];
const addIncrements = [10000, 20000, 50000, 100000];

export const QuickCashButtons: React.FC<QuickCashButtonsProps> = ({
  totalAmount,
  currentCashGiven = 0,
  onSelectAmount,
  onAddAmount,
}) => {
  // Hitung pecahan bulat terdekat di atas total belanja (misal total 34.500 -> 35.000, 40.000, 50.000)
  const dynamicSuggestions: number[] = [];
  if (totalAmount > 0) {
    const nextFiveThousand = Math.ceil(totalAmount / 5000) * 5000;
    if (nextFiveThousand > totalAmount && !dynamicSuggestions.includes(nextFiveThousand)) {
      dynamicSuggestions.push(nextFiveThousand);
    }

    const nextTenThousand = Math.ceil(totalAmount / 10000) * 10000;
    if (nextTenThousand > totalAmount && !dynamicSuggestions.includes(nextTenThousand)) {
      dynamicSuggestions.push(nextTenThousand);
    }

    const nextFiftyThousand = Math.ceil(totalAmount / 50000) * 50000;
    if (nextFiftyThousand > totalAmount && !dynamicSuggestions.includes(nextFiftyThousand)) {
      dynamicSuggestions.push(nextFiftyThousand);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tombol Raksasa UANG PAS */}
      <Button
        variant="primary"
        size="xl"
        fullWidth
        soundFeedback="chime"
        onClick={() => onSelectAmount(totalAmount)}
        className="text-xl sm:text-2xl font-black shadow-lg"
      >
        <span className="flex items-center justify-between w-full px-2">
          <span>[UANG PAS]</span>
          <span className="bg-emerald-800/60 px-3 py-1 rounded-xl text-lg sm:text-xl">
            {formatRupiah(totalAmount)}
          </span>
        </span>
      </Button>

      {/* Rekomendasi Bulat Terdekat jika ada */}
      {dynamicSuggestions.length > 0 && (
        <div>
          <span className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">
            Pecahan Terdekat Total Belanja:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {dynamicSuggestions.map((amt) => (
              <Button
                key={`dyn-${amt}`}
                variant="info"
                size="lg"
                soundFeedback="click"
                onClick={() => onSelectAmount(amt)}
                className="text-lg font-black"
              >
                {formatRupiah(amt)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Lembaran Uang Rupiah Standar */}
      <div>
        <span className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">
          Pilih Lembaran Uang Tunai:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {standardBills.map((bill) => (
            <Button
              key={bill}
              variant="secondary"
              size="lg"
              soundFeedback="click"
              onClick={() => onSelectAmount(bill)}
              className="text-lg sm:text-xl font-extrabold border-2 border-gray-300"
            >
              {formatRupiah(bill)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tombol Tambah Cepat (+10rb, +20rb, +50rb, +100rb) */}
      {onAddAmount && (
        <div>
          <span className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">
            Tambah Uang Cepat:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {addIncrements.map((inc) => (
              <Button
                key={`add-${inc}`}
                variant="warning"
                size="md"
                soundFeedback="click"
                onClick={() => onAddAmount(inc)}
                className="text-base sm:text-lg font-black"
              >
                +{formatRupiah(inc).replace('Rp ', '')}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tombol Reset / Nolkan */}
      {currentCashGiven > 0 && (
        <Button
          variant="danger"
          size="md"
          fullWidth
          soundFeedback="click"
          onClick={() => {
            sound.playClick();
            onSelectAmount(0);
          }}
          className="text-base font-extrabold"
        >
          Nolkan Pilihan Uang (Reset)
        </Button>
      )}
    </div>
  );
};

export default QuickCashButtons;
