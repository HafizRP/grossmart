import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';

export interface OwnerProduct {
  id: number;
  sku: string;
  barcode?: string | null;
  name: string;
  category_id?: number | null;
  category_name?: string | null;
  unit: string;
  cost_price: number; // Tampil khusus akun pemilik
  selling_price: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  current_stock: number;
  min_stock_alert: number;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductsIndexProps {
  products: OwnerProduct[];
  trashed_products?: OwnerProduct[];
  categories: Category[];
  user_name?: string;
}

export const ProductsIndex: React.FC<ProductsIndexProps> = ({
  products = [],
  trashed_products = [],
  categories = [],
  user_name,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // State Modal Tambah/Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<OwnerProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formSku, setFormSku] = useState<string>('');
  const [formBarcode, setFormBarcode] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
  const [formUnit, setFormUnit] = useState<string>('Pcs');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formWholesalePrice, setFormWholesalePrice] = useState<number>(0);
  const [formWholesaleMinQty, setFormWholesaleMinQty] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formMinStockAlert, setFormMinStockAlert] = useState<number>(5);

  // Modal Label Barcode
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<OwnerProduct | null>(null);

  const openCreateModal = () => {
    sound.playClick();
    setEditingProduct(null);
    setFormName('');
    setFormSku(`PRD-${Date.now().toString().slice(-6)}`);
    setFormBarcode('');
    setFormCategoryId(categories[0]?.id || null);
    setFormUnit('Pcs');
    setFormCostPrice(0);
    setFormSellingPrice(0);
    setFormWholesalePrice(0);
    setFormWholesaleMinQty(0);
    setFormStock(10);
    setFormMinStockAlert(5);
    setIsFormModalOpen(true);
  };

