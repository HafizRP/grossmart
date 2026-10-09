import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { PosLayout } from '@/Layouts/PosLayout';
import { ProductGrid, Category } from '@/Components/POS/ProductGrid';
import { CartTable } from '@/Components/POS/CartTable';
import { MobileCartDrawer } from '@/Components/POS/MobileCartDrawer';
import { PaymentDialog } from '@/Components/POS/PaymentDialog';
import { ThermalReceipt } from '@/Components/POS/ThermalReceipt';
import { HeldCartsModal } from '@/Components/POS/HeldCartsModal';
import { CameraScannerModal } from '@/Components/POS/CameraScannerModal';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { useToast } from '@/Components/UI/Toast';
import { Product, CartItem, Customer, HeldCart, PaymentData, ReceiptData } from '@/types/pos';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface PosIndexProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  shift: {
    id: number;
    cashier_name: string;
    start_time: string;
  };
  store: {
    name: string;
    address: string;
    phone: string;
    receipt_footer: string;
  };
}

export const PosIndex: React.FC<PosIndexProps> = ({
  products = [],
  categories = [],
  customers = [],
  shift,
  store,
}) => {
  const toast = useToast();

  // State Keranjang Aktif
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);

  // State Modal Dialogs
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isCashDropOpen, setIsCashDropOpen] = useState<boolean>(false);

  // State Transaksi & Checkout
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [latestReceipt, setLatestReceipt] = useState<ReceiptData | null>(null);

  // State Cash Drop Form
  const [cashDropAmount, setCashDropAmount] = useState<number>(0);
  const [cashDropNotes, setCashDropNotes] = useState<string>('');

  // 1. Tambah Produk ke Keranjang (Dengan Kalkulasi Otomatis Harga Grosir)
  const handleAddToCart = useCallback((product: Product) => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex((it) => it.product_id === product.id);

      if (existingIdx !== -1) {
        const item = prevItems[existingIdx];
        const nextQty = item.quantity + 1;

        if (nextQty > product.current_stock) {
          toast.warning(`Stok ${product.name} tersisa ${product.current_stock} ${product.unit}`);
          sound.playError();
          return prevItems;
        }

        // Cek harga grosir bertingkat
        const applyWholesale = Boolean(
          product.wholesale_price &&
          product.wholesale_min_qty &&
          nextQty >= product.wholesale_min_qty
        );

        const unitPrice = applyWholesale && product.wholesale_price
          ? product.wholesale_price
          : product.selling_price;

        const updated = [...prevItems];
        updated[existingIdx] = {
          ...item,
          quantity: nextQty,
          unit_price: unitPrice,
          is_wholesale_applied: applyWholesale,
          subtotal: nextQty * unitPrice - (item.discount_amount * nextQty),
        };
        return updated;
      }

      // Barang baru
      const applyWholesale = Boolean(
        product.wholesale_price &&
        product.wholesale_min_qty &&
        1 >= product.wholesale_min_qty
      );

      const unitPrice = applyWholesale && product.wholesale_price
        ? product.wholesale_price
        : product.selling_price;

      const newItem: CartItem = {
        cart_id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        name: product.name,
        barcode: product.barcode,
        unit: product.unit,
        unit_price: unitPrice,
        regular_price: product.selling_price,
        wholesale_price: product.wholesale_price,
        wholesale_min_qty: product.wholesale_min_qty,
        is_wholesale_applied: applyWholesale,
        quantity: 1,
        discount_amount: 0,
        subtotal: unitPrice,
        current_stock: product.current_stock,
      };

      return [...prevItems, newItem];
    });
  }, [toast]);

  // 2. Ubah Jumlah Item
  const handleUpdateQuantity = useCallback((cartId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartId);
      return;
    }

    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.cart_id !== cartId) return item;

        const qty = Math.min(newQty, item.current_stock);
        const applyWholesale = Boolean(
          item.wholesale_price &&
          item.wholesale_min_qty &&
          qty >= item.wholesale_min_qty
        );

        const unitPrice = applyWholesale && item.wholesale_price
          ? item.wholesale_price
          : item.regular_price;

        return {
          ...item,
          quantity: qty,
          unit_price: unitPrice,
          is_wholesale_applied: applyWholesale,
          subtotal: qty * unitPrice - (item.discount_amount * qty),
        };
      });
    });
  }, []);

  // 3. Hapus Item
  const handleRemoveItem = useCallback((cartId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cart_id !== cartId));
  }, []);

  // 4. Kosongkan Keranjang
  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // 5. Scan Barcode (Hardware USB / Bluetooth Barcode Listener)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika user sedang mengetik di input teks biasa
      const activeTag = document.activeElement?.tagName;
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

      // Global Retail Keyboard Shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        sound.playClick();
        setIsHelpOpen(true);
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        sound.playClick();
        setIsHeldCartsOpen(true);
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        sound.playClick();
        setIsCameraOpen(true);
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        if (cartItems.length > 0) {
          sound.playChime();
          setIsPaymentOpen(true);
        } else {
          toast.warning('Keranjang belanja masih kosong');
          sound.playError();
        }
        return;
      }

      // Deteksi Scanner Fisik (Keystroke cepat < 50ms per karakter)
      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3 && !isInput) {
          e.preventDefault();
          const scannedCode = buffer.trim();
          buffer = '';

          // Cari produk berdasarkan barcode atau SKU
          const found = products.find(
            (p) => p.barcode === scannedCode || p.sku.toLowerCase() === scannedCode.toLowerCase()
          );

          if (found) {
            handleAddToCart(found);
            sound.playBeep();
            toast.success(`+ ${found.name} masuk keranjang`);
          } else {
            sound.playError();
            toast.error(`Barang dengan barcode [${scannedCode}] tidak ditemukan`);
          }
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cartItems.length, handleAddToCart, toast]);

  // 6. Parkir Keranjang Saat Ini
  const handleHoldCurrentCart = (note: string) => {
    if (cartItems.length === 0) return;

    const grandTotal = cartItems.reduce((sum, it) => sum + it.subtotal, 0);
    const newHeld: HeldCart = {
      id: `held-${Date.now()}`,
      note,
      held_at: new Date().toISOString(),
      items: [...cartItems],
      total_items: cartItems.reduce((sum, it) => sum + it.quantity, 0),
      grand_total: grandTotal,
    };

    setHeldCarts((prev) => [newHeld, ...prev]);
    setCartItems([]);
    toast.success(`Keranjang belanja (${note}) berhasil diparkir`);
  };

  // 7. Panggil Keranjang Parkir
  const handleRestoreCart = (held: HeldCart) => {
    if (cartItems.length > 0) {
      if (!window.confirm('Keranjang saat ini ada barangnya. Gantikan dengan keranjang tertunda ini?')) {
        return;
      }
    }
    setCartItems(held.items);
    setHeldCarts((prev) => prev.filter((h) => h.id !== held.id));
    toast.success(`Keranjang (${held.note}) dipanggil ke kasir`);
  };

  // 8. Eksekusi Pembayaran
  const handleProcessPayment = (payment: PaymentData) => {
    setIsProcessingCheckout(true);

    const subtotal = cartItems.reduce((sum, it) => sum + it.subtotal, 0);
    const grandTotal = subtotal + payment.rounding_amount - (payment.points_discount_value || 0);

    const payload = {
      items: cartItems.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount_amount: it.discount_amount,
        subtotal: it.subtotal,
      })),
      ...payment,
    };

    router.post('/pos/checkout', payload, {
      onSuccess: () => {
        setIsProcessingCheckout(false);
        setIsPaymentOpen(false);

        // Buat objek ReceiptData untuk cetak & WA
        const generatedReceipt: ReceiptData = {
          invoice_number: `NOTA-${Date.now().toString().slice(-6)}`,
          transaction_date: new Date().toISOString(),
          cashier_name: shift?.cashier_name || 'Kasir',
          customer_name: payment.customer_name,
          store_name: store?.name || 'GROSSMART TOKO KELONTONG',
          store_address: store?.address || 'Jl. Raya Desa No. 12',
          store_phone: store?.phone || '081234567890',
          receipt_footer_text: store?.receipt_footer || 'Barang yang sudah dibeli dapat ditukar 1x24 jam dengan nota.',
          items: cartItems.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            unit_price: it.unit_price,
            discount_amount: it.discount_amount,
            subtotal: it.subtotal,
          })),
          subtotal,
          discount_total: cartItems.reduce((s, it) => s + (it.discount_amount * it.quantity), 0),
          points_discount: payment.points_discount_value || 0,
          rounding_amount: payment.rounding_amount,
          grand_total: grandTotal,
          payment_method: payment.payment_method,
          cash_paid: payment.cash_amount,
          transfer_paid: payment.transfer_amount,
          receivable_paid: payment.receivable_amount,
          change_returned: payment.change_due,
        };

        setLatestReceipt(generatedReceipt);
        setIsReceiptOpen(true);
        setCartItems([]);
        toast.success('Transaksi Berhasil! Nota siap dicetak.');
      },
      onError: (errors) => {
        setIsProcessingCheckout(false);
        sound.playError();
        const errFirst = Object.values(errors)[0] as string;
        toast.error(errFirst || 'Gagal memproses transaksi kasir');
      },
    });
  };

  // 9. Setor Kas ke Brankas (Cash Drop)
  const handleCashDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashDropAmount <= 0) return;

    sound.playChime();
    router.post('/shifts/cash-drop', {
      amount: cashDropAmount,
      notes: cashDropNotes.trim() || null,
    }, {
      onSuccess: () => {
        setIsCashDropOpen(false);
        setCashDropAmount(0);
        setCashDropNotes('');
        toast.success(`Setoran brankas ${formatRupiah(cashDropAmount)} berhasil dicatat`);
      },
      onError: () => {
        sound.playError();
        toast.error('Gagal mencatat setoran brankas');
      },
    });
  };

  const grandTotal = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.subtotal, 0);
  }, [cartItems]);

  return (
    <PosLayout
      title="Kasir Penjualan - Grossmart"
      cashierName={shift?.cashier_name}
      shiftStartTime={shift?.start_time}
      onOpenCashDrop={() => setIsCashDropOpen(true)}
      onCloseShift={() => router.visit(`/shifts/${shift?.id}/close`)}
    >
      {/* Banner Shortcut Keyboard Kasir (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-emerald-800 text-white rounded-2xl mb-3 shadow text-xs sm:text-sm font-extrabold select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><kbd className="bg-emerald-950 px-2 py-0.5 rounded">F1</kbd> Bantuan</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-emerald-950 px-2 py-0.5 rounded">F3</kbd> Parkir Keranjang ({heldCarts.length})</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-emerald-950 px-2 py-0.5 rounded">F4</kbd> Kamera Barcode</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-emerald-950 px-2 py-0.5 rounded">F8</kbd> Bayar Belanja</span>
        </div>
        <div className="text-emerald-200">
          Scanner Fisik Otomatis Aktif
        </div>
      </div>

      {/* Konten Utama POS Kasir (Multi-Device Responsive) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
        {/* Panel Kiri (65% di Layar Lebar): Katalog Produk */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-[500px]">
          <ProductGrid
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
            onOpenScanner={() => setIsCameraOpen(true)}
          />
        </div>

        {/* Panel Kanan (35% di Layar Lebar, Hidden di Mobile): Keranjang Belanja */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col h-full sticky top-20">
          <CartTable
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onHoldCart={() => setIsHeldCartsOpen(true)}
            onCheckout={() => setIsPaymentOpen(true)}
          />
        </div>
      </div>

      {/* Laci Keranjang Melayang Khusus Layar HP Smartphone (360px - 480px) */}
      <MobileCartDrawer
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onHoldCart={() => setIsHeldCartsOpen(true)}
        onCheckout={() => setIsPaymentOpen(true)}
      />

      {/* Modal Dialog Pembayaran */}
      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        grandTotal={grandTotal}
        customers={customers}
        onProcessPayment={handleProcessPayment}
        isProcessing={isProcessingCheckout}
      />

      {/* Modal Struk Thermal */}
      {latestReceipt && (
        <ThermalReceipt
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          receiptData={latestReceipt}
          onNewTransaction={() => {
            setLatestReceipt(null);
            setIsReceiptOpen(false);
          }}
        />
      )}

      {/* Modal Parkir Keranjang (F3) */}
      <HeldCartsModal
        isOpen={isHeldCartsOpen}
        onClose={() => setIsHeldCartsOpen(false)}
        heldCarts={heldCarts}
        currentItems={cartItems}
        onHoldCurrentCart={handleHoldCurrentCart}
        onRestoreCart={handleRestoreCart}
        onDeleteHeldCart={(id) => setHeldCarts((prev) => prev.filter((h) => h.id !== id))}
      />

      {/* Modal Scanner Barcode Kamera HP */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(code) => {
          const found = products.find(
            (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
          );
          if (found) {
            handleAddToCart(found);
            toast.success(`+ ${found.name} masuk keranjang`);
          } else {
            toast.error(`Barang barcode [${code}] tidak ada`);
          }
        }}
      />

      {/* Modal Setor Kas Laci ke Brankas (Cash Drop) */}
      <Modal
        isOpen={isCashDropOpen}
        onClose={() => setIsCashDropOpen(false)}
        title="Setor Kas Laci ke Brankas (Cash Drop)"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              soundFeedback="click"
              onClick={() => setIsCashDropOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              soundFeedback="chime"
              onClick={handleCashDropSubmit}
              disabled={cashDropAmount <= 0}
              className="font-black"
            >
              Simpan Setoran ({formatRupiah(cashDropAmount)})
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCashDropSubmit} className="space-y-4">
          <p className="text-sm font-bold text-gray-700">
            Setor uang fisik berlebih dari laci ke brankas pemilik toko agar laci tidak menumpuk rawan perampokan.
          </p>

          <div>
            <label htmlFor="cash-drop-amount-input" className="block text-base font-black text-gray-900 mb-1">
              Nominal Uang Disetor ke Brankas:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl font-black text-gray-500">
                Rp
              </span>
              <input
                id="cash-drop-amount-input"
                type="number"
                min="10000"
                step="5000"
                value={cashDropAmount || ''}
                onChange={(e) => setCashDropAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="0"
                className="w-full min-h-[58px] pl-14 pr-4 text-2xl font-black border-2 border-gray-300 rounded-2xl focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cash-drop-notes-input" className="block text-sm font-bold text-gray-700 mb-1">
              Catatan / Diterima Oleh:
            </label>
            <input
              id="cash-drop-notes-input"
              type="text"
              value={cashDropNotes}
              onChange={(e) => setCashDropNotes(e.target.value)}
              placeholder="Contoh: Diserahkan langsung ke Ibu Pemilik..."
              className="w-full min-h-[48px] px-3 text-base font-bold border-2 border-gray-300 rounded-xl"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Bantuan Shortcut Keyboard (F1) */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Daftar Tombol Cepat Keyboard (Shortcut)"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <span className="text-base font-bold text-gray-800">Bantuan Tombol Cepat</span>
            <kbd className="px-3 py-1 bg-gray-900 text-white rounded-xl font-mono font-black text-lg">F1</kbd>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <span className="text-base font-bold text-gray-800">Parkir / Tunda Keranjang Belanja</span>
            <kbd className="px-3 py-1 bg-gray-900 text-white rounded-xl font-mono font-black text-lg">F3</kbd>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <span className="text-base font-bold text-gray-800">Buka Pemindai Barcode Kamera HP</span>
            <kbd className="px-3 py-1 bg-gray-900 text-white rounded-xl font-mono font-black text-lg">F4</kbd>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <span className="text-base font-bold text-gray-800">Buka Jendela Bayar (Checkout)</span>
            <kbd className="px-3 py-1 bg-emerald-700 text-white rounded-xl font-mono font-black text-lg">F8</kbd>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <span className="text-base font-bold text-gray-800">Tutup Dialog / Batal</span>
            <kbd className="px-3 py-1 bg-gray-900 text-white rounded-xl font-mono font-black text-lg">Esc</kbd>
          </div>
        </div>
      </Modal>
    </PosLayout>
  );
};

export default PosIndex;
