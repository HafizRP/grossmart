import React, { useState } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { HeldCart, CartItem } from '@/types/pos';
import { formatRupiah, formatTanggalWaktu } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface HeldCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldCarts: HeldCart[];
  currentItems: CartItem[];
  onHoldCurrentCart: (note: string) => void;
  onRestoreCart: (heldCart: HeldCart) => void;
  onDeleteHeldCart: (heldCartId: string) => void;
}

export const HeldCartsModal: React.FC<HeldCartsModalProps> = ({
  isOpen,
  onClose,
  heldCarts,
  currentItems,
  onHoldCurrentCart,
  onRestoreCart,
  onDeleteHeldCart,
}) => {
  const [noteInput, setNoteInput] = useState<string>('');
  const [isParkingCurrent, setIsParkingCurrent] = useState<boolean>(false);

  const handleParkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItems.length === 0) return;

    sound.playBeep();
    onHoldCurrentCart(noteInput.trim() || 'Tanpa Catatan');
    setNoteInput('');
    setIsParkingCurrent(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Parkir & Panggil Keranjang Belanja (F3)"
      maxWidth="lg"
      footer={
        <div className="flex justify-between w-full">
          {currentItems.length > 0 && !isParkingCurrent && (
            <Button
              variant="warning"
              size="lg"
              soundFeedback="click"
              onClick={() => setIsParkingCurrent(true)}
              className="text-base sm:text-lg font-black"
            >
              Parkir Keranjang Saat Ini (+ Simpan)
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            soundFeedback="click"
            onClick={onClose}
            className="ml-auto"
          >
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Form Parkir Keranjang Saat Ini */}
        {isParkingCurrent && (
          <form onSubmit={handleParkSubmit} className="p-4 bg-amber-50 rounded-2xl border-3 border-amber-400 space-y-3">
            <h4 className="text-lg font-black text-amber-950">
              Simpan & Tunda Belanjaan Pelanggan Ini:
            </h4>
            <p className="text-sm font-bold text-amber-800">
              Ada {currentItems.length} barang di keranjang aktif. Anda dapat melayani pembeli lain terlebih dahulu.
            </p>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Catatan / Nama Pembeli (Contoh: Ibu Ani - ambil dompet)..."
              autoFocus
              className="w-full min-h-[50px] px-4 text-lg font-bold border-2 border-amber-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-200 bg-white"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="md"
                soundFeedback="click"
                onClick={() => setIsParkingCurrent(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="warning"
                size="md"
                soundFeedback="beep"
                className="font-black"
              >
                Simpan & Kosongkan Kasir
              </Button>
            </div>
          </form>
        )}

        {/* Daftar Keranjang yang Terparkir */}
        <div>
          <h4 className="text-base sm:text-lg font-black text-gray-900 mb-3">
            Daftar Keranjang Tertunda ({heldCarts.length}):
          </h4>

          {heldCarts.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <p className="text-lg font-black text-gray-600">Tidak ada keranjang yang diparkir</p>
              <p className="text-sm font-bold text-gray-400 mt-1">
                Gunakan fitur ini jika pembeli izin mengambil uang tambahan atau dompet tertinggal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {heldCarts.map((cart) => (
                <div
                  key={cart.id}
                  className="p-4 bg-white rounded-2xl border-2 border-gray-300 hover:border-emerald-500 shadow-sm transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-100 text-blue-800">
                        {cart.total_items} Barang
                      </span>
                      <h5 className="text-lg font-black text-gray-900">
                        {cart.note}
                      </h5>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500 mt-1">
                      <span>Waktu: {formatTanggalWaktu(cart.held_at)}</span>
                      <span className="text-emerald-700 font-black text-base">
                        Total: {formatRupiah(cart.grand_total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        if (window.confirm('Hapus keranjang tertunda ini?')) {
                          onDeleteHeldCart(cart.id);
                        }
                      }}
                      className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Hapus"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <Button
                      variant="primary"
                      size="md"
                      soundFeedback="chime"
                      onClick={() => {
                        onRestoreCart(cart);
                        onClose();
                      }}
                      className="text-base font-black px-4"
                    >
                      Panggil ke Kasir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HeldCartsModal;
