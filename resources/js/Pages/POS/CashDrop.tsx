import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PosLayout } from '@/Layouts/PosLayout';
import { Button } from '@/Components/UI/Button';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

export interface OwnerOption {
  id: number;
  name: string;
}

export interface ShiftInfo {
  id: number;
  start_time: string;
  starting_cash: number;
  cashier?: {
    name: string;
  };
}

export interface CashDropPageProps {
  shift: ShiftInfo;
  owners: OwnerOption[];
}

export const CashDrop: React.FC<CashDropPageProps> = ({
  shift,
  owners = [],
}) => {
  const toast = useToast();
  const [amount, setAmount] = useState<number>(100000);
  const [receivedBy, setReceivedBy] = useState<number>(owners[0]?.id || 1);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const quickAmounts = [100000, 200000, 500000, 1000000, 2000000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 1000) {
      toast.warning('Nominal setoran brankas minimal Rp 1.000');
      sound.playError();
      return;
    }

    if (!receivedBy) {
      toast.warning('Pilih pemilik toko yang menerima setoran');
      return;
    }

    sound.playChime();
    setIsSubmitting(true);

    router.post('/pos/cash-drops', {
      amount,
      received_by: receivedBy,
      notes: notes.trim() || null,
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
      },
      onError: (errors) => {
        setIsSubmitting(false);
        sound.playError();
        const errFirst = Object.values(errors)[0];
        toast.error(typeof errFirst === 'string' ? errFirst : 'Gagal mencatat setoran uang kas');
      },
    });
  };

  return (
    <PosLayout
      title="Setor Kas ke Brankas - Grossmart"
      shiftStartTime={shift?.start_time}
    >
      <Head title="Setor Kas ke Brankas (Cash Drop) - Grossmart" />

      <div className="max-w-2xl mx-auto w-full py-4 sm:py-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Kartu */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-black">
              🏦
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Setor Kas ke Brankas (Cash Drop)
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-400">
                Pindahkan uang fisik dari laci kasir ke brankas pemilik toko untuk menjaga keamanan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nominal Uang */}
            <div className="space-y-2">
              <label htmlFor="cash-drop-amount" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Nominal Uang yang Disetor:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-black text-slate-500 select-none">
                  Rp
                </span>
                <input
                  id="cash-drop-amount"
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full min-h-[64px] pl-16 pr-4 text-3xl font-black bg-slate-950 text-emerald-400 border-2 border-slate-700 rounded-2xl focus:border-emerald-500 focus:outline-none tabular-nums"
                />
              </div>

              {/* Tombol Preset Cepat */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAmount(q);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all border cursor-pointer active:scale-95 ${
                      amount === q
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {formatRupiah(q)}
                  </button>
                ))}
              </div>
            </div>

            {/* Pilihan Penerima (Pemilik Toko) */}
            <div className="space-y-1.5">
              <label htmlFor="cash-drop-received-by" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Diserahkan Langsung Kepada:
              </label>
              <select
                id="cash-drop-received-by"
                value={receivedBy}
                onChange={(e) => setReceivedBy(parseInt(e.target.value, 10))}
                className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} (Pemilik Toko)
                  </option>
                ))}
              </select>
            </div>

            {/* Catatan / Keterangan */}
            <div className="space-y-1.5">
              <label htmlFor="cash-drop-notes" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Catatan / Keterangan (Opsional):
              </label>
              <input
                id="cash-drop-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pengamanan uang tunai siang hari"
                className="w-full min-h-[50px] px-3.5 text-sm font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.visit('/pos')}
                className="flex-1 min-h-[54px] font-black"
              >
                Batal / Kembali
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="flex-1 min-h-[54px] font-black text-base bg-emerald-600 hover:bg-emerald-500 shadow-xl"
              >
                Simpan Setoran Brankas ➔
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PosLayout>
  );
};

export default CashDrop;
