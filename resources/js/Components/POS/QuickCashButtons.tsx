import React from 'react';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface QuickCashButtonsProps {
  totalAmount: number;
  currentCashGiven?: number;
  onSelectAmount: (amount: number) => void;
  onAddAmount?: (amount: number) => void;
}

interface BillPreset {
  value: number;
  label: string;
  sublabel: string;
  bgGradient: string;
  textColor: string;
  borderColor: string;
  accentBadge: string;
}

const billsConfig: BillPreset[] = [
  {
    value: 100000,
    label: '100.000',
    sublabel: 'Merah',
    bgGradient: 'bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 active:from-rose-200',
    textColor: 'text-rose-950',
    borderColor: 'border-rose-400 focus:border-rose-600',
    accentBadge: 'bg-rose-600 text-white',
  },
  {
    value: 50000,
    label: '50.000',
    sublabel: 'Biru',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 active:from-blue-200',
    textColor: 'text-blue-950',
    borderColor: 'border-blue-400 focus:border-blue-600',
    accentBadge: 'bg-blue-600 text-white',
  },
  {
    value: 20000,
    label: '20.000',
    sublabel: 'Hijau',
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 active:from-emerald-200',
    textColor: 'text-emerald-950',
    borderColor: 'border-emerald-400 focus:border-emerald-600',
    accentBadge: 'bg-emerald-600 text-white',
  },
  {
    value: 10000,
    label: '10.000',
    sublabel: 'Ungu',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 active:from-purple-200',
    textColor: 'text-purple-950',
    borderColor: 'border-purple-400 focus:border-purple-600',
    accentBadge: 'bg-purple-600 text-white',
  },
];

export const QuickCashButtons: React.FC<QuickCashButtonsProps> = ({
  totalAmount,
  currentCashGiven = 0,
  onSelectAmount,
  onAddAmount,
}) => {
  // Hitung pecahan bulat terdekat di atas total belanja
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

  const handleSelect = (amt: number) => {
    sound.playClick();
    onSelectAmount(amt);
  };

  const handleAdd = (amt: number) => {
    sound.playClick();
    if (onAddAmount) {
      onAddAmount(amt);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Tombol Uang Pas Jumbo Emas (Aksi Paling Sering & Bebas Pusing) */}
      <button
        type="button"
        onClick={() => handleSelect(totalAmount)}
        className="w-full min-h-[64px] px-5 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 active:scale-[0.99] transition-all rounded-2xl border-4 border-amber-600 shadow-md flex items-center justify-between group"
      >
        <div className="text-left flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-800 text-amber-100 flex items-center justify-center font-black text-xl shadow-inner">
            ✓
          </span>
          <div>
            <span className="text-xs uppercase font-black text-amber-950 tracking-wider block">
              Pilihan Paling Cepat
            </span>
            <span className="text-2xl font-black text-amber-950 tracking-tight block">
              UANG PAS
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-amber-950 tabular-nums">
            {formatRupiah(totalAmount)}
          </span>
          <span className="text-xs font-extrabold text-amber-900 block">
            Kembalian Rp 0
          </span>
        </div>
      </button>

      {/* 2. Lembaran Uang Visual Khas Rupiah (BCA ATM Inspiration) */}
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
          Pilih Lembaran Uang Pembeli:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {billsConfig.map((bill) => {
            const isSelected = currentCashGiven === bill.value;
            return (
              <button
                key={bill.value}
                type="button"
                onClick={() => handleSelect(bill.value)}
                className={`min-h-[68px] p-2.5 rounded-2xl border-3 transition-all flex flex-col justify-between text-left active:scale-[0.98] ${
                  bill.bgGradient
                } ${bill.borderColor} ${
                  isSelected ? 'ring-4 ring-offset-2 ring-emerald-500 shadow-lg scale-[1.02]' : 'shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${bill.accentBadge}`}>
                    {bill.sublabel}
                  </span>
                  <span className="text-[10px] font-black text-gray-500">
                    Rp
                  </span>
                </div>
                <div className="mt-1">
                  <span className={`text-xl font-black tracking-tight ${bill.textColor} tabular-nums block`}>
                    {bill.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pembulatan Terdekat (Misal total Rp 23.500 -> 25.000 / 30.000) */}
      {dynamicSuggestions.length > 0 && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
              Uang Bulat Terdekat:
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Cukup sekali sentuh
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dynamicSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSelect(sug)}
                className="flex-1 min-h-[46px] px-3 py-2 bg-white hover:bg-slate-100 active:scale-[0.98] border-2 border-slate-300 rounded-xl text-base font-black text-slate-900 tabular-nums shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>{formatRupiah(sug)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tambah Cepat (+10rb, +20rb, +50rb) & Reset */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        {onAddAmount && (
          <div className="flex-1 flex gap-1.5">
            {[10000, 20000, 50000].map((addAmt) => (
              <button
                key={addAmt}
                type="button"
                onClick={() => handleAdd(addAmt)}
                className="flex-1 min-h-[42px] px-2 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] border border-gray-300 rounded-xl text-xs font-black text-gray-800 tabular-nums"
              >
                +{addAmt / 1000}rb
              </button>
            ))}
          </div>
        )}

        {currentCashGiven > 0 && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectAmount(0);
            }}
            className="min-h-[42px] px-3.5 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] border border-rose-200 rounded-xl text-xs font-black text-rose-700 flex items-center gap-1"
          >
            ✕ Nolkan
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickCashButtons;
