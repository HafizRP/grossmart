import React from 'react';
import { Link } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { formatRupiah, formatTanggalWaktu } from '@/Utils/format';

export interface DashboardMetrics {
  today_revenue: number;
  today_transactions_count: number;
  total_customer_receivables: number;
  total_supplier_payables: number;
  low_stock_count: number;
  expiring_soon_count: number;
}

export interface RecentTransaction {
  id: number;
  invoice_number: string;
  cashier_name: string;
  customer_name?: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  min_stock_alert: number;
  unit: string;
}

export interface OwnerDashboardProps {
  metrics: DashboardMetrics;
  recent_transactions: RecentTransaction[];
  low_stock_products: LowStockItem[];
  user_name: string;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  metrics = {
    today_revenue: 0,
    today_transactions_count: 0,
    total_customer_receivables: 0,
    total_supplier_payables: 0,
    low_stock_count: 0,
    expiring_soon_count: 0,
  },
  recent_transactions = [],
  low_stock_products = [],
  user_name = 'Pemilik Toko',
}) => {
  return (
    <OwnerLayout title="Ringkasan Warung - Grossmart" userName={user_name}>
      <div className="space-y-6 max-w-7xl">
        {/* Banner Selamat Datang & Pintasan Cepat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Selamat Datang, {user_name}!
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-400">
              Pantau arus omzet, sisa bon pembeli, dan barang dagangan yang perlu segera dikulak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/pos"
              className="min-h-[50px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-lg border border-emerald-500 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🛒</span>
              <span>Layar Kasir</span>
            </Link>
            <Link
              href="/owner/products"
              className="min-h-[50px] px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>📦</span>
              <span>Kelola Barang</span>
            </Link>
          </div>
        </div>

        {/* 5 Kartu Metrik Ringkasan Jumbo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* 1. Omzet Hari Ini */}
          <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl border-2 border-emerald-500 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black tracking-wider text-emerald-200 block">
                💰 OMZET KAS HARI INI
              </span>
              <span className="text-2xl sm:text-3xl font-black block mt-1.5 tabular-nums tracking-tight">
                {formatRupiah(metrics.today_revenue)}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-200 mt-3 pt-2 border-t border-emerald-500/50 block">
              ✓ {metrics.today_transactions_count} Nota Sukses
            </span>
          </div>

          {/* 2. Total Bon Piutang Pembeli */}
          <div className="p-5 bg-slate-900 rounded-3xl border-2 border-amber-500/40 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-amber-400 tracking-wider block">
                📖 BUKU BON (UTANG WARGA)
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block mt-1.5 tabular-nums tracking-tight">
                {formatRupiah(metrics.total_customer_receivables)}
              </span>
            </div>
            <Link
              href="/owner/reports"
              className="min-h-[36px] text-xs font-black text-amber-400 hover:text-amber-300 hover:underline mt-3 pt-2 border-t border-slate-800 flex items-center justify-between"
            >
              <span>Buka Rincian Bon</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 3. Utang ke Pemasok / Agen */}
          <div className="p-5 bg-slate-900 rounded-3xl border-2 border-blue-500/40 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-blue-400 tracking-wider block">
                🚚 UTANG KULAKAN AGEN
              </span>
              <span className="text-2xl sm:text-3xl font-black text-blue-300 block mt-1.5 tabular-nums tracking-tight">
                {formatRupiah(metrics.total_supplier_payables)}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400 mt-3 pt-2 border-t border-slate-800 block">
              Faktur Belum Lunas
            </span>
          </div>

          {/* 4. Peringatan Stok Menipis */}
          <div className="p-5 bg-slate-900 rounded-3xl border-2 border-rose-500/40 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-rose-400 tracking-wider block">
                ⚠️ STOK HAMPIR HABIS
              </span>
              <span className="text-2xl sm:text-3xl font-black text-rose-300 block mt-1.5 tabular-nums tracking-tight">
                {metrics.low_stock_count} Macam
              </span>
            </div>
            <Link
              href="/owner/products"
              className="min-h-[36px] text-xs font-black text-rose-400 hover:text-rose-300 hover:underline mt-3 pt-2 border-t border-slate-800 flex items-center justify-between"
            >
              <span>Periksa Kulakan</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 5. Barang Mendekati Kedaluwarsa */}
          <div className="p-5 bg-slate-900 rounded-3xl border-2 border-purple-500/40 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-purple-400 tracking-wider block">
                ⏳ MENDEKATI KEDALUWARSA
              </span>
              <span className="text-2xl sm:text-3xl font-black text-purple-300 block mt-1.5 tabular-nums tracking-tight">
                {metrics.expiring_soon_count} Macam
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400 mt-3 pt-2 border-t border-slate-800 block">
              Cek Rak & Lakukan Obral
            </span>
          </div>
        </div>

        {/* Aktivitas Nota Masuk & Barang Kritis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Riwayat Transaksi Hari Ini */}
          <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">
                  Aktivitas Nota Penjualan Kasir
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Transaksi masuk terkini hari ini
                </span>
              </div>
              <Link
                href="/sales"
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-emerald-400 border border-slate-700 flex items-center gap-1 transition-all"
              >
                <span>Lihat Semua Nota</span>
                <span>➔</span>
              </Link>
            </div>

            {recent_transactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                <span className="text-3xl block mb-1">🧾</span>
                <p className="text-sm font-bold text-slate-400">Belum ada transaksi penjualan hari ini</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 space-y-2">
                {recent_transactions.map((tx) => (
                  <div key={tx.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono font-black text-base text-white block leading-tight">
                        {tx.invoice_number}
                      </span>
                      <span className="text-xs font-bold text-slate-400 block mt-0.5">
                        Kasir: <strong className="text-slate-200">{tx.cashier_name}</strong> &bull; {formatTanggalWaktu(tx.created_at)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-400 block tabular-nums">
                        {formatRupiah(tx.total_amount)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-800 text-slate-300 uppercase border border-slate-700">
                        {tx.payment_method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Daftar Barang Perlu Kulakan Ulang */}
          <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">
                  Daftar Kulakan Kritis
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Stok barang hampir habis di rak
                </span>
              </div>
              <Link
                href="/owner/products"
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-rose-400 border border-slate-700 flex items-center gap-1 transition-all"
              >
                <span>Kelola Stok</span>
                <span>➔</span>
              </Link>
            </div>

            {low_stock_products.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                <span className="text-3xl block mb-1">🎉</span>
                <p className="text-base font-black text-emerald-400">Semua Stok Barang Aman</p>
                <p className="text-xs text-slate-500 mt-0.5">Tidak ada barang yang berada di bawah batas minimum</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 space-y-2">
                {low_stock_products.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-sm sm:text-base text-white block truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-bold text-slate-400 block">
                        SKU: {item.sku} &bull; Batas: {item.min_stock_alert} {item.unit}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-950 text-rose-300 border border-rose-800 block">
                        Sisa {item.current_stock} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
};

export default OwnerDashboard;
