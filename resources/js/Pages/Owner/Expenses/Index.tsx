import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

interface ExpenseItem {
  id: number;
  category: string;
  amount: number;
  source: 'DRAWER' | 'OWNER';
  note?: string | null;
  created_at: string;
  shift?: {
    id: number;
    cashier?: { name: string } | null;
  } | null;
  creator?: { name: string } | null;
}

interface ExpensesIndexProps {
  expenses: {
    data: ExpenseItem[];
    current_page: number;
    last_page: number;
    total: number;
  };
  summary: {
    monthly_total: number;
    drawer_total: number;
    owner_total: number;
  };
  categories: string[];
  filters: {
    category?: string | null;
    source?: string | null;
  };
}

export default function ExpensesIndex({
  expenses,
  summary,
  categories,
  filters,
}: ExpensesIndexProps) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState(categories[0] || 'Lain-lain');
  const [amount, setAmount] = useState<number>(0);
  const [source, setSource] = useState<'DRAWER' | 'OWNER'>('DRAWER');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFilter = (key: 'category' | 'source', val: string) => {
    const nextFilters = {
      category: key === 'category' ? val : filters.category || '',
      source: key === 'source' ? val : filters.source || '',
    };
    router.get('/owner/expenses', nextFilters, { preserveState: true });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('Nominal pengeluaran harus lebih dari 0.');
      return;
    }

    setSubmitting(true);
    router.post(
      '/owner/expenses',
      {
        category,
        amount,
        source,
        note,
      },
      {
        onSuccess: () => {
          sound.playChime();
          toast.success('Biaya operasional berhasil dicatat');
          setModalOpen(false);
          setAmount(0);
          setNote('');
          setSubmitting(false);
        },
        onError: () => {
          sound.playError();
          toast.error('Gagal mencatat pengeluaran.');
          setSubmitting(false);
        },
      }
    );
  };

  const handleDelete = (item: ExpenseItem) => {
    sound.playClick();
    if (window.confirm(`Hapus catatan biaya "${item.category}" sebesar ${formatRupiah(item.amount)}?`)) {
      router.delete(`/owner/expenses/${item.id}`, {
        onSuccess: () => toast.success('Catatan biaya berhasil dihapus'),
      });
    }
  };

  return (
    <OwnerLayout title="Biaya Operasional Toko - Grossmart">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Biaya & Pengeluaran Toko
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Catat pengeluaran harian seperti token listrik, kresek, bensin kulakan, dan iuran lingkungan.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              sound.playClick();
              setAmount(0);
              setNote('');
              setModalOpen(true);
            }}
            className="font-black text-sm"
          >
            + Catat Pengeluaran
          </Button>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Beban Bulan Ini</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">
              {formatRupiah(summary.monthly_total)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Mengurangi laba kotor</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diambil dari Laci Kasir</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {formatRupiah(summary.drawer_total)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Mempengaruhi uang fisik kasir</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dari Kantong Pemilik</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {formatRupiah(summary.owner_total)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Dana pribadi pemilik warung</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFilter('source', '')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                !filters.source ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Semua Sumber Dana
            </button>
            <button
              type="button"
              onClick={() => handleFilter('source', 'DRAWER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filters.source === 'DRAWER' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Kas Laci Kasir
            </button>
            <button
              type="button"
              onClick={() => handleFilter('source', 'OWNER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filters.source === 'OWNER' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Uang Pemilik
            </button>
          </div>

          <select
            value={filters.category || ''}
            onChange={(e) => handleFilter('category', e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">-- Semua Kategori Biaya --</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Tabel Data Biaya */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">Tanggal & Waktu</th>
                  <th className="py-4 px-4">Kategori Pengeluaran</th>
                  <th className="py-4 px-4">Keterangan / Keperluan</th>
                  <th className="py-4 px-4">Sumber Dana</th>
                  <th className="py-4 px-4 text-right">Nominal</th>
                  <th className="py-4 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {expenses.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-bold">
                      Belum ada catatan pengeluaran biaya operasional.
                    </td>
                  </tr>
                ) : (
                  expenses.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 text-xs text-slate-300 font-mono">
                        {new Date(item.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 font-black text-white">{item.category}</td>
                      <td className="py-4 px-4 text-slate-300 text-xs">
                        {item.note || '-'}
                        {item.shift?.cashier && (
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Kasir: {item.shift.cashier.name}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {item.source === 'DRAWER' ? (
                          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                            Kas Laci Kasir
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                            Dompet Pemilik
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-rose-400 font-mono text-base">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="text-slate-500 hover:text-rose-400 text-xs font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Catat Biaya */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Catat Pengeluaran Biaya Toko"
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Kategori Pengeluaran
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nominal Biaya (Rp)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-black text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sumber Dana Pengeluaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSource('DRAWER')}
                  className={`py-3 rounded-xl font-black text-xs border transition-all ${
                    source === 'DRAWER'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  💵 Kas Laci Kasir (Kurangi Fisik)
                </button>
                <button
                  type="button"
                  onClick={() => setSource('OWNER')}
                  className={`py-3 rounded-xl font-black text-xs border transition-all ${
                    source === 'OWNER'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  👤 Uang Pribadi Pemilik
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Keterangan / Keperluan
              </label>
              <input
                type="text"
                placeholder="Misal: Beli token listrik PLN 50rb"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={submitting} className="font-black">
                {submitting ? 'Menyimpan...' : 'Simpan Biaya'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  );
}
