import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PosLayout } from '@/Layouts/PosLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { ThermalReceipt } from '@/Components/POS/ThermalReceipt';
import { formatRupiah, formatTanggalWaktu } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';
import { ReceiptData, PaymentMethod } from '@/types/pos';

export interface SaleItem {
  id: number;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
}

export interface SaleTransaction {
  id: number;
  invoice_number: string;
  cashier_name: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  cash_paid: number;
  change_due: number;
  created_at: string;
  status: 'COMPLETED' | 'VOIDED';
  void_reason?: string;
  items: SaleItem[];
}

export interface SalesIndexProps {
  sales: SaleTransaction[];
  is_owner?: boolean;
  store: {
    name: string;
    address: string;
    phone: string;
    receipt_footer: string;
  };
}

export const SalesIndex: React.FC<SalesIndexProps> = ({
  sales = [],
  is_owner = false,
  store,
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Modal Void Transaksi
  const [voidSale, setVoidSale] = useState<SaleTransaction | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  const handleOpenReceipt = (s: SaleTransaction) => {
    sound.playClick();
    const data: ReceiptData = {
      invoice_number: s.invoice_number,
      transaction_date: s.created_at,
      cashier_name: s.cashier_name,
      customer_name: s.customer_name,
      customer_phone: s.customer_phone,
      store_name: store?.name || 'GROSSMART TOKO KELONTONG',
      store_address: store?.address || 'Jl. Raya Desa No. 12',
      store_phone: store?.phone || '081234567890',
      receipt_footer_text: store?.receipt_footer || 'Terima kasih atas belanjaan Anda!',
      items: s.items.map((it) => ({
        name: it.product_name,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        discount_amount: it.discount_amount,
        subtotal: it.subtotal,
      })),
      subtotal: s.total_amount,
      discount_total: 0,
      points_discount: 0,
      rounding_amount: 0,
      grand_total: s.total_amount,
      payment_method: s.payment_method,
      cash_paid: s.cash_paid,
      transfer_paid: 0,
      receivable_paid: 0,
      change_returned: s.change_due,
    };
    setReceiptData(data);
  };

  const handleExecuteVoid = () => {
    if (!voidSale || !voidReason.trim()) {
      toast.warning('Alasan pembatalan nota wajib diisi');
      sound.playError();
      return;
    }

    setIsVoiding(true);
    sound.playClick();

    router.post(`/sales/${voidSale.id}/void`, {
      reason: voidReason.trim(),
    }, {
      onSuccess: () => {
        setIsVoiding(false);
        setVoidSale(null);
        setVoidReason('');
        toast.success(`Nota ${voidSale.invoice_number} berhasil dibatalkan`);
      },
      onError: () => {
        setIsVoiding(false);
        sound.playError();
        toast.error('Gagal membatalkan nota');
      },
    });
  };

  const filteredSales = sales.filter((s) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      s.invoice_number.toLowerCase().includes(q) ||
      s.cashier_name.toLowerCase().includes(q) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q))
    );
  });

  return (
    <PosLayout title="Riwayat Nota Penjualan - Grossmart">
      <div className="space-y-4">
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-2xl font-black text-white">
              Riwayat Nota Belanja
            </h2>
            <p className="text-sm font-bold text-slate-400 mt-0.5">
              Cetak ulang struk kasir, kirim nota via WhatsApp, atau batalkan nota salah pencet.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor nota / pembeli..."
              className="w-full min-h-[48px] px-4 font-bold border-2 border-slate-700 rounded-xl focus:border-emerald-500 bg-slate-950 text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabel Riwayat Penjualan */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-xs sm:text-sm font-black uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4">No. Nota</th>
                  <th className="p-4">Waktu & Kasir</th>
                  <th className="p-4">Pembeli</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4">Total Belanja</th>
                  <th className="p-4">Status Nota</th>
                  <th className="p-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm font-bold text-slate-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400 font-bold">
                      Belum ada riwayat nota penjualan yang tercatat
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-black text-base text-white">
                        {s.invoice_number}
                      </td>

                      <td className="p-4">
                        <span className="block text-slate-200">{formatTanggalWaktu(s.created_at)}</span>
                        <span className="text-xs text-slate-400 font-semibold">Kasir: {s.cashier_name}</span>
                      </td>

                      <td className="p-4">
                        {s.customer_name ? (
                          <span className="font-extrabold text-white">{s.customer_name}</span>
                        ) : (
                          <span className="text-slate-500">Umum</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
                          {s.payment_method}
                        </span>
                      </td>

                      <td className="p-4 text-base font-black text-emerald-400">
                        {formatRupiah(s.total_amount)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            s.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {s.status === 'COMPLETED' ? 'LUNAS' : 'BATAL (VOID)'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedSale(s)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs font-black cursor-pointer transition-all"
                        >
                          📄 Rincian
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(s)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-black cursor-pointer transition-all"
                        >
                          🖨️ Cetak
                        </button>
                        {is_owner && s.status === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setVoidSale(s);
                              setVoidReason('');
                            }}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs font-black cursor-pointer transition-all"
                          >
                            🚫 Batal Nota
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Rincian Item Belanja */}
      {selectedSale && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSale(null)}
          title={`Rincian Belanja Nota: ${selectedSale.invoice_number}`}
          maxWidth="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                size="md"
                soundFeedback="click"
                onClick={() => setSelectedSale(null)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="md"
                soundFeedback="click"
                onClick={() => {
                  handleOpenReceipt(selectedSale);
                  setSelectedSale(null);
                }}
                className="font-black"
              >
                Cetak Struk Nota Ini
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="divide-y divide-gray-100">
              {selectedSale.items.map((it) => (
                <div key={it.id} className="py-2.5 flex justify-between items-center text-sm font-bold">
                  <div>
                    <span className="text-base font-black text-gray-900 block">{it.product_name}</span>
                    <span className="text-xs text-gray-500">
                      {it.quantity} {it.unit} x {formatRupiah(it.unit_price)}
                    </span>
                  </div>
                  <span className="text-base font-black text-emerald-700">
                    {formatRupiah(it.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-gray-200 flex justify-between items-center text-lg font-black text-gray-950">
              <span>TOTAL TRANSAKSI:</span>
              <span className="text-2xl text-emerald-700">{formatRupiah(selectedSale.total_amount)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Batal Nota Belanja (Void) */}
      {voidSale && (
        <Modal
          isOpen={true}
          onClose={() => setVoidSale(null)}
          title="Batalkan Nota Belanja (Void Transaksi)"
          maxWidth="md"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="secondary"
                size="md"
                soundFeedback="click"
                onClick={() => setVoidSale(null)}
              >
                Kembali
              </Button>
              <Button
                variant="danger"
                size="md"
                isLoading={isVoiding}
                soundFeedback="chime"
                onClick={handleExecuteVoid}
                className="font-black"
              >
                Batalkan Nota Permanen
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              <span className="block font-black text-base mb-1">Peringatan Pembatalan Transaksi:</span>
              Stok barang akan dikembalikan ke inventaris toko dan uang penjualan sebesar{' '}
              <strong>{formatRupiah(voidSale.total_amount)}</strong> akan dibatalkan dari laporan kasir.
            </div>

            <div>
              <label htmlFor="void-reason-input" className="block text-sm font-black text-gray-900 mb-1">
                Alasan Pembatalan Nota (Wajib):
              </label>
              <textarea
                id="void-reason-input"
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Contoh: Pembeli keliru memilih varian susu dan transaksi dibatalkan..."
                className="w-full p-3 font-bold border-2 border-gray-300 rounded-xl focus:border-rose-600"
                autoFocus
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Preview Struk */}
      {receiptData && (
        <ThermalReceipt
          isOpen={true}
          onClose={() => setReceiptData(null)}
          receiptData={receiptData}
          onNewTransaction={() => setReceiptData(null)}
        />
      )}
    </PosLayout>
  );
};

export default SalesIndex;
