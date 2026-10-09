import React from 'react';
import { CartItem } from '@/types/pos';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { Button } from '@/Components/UI/Button';

export interface CartTableProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, newQty: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onHoldCart?: () => void;
  onCheckout: () => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onHoldCart,
  onCheckout,
}) => {
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount_amount || 0) * item.quantity, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border-3 border-gray-200 shadow-md overflow-hidden">
      {/* Header Keranjang */}
      <div className="p-4 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-xl font-black text-gray-900">
            Keranjang Belanja
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800">
            {totalItemsCount} barang
          </span>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (window.confirm('Kosongkan semua barang dari keranjang belanja?')) {
                onClearCart();
              }
            }}
            className="text-sm font-black text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
          >
            Kosongkan
          </button>
        )}
      </div>

      {/* Daftar Item Belanja */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <svg className="w-20 h-20 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl font-black text-gray-600">Keranjang Masih Kosong</p>
            <p className="text-base font-bold text-gray-400 mt-1">Scan barcode atau pilih barang di katalog kiri</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.cart_id} className="pt-2.5 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm sm:text-base font-bold text-gray-600">
                      {formatRupiah(item.unit_price)} / {item.unit}
                    </span>

                    {item.is_wholesale_applied && (
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-100 text-blue-800">
                        HARGA GROSIR
                      </span>
                    )}

                    {item.quantity >= item.current_stock && (
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-rose-100 text-rose-800">
                        MAKS STOK
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtotal Item */}
                <div className="text-right flex-shrink-0">
                  <span className="text-lg sm:text-xl font-black text-emerald-700 block">
                    {formatRupiah(item.subtotal)}
                  </span>
                  {item.discount_amount > 0 && (
                    <span className="text-xs font-bold text-rose-600 line-through">
                      Hemat {formatRupiah(item.discount_amount * item.quantity)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stepper Jumlah Jumbo & Tombol Hapus */}
              <div className="flex items-center justify-between mt-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onRemoveItem(item.cart_id);
                  }}
                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Hapus barang ini"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateQuantity(item.cart_id, item.quantity - 1);
                    }}
                    className="
                      w-11 h-11 rounded-xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                      text-gray-900 text-2xl font-black flex items-center justify-center
                      touch-manipulation cursor-pointer
                    "
                    aria-label="Kurangi jumlah"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={item.current_stock}
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) {
                        onUpdateQuantity(item.cart_id, Math.min(val, item.current_stock));
                      }
                    }}
                    className="
                      w-14 h-11 text-center text-lg sm:text-xl font-black text-gray-950 bg-white
                      border-2 border-gray-400 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateQuantity(item.cart_id, item.quantity + 1);
                    }}
                    disabled={item.quantity >= item.current_stock}
                    className="
                      w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                      text-white text-2xl font-black flex items-center justify-center
                      disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation cursor-pointer
                    "
                    aria-label="Tambah jumlah"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ringkasan & Tombol Pembayaran Raksasa */}
      {items.length > 0 && (
        <div className="p-4 bg-gray-50 border-t-2 border-gray-200 space-y-3">
          {/* Rincian Finansial */}
          <div className="space-y-1">
            {totalDiscount > 0 && (
              <div className="flex justify-between text-base font-bold text-rose-600">
                <span>Total Potongan Diskon:</span>
                <span>-{formatRupiah(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1 border-t border-gray-200">
              <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                TOTAL BAYAR:
              </span>
              <span className="text-2xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* Baris Tombol Aksi */}
          <div className="flex items-center gap-2 pt-1">
            {onHoldCart && (
              <Button
                variant="info"
                size="lg"
                soundFeedback="click"
                onClick={onHoldCart}
                className="w-1/3 text-base sm:text-lg font-black"
                title="Tunda dan simpan keranjang belanja (F3)"
              >
                Parkir (F3)
              </Button>
            )}

            <Button
              variant="primary"
              size="xl"
              fullWidth={!onHoldCart}
              soundFeedback="chime"
              onClick={onCheckout}
              className={`flex-1 text-xl sm:text-2xl font-black shadow-lg ${onHoldCart ? 'w-2/3' : 'w-full'}`}
            >
              BAYAR SEKARANG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartTable;
