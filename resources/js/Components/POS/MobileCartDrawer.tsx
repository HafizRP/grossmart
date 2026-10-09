import React, { useState } from 'react';
import { CartItem } from '@/types/pos';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';
import { CartTable } from '@/Components/POS/CartTable';
import { Button } from '@/Components/UI/Button';

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
      {/* Bilah Keranjang Melayang Sticky Bawah Layar HP (Hanya Tampil di HP/sm:hidden) */}
      <div className="fixed bottom-20 left-3 right-3 z-30 sm:hidden">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsOpen(true);
          }}
          className="
            w-full min-h-[64px] bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900
            text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between
            border-3 border-emerald-500 touch-manipulation cursor-pointer select-none
          "
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                {totalItemsCount}
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 block">
                Keranjang Belanja
              </span>
              <span className="text-xl font-black block leading-none">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white text-emerald-800 font-black text-base px-3.5 py-2 rounded-xl shadow">
            <span>Buka Laci</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Laci Penuh (Bottom Sheet Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
          {/* Backdrop Gelap */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => {
              sound.playClick();
              setIsOpen(false);
            }}
          />

          {/* Konten Laci Menempel Bawah */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col z-10 border-t-4 border-emerald-600">
            {/* Header Laci */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-gray-100 bg-gray-50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <h3 className="text-xl font-black text-gray-900">
                  Keranjang ({totalItemsCount} Barang)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer"
                aria-label="Tutup Keranjang"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Isi Tabel Keranjang */}
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
