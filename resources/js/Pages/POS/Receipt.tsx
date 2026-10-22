import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { formatRupiah, formatTanggalWaktu } from '@/Utils/format';
import { Button } from '@/Components/UI/Button';
import { sound } from '@/Utils/sound';

export interface SaleItemData {
  id: number;
  product_name: string;
  unit_name: string;
  quantity: number;
  selling_price: number;
  discount_amount: number;
  subtotal: number;
}

export interface SalePaymentData {
  id: number;
  payment_method: string;
  amount: number;
  payment_reference?: string | null;
}

export interface SaleData {
  id: number;
  invoice_number: string;
  transaction_date: string;
  created_at: string;
  subtotal: number;
  discount_amount: number;
  points_redeemed_discount: number;
  rounding_amount: number;
  final_amount: number;
  payment_status: string;
  payment_method: string;
  cash_received?: number | null;
  change_amount?: number | null;
  notes?: string | null;
  cashier?: {
    name: string;
  } | null;
  customer?: {
    name: string;
    phone?: string | null;
    current_points?: number;
  } | null;
  items: SaleItemData[];
  payments: SalePaymentData[];
}

export interface ReceiptPageProps {
  sale: SaleData;
  settings?: Record<string, string>;
}

export const Receipt: React.FC<ReceiptPageProps> = ({
  sale,
  settings = {},
}) => {
  const storeName = settings.store_name || 'GROSSMART TOKO KELONTONG';
  const storeAddress = settings.store_address || 'Jl. Raya Desa No. 12';
  const storePhone = settings.store_phone || '0812-3456-7890';
  const receiptFooter = settings.receipt_footer || 'Barang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.';

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleShareWhatsApp = () => {
    sound.playClick();
    const phone = sale.customer?.phone ? sale.customer.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

    const messageLines = [
      `*NOTA BELANJA - ${storeName}*`,
      `No. Nota: ${sale.invoice_number}`,
      `Tanggal: ${formatTanggalWaktu(sale.transaction_date || sale.created_at)}`,
      `Kasir: ${sale.cashier?.name || 'Kasir'}`,
      sale.customer ? `Pelanggan: ${sale.customer.name}` : '',
      '--------------------------------',
      ...sale.items.map(
        (it) => `${it.product_name} x ${it.quantity} ${it.unit_name} = ${formatRupiah(it.subtotal)}`
      ),
      '--------------------------------',
      `Total Belanja: ${formatRupiah(sale.final_amount)}`,
      `Metode: ${sale.payment_method}`,
      sale.change_amount ? `Kembalian: ${formatRupiah(sale.change_amount)}` : '',
      '',
      `Terima kasih sudah berbelanja di warung kami!`
    ].filter(Boolean);

    const encoded = encodeURIComponent(messageLines.join('\n'));
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 antialiased print:bg-white print:p-0 print:text-black">
      <Head title={`Nota Belanja #${sale.invoice_number} - ${storeName}`} />

      {/* Action Bar (Sembunyi saat dicetak) */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 print:hidden">
        <Link
          href="/pos"
          className="text-xs font-black text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>⬅️</span>
          <span>Kembali ke Kasir</span>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleShareWhatsApp}
            className="font-black bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
          >
            <span>📱</span>
            <span>Kirim WA</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            className="font-black bg-emerald-600 hover:bg-emerald-500"
          >
            <span>🖨️</span>
            <span>Cetak Struk</span>
          </Button>
        </div>
      </div>

      {/* Kertas Struk Thermal (58mm - 80mm preview) */}
      <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 font-mono text-xs border border-slate-200 print:border-none print:shadow-none print:p-2 print:max-w-none print:w-full print:rounded-none">
        {/* Header Toko */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
          <h1 className="text-base font-black uppercase tracking-tight text-slate-950">
            {storeName}
          </h1>
          <p className="text-[11px] font-bold text-slate-600">
            {storeAddress}
          </p>
          <p className="text-[11px] font-bold text-slate-600">
            Telp: {storePhone}
          </p>
        </div>

        {/* Info Transaksi */}
        <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-600">No. Nota:</span>
            <span className="font-black text-slate-950">{sale.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Waktu:</span>
            <span className="font-bold text-slate-800">{formatTanggalWaktu(sale.transaction_date || sale.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Kasir:</span>
            <span className="font-bold text-slate-800">{sale.cashier?.name || 'Kasir'}</span>
          </div>
          {sale.customer && (
            <div className="flex justify-between">
              <span className="text-slate-600">Pelanggan:</span>
              <span className="font-bold text-slate-800">{sale.customer.name}</span>
            </div>
          )}
        </div>

        {/* Rincian Barang Belanja */}
        <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
          {sale.items.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="font-black text-slate-900 text-xs truncate">
                {item.product_name}
              </div>
              <div className="flex justify-between text-[11px] text-slate-700">
                <span>
                  {item.quantity} {item.unit_name} x {formatRupiah(item.selling_price)}
                </span>
                <span className="font-bold tabular-nums">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
              {item.discount_amount > 0 && (
                <div className="text-[10px] text-rose-600 font-bold">
                  Hemat {formatRupiah(item.discount_amount)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ringkasan Total & Pembayaran */}
        <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-700">
            <span>Subtotal:</span>
            <span className="tabular-nums font-bold">{formatRupiah(sale.subtotal)}</span>
          </div>

          {sale.discount_amount > 0 && (
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Diskon:</span>
              <span className="tabular-nums">-{formatRupiah(sale.discount_amount)}</span>
            </div>
          )}

          {sale.points_redeemed_discount > 0 && (
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Tukar Poin:</span>
              <span className="tabular-nums">-{formatRupiah(sale.points_redeemed_discount)}</span>
            </div>
          )}

          {sale.rounding_amount !== 0 && (
            <div className="flex justify-between text-slate-700">
              <span>Pembulatan:</span>
              <span className="tabular-nums font-bold">
                {sale.rounding_amount > 0 ? `+${formatRupiah(sale.rounding_amount)}` : formatRupiah(sale.rounding_amount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-slate-200">
            <span>TOTAL:</span>
            <span className="tabular-nums">{formatRupiah(sale.final_amount)}</span>
          </div>

          {/* Metode Pembayaran */}
          <div className="pt-2 space-y-1 text-[11px] text-slate-700">
            <div className="flex justify-between font-bold">
              <span>Metode Bayar:</span>
              <span>{sale.payment_method}</span>
            </div>
            {sale.cash_received && sale.cash_received > 0 && (
              <div className="flex justify-between">
                <span>Tunai Diterima:</span>
                <span className="tabular-nums">{formatRupiah(sale.cash_received)}</span>
              </div>
            )}
            {sale.change_amount !== null && sale.change_amount !== undefined && sale.change_amount > 0 && (
              <div className="flex justify-between font-black text-slate-900">
                <span>Kembalian:</span>
                <span className="tabular-nums">{formatRupiah(sale.change_amount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Nota */}
        <div className="pt-4 text-center space-y-1.5 text-[10px] text-slate-500 font-sans">
          <p className="font-bold">{receiptFooter}</p>
          <p className="font-black text-slate-600">Terima Kasih Atas Kunjungan Anda!</p>
          <p className="text-[9px] text-slate-400">Didukung oleh Grossmart POS</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
