import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { formatTanggalWaktu } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

export interface ProductOption {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
}

export interface StockConversionItem {
  id: number;
  conversion_number: string;
  source_product_id: number;
  source_quantity: number;
  target_product_id: number;
  conversion_ratio: number;
  target_quantity: number;
  notes?: string | null;
  created_at: string;
  source_product?: {
    id: number;
    name: string;
    unit: string;
  };
  target_product?: {
    id: number;
    name: string;
    unit: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

export interface PaginatedConversions {
  data: StockConversionItem[];
  current_page: number;
  last_page: number;
  prev_page_url?: string | null;
  next_page_url?: string | null;
  total: number;
}

export interface StockConversionsIndexProps {
  conversions: PaginatedConversions;
  products: ProductOption[];
  user_name?: string;
}

export const StockConversionsIndex: React.FC<StockConversionsIndexProps> = ({
  conversions,
  products = [],
  user_name = 'Pemilik Toko',
}) => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [sourceProductId, setSourceProductId] = useState<number>(products[0]?.id || 0);
  const [targetProductId, setTargetProductId] = useState<number>(products[1]?.id || 0);
  const [sourceQuantity, setSourceQuantity] = useState<number>(1);
  const [conversionRatio, setConversionRatio] = useState<number>(12);
  const [notes, setNotes] = useState<string>('');

  const selectedSource = products.find((p) => p.id === sourceProductId);
  const selectedTarget = products.find((p) => p.id === targetProductId);

  const calculatedTargetQuantity = Number((sourceQuantity * conversionRatio).toFixed(2));

  const handleOpenModal = () => {
    sound.playClick();
    if (products.length >= 2) {
      setSourceProductId(products[0].id);
      setTargetProductId(products[1].id);
    }
    setSourceQuantity(1);
    setConversionRatio(12);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceProductId || !targetProductId) {
      toast.warning('Pilih barang asal dan barang tujuan');
      return;
    }

    if (sourceProductId === targetProductId) {
      toast.warning('Barang asal dan barang tujuan tidak boleh sama');
      return;
    }

    if (sourceQuantity <= 0 || conversionRatio <= 0) {
      toast.warning('Jumlah dan rasio konversi harus lebih dari 0');
      return;
    }

    if (selectedSource && sourceQuantity > selectedSource.current_stock) {
      toast.error(`Stok ${selectedSource.name} tidak cukup (sisa ${selectedSource.current_stock} ${selectedSource.unit})`);
      sound.playError();
      return;
    }

    setIsSubmitting(true);
    sound.playChime();

    router.post('/owner/conversions', {
      source_product_id: sourceProductId,
      target_product_id: targetProductId,
      source_quantity: sourceQuantity,
      conversion_ratio: conversionRatio,
      notes: notes.trim() || null,
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        setIsModalOpen(false);
        toast.success('Pecah satuan stok berhasil dicatat');
      },
      onError: (errors) => {
        setIsSubmitting(false);
        sound.playError();
        const errFirst = Object.values(errors)[0];
        toast.error(typeof errFirst === 'string' ? errFirst : 'Gagal memproses konversi stok');
      },
    });
  };

  return (
    <OwnerLayout title="Pecah Satuan Stok (Dus ke Pcs) - Grossmart" userName={user_name}>
      <Head title="Pecah Satuan Stok - Grossmart" />

      <div className="space-y-6 max-w-7xl">
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">🔄</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pecah Satuan Stok (Dus ke Eceran)
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-400">
              Konversi otomatis kulakan grosir besar menjadi eceran tanpa selisih hitungan stok manual.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            soundFeedback="click"
            onClick={handleOpenModal}
            className="min-h-[50px] font-black text-base rounded-2xl shadow-lg bg-emerald-600 hover:bg-emerald-500"
          >
            + Buka Dus / Pecah Satuan
          </Button>
        </div>

        {/* Tabel Riwayat Pecah Satuan */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                Riwayat Pemecahan Satuan
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                Total {conversions.total} mutasi konversi tercatat dalam audit stok
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-xs font-black uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4">No. Ref & Waktu</th>
                  <th className="p-4">Barang Asal (Berkurang)</th>
                  <th className="p-4">Rasio Pecah</th>
                  <th className="p-4">Barang Tujuan (Bertambah)</th>
                  <th className="p-4">Petugas</th>
                  <th className="p-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm font-bold text-slate-200">
                {conversions.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <span className="text-4xl block mb-2">📦</span>
                      Belum ada riwayat pemecahan satuan dus ke eceran.
                    </td>
                  </tr>
                ) : (
                  conversions.data.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-black text-white block">
                          {c.conversion_number}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {formatTanggalWaktu(c.created_at)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-rose-400 font-black block">
                          -{c.source_quantity} {c.source_product?.unit || 'Dus'}
                        </span>
                        <span className="text-xs text-slate-300">
                          {c.source_product?.name || `Produk #${c.source_product_id}`}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-black text-slate-300">
                        1 : {c.conversion_ratio}
                      </td>

                      <td className="p-4">
                        <span className="text-emerald-400 font-black block">
                          +{c.target_quantity} {c.target_product?.unit || 'Pcs'}
                        </span>
                        <span className="text-xs text-slate-300">
                          {c.target_product?.name || `Produk #${c.target_product_id}`}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-300">
                        {c.creator?.name || 'Pemilik'}
                      </td>

                      <td className="p-4 text-xs text-slate-400 italic">
                        {c.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {conversions.last_page > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Halaman {conversions.current_page} dari {conversions.last_page}</span>
              <div className="flex gap-2">
                {conversions.prev_page_url && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => router.visit(conversions.prev_page_url!)}
                  >
                    Sebelumnya
                  </Button>
                )}
                {conversions.next_page_url && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => router.visit(conversions.next_page_url!)}
                  >
                    Berikutnya
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Eksekusi Pecah Satuan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Pecah Satuan Kulakan (Dus ke Pcs)"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold leading-relaxed">
            💡 Mengurangi stok barang kemasan besar dan secara atomik menambah stok barang eceran tanpa merusak data keuangan HPP.
          </div>

          {/* Pilih Barang Sumber */}
          <div>
            <label htmlFor="source-product-select" className="block text-xs font-black uppercase text-slate-300 tracking-wider mb-1.5">
              Barang Kemasan Besar (Sumber yang Dipecah):
            </label>
            <select
              id="source-product-select"
              value={sourceProductId}
              onChange={(e) => setSourceProductId(parseInt(e.target.value, 10))}
              className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-900 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Sisa: {p.current_stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="source-quantity-input" className="block text-xs font-black uppercase text-slate-300 tracking-wider mb-1.5">
                Jumlah Dus/Kemasan yang Dibuka:
              </label>
              <div className="relative">
                <input
                  id="source-quantity-input"
                  type="number"
                  min="0.1"
                  step="any"
                  value={sourceQuantity}
                  onChange={(e) => setSourceQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[50px] px-3.5 text-lg font-black bg-slate-900 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 tabular-nums focus:outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sm font-bold text-slate-400">
                  {selectedSource?.unit || 'Dus'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="conversion-ratio-input" className="block text-xs font-black uppercase text-slate-300 tracking-wider mb-1.5">
                Isi per Kemasan (Rasio Eceran):
              </label>
              <div className="relative">
                <input
                  id="conversion-ratio-input"
                  type="number"
                  min="1"
                  step="any"
                  value={conversionRatio}
                  onChange={(e) => setConversionRatio(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[50px] px-3.5 text-lg font-black bg-slate-900 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 tabular-nums focus:outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sm font-bold text-slate-400">
                  {selectedTarget?.unit || 'Pcs'} / {selectedSource?.unit || 'Dus'}
                </span>
              </div>
            </div>
          </div>

          {/* Pilih Barang Target */}
          <div>
            <label htmlFor="target-product-select" className="block text-xs font-black uppercase text-slate-300 tracking-wider mb-1.5">
              Barang Eceran Tujuan (Hasil yang Bertambah):
            </label>
            <select
              id="target-product-select"
              value={targetProductId}
              onChange={(e) => setTargetProductId(parseInt(e.target.value, 10))}
              className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-900 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Sisa Sekarang: {p.current_stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Kalkulasi Ringkasan Pratinjau */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">
                Hasil Pemecahan Stok:
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">
                +{calculatedTargetQuantity} {selectedTarget?.unit || 'Pcs'}
              </span>
            </div>
            <span className="text-2xl">➡️</span>
          </div>

          {/* Catatan Opsional */}
          <div>
            <label htmlFor="conversion-notes-input" className="block text-xs font-black uppercase text-slate-300 tracking-wider mb-1.5">
              Catatan / Keterangan (Opsional):
            </label>
            <input
              id="conversion-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pecah 1 dus Indomie Goreng untuk stok rak depan"
              className="w-full min-h-[50px] px-3.5 text-sm font-bold bg-slate-900 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 min-h-[52px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="flex-1 min-h-[52px] font-black bg-emerald-600 hover:bg-emerald-500"
            >
              Proses Pemecahan Stok ➔
            </Button>
          </div>
        </form>
      </Modal>
    </OwnerLayout>
  );
};

export default StockConversionsIndex;