  const openEditModal = (p: OwnerProduct) => {
    sound.playClick();
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || '');
    setFormCategoryId(p.category_id || null);
    setFormUnit(p.unit);
    setFormCostPrice(p.cost_price || 0);
    setFormSellingPrice(p.selling_price);
    setFormWholesalePrice(p.wholesale_price || 0);
    setFormWholesaleMinQty(p.wholesale_min_qty || 0);
    setFormStock(p.current_stock);
    setFormMinStockAlert(p.min_stock_alert);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formSellingPrice <= 0) {
      toast.warning('Nama barang dan harga jual wajib diisi');
      sound.playError();
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    const payload = {
      name: formName,
      sku: formSku,
      barcode: formBarcode.trim() || null,
      category_id: formCategoryId,
      unit: formUnit,
      cost_price: formCostPrice,
      selling_price: formSellingPrice,
      wholesale_price: formWholesalePrice > 0 ? formWholesalePrice : null,
      wholesale_min_qty: formWholesaleMinQty > 0 ? formWholesaleMinQty : null,
      current_stock: formStock,
      min_stock_alert: formMinStockAlert,
    };

    if (editingProduct) {
      router.put(`/owner/products/${editingProduct.id}`, payload, {
        onSuccess: () => {
          setIsSubmitting(false);
          setIsFormModalOpen(false);
          toast.success('Data produk berhasil diperbarui');
        },
        onError: () => {
          setIsSubmitting(false);
          toast.error('Gagal memperbarui produk');
        },
      });
    } else {
      router.post('/owner/products', payload, {
        onSuccess: () => {
          setIsSubmitting(false);
          setIsFormModalOpen(false);
          toast.success('Produk baru berhasil ditambahkan');
        },
        onError: () => {
          setIsSubmitting(false);
          toast.error('Gagal menambahkan produk');
        },
      });
    }
  };

  const handleDeleteProduct = (p: OwnerProduct) => {
    sound.playClick();
    if (window.confirm(`Pindahkan barang "${p.name}" ke Tempat Sampah?`)) {
      router.delete(`/owner/products/${p.id}`, {
        onSuccess: () => toast.success(`"${p.name}" dipindahkan ke Tempat Sampah`),
      });
    }
  };

  const handleRestoreProduct = (p: OwnerProduct) => {
    sound.playClick();
    router.post(`/owner/products/${p.id}/restore`, {}, {
      onSuccess: () => toast.success(`"${p.name}" berhasil dipulihkan`),
    });
  };

  const currentList = activeTab === 'active' ? products : trashed_products;
  const filteredProducts = currentList.filter((p) => {
    if (selectedCategory !== null && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <OwnerLayout title="Katalog Produk & Stok - Grossmart" userName={user_name}>
      <div className="space-y-6">
        {/* Header & Aksi Tambah */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Katalog Produk & Stok Barang
            </h2>
            <p className="text-base font-bold text-gray-600 mt-0.5">
              Kelola daftar barang, barcode, modal HPP rahasia, harga eceran, dan harga grosir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="lg"
              soundFeedback="click"
              onClick={openCreateModal}
              className="text-base sm:text-lg font-black"
            >
              + Tambah Barang Baru
            </Button>
          </div>
        </div>

        {/* Tab Aktif vs Tempat Sampah (Recycle Bin) */}
        <div className="flex items-center justify-between border-b-2 border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Daftar Barang Aktif ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trash')}
              className={`px-5 py-3 font-black text-base border-b-4 transition-colors cursor-pointer ${
                activeTab === 'trash'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Tempat Sampah ({trashed_products.length})
            </button>
          </div>
        </div>

        {/* Filter Pencarian & Kategori */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang / barcode / SKU..."
              className="w-full min-h-[50px] px-4 text-base font-bold border-2 border-gray-300 rounded-2xl focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm border-2 ${
                selectedCategory === null ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm border-2 whitespace-nowrap ${
                  selectedCategory === c.id ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Produk */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-900 text-xs sm:text-sm font-black uppercase tracking-wider">
                  <th className="p-4">Barang / SKU</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">HPP Modal</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Grosir</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 font-bold">
                      Tidak ada data barang yang sesuai
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-black text-base text-gray-950 block leading-tight">
                          {p.name}
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                          SKU: {p.sku} {p.barcode ? `| Barcode: ${p.barcode}` : ''}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gray-100 text-gray-700">
                          {p.category_name || '-'}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-gray-600">
                        {formatRupiah(p.cost_price)}
                      </td>

                      <td className="p-4 font-black text-emerald-700 text-base">
                        {formatRupiah(p.selling_price)} / {p.unit}
                      </td>

                      <td className="p-4">
                        {p.wholesale_price && p.wholesale_min_qty ? (
                          <span className="text-xs font-bold text-blue-700 block">
                            ≥ {p.wholesale_min_qty}: {formatRupiah(p.wholesale_price)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            p.current_stock <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : p.current_stock <= p.min_stock_alert
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.current_stock} {p.unit}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        {activeTab === 'active' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setBarcodePrintProduct(p)}
                              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black cursor-pointer"
                              title="Cetak label barcode rak"
                            >
                              Barcode
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black cursor-pointer"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black cursor-pointer"
                            >
                              Hapus
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestoreProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
                          >
                            Pulihkan Data
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

      {/* Modal Tambah / Edit Produk */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Ubah Data Produk' : 'Tambah Produk Baru'}
        maxWidth="xl"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              soundFeedback="click"
              onClick={() => setIsFormModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              soundFeedback="chime"
              onClick={handleSaveProduct}
              className="font-black px-6"
            >
              Simpan Data Produk
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nama Barang Lengkap:"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Minyak Goreng Bimoli 1 Liter"
                required
              />
            </div>

            <Input
              label="Kode SKU Produk:"
              type="text"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              placeholder="Contoh: PRD-00123"
              required
            />

            <Input
              label="Kode Barcode (Scan EAN-13 / Code-128):"
              type="text"
              value={formBarcode}
              onChange={(e) => setFormBarcode(e.target.value)}
              placeholder="Contoh: 8992775211018"
            />

            <div>
              <label className="block text-base font-extrabold text-gray-900 mb-2">
                Kategori Barang:
              </label>
              <select
                value={formCategoryId || ''}
                onChange={(e) => setFormCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full min-h-[56px] px-4 text-lg font-bold border-2 border-gray-300 rounded-2xl bg-white"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-extrabold text-gray-900 mb-2">
                Satuan Ukuran:
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full min-h-[56px] px-4 text-lg font-bold border-2 border-gray-300 rounded-2xl bg-white"
              >
                <option value="Pcs">Pcs / Biji</option>
                <option value="Bungkus">Bungkus</option>
                <option value="Botol">Botol</option>
                <option value="Kg">Kilogram (Kg)</option>
                <option value="Liter">Liter</option>
                <option value="Dus">Dus / Karton</option>
                <option value="Renceng">Renceng</option>
              </select>
            </div>

            <Input
              label="Harga Modal HPP (Khusus Pemilik):"
              type="number"
              value={formCostPrice || ''}
              onChange={(e) => setFormCostPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="0"
              helperText="Rahasia: Kasir tidak dapat melihat angka modal ini"
            />

            <Input
              label="Harga Jual Eceran:"
              type="number"
              value={formSellingPrice || ''}
              onChange={(e) => setFormSellingPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="0"
              required
            />

            <Input
              label="Harga Grosir Bertingkat (Opsional):"
              type="number"
              value={formWholesalePrice || ''}
              onChange={(e) => setFormWholesalePrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="0"
            />

            <Input
              label="Min Pembelian Grosir (Qty):"
              type="number"
              value={formWholesaleMinQty || ''}
              onChange={(e) => setFormWholesaleMinQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="Contoh: 3 atau 12"
            />

            <Input
              label="Stok Fisik Tersedia:"
              type="number"
              value={formStock || ''}
              onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="0"
            />

            <Input
              label="Batas Minimal Peringatan Stok:"
              type="number"
              value={formMinStockAlert || ''}
              onChange={(e) => setFormMinStockAlert(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="5"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Cetak Label Barcode */}
      {barcodePrintProduct && (
        <Modal
          isOpen={true}
          onClose={() => setBarcodePrintProduct(null)}
          title="Cetak Label Barcode Rak Toko"
          maxWidth="sm"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                size="md"
                soundFeedback="click"
                onClick={() => setBarcodePrintProduct(null)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="md"
                soundFeedback="click"
                onClick={() => window.print()}
                className="font-black"
              >
                Cetak (Print)
              </Button>
            </div>
          }
        >
          <div className="text-center p-6 bg-white border-2 border-gray-300 rounded-2xl space-y-2">
            <h3 className="text-lg font-black text-gray-900">{barcodePrintProduct.name}</h3>
            <p className="text-2xl font-black text-emerald-700">{formatRupiah(barcodePrintProduct.selling_price)}</p>
            {/* Visualisasi Barcode Strip */}
            <div className="py-4 font-mono font-bold text-sm tracking-widest bg-gray-100 rounded-xl">
              ||| | || |||| | ||| |||| |
              <span className="block mt-1 font-mono text-xs text-gray-600">
                {barcodePrintProduct.barcode || barcodePrintProduct.sku}
              </span>
            </div>
            <p className="text-xs text-gray-500">Ukuran label standar rak warung 40x30mm</p>
          </div>
        </Modal>
      )}
    </OwnerLayout>
  );
};

export default ProductsIndex;
