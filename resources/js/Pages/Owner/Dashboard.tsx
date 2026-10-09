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
    <OwnerLayout title="Ringkasan Toko - Grossmart" userName={user_name}>
      <div className="space-y-6">
        {/* Salam & Tombol Pintas Cepat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Selamat Datang, {user_name}!
            </h2>
            <p className="text-base font-bold text-gray-600 mt-0.5">
              Pantau perkembangan omzet, catatan bon pembeli, dan ketersediaan stok warung Anda.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/pos"
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base shadow-md border-b-4 border-emerald-800"
            >
              Buka Kasir (POS)
            </Link>
            <Link
              href="/owner/products"
              className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-base border-2 border-gray-300"
            >
              Tambah Produk
            </Link>
          </div>
        </div>

        {/* 5 Kartu Metrik Jumbo Ramah Penglihatan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Omzet Hari Ini */}
          <div className="p-5 bg-white rounded-3xl border-3 border-emerald-500 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-emerald-800 tracking-wider block">
                OMZET PENJUALAN HARI INI
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 block mt-2">
                {formatRupiah(metrics.today_revenue)}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-500 mt-3 pt-2 border-t border-gray-100">
              {metrics.today_transactions_count} Transaksi Berhasil
            </span>
          </div>

          {/* 2. Total Bon Piutang Pembeli */}
          <div className="p-5 bg-white rounded-3xl border-3 border-amber-400 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-amber-900 tracking-wider block">
                BUKU BON / UTANG PEMBELI
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-700 block mt-2">
                {formatRupiah(metrics.total_customer_receivables)}
              </span>
            </div>
            <Link
              href="/owner/reports"
              className="text-xs font-black text-amber-800 hover:underline mt-3 pt-2 border-t border-gray-100"
            >
              Lihat Rincian Buku Bon &rarr;
            </Link>
          </div>

          {/* 3. Utang ke Pemasok / Agen */}
          <div className="p-5 bg-white rounded-3xl border-3 border-blue-400 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-blue-900 tracking-wider block">
                UTANG KULAKAN KE AGEN
              </span>
              <span className="text-2xl sm:text-3xl font-black text-blue-700 block mt-2">
                {formatRupiah(metrics.total_supplier_payables)}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-500 mt-3 pt-2 border-t border-gray-100">
              Faktur Masuk Belum Lunas
            </span>
          </div>

          {/* 4. Peringatan Stok Menipis */}
          <div className="p-5 bg-white rounded-3xl border-3 border-rose-400 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-rose-900 tracking-wider block">
                PERINGATAN STOK MENIPIS
              </span>
              <span className="text-2xl sm:text-3xl font-black text-rose-600 block mt-2">
                {metrics.low_stock_count} Barang
              </span>
            </div>
            <span className="text-xs font-bold text-gray-500 mt-3 pt-2 border-t border-gray-100">
              Perlu Segera Kulakan Ulang
            </span>
          </div>

          {/* 5. Barang Mendekati Kadaluarsa */}
          <div className="p-5 bg-white rounded-3xl border-3 border-purple-400 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-black text-purple-900 tracking-wider block">
                MENDEKATI KADALUARSA
              </span>
              <span className="text-2xl sm:text-3xl font-black text-purple-700 block mt-2">
                {metrics.expiring_soon_count} Barang
              </span>
            </div>
            <span className="text-xs font-bold text-gray-500 mt-3 pt-2 border-t border-gray-100">
              Cek Rak & Lakukan Diskon Cuci Gudang
            </span>
          </div>
        </div>

        {/* Baris Konten: Transaksi Terbaru & Daftar Stok Menipis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Riwayat Transaksi Hari Ini */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">
                Aktivitas Nota Penjualan Kasir Terkini
              </h3>
              <Link href="/sales" className="text-sm font-extrabold text-emerald-700 hover:underline">
                Lihat Semua &rarr;
              </Link>
            </div>

            {recent_transactions.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-base font-bold text-gray-500">Belum ada transaksi penjualan hari ini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recent_transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono font-black text-sm text-gray-900 block">
                        {tx.invoice_number}
                      </span>
                      <span className="text-xs font-bold text-gray-500 block">
                        Kasir: {tx.cashier_name} &bull; {formatTanggalWaktu(tx.created_at)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-700 block">
                        {formatRupiah(tx.total_amount)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-gray-100 text-gray-700 uppercase">
                        {tx.payment_method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Daftar Stok Kritis Menipis */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">
                Daftar Barang Segera Habis
              </h3>
              <Link href="/owner/products" className="text-sm font-extrabold text-rose-700 hover:underline">
                Kelola Stok &rarr;
              </Link>
            </div>

            {low_stock_products.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <p className="text-base font-bold text-emerald-800">Semua stok barang aman dan tercukupi!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {low_stock_products.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-rose-950">
                        {item.name}
                      </h4>
                      <span className="text-xs font-bold text-rose-700">
                        SKU: {item.sku}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-rose-700 block">
                        Sisa: {item.current_stock} {item.unit}
                      </span>
                      <span className="text-[10px] font-bold text-rose-500">
                        Batas Min: {item.min_stock_alert}
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
