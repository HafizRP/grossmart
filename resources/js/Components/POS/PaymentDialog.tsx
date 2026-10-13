import React, { useState, useMemo } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { QuickCashButtons } from '@/Components/POS/QuickCashButtons';
import { Customer, PaymentData, PaymentMethod } from '@/types/pos';
import { formatRupiah, calculateChangeBreakdown } from '@/Utils/format';
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

  // Rincian fisik lembaran kembalian untuk panduan kasir lansia
  const changeBreakdown = useMemo(() => {
    if (method === 'CASH' || (method === 'SPLIT' && changeDue > 0)) {
      return calculateChangeBreakdown(changeDue);
    }
    return [];
  }, [changeDue, method]);

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
        if (sisaLimit < receivableAmount) return false;
      }
      return true;
    }
    return false;
  }, [method, cashGiven, transferAmount, receivableAmount, finalTotalToPay, selectedCustomer, isProcessing]);

  const handleExecutePayment = () => {
    if (!isValid || isProcessing) {
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
      title="Pembayaran Transaksi"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ============================================================== */}
        {/* KOLOM KIRI: TOTAL TAGIHAN, METODE BAYAR & DATA PELANGGAN        */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Banner Tagihan Super Jelas (WCAG AAA) */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-xs uppercase font-black tracking-widest text-emerald-100 block">
              TOTAL TAGIHAN BELANJA
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight tabular-nums">
                {formatRupiah(finalTotalToPay)}
              </span>
            </div>
            {roundingAmount > 0 && (
              <span className="text-xs font-bold text-emerald-100 block mt-1.5 bg-emerald-800/60 px-2.5 py-1 rounded-lg w-fit">
                + Pembulatan Kasir: {formatRupiah(roundingAmount)}
              </span>
            )}
          </div>

          {/* Tab Pilihan Metode Pembayaran Ergonomis */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
              Pilih Cara Bayar:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('CASH')}
                className={`min-h-[56px] px-3 py-2 rounded-2xl font-black text-sm transition-all border-3 flex items-center justify-center gap-2 ${
                  method === 'CASH'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">💵</span>
                <span>Uang Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('TRANSFER')}
                className={`min-h-[56px] px-3 py-2 rounded-2xl font-black text-sm transition-all border-3 flex items-center justify-center gap-2 ${
                  method === 'TRANSFER'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">📱</span>
                <span>Transfer / QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('RECEIVABLE')}
                className={`min-h-[56px] px-3 py-2 rounded-2xl font-black text-sm transition-all border-3 flex items-center justify-center gap-2 ${
                  method === 'RECEIVABLE'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">📖</span>
                <span>Bon (Tempo)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('SPLIT')}
                className={`min-h-[56px] px-3 py-2 rounded-2xl font-black text-sm transition-all border-3 flex items-center justify-center gap-2 ${
                  method === 'SPLIT'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">⚖️</span>
                <span>Campuran</span>
              </button>
            </div>
          </div>

          {/* Pemilihan Pelanggan / Anggota */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2">
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
              Nama Pembeli / Pelanggan Toko:
            </label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
              className="w-full min-h-[50px] px-3 text-base font-bold bg-white border-2 border-slate-300 rounded-xl focus:border-emerald-600"
            >
              <option value="">Pembeli Umum (Tanpa Catatan Bon)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} — Limit: {formatRupiah(c.max_receivable_limit - c.current_receivable)}
                </option>
              ))}
            </select>

            {/* Detail Pelanggan Terpilih */}
            {selectedCustomer && (
              <div className="pt-2 border-t border-slate-200 text-xs font-bold space-y-1.5 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Poin Belanja:</span>
                  <span className="text-emerald-700 font-extrabold px-2 py-0.5 bg-emerald-50 rounded-md">
                    {selectedCustomer.points} Poin
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sisa Limit Bon Tempo:</span>
                  <span className="text-amber-800 font-extrabold px-2 py-0.5 bg-amber-50 rounded-md tabular-nums">
                    {formatRupiah(selectedCustomer.max_receivable_limit - selectedCustomer.current_receivable)}
                  </span>
                </div>

                {selectedCustomer.points >= 50 && (
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-emerald-900">Gunakan 50 Poin (-Rp 5.000):</span>
                    <input
                      type="checkbox"
                      checked={pointsToRedeem > 0}
                      onChange={(e) => setPointsToRedeem(e.target.checked ? 50 : 0)}
                      className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* KOLOM KANAN: NOMINAL, LEMBARAN CEPAT & PECAHAN KEMBALIAN       */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Form Pembayaran Tunai */}
          {method === 'CASH' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase text-gray-700 tracking-wider mb-1.5">
                  Uang Tunai dari Pembeli:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl font-black text-gray-400 select-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    placeholder="0"
                    onChange={(e) => setCashGiven(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full min-h-[64px] pl-14 pr-4 text-3xl font-black text-gray-950 border-3 border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 tabular-nums"
                  />
                </div>
              </div>

              {/* Tombol Lembaran Uang Visual Khas Rupiah */}
              <QuickCashButtons
                totalAmount={finalTotalToPay}
                currentCashGiven={cashGiven}
                onSelectAmount={(amt) => setCashGiven(amt)}
                onAddAmount={(amt) => setCashGiven((prev) => prev + amt)}
              />
            </div>
          )}

          {/* Form Transfer / QRIS */}
          {method === 'TRANSFER' && (
            <div className="p-4 bg-blue-50 border-3 border-blue-200 rounded-3xl space-y-3">
              <h4 className="text-base font-black text-blue-950 flex items-center gap-2">
                <span>📱</span> Konfirmasi Transfer Bank / QRIS
              </h4>
              <p className="text-xs font-bold text-blue-800 leading-relaxed">
                Pastikan dana sebesar <strong>{formatRupiah(finalTotalToPay)}</strong> sudah masuk ke mutasi rekening toko sebelum menekan tombol proses.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Rekening Toko:</label>
                <select
                  value={transferBank}
                  onChange={(e) => setTransferBank(e.target.value)}
                  className="w-full min-h-[48px] px-3 text-base font-bold bg-white border-2 border-blue-200 rounded-xl"
                >
                  <option value="BCA">BCA (Toko Kelontong Grossmart)</option>
                  <option value="BRI">BRI (Toko Kelontong Grossmart)</option>
                  <option value="MANDIRI">Bank Mandiri</option>
                  <option value="QRIS">QRIS Statis Toko</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Bukti / 4 Angka Rekening Pembeli (Opsional):</label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="Contoh: 1234 atau REF-0091"
                  className="w-full min-h-[48px] px-3 text-base font-bold bg-white border-2 border-blue-200 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Form Buku Bon (Tempo) */}
          {method === 'RECEIVABLE' && (
            <div className="p-4 bg-amber-50 border-3 border-amber-200 rounded-3xl space-y-3">
              <h4 className="text-base font-black text-amber-950 flex items-center gap-2">
                <span>📖</span> Catat ke Buku Bon (Utang Pelanggan)
              </h4>
              {!selectedCustomer ? (
                <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-black">
                  ⚠️ Harap pilih nama pelanggan pada kolom sebelah kiri terlebih dahulu!
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-amber-900 leading-relaxed">
                    Tagihan <strong>{formatRupiah(finalTotalToPay)}</strong> akan dicatat ke buku utang <strong>{selectedCustomer.name}</strong>.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Janji Tanggal Pembayaran Bon:</label>
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

          {/* Form Pembayaran Split (Campuran) */}
          {method === 'SPLIT' && (
            <div className="space-y-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
              <h4 className="text-sm font-black text-slate-900">Pembagian Porsi Pembayaran:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Tunai:</label>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-full min-h-[48px] px-3 text-base font-black border-2 border-slate-300 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Transfer:</label>
                  <input
                    type="number"
                    value={transferAmount || ''}
                    onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-full min-h-[48px] px-3 text-base font-black border-2 border-slate-300 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Bon Tempo:</label>
                  <input
                    type="number"
                    value={receivableAmount || ''}
                    onChange={(e) => setReceivableAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-full min-h-[48px] px-3 text-base font-black border-2 border-slate-300 rounded-xl tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* KOTAK KEMBALIAN JUMBO & BREAKDOWN FISIK LEMBARAN (FITUR JUARA) */}
          {/* ============================================================== */}
          <div className="p-4 bg-slate-900 text-white rounded-3xl border-4 border-slate-800 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-widest text-slate-400">
                UANG KEMBALIAN KASIR:
              </span>
              {changeDue > 0 && (
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Wajib Berikan ke Pembeli
                </span>
              )}
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
                  changeDue > 0 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {formatRupiah(changeDue)}
              </span>
            </div>

            {/* PANDUAN FISIK LEMBARAN KEMBALIAN UNTUK LANSIA */}
            {changeBreakdown.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-800">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block mb-2">
                  👉 Panduan Ambil Uang Kembalian di Laci:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {changeBreakdown.map((item) => (
                    <div
                      key={item.value}
                      className="bg-slate-800/90 border border-slate-700 rounded-xl p-2 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                          {item.count}x
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {item.isCoin ? 'Koin' : 'Lembar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tombol Eksekusi Pembayaran Raksasa (Target Sentuh 68px) */}
          <Button
            variant="primary"
            size="xl"
            fullWidth
            isLoading={isProcessing}
            disabled={!isValid}
            soundFeedback="chime"
            onClick={handleExecutePayment}
            className="min-h-[68px] text-xl sm:text-2xl font-black shadow-2xl rounded-2xl tracking-wide uppercase"
          >
            Selesaikan & Cetak Struk 🖨️
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDialog;
