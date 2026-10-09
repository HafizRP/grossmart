import React, { useState, useMemo } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { QuickCashButtons } from '@/Components/POS/QuickCashButtons';
import { Customer, PaymentData, PaymentMethod } from '@/types/pos';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  customers: Customer[];
  onProcessPayment: (payment: PaymentData) => void;
  isProcessing?: boolean;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  grandTotal,
  customers,
  onProcessPayment,
  isProcessing = false,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [receivableAmount, setReceivableAmount] = useState<number>(0);
  const [receivableDueDate, setReceivableDueDate] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [transferBank, setTransferBank] = useState<string>('BCA');
  const [transferRef, setTransferRef] = useState<string>('');
  const [isRounded, setIsRounded] = useState<boolean>(true);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Nilai diskon poin: 1 poin = Rp 100
  const pointsDiscountValue = pointsToRedeem * 100;
  const netPayable = Math.max(0, grandTotal - pointsDiscountValue);

  // Pembulatan kasir (Cash Rounding) ke 100 rupiah terdekat jika tunai murni
  const roundingAmount = useMemo(() => {
    if (!isRounded || method !== 'CASH') return 0;
    const remainder = netPayable % 100;
    return remainder === 0 ? 0 : 100 - remainder;
  }, [netPayable, isRounded, method]);

  const finalTotalToPay = netPayable + roundingAmount;

  // Kembalian
  const changeDue = useMemo(() => {
    if (method === 'CASH') {
      return Math.max(0, cashGiven - finalTotalToPay);
    }
    if (method === 'SPLIT') {
      const totalPaid = cashGiven + transferAmount + receivableAmount;
      return Math.max(0, totalPaid - finalTotalToPay);
    }
    return 0;
  }, [method, cashGiven, transferAmount, receivableAmount, finalTotalToPay]);

  // Validasi pembayaran
  const isValid = useMemo(() => {
    if (isProcessing) return false;

    if (method === 'CASH') {
      return cashGiven >= finalTotalToPay;
    }
    if (method === 'TRANSFER') {
      return true; // Transfer dianggap tepat sesuai tagihan
    }
    if (method === 'RECEIVABLE') {
      if (!selectedCustomer) return false;
      const sisaLimit = selectedCustomer.max_receivable_limit - selectedCustomer.current_receivable;
      return sisaLimit >= finalTotalToPay;
    }
    if (method === 'SPLIT') {
      const totalCovered = cashGiven + transferAmount + receivableAmount;
      if (totalCovered < finalTotalToPay) return false;
      if (receivableAmount > 0) {
        if (!selectedCustomer) return false;
        const sisaLimit = selectedCustomer.max_receivable_limit - selectedCustomer.current_receivable;
        if (receivableAmount > sisaLimit) return false;
      }
      return true;
    }
    return false;
  }, [method, cashGiven, transferAmount, receivableAmount, finalTotalToPay, selectedCustomer, isProcessing]);

  const handleExecutePayment = () => {
    if (!isValid) {
      sound.playError();
      return;
    }

    sound.playChime();
    const paymentData: PaymentData = {
      payment_method: method,
      cash_amount: method === 'CASH' ? finalTotalToPay : method === 'SPLIT' ? cashGiven : 0,
      transfer_amount: method === 'TRANSFER' ? finalTotalToPay : method === 'SPLIT' ? transferAmount : 0,
      receivable_amount: method === 'RECEIVABLE' ? finalTotalToPay : method === 'SPLIT' ? receivableAmount : 0,
      receivable_due_date: receivableDueDate || undefined,
      points_redeemed: pointsToRedeem > 0 ? pointsToRedeem : undefined,
      points_discount_value: pointsDiscountValue > 0 ? pointsDiscountValue : undefined,
      rounding_amount: roundingAmount,
      cash_given: method === 'CASH' || method === 'SPLIT' ? cashGiven : finalTotalToPay,
      change_due: changeDue,
      customer_id: selectedCustomerId,
      customer_name: selectedCustomer?.name,
      transfer_bank_name: method === 'TRANSFER' || (method === 'SPLIT' && transferAmount > 0) ? transferBank : undefined,
      transfer_reference_number: transferRef || undefined,
    };

    onProcessPayment(paymentData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Pembayaran Kasir"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Kolom Kiri: Pilihan Metode & Identitas Pembeli */}
        <div className="md:col-span-5 space-y-4">
          {/* Banner Tagihan Jumbo */}
          <div className="bg-emerald-50 border-4 border-emerald-600 rounded-3xl p-4 text-center">
            <span className="text-xs uppercase font-black text-emerald-900 tracking-wider block">
              TOTAL TAGIHAN BELANJA
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-700 block mt-1">
              {formatRupiah(finalTotalToPay)}
            </span>
            {roundingAmount > 0 && (
              <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                (Termasuk Pembulatan Kasir: +{formatRupiah(roundingAmount)})
              </span>
            )}
          </div>

          {/* Tab Pilihan Metode Pembayaran */}
          <div>
            <label className="block text-sm font-extrabold text-gray-800 mb-2">
              Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={method === 'CASH' ? 'primary' : 'secondary'}
                size="md"
                soundFeedback="click"
                onClick={() => setMethod('CASH')}
                className="text-base font-black"
              >
                Uang Tunai
              </Button>
              <Button
                variant={method === 'TRANSFER' ? 'primary' : 'secondary'}
                size="md"
                soundFeedback="click"
                onClick={() => setMethod('TRANSFER')}
                className="text-base font-black"
              >
                Transfer / QRIS
              </Button>
              <Button
                variant={method === 'RECEIVABLE' ? 'warning' : 'secondary'}
                size="md"
                soundFeedback="click"
                onClick={() => setMethod('RECEIVABLE')}
                className="text-base font-black"
              >
                Buku Bon (Tempo)
              </Button>
              <Button
                variant={method === 'SPLIT' ? 'info' : 'secondary'}
                size="md"
                soundFeedback="click"
                onClick={() => setMethod('SPLIT')}
                className="text-base font-black"
              >
                Kombinasi (Split)
              </Button>
            </div>
          </div>

          {/* Pilih Pelanggan Toko (Untuk Tempo & Poin) */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border-2 border-gray-200 space-y-2">
            <label className="block text-sm font-extrabold text-gray-800">
              Pelanggan Toko / Anggota:
            </label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
              className="w-full min-h-[48px] px-3 text-base font-bold bg-white border-2 border-gray-300 rounded-xl focus:border-emerald-600"
            >
              <option value="">Pembeli Umum (Tanpa Nama)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} - Sisa Limit Bon: {formatRupiah(c.max_receivable_limit - c.current_receivable)}
                </option>
              ))}
            </select>

            {/* Info Limit & Poin Pelanggan Terpilih */}
            {selectedCustomer && (
              <div className="pt-2 border-t border-gray-200 text-xs font-bold space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <span>Poin Tersedia:</span>
                  <span className="text-emerald-700 font-extrabold">{selectedCustomer.points} Poin</span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Limit Bon Tempo:</span>
                  <span className="text-amber-800 font-extrabold">
                    {formatRupiah(selectedCustomer.max_receivable_limit - selectedCustomer.current_receivable)}
                  </span>
                </div>

                {selectedCustomer.points >= 50 && (
                  <div className="pt-1.5 flex items-center justify-between">
                    <span>Tukar 50 Poin (-Rp 5.000):</span>
                    <input
                      type="checkbox"
                      checked={pointsToRedeem > 0}
                      onChange={(e) => setPointsToRedeem(e.target.checked ? 50 : 0)}
                      className="w-5 h-5 rounded text-emerald-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Input Nominal & Tombol Cepat Uang */}
        <div className="md:col-span-7 space-y-4">
          {/* Form Sesuai Metode */}
          {method === 'CASH' && (
            <div className="space-y-4">
              <div>
                <label className="block text-base font-black text-gray-900 mb-1">
                  Uang Tunai yang Diterima Kasir:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl font-black text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    placeholder="0"
                    onChange={(e) => setCashGiven(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full min-h-[58px] pl-14 pr-4 text-2xl sm:text-3xl font-black text-gray-950 border-3 border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Tombol Cepat Pecahan Uang Ramah Lansia */}
              <QuickCashButtons
                totalAmount={finalTotalToPay}
                currentCashGiven={cashGiven}
                onSelectAmount={(amt) => setCashGiven(amt)}
                onAddAmount={(amt) => setCashGiven((prev) => prev + amt)}
              />
            </div>
          )}

          {method === 'TRANSFER' && (
            <div className="p-4 bg-blue-50 border-3 border-blue-300 rounded-3xl space-y-3">
              <h4 className="text-lg font-black text-blue-950">
                Konfirmasi Transfer Bank / QRIS
              </h4>
              <p className="text-sm font-bold text-blue-800">
                Pastikan uang transfer sebesar {formatRupiah(finalTotalToPay)} sudah masuk ke rekening toko sebelum menekan tombol proses.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Pilih Bank / E-Wallet:</label>
                <select
                  value={transferBank}
                  onChange={(e) => setTransferBank(e.target.value)}
                  className="w-full min-h-[48px] px-3 text-base font-bold bg-white border-2 border-blue-200 rounded-xl"
                >
                  <option value="BCA">BCA (Toko Berkah)</option>
                  <option value="BRI">BRI (Toko Berkah)</option>
                  <option value="MANDIRI">Bank Mandiri</option>
                  <option value="QRIS">QRIS Statis Toko</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Nomor Referensi / 4 Digit Terakhir (Opsional):</label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="Contoh: 1234 atau REF-8812"
                  className="w-full min-h-[48px] px-3 text-base font-bold bg-white border-2 border-blue-200 rounded-xl"
                />
              </div>
            </div>
          )}

          {method === 'RECEIVABLE' && (
            <div className="p-4 bg-amber-50 border-3 border-amber-300 rounded-3xl space-y-3">
              <h4 className="text-lg font-black text-amber-950">
                Pencatatan Bon Belanja (Utang Pembeli)
              </h4>
              {!selectedCustomer ? (
                <div className="p-3 bg-rose-100 rounded-xl text-rose-800 text-sm font-black">
                  Harap pilih nama pelanggan terlebih dahulu pada kolom sebelah kiri untuk mencatat bon tempo!
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-amber-800">
                    Tagihan sebesar {formatRupiah(finalTotalToPay)} akan dicatat ke buku utang pelanggan <strong>{selectedCustomer.name}</strong>.
                  </p>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">Janji Tanggal Jatuh Tempo Pembayaran:</label>
                    <input
                      type="date"
                      value={receivableDueDate}
                      onChange={(e) => setReceivableDueDate(e.target.value)}
                      className="w-full min-h-[48px] px-3 text-base font-bold bg-white border-2 border-amber-200 rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {method === 'SPLIT' && (
            <div className="space-y-3 p-4 bg-gray-50 border-3 border-gray-200 rounded-3xl">
              <h4 className="text-lg font-black text-gray-900">Pembayaran Campuran (Split)</h4>
              <div>
                <label className="block text-sm font-extrabold text-gray-700">1. Porsi Tunai Diterima:</label>
                <input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full min-h-[48px] px-3 text-lg font-black border-2 border-gray-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700">2. Porsi Transfer / QRIS:</label>
                <input
                  type="number"
                  value={transferAmount || ''}
                  onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full min-h-[48px] px-3 text-lg font-black border-2 border-gray-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700">3. Porsi Bon Tempo (Wajib Pilih Pelanggan):</label>
                <input
                  type="number"
                  value={receivableAmount || ''}
                  onChange={(e) => setReceivableAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full min-h-[48px] px-3 text-lg font-black border-2 border-gray-300 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Kotak Kembalian Font Raksasa */}
          <div className="p-4 bg-gray-100 rounded-3xl border-3 border-gray-300 text-center">
            <span className="text-sm uppercase font-black text-gray-700 tracking-wider block">
              UANG KEMBALIAN KASIR:
            </span>
            <span className={`text-4xl sm:text-5xl font-black block mt-1 ${changeDue > 0 ? 'text-emerald-700' : 'text-gray-500'}`}>
              {formatRupiah(changeDue)}
            </span>
          </div>

          {/* Tombol Eksekusi Pembayaran Jumbo */}
          <Button
            variant="primary"
            size="xl"
            fullWidth
            isLoading={isProcessing}
            disabled={!isValid}
            soundFeedback="chime"
            onClick={handleExecutePayment}
            className="text-2xl font-black shadow-xl"
          >
            SELESAIKAN & CETAK STRUK
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDialog;
