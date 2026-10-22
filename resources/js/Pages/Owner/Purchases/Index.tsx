import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

interface Supplier {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
}

interface ProductOption {
  id: number;
  name: string;
  unit: string;
  cost_price: number;
  current_stock: number;
  barcode?: string | null;
}

interface PurchaseItemRow {
  [key: string]: number | string | undefined;
  product_id: number;
  quantity: number;
  cost_price: number;
}

interface PurchaseItemRecord {
  id: number;
  product_name_snapshot: string;
  unit_snapshot: string;
  cost_price: number;
  quantity: number;
  subtotal: number;
}

interface PurchaseRecord {
  id: number;
  invoice_number: string;
  purchase_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  notes?: string | null;
  supplier?: Supplier | null;
  items: PurchaseItemRecord[];
  creator?: { name: string } | null;
}

interface PurchasesIndexProps {
  purchases: {
    data: PurchaseRecord[];
    current_page: number;
    last_page: number;
    total: number;
  };
  suppliers: Supplier[];
  products: ProductOption[];
  summary: {
    monthly_total: number;
    unpaid_payables: number;
    total_count: number;
  };
}

export default function PurchasesIndex({
  purchases,
  suppliers,
  products,
  summary,
}: PurchasesIndexProps) {
  const toast = useToast();

  // Modal Catat Kulakan
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItemRow[]>([
    { product_id: products[0]?.id || 0, quantity: 10, cost_price: products[0]?.cost_price || 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Modal Tambah Supplier
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.cost_price, 0);
  };

  const handleAddItemRow = () => {
    sound.playClick();
    const defaultProduct = products[0];
    setItems([
      ...items,
      { product_id: defaultProduct?.id || 0, quantity: 1, cost_price: defaultProduct?.cost_price || 0 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    sound.playClick();
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: number) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index].product_id = productId;
    if (prod) {
      updated[index].cost_price = prod.cost_price;
    }
    setItems(updated);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Masukkan minimal 1 produk kulakan.');
      return;
    }

    setSubmitting(true);
    router.post(
      '/owner/purchases',
      {
        supplier_id: supplierId || null,
        purchase_date: purchaseDate,
        invoice_number: invoiceNumber.trim() || null,
        paid_amount: paidAmount,
        notes,
        items,
      },
      {
        onSuccess: () => {
          sound.playChime();
          toast.success('Penerimaan kulakan berhasil dicatat!');
          setIsPurchaseModalOpen(false);
          setSubmitting(false);
        },
        onError: () => {
          sound.playError();
          toast.error('Gagal mencatat faktur kulakan.');
          setSubmitting(false);
        },
      }
    );
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    router.post(
      '/owner/purchases/suppliers',
      {
        name: supplierName,
        phone: supplierPhone,
        address: supplierAddress,
      },
      {
        onSuccess: () => {
          sound.playChime();
          toast.success('Pemasok baru berhasil ditambahkan');
          setIsSupplierModalOpen(false);
          setSupplierName('');
          setSupplierPhone('');
          setSupplierAddress('');
        },
      }
    );
  };

  return (
    <OwnerLayout title="Kulakan & Pasokan Barang Masuk - Grossmart">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kulakan & Pasokan Barang Masuk (Restock)
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Catat faktur pasokan distributor, otomatis tambah stok rak dan perbarui harga modal HPP.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                sound.playClick();
                setIsSupplierModalOpen(true);
              }}
              className="font-black text-sm"
            >
              + Tambah Supplier
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                sound.playClick();
                const total = calculateTotal();
                setPaidAmount(total);
                setIsPurchaseModalOpen(true);
              }}
              className="font-black text-sm"
            >
              + Catat Kulakan Baru
            </Button>
          </div>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Kulakan Bulan Ini</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {formatRupiah(summary.monthly_total)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Akumulasi pengadaan barang</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Utang ke Supplier</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {formatRupiah(summary.unpaid_payables)}
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Jatuh tempo tempo distributor</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi Kulakan</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {summary.total_count} Faktur
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">Tercatat di sistem</span>
          </div>
        </div>

        {/* Tabel Riwayat Kulakan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">No. Faktur / Tanggal</th>
                  <th className="py-4 px-4">Nama Pemasok (Distributor)</th>
                  <th className="py-4 px-4">Rincian Barang</th>
                  <th className="py-4 px-4 text-right">Total Faktur</th>
                  <th className="py-4 px-4 text-right">Dibayar Tunai</th>
                  <th className="py-4 px-4 text-right">Sisa Utang</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {purchases.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                      Belum ada catatan faktur kulakan. Klik tombol "+ Catat Kulakan Baru".
                    </td>
                  </tr>
                ) : (
                  purchases.data.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-white block">{p.invoice_number}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(p.purchase_date).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-200">
                        {p.supplier ? p.supplier.name : 'Supplier Umum / Pasar'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-300">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {p.items.map((it) => (
                            <li key={it.id}>
                              {it.product_name_snapshot} ({it.quantity} {it.unit_snapshot})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-slate-100">
                        {formatRupiah(p.total_amount)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-emerald-400">
                        {formatRupiah(p.paid_amount)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-amber-400">
                        {formatRupiah(p.remaining_balance)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {p.status === 'PAID' && (
                          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                            LUNAS
                          </span>
                        )}
                        {p.status === 'PARTIAL' && (
                          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                            TEMPO SEBAGIAN
                          </span>
                        )}
                        {p.status === 'UNPAID' && (
                          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                            UTANG TEMPO
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Catat Kulakan Baru */}
        <Modal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          maxWidth="lg"
        >
          <form onSubmit={handleSavePurchase} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tanggal Faktur
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Pemasok / Distributor
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="">-- Pemasok Umum / Pasar --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  No. Nota Pemasok (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Otomatis jika kosong"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Tabel Item Kulakan */}
            <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Daftar Barang yang Diterima
                </span>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs font-black text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  + Tambah Baris Barang
                </button>
              </div>

              <div className="space-y-2">
                {items.map((row, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex-1 w-full">
                      <select
                        value={row.product_id}
                        onChange={(e) => handleProductChange(idx, parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit}) — Stok saat ini: {p.current_stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-28 flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantity = parseFloat(e.target.value) || 0;
                          setItems(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-right"
                      />
                    </div>

                    <div className="w-full sm:w-36 flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Rp</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Harga Modal"
                        value={row.cost_price}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].cost_price = parseInt(e.target.value) || 0;
                          setItems(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-right font-mono"
                      />
                    </div>

                    <div className="w-full sm:w-28 text-right font-mono text-xs font-black text-emerald-400">
                      {formatRupiah(row.quantity * row.cost_price)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 disabled:opacity-20 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400">Total Nilai Kulakan:</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatRupiah(calculateTotal())}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nominal Dibayar Tunai (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  max={calculateTotal()}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setPaidAmount(calculateTotal())}
                  className="text-[11px] text-emerald-400 font-bold mt-1 cursor-pointer"
                >
                  Bayar Lunas Penuh
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Sisa Utang ke Supplier
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-black text-amber-400">
                  {formatRupiah(Math.max(0, calculateTotal() - paidAmount))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                placeholder="Misal: Pasokan mie dan sabun dari agen grosir pasar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setIsPurchaseModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={submitting} className="font-black">
                {submitting ? 'Menyimpan...' : 'Simpan & Tambah Stok Rak'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Tambah Supplier */}
        <Modal
          isOpen={isSupplierModalOpen}
          onClose={() => setIsSupplierModalOpen(false)}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSupplier} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nama Pemasok / Toko Agen
              </label>
              <input
                type="text"
                placeholder="Contoh: Agen Sembako Sumber Makmur"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
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
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Alamat / Lokasi Toko
              </label>
              <input
                type="text"
                placeholder="Contoh: Pasar Induk Kramat Jati Blok B"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setIsSupplierModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" className="font-black">
                Simpan Pemasok
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  );
}
