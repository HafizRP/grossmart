import React, { useState } from 'react';
import { CartItem } from '@/types/pos';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { CartTable } from '@/Components/POS/CartTable';

export interface MobileCartDrawerProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, newQty: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onHoldCart?: () => void;
  onCheckout: () => void;
}

export const MobileCartDrawer: React.FC<MobileCartDrawerProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onHoldCart,
  onCheckout,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (items.length === 0) return null;

  return (
    <>
      {/* Bilah Bar Keranjang Mengambang Ergonomis (Hanya Muncul di Mobile/Tablet: lg:hidden) */}
      {/* Terpasang di atas Bottom Nav Bar (bottom-20) dengan z-index 35 */}
      <div className="fixed bottom-20 left-3 right-3 z-35 lg:hidden">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsOpen(true);
          }}
          className="w-full min-h-[64px] bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between border-2 border-emerald-400 touch-manipulation cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                {totalItemsCount}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-200 block">
                Keranjang Belanja
              </span>
              <span className="text-xl font-black block leading-none tabular-nums">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 text-emerald-400 font-black text-sm px-3.5 py-2 rounded-xl border border-slate-700 shadow">
            <span>Buka Struk</span>
            <span>▲</span>
          </div>
        </button>
      </div>

      {/* Full Bottom-Sheet Drawer Layar Penuh di Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop Gelap */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => {
              sound.playClick();
              setIsOpen(false);
            }}
          />

          {/* Lembar Konten Struk */}
          <div className="relative bg-slate-950 rounded-t-3xl border-t-3 border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Handle Bar Penutup */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧾</span>
                <span className="text-base font-black text-white">Struk Kasir Sementara</span>
                <span className="text-xs font-bold text-slate-400">({totalItemsCount} barang)</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsOpen(false);
                }}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 text-slate-300 font-black text-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Container Struk CartTable */}
            <div className="flex-1 overflow-y-auto p-2">
              <CartTable
                items={items}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
                onClearCart={() => {
                  onClearCart();
                  setIsOpen(false);
                }}
                onHoldCart={
                  onHoldCart
                    ? () => {
                        onHoldCart();
                        setIsOpen(false);
                      }
                    : undefined
                }
                onCheckout={() => {
                  setIsOpen(false);
                  onCheckout();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileCartDrawer;
