import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

interface ConsignorProduct {
  id: number;
  name: string;
  selling_price: number;
  consignor_split_price?: number | null;
  cost_price: number;
}

interface ConsignorItem {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  products?: ConsignorProduct[];
}

interface SettlementItemRow {
  id: number;
  product?: { name: string } | null;
  sold_quantity: number;
  consignor_split_price: number;
  selling_price_snapshot: number;
  total_payable: number;
  store_profit: number;
}

interface SettlementRecord {
  id: number;
  settlement_number: string;
  start_date: string;
  end_date: string;
  total_sold_quantity: number;
  total_payable_amount: number;
  total_store_profit: number;
  status: 'PAID' | 'PENDING';
  created_at: string;
  consignor?: ConsignorItem | null;
  items: SettlementItemRow[];
}

interface ConsignmentsIndexProps {
  settlements: {
    data: SettlementRecord[];
    current_page: number;
    last_page: number;
    total: number;
  };
  consignors: ConsignorItem[];
  summary: {
    consignors_count: number;
    products_count: number;
    total_paid: number;
    total_profit: number;
  };
}

export default function ConsignmentsIndex({
  settlements,
  consignors,
  summary,
}: ConsignmentsIndexProps) {
  const toast = useToast();

  // Modal Tambah Penitip
  const [consignorModalOpen, setConsignorModalOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');

  // Modal Rekonsiliasi Bagi Hasil
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [selectedConsignorId, setSelectedConsignorId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSaveConsignor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;

    router.post(
      '/owner/consignments/consignors',
      { name: cName, phone: cPhone, address: cAddress },
      {
        onSuccess: () => {
          sound.playChime();
          toast.success('Data warga penitip berhasil disimpan');
          setConsignorModalOpen(false);
          setCName('');
          setCPhone('');
          setCAddress('');
        },
      }
    );
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsignorId) {
      toast.error('Pilih nama warga penitip.');
      return;
    }

    setSubmitting(true);
    router.post(
      '/owner/consignments/settlements',
      {
        consignor_id: selectedConsignorId,
        start_date: startDate,
        end_date: endDate,
        notes,
      },
      {
        onSuccess: () => {
          sound.playChime();
          toast.success('Bagi hasil berhasil dibukukan!');
          setSettlementModalOpen(false);
          setSubmitting(false);
        },
        onError: (errs) => {
          sound.playError();
          toast.error(errs.consignor_id || 'Gagal menghitung bagi hasil.');
          setSubmitting(false);
        },
      }
    );
  };

  return (
    <OwnerLayout title="Rekonsiliasi Makanan Titipan Warga - Grossmart">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Makanan Titipan Warga (Konsinyasi)
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Kelola titipan kue basah, kerupuk, atau gorengan tetangga dan hitung bagi hasil terjual transparan.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                sound.playClick();
                setConsignorModalOpen(true);
              }}
              className="font-black text-sm"
            >
              + Tambah Penitip
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                sound.playClick();
                setSelectedConsignorId(consignors[0]?.id || '');
                setSettlementModalOpen(true);
              }}
              className="font-black text-sm"
            >
              🤝 Hitung Bagi Hasil
            </Button>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Warga Penitip</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {summary.consignors_count} Orang
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Tetangga terdaftar</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Varian Makanan</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {summary.products_count} Produk
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Produk tipe titipan</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Dibagikan ke Warga</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {formatRupiah(summary.total_paid)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Hak uang penitip</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bagi Hasil Kas Warung</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {formatRupiah(summary.total_profit)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Keuntungan warung</span>
          </div>
        </div>

        {/* Tabel Riwayat Bagi Hasil */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">No. Rekonsiliasi</th>
                  <th className="py-4 px-4">Nama Warga Penitip</th>
                  <th className="py-4 px-4">Periode Penjualan</th>
                  <th className="py-4 px-4 text-center">Total Laku</th>
                  <th className="py-4 px-4 text-right">Uang Diserahkan ke Warga</th>
                  <th className="py-4 px-4 text-right">Margin Warung</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {settlements.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                      Belum ada catatan rekonsiliasi bagi hasil titipan.
                    </td>
                  </tr>
                ) : (
                  settlements.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-white block">
                          {item.settlement_number}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-white">
                        {item.consignor?.name || 'Warga Umum'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-300">
                        {new Date(item.start_date).toLocaleDateString('id-ID')} s.d.{' '}
                        {new Date(item.end_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-200">
                        {item.total_sold_quantity} Pcs
                      </td>
                      <td className="py-4 px-4 text-right font-black text-emerald-400 font-mono text-base">
                        {formatRupiah(item.total_payable_amount)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-amber-400 font-mono text-base">
                        {formatRupiah(item.total_store_profit)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ✓ SUDAH DIBAGIKAN
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah Penitip */}
        <Modal
          isOpen={consignorModalOpen}
          onClose={() => setConsignorModalOpen(false)}
          maxWidth="md"
        >
          <form onSubmit={handleSaveConsignor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nama Warga Penitip
              </label>
              <input
                type="text"
                placeholder="Contoh: Ibu Rina (Gorengan Pak RT)"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                placeholder="081234567890"
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Alamat / Blok Rumah
              </label>
              <input
                type="text"
                placeholder="Contoh: Rumah No. 12 RT 04"
                value={cAddress}
                onChange={(e) => setCAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setConsignorModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" className="font-black">
                Simpan Warga Penitip
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Hitung Bagi Hasil */}
        <Modal
          isOpen={settlementModalOpen}
          onClose={() => setSettlementModalOpen(false)}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSettlement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pilih Warga Penitip
              </label>
              <select
                value={selectedConsignorId}
                onChange={(e) => setSelectedConsignorId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                required
              >
                <option value="">-- Pilih Warga --</option>
                {consignors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.products?.length || 0} varian makanan)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Rekap mingguan kue onde-onde & lemper"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400">
              💡 Sistem akan memindai seluruh transaksi kasir yang selesai pada rentang tanggal di atas, mengalikan porsi bagi hasil per bungkus, dan membukukan setoran hak warga.
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setSettlementModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={submitting} className="font-black">
                {submitting ? 'Menghitung...' : 'Kalkulasi & Selesaikan Bagi Hasil'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  );
}
