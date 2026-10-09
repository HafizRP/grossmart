import React, { useState } from 'react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { formatRupiah, formatTanggalWaktu } from '@/Utils/format';
import { Button } from '@/Components/UI/Button';
import { sound } from '@/Utils/sound';

export interface ReportSummary {
  gross_sales: number;
  total_discount: number;
  net_sales: number;
  total_cogs: number; // HPP Modal
  gross_profit: number;
  total_expenses: number;
  net_profit: number;
  total_receivable_outstanding: number;
  total_payable_outstanding: number;
}

export interface ReceivableItem {
  id: number;
  customer_name: string;
  phone?: string;
  total_debt: number;
  due_date?: string;
  last_payment_date?: string;
}

export interface ShiftAuditItem {
  id: number;
  cashier_name: string;
  start_time: string;
  end_time?: string;
  starting_cash: number;
  total_cash_sales: number;
  expected_cash: number;
  actual_cash?: number;
  difference?: number;
}

export interface ReportsIndexProps {
  summary: ReportSummary;
  receivables: ReceivableItem[];
  shifts: ShiftAuditItem[];
  start_date?: string;
  end_date?: string;
  user_name?: string;
}

export const ReportsIndex: React.FC<ReportsIndexProps> = ({
  summary = {
    gross_sales: 0,
    total_discount: 0,
    net_sales: 0,
    total_cogs: 0,
    gross_profit: 0,
    total_expenses: 0,
    net_profit: 0,
    total_receivable_outstanding: 0,
    total_payable_outstanding: 0,
  },
  receivables = [],
  shifts = [],
  start_date,
  end_date,
  user_name,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profit' | 'receivables' | 'shifts'>('profit');
  const [startDateInput, setStartDateInput] = useState<string>(start_date || new Date().toISOString().split('T')[0]);
  const [endDateInput, setEndDateInput] = useState<string>(end_date || new Date().toISOString().split('T')[0]);

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <OwnerLayout title="Laporan Keuangan & Laba Rugi - Grossmart" userName={user_name}>
      <div className="space-y-6">
        {/* Header & Filter Rentang Tanggal */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Laporan Keuangan & Arus Kas Warung
            </h2>
            <p className="text-base font-bold text-gray-600 mt-0.5">
              Analisis laba rugi, HPP modal, pengeluaran kas kecil, dan buku catatan bon pembeli.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="min-h-[46px] px-3 font-bold border-2 border-gray-300 rounded-xl"
              />
              <span className="font-bold text-gray-500">s/d</span>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="min-h-[46px] px-3 font-bold border-2 border-gray-300 rounded-xl"
              />
            </div>

            <Button
              variant="info"
              size="md"
              soundFeedback="click"
              onClick={handlePrint}
              className="font-black"
            >
              Cetak Laporan
            </Button>
          </div>
        </div>

        {/* Tab Submenu Laporan */}
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('profit')}
            className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
              activeSubTab === 'profit' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Laba Rugi & Penjualan
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('receivables')}
            className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
              activeSubTab === 'receivables' ? 'border-amber-500 text-amber-800' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Buku Catatan Bon Pembeli ({receivables.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('shifts')}
            className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
              activeSubTab === 'shifts' ? 'border-blue-600 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Audit Kas Laci Shift Kasir
          </button>
        </div>

        {/* Tab 1: Laba Rugi Toko */}
        {activeSubTab === 'profit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-3xl border-3 border-emerald-500 shadow-sm">
                <span className="text-xs uppercase font-black text-emerald-800 tracking-wider">PENJUALAN BERSIH</span>
                <span className="text-3xl font-black text-emerald-700 block mt-2">
                  {formatRupiah(summary.net_sales)}
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  Kotor: {formatRupiah(summary.gross_sales)} (Diskon: -{formatRupiah(summary.total_discount)})
                </span>
              </div>

              <div className="p-5 bg-white rounded-3xl border-3 border-blue-500 shadow-sm">
                <span className="text-xs uppercase font-black text-blue-800 tracking-wider">LABA KOTOR (GROSS MARGIN)</span>
                <span className="text-3xl font-black text-blue-700 block mt-2">
                  {formatRupiah(summary.gross_profit)}
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  Modal HPP: {formatRupiah(summary.total_cogs)}
                </span>
              </div>

              <div className="p-5 bg-white rounded-3xl border-3 border-emerald-600 bg-emerald-50 shadow-sm">
                <span className="text-xs uppercase font-black text-emerald-950 tracking-wider">LABA BERSIH TOKO</span>
                <span className="text-3xl font-black text-emerald-800 block mt-2">
                  {formatRupiah(summary.net_profit)}
                </span>
                <span className="text-xs text-emerald-900 font-bold block mt-1">
                  Setelah beban operasional warung: -{formatRupiah(summary.total_expenses)}
                </span>
              </div>
            </div>

            {/* Rincian Akuntansi Berbahasa Indonesia Ramah Warung */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-gray-950">
                Tabel Rincian Perhitungan Laba Rugi
              </h3>

              <div className="divide-y divide-gray-200 text-base font-bold text-gray-800">
                <div className="py-3 flex justify-between">
                  <span>1. Total Penjualan Kotor (Gross Revenue)</span>
                  <span>{formatRupiah(summary.gross_sales)}</span>
                </div>
                <div className="py-3 flex justify-between text-rose-600">
                  <span>2. Total Potongan Harga & Diskon</span>
                  <span>-{formatRupiah(summary.total_discount)}</span>
                </div>
                <div className="py-3 flex justify-between font-black text-lg bg-gray-50 px-2 rounded-xl">
                  <span>= Pendapatan Penjualan Bersih</span>
                  <span>{formatRupiah(summary.net_sales)}</span>
                </div>
                <div className="py-3 flex justify-between text-gray-600">
                  <span>3. Total Biaya Modal Pokok Barang (HPP)</span>
                  <span>-{formatRupiah(summary.total_cogs)}</span>
                </div>
                <div className="py-3 flex justify-between font-black text-lg bg-blue-50 text-blue-900 px-2 rounded-xl">
                  <span>= Laba Kotor Operasional</span>
                  <span>{formatRupiah(summary.gross_profit)}</span>
                </div>
                <div className="py-3 flex justify-between text-rose-600">
                  <span>4. Pengeluaran Biaya Toko (Listrik, Plastik, Makan Kasir)</span>
                  <span>-{formatRupiah(summary.total_expenses)}</span>
                </div>
                <div className="py-4 flex justify-between font-black text-2xl bg-emerald-100 text-emerald-950 px-3 rounded-2xl">
                  <span>= KEUNTUNGAN BERSIH TOKO (NET PROFIT)</span>
                  <span>{formatRupiah(summary.net_profit)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Buku Bon Pembeli */}
        {activeSubTab === 'receivables' && (
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-950">
                  Buku Catatan Bon / Piutang Pembeli
                </h3>
                <p className="text-sm font-bold text-gray-500">
                  Total Seluruh Bon Belum Dibayar: <strong className="text-amber-700">{formatRupiah(summary.total_receivable_outstanding)}</strong>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-black uppercase text-gray-800">
                    <th className="p-4">Nama Pembeli</th>
                    <th className="p-4">No. HP / WA</th>
                    <th className="p-4">Total Sisa Bon</th>
                    <th className="p-4">Jatuh Tempo</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-bold">
                  {receivables.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        Tidak ada catatan bon pembeli aktif
                      </td>
                    </tr>
                  ) : (
                    receivables.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-4 text-base font-black text-gray-950">{r.customer_name}</td>
                        <td className="p-4 text-gray-600">{r.phone || '-'}</td>
                        <td className="p-4 text-lg font-black text-amber-800">{formatRupiah(r.total_debt)}</td>
                        <td className="p-4 text-gray-600">{r.due_date || 'Tanpa Batas'}</td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              const phone = (r.phone || '').replace(/\D/g, '');
                              const text = `Halo Ibu/Bapak ${r.customer_name}, mengingatkan catatan bon belanja di Toko kami sebesar ${formatRupiah(r.total_debt)}. Terima kasih.`;
                              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
                          >
                            Ingatkan via WA
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Shift Kasir */}
        {activeSubTab === 'shifts' && (
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-gray-950">
              Riwayat Penutupan Kasir (Rekonsiliasi Kas Laci)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-black uppercase text-gray-800">
                    <th className="p-4">Kasir / Waktu</th>
                    <th className="p-4">Modal Awal</th>
                    <th className="p-4">Penjualan Tunai</th>
                    <th className="p-4">Saldo Sistem</th>
                    <th className="p-4">Fisik Dihitung</th>
                    <th className="p-4 text-right">Selisih Kas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-bold">
                  {shifts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Belum ada riwayat penutupan shift kasir
                      </td>
                    </tr>
                  ) : (
                    shifts.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-black text-base text-gray-950 block">{s.cashier_name}</span>
                          <span className="text-xs text-gray-500">{formatTanggalWaktu(s.start_time)}</span>
                        </td>
                        <td className="p-4">{formatRupiah(s.starting_cash)}</td>
                        <td className="p-4 text-emerald-700">{formatRupiah(s.total_cash_sales)}</td>
                        <td className="p-4">{formatRupiah(s.expected_cash)}</td>
                        <td className="p-4">{s.actual_cash !== undefined ? formatRupiah(s.actual_cash) : '-'}</td>
                        <td className="p-4 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                              (s.difference || 0) === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : (s.difference || 0) > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {(s.difference || 0) === 0
                              ? 'PAS'
                              : (s.difference || 0) > 0
                              ? `+${formatRupiah(s.difference || 0)}`
                              : formatRupiah(s.difference || 0)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
};

export default ReportsIndex;
