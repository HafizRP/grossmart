import React, { useState } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { ReceiptData } from '@/types/pos';
import { formatRupiah, formatTanggalWaktu } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface ThermalReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
  onNewTransaction: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  isOpen,
  onClose,
  receiptData,
  onNewTransaction,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [customerPhone, setCustomerPhone] = useState<string>(receiptData.customer_phone || '');

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleSendWhatsApp = () => {
    sound.playClick();
    const cleanPhone = customerPhone.replace(/\D/g, '');
    let targetPhone = cleanPhone;
    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    }

    const itemsSummary = receiptData.items
      .map((it) => `${it.name} (${it.quantity} ${it.unit}) = ${formatRupiah(it.subtotal)}`)
      .join('\n');

    const message = `*${receiptData.store_name}*\n` +
      `${receiptData.store_address}\n` +
      `Telp: ${receiptData.store_phone}\n\n` +
      `No. Nota: ${receiptData.invoice_number}\n` +
      `Waktu: ${formatTanggalWaktu(receiptData.transaction_date)}\n` +
      `Kasir: ${receiptData.cashier_name}\n` +
      (receiptData.customer_name ? `Pelanggan: ${receiptData.customer_name}\n` : '') +
      `--------------------------------\n` +
      `${itemsSummary}\n` +
      `--------------------------------\n` +
      `Total Belanja: *${formatRupiah(receiptData.grand_total)}*\n` +
      (receiptData.cash_paid > 0 ? `Uang Diterima: ${formatRupiah(receiptData.cash_paid)}\n` : '') +
      (receiptData.change_returned > 0 ? `Kembalian: ${formatRupiah(receiptData.change_returned)}\n` : '') +
      `\n${receiptData.receipt_footer_text || 'Terima kasih atas kunjungan Anda!'}`;

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bukti Nota Belanja (Struk Kasir)"
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <Button
            variant="secondary"
            size="lg"
            soundFeedback="click"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>

          <Button
            variant="primary"
            size="xl"
            soundFeedback="chime"
            onClick={() => {
              onNewTransaction();
              onClose();
            }}
            className="w-full sm:w-auto text-lg sm:text-xl font-black"
          >
            Transaksi Baru
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Pilihan Ukuran Kertas Thermal */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
          <span className="text-sm font-extrabold text-gray-800">
            Ukuran Kertas Thermal:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPaperWidth('58mm');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                paperWidth === '58mm' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              58 mm
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPaperWidth('80mm');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                paperWidth === '80mm' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              80 mm
            </button>
          </div>
        </div>

        {/* Simulasi Tampilan Kertas Struk Thermal */}
        <div className="flex justify-center bg-gray-200 p-4 rounded-3xl overflow-x-auto">
          <div
            id="thermal-receipt-printable"
            className={`
              bg-white text-gray-900 p-4 shadow-lg border border-gray-300 font-mono text-xs sm:text-sm
              ${paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'}
            `}
          >
            {/* Header Toko */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <h2 className="text-base font-black uppercase tracking-wider">{receiptData.store_name}</h2>
              <p className="text-xs leading-tight">{receiptData.store_address}</p>
              <p className="text-xs leading-tight">Telp: {receiptData.store_phone}</p>
            </div>

            {/* Info Transaksi */}
            <div className="py-2 border-b border-dashed border-gray-400 text-xs leading-tight space-y-0.5">
              <div className="flex justify-between">
                <span>Nota:</span>
                <span className="font-bold">{receiptData.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatTanggalWaktu(receiptData.transaction_date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{receiptData.cashier_name}</span>
              </div>
              {receiptData.customer_name && (
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>{receiptData.customer_name}</span>
                </div>
              )}
            </div>

            {/* Daftar Barang */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5">
              {receiptData.items.map((it, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-bold leading-tight">{it.name}</div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {it.quantity} {it.unit} x {formatRupiah(it.unit_price)}
                    </span>
                    <span className="font-bold text-gray-900">{formatRupiah(it.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Finansial */}
            <div className="py-2 border-b border-dashed border-gray-400 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(receiptData.subtotal)}</span>
              </div>

              {receiptData.discount_total > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(receiptData.discount_total)}</span>
                </div>
              )}

              {receiptData.rounding_amount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Pembulatan:</span>
                  <span>+{formatRupiah(receiptData.rounding_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>{formatRupiah(receiptData.grand_total)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span>Metode:</span>
                <span>{receiptData.payment_method}</span>
              </div>

              {receiptData.cash_paid > 0 && (
                <div className="flex justify-between">
                  <span>Bayar Tunai:</span>
                  <span>{formatRupiah(receiptData.cash_paid)}</span>
                </div>
              )}

              {receiptData.change_returned > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(receiptData.change_returned)}</span>
                </div>
              )}
            </div>

            {/* Footer Struk */}
            <div className="text-center pt-3 text-xs leading-tight text-gray-600">
              <p>{receiptData.receipt_footer_text || 'Terima kasih atas belanjaan Anda di warung kami!'}</p>
              <p className="mt-1 text-[10px] text-gray-400">Grossmart PWA Toko Kelontong</p>
            </div>
          </div>
        </div>

        {/* Tombol Cetak & WhatsApp */}
        <div className="space-y-3 pt-2">
          <Button
            variant="info"
            size="lg"
            fullWidth
            soundFeedback="click"
            onClick={handlePrint}
            className="text-lg font-black"
          >
            Cetak Struk Thermal (Print)
          </Button>

          {/* Kirim WhatsApp */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
            <label htmlFor="wa-phone-input" className="block text-sm font-extrabold text-emerald-950">
              Kirim Nota via WhatsApp Pembeli:
            </label>
            <div className="flex gap-2">
              <input
                id="wa-phone-input"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Nomor WA (contoh: 08123456789)..."
                className="flex-1 min-h-[48px] px-3 text-base font-bold bg-white border-2 border-emerald-300 rounded-xl focus:border-emerald-600"
              />
              <Button
                variant="primary"
                size="md"
                soundFeedback="click"
                onClick={handleSendWhatsApp}
                className="font-black px-4 bg-emerald-600"
              >
                Kirim WA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ThermalReceipt;
