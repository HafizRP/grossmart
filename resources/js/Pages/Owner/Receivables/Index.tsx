import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

interface PaymentHistory {
  id: number;
  receipt_number: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
  created_at: string;
  receiver?: { name: string } | null;
}

interface ReceivableItem {
  id: number;
  sale_id: number;
  customer_id: number;
  total_amount: number;
  down_payment: number;
  remaining_balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  due_date: string | null;
  created_at: string;
  customer?: {
    id: number;
    name: string;
    phone?: string | null;
  } | null;
  sale?: {
    invoice_number: string;
    cashier?: { name: string } | null;
  } | null;
  payments?: PaymentHistory[];
}

interface ReceivablesIndexProps {
  receivables: {
    data: ReceivableItem[];
    current_page: number;
    last_page: number;
    total: number;
  };
  summary: {
    total_outstanding: number;
    customers_count: number;
    overdue_count: number;
  };
  filters: {
    status?: string | null;
    search?: string | null;
  };
}

export default function ReceivablesIndex({
  receivables,
  summary,
  filters,
}: ReceivablesIndexProps) {
  const toast = useToast();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedReceivable, setSelectedReceivable] = useState<ReceivableItem | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [payNotes, setPayNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/owner/receivables', { search, status: filters.status || '' }, { preserveState: true });
  };

  const handleFilterStatus = (status: string) => {
    router.get('/owner/receivables', { search, status }, { preserveState: true });
  };

  const openPayModal = (item: ReceivableItem) => {
    sound.playClick();
    setSelectedReceivable(item);
    setPayAmount(item.remaining_balance);
    setPayMethod('CASH');
    setPayNotes('');
    setPayModalOpen(true);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    if (payAmount <= 0) {
      toast.error('Nominal pembayaran harus lebih dari 0.');
      return;
    }
    if (payAmount > selectedReceivable.remaining_balance) {
      toast.error('Nominal melebihi sisa utang!');
      return;
    }

    setSubmitting(true);
    router.post(
      `/owner/receivables/${selectedReceivable.id}/pay`,
      {
        amount: payAmount,
        payment_method: payMethod,
        notes: payNotes,
      },
      {
        onSuccess: () => {
          sound.playChime();
          toast.success('Pembayaran bon berhasil dicatat!');
          setPayModalOpen(false);
          setSubmitting(false);
        },
        onError: (errs) => {
          sound.playError();
          toast.error(errs.amount || 'Gagal mencatat pembayaran.');
          setSubmitting(false);
        },
      }
    );
  };

  return (
    <OwnerLayout title="Buku Bon Utang Pelanggan - Grossmart">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Buku Bon Utang Pelanggan (Kasbon Warung)
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Catatan piutang belanja tempo warga, tanggal jatuh tempo, dan riwayat setoran cicilan.
            </p>
          </div>
          <Link
            href="/pos"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg transition-all"
          >
            🛒 Buka Kasir
          </Link>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Piutang Belum Lunas</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {formatRupiah(summary.total_outstanding)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Dari transaksi belanja tempo</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pelanggan Berutang</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {summary.customers_count} Orang
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Data pelanggan aktif</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lewat Jatuh Tempo</span>
            <div className={`text-2xl sm:text-3xl font-black mt-2 ${summary.overdue_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {summary.overdue_count} Tagihan
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Perlu diingatkan/ditagih</span>
          </div>
        </div>

        {/* Pencarian dan Filter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleFilterStatus('')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                !filters.status ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => handleFilterStatus('UNPAID')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                filters.status === 'UNPAID' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Belum Bayar
            </button>
            <button
              type="button"
              onClick={() => handleFilterStatus('PARTIAL')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                filters.status === 'PARTIAL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Dicicil Sebagian
            </button>
            <button
              type="button"
              onClick={() => handleFilterStatus('PAID')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                filters.status === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Lunas
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama / nomor HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-black rounded-xl transition-all"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Tabel Data Piutang */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">No. Faktur / Tanggal</th>
                  <th className="py-4 px-4">Nama Pelanggan</th>
                  <th className="py-4 px-4">Jatuh Tempo</th>
                  <th className="py-4 px-4 text-right">Total Bon</th>
                  <th className="py-4 px-4 text-right">Uang Muka (DP)</th>
                  <th className="py-4 px-4 text-right">Sisa Utang</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {receivables.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                      Tidak ada data bon utang pelanggan yang cocok.
                    </td>
                  </tr>
                ) : (
                  receivables.data.map((item) => {
                    const isOverdue =
                      item.status !== 'PAID' &&
                      item.due_date &&
                      new Date(item.due_date) < new Date();

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-white block">
                            {item.sale?.invoice_number || `TRX-${item.sale_id}`}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-black text-white block">
                            {item.customer?.name || 'Pelanggan Umum'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.customer?.phone || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {item.due_date ? (
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                                isOverdue
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {new Date(item.due_date).toLocaleDateString('id-ID')}
                              {isOverdue && ' (Terlambat)'}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-300">
                          {formatRupiah(item.total_amount)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-400">
                          {formatRupiah(item.down_payment)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-base font-black text-amber-400">
                            {formatRupiah(item.remaining_balance)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.status === 'PAID' && (
                            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                              LUNAS
                            </span>
                          )}
                          {item.status === 'PARTIAL' && (
                            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                              DICICIL
                            </span>
                          )}
                          {item.status === 'UNPAID' && (
                            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                              BELUM BAYAR
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.status !== 'PAID' ? (
                            <Button
                              variant="primary"
                              size="md"
                              className="font-black text-xs"
                            >
                              💳 Bayar Cicilan
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-500 font-bold">✓ Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Bayar Cicilan Bon */}
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Catat Pembayaran Bon: ${selectedReceivable?.customer?.name || 'Pelanggan'}`}
          maxWidth="md"
        >
          <form onSubmit={submitPayment} className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Faktur Transaksi:</span>
                <span className="font-mono font-bold text-white">
                  {selectedReceivable?.sale?.invoice_number}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sisa Utang Saat Ini:</span>
                <span className="text-base font-black text-amber-400">
                  {formatRupiah(selectedReceivable?.remaining_balance || 0)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nominal Setoran Bayar (Rp)
              </label>
              <input
                type="number"
                min="1"
                max={selectedReceivable?.remaining_balance || 1}
                value={payAmount}
                onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPayAmount(selectedReceivable?.remaining_balance || 0)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg"
                >
                  Bayar Lunas Semua
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('CASH')}
                  className={`py-3 rounded-xl font-black text-sm border transition-all ${
                    payMethod === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  💵 Uang Tunai (Laci)
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('TRANSFER')}
                  className={`py-3 rounded-xl font-black text-sm border transition-all ${
                    payMethod === 'TRANSFER'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  📱 Transfer Bank / QRIS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Titip lewat anak, cicilan ke-2"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                onClick={() => setPayModalOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitting || payAmount <= 0}
                className="font-black"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  );
}
