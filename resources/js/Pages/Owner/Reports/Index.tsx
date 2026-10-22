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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Laporan Keuangan & Arus Kas Warung
            </h2>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Analisis laba rugi, HPP modal, pengeluaran kas kecil, dan buku catatan bon pembeli.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-700">
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="min-h-[46px] px-3 font-bold border border-slate-700 rounded-xl bg-slate-900 text-white"
              />
              <span className="font-black text-slate-400">s/d</span>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="min-h-[46px] px-3 font-bold border border-slate-700 rounded-xl bg-slate-900 text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                window.location.href = `/owner/reports?start_date=${startDateInput}&end_date=${endDateInput}`;
              }}
              className="min-h-[48px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-sm cursor-pointer transition-all"
            >
              🔍 Terapkan
            </button>

            <Button
              variant="info"
              size="md"
              soundFeedback="click"
              onClick={handlePrint}
              className="min-h-[48px] font-black rounded-xl"
            >
              🖨️ Cetak
            </Button>

            <a
              href={`/owner/reports/export-sales?start_date=${startDateInput}&end_date=${endDateInput}`}
              onClick={() => sound.playClick()}
              className="min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-sm inline-flex items-center gap-1.5 transition-all"
              download
            >
              📥 Ekspor CSV
            </a>

            <a
              href="/owner/backup/database"
              onClick={() => sound.playClick()}
              className="min-h-[48px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-sm inline-flex items-center gap-1.5 transition-all"
              download
            >
              💾 Backup Data
            </a>
          </div>
        </div>
        {/* Tab Submenu Laporan */}
        <div className="flex gap-2 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('profit')}
            className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
              activeSubTab === 'profit' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Laba Rugi & Penjualan
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('receivables')}
            className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
              activeSubTab === 'receivables' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Buku Catatan Bon Pembeli ({receivables.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('shifts')}
            className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
              activeSubTab === 'shifts' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Audit Kas Laci Shift Kasir
          </button>
        </div>

        {/* Tab 1: Laba Rugi Toko */}
        {activeSubTab === 'profit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 rounded-3xl border-2 border-emerald-500 shadow-xl">
                <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">PENJUALAN BERSIH</span>
                <span className="text-3xl font-black text-emerald-300 block mt-2">
                  {formatRupiah(summary.net_sales)}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Kotor: {formatRupiah(summary.gross_sales)} (Diskon: -{formatRupiah(summary.total_discount)})
                </span>
              </div>

              <div className="p-5 bg-slate-900 rounded-3xl border-2 border-blue-500 shadow-xl">
                <span className="text-xs uppercase font-black text-blue-400 tracking-wider">LABA KOTOR (GROSS MARGIN)</span>
                <span className="text-3xl font-black text-blue-300 block mt-2">
                  {formatRupiah(summary.gross_profit)}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Modal HPP: {formatRupiah(summary.total_cogs)}
                </span>
              </div>

              <div className="p-5 bg-slate-900 rounded-3xl border-2 border-emerald-400 shadow-xl">
                <span className="text-xs uppercase font-black text-emerald-300 tracking-wider">LABA BERSIH TOKO</span>
                <span className="text-3xl font-black text-emerald-400 block mt-2">
                  {formatRupiah(summary.net_profit)}
                </span>
                <span className="text-xs text-slate-400 font-bold block mt-1">
                  Setelah beban operasional warung: -{formatRupiah(summary.total_expenses)}
                </span>
              </div>
            </div>

            {/* Rincian Akuntansi Berbahasa Indonesia Ramah Warung */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-black text-white">
                Tabel Rincian Perhitungan Laba Rugi
              </h3>

              <div className="divide-y divide-slate-800 text-base font-bold text-slate-200">
                <div className="py-3 flex justify-between">
                  <span>1. Total Penjualan Kotor (Gross Revenue)</span>
                  <span className="text-white">{formatRupiah(summary.gross_sales)}</span>
                </div>
                <div className="py-3 flex justify-between text-rose-400">
                  <span>2. Total Potongan Harga & Diskon</span>
                  <span>-{formatRupiah(summary.total_discount)}</span>
                </div>
                <div className="py-3 flex justify-between font-black text-lg bg-slate-950 px-3 rounded-xl text-emerald-400">
                  <span>= Pendapatan Penjualan Bersih</span>
                  <span>{formatRupiah(summary.net_sales)}</span>
                </div>
                <div className="py-3 flex justify-between text-slate-400">
                  <span>3. Total Biaya Modal Pokok Barang (HPP)</span>
                  <span>-{formatRupiah(summary.total_cogs)}</span>
                </div>
                <div className="py-3 flex justify-between font-black text-lg bg-slate-950 px-3 rounded-xl text-blue-400">
                  <span>= Laba Kotor Operasional</span>
                  <span>{formatRupiah(summary.gross_profit)}</span>
                </div>
                <div className="py-3 flex justify-between text-rose-400">
                  <span>4. Pengeluaran Biaya Toko (Listrik, Plastik, Makan Kasir)</span>
                  <span>-{formatRupiah(summary.total_expenses)}</span>
                </div>
                <div className="py-4 flex justify-between font-black text-2xl bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 rounded-2xl">
                  <span>= KEUNTUNGAN BERSIH TOKO (NET PROFIT)</span>
                  <span>{formatRupiah(summary.net_profit)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Buku Bon Pembeli */}
        {activeSubTab === 'receivables' && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">
                  Buku Catatan Bon / Piutang Pembeli
                </h3>
                <p className="text-sm font-bold text-slate-400">
                  Total Seluruh Bon Belum Dibayar: <strong className="text-amber-400">{formatRupiah(summary.total_receivable_outstanding)}</strong>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-black uppercase text-slate-400">
                    <th className="p-4">Nama Pembeli</th>
                    <th className="p-4">No. HP / WA</th>
                    <th className="p-4">Total Sisa Bon</th>
                    <th className="p-4">Jatuh Tempo</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm font-bold">
                  {receivables.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Tidak ada catatan bon pembeli aktif
                      </td>
                    </tr>
                  ) : (
                    receivables.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 text-base font-black text-white">{r.customer_name}</td>
                        <td className="p-4 text-slate-400">{r.phone || '-'}</td>
                        <td className="p-4 text-lg font-black text-amber-400">{formatRupiah(r.total_debt)}</td>
                        <td className="p-4 text-slate-400">{r.due_date || 'Tanpa Batas'}</td>
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
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-xl font-black text-white">
              Riwayat Penutupan Kasir (Rekonsiliasi Kas Laci)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-black uppercase text-slate-400">
                    <th className="p-4">Kasir / Waktu</th>
                    <th className="p-4">Modal Awal</th>
                    <th className="p-4">Penjualan Tunai</th>
                    <th className="p-4">Saldo Sistem</th>
                    <th className="p-4">Fisik Dihitung</th>
                    <th className="p-4 text-right">Selisih Kas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm font-bold text-slate-200">
                  {shifts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Belum ada riwayat penutupan shift kasir
                      </td>
                    </tr>
                  ) : (
                    shifts.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <span className="font-black text-base text-white block">{s.cashier_name}</span>
                          <span className="text-xs text-slate-400">{formatTanggalWaktu(s.start_time)}</span>
                        </td>
                        <td className="p-4">{formatRupiah(s.starting_cash)}</td>
                        <td className="p-4 text-emerald-400 font-black">{formatRupiah(s.total_cash_sales)}</td>
                        <td className="p-4">{formatRupiah(s.expected_cash)}</td>
                        <td className="p-4">{s.actual_cash !== undefined ? formatRupiah(s.actual_cash) : '-'}</td>
                        <td className="p-4 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                              (s.difference || 0) === 0
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : (s.difference || 0) > 0
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
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
