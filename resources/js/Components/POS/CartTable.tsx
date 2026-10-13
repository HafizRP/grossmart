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
  const grandTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border-3 border-slate-200 shadow-lg overflow-hidden">
      {/* Header Keranjang Struk */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b-2 border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/30">
            🛒
          </span>
          <div>
            <h3 className="text-base font-black text-white leading-tight">
              Keranjang Kasir
            </h3>
            <span className="text-[11px] font-bold text-slate-300">
              Total {totalItemsCount} barang terhitung
            </span>
          </div>
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
            className="text-xs font-black text-rose-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 transition-all cursor-pointer"
          >
            ✕ Kosongkan
          </button>
        )}
      </div>

      {/* Daftar Item Belanja (Ergonomis Lansia: Tombol Min-Height 48px) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-20 h-20 mb-3 rounded-full bg-slate-100 flex items-center justify-center text-4xl">
              🧺
            </div>
            <p className="text-xl font-black text-slate-700">Keranjang Masih Kosong</p>
            <p className="text-sm font-bold text-slate-400 mt-1 max-w-xs">
              Klik nama barang di menu sebelah kiri atau arahkan pemindai barcode
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.cart_id} className="pt-2.5 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
                      {formatRupiah(item.unit_price)} / {item.unit}
                    </span>

                    {item.is_wholesale_applied && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                        ⭐ Harga Grosir
                      </span>
                    )}

                    {item.notes && (
                      <span className="text-[11px] font-bold text-amber-800 italic">
                        ({item.notes})
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtotal Item */}
                <div className="text-right pl-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums block">
                    {formatRupiah(item.subtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onRemoveItem(item.cart_id);
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline pt-0.5"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {/* Pengontrol Jumlah (Touch Target 48px Ergonomis) */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateQuantity(item.cart_id, item.quantity - 1);
                    }}
                    className="w-11 h-11 bg-white hover:bg-rose-50 active:scale-95 text-rose-700 font-black text-xl rounded-xl border border-slate-300 shadow-sm flex items-center justify-center transition-all"
                    aria-label={`Kurangi 1 ${item.name}`}
                  >
                    −
                  </button>

                  <span className="w-12 text-center text-lg font-black text-slate-900 tabular-nums select-none">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateQuantity(item.cart_id, item.quantity + 1);
                    }}
                    className="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xl rounded-xl shadow-sm flex items-center justify-center transition-all"
                    aria-label={`Tambah 1 ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <span className="text-xs font-extrabold text-slate-400">
                  Satuan: {item.unit}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bagian Bawah: Total Jumbo & Tombol Bayar Raksasa */}
      <div className="p-4 bg-slate-900 text-white border-t-3 border-slate-800 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase font-black tracking-widest text-slate-400">
            TOTAL BELANJA:
          </span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-400 tabular-nums">
            {formatRupiah(grandTotal)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {onHoldCart && items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onHoldCart();
              }}
              className="w-full min-h-[44px] bg-slate-800 hover:bg-slate-700 active:scale-[0.99] border border-slate-700 rounded-xl text-xs font-black text-amber-300 transition-all flex items-center justify-center gap-1.5"
            >
              <span>⏸️</span> Simpan Sementara (Pending)
            </button>
          )}

          <Button
            variant="primary"
            size="xl"
            fullWidth
            disabled={items.length === 0}
            soundFeedback="chime"
            onClick={onCheckout}
            className="min-h-[64px] text-xl font-black uppercase tracking-wider rounded-2xl shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            BAYAR SEKARANG ➔
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartTable;
