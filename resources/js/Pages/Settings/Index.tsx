import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PosLayout } from '@/Layouts/PosLayout';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { sound } from '@/Utils/sound';
import { useToast } from '@/Components/UI/Toast';
import { promptPWAInstall } from '@/registerServiceWorker';

export interface StoreSettings {
  store_name: string;
  store_address: string;
  store_phone: string;
  receipt_footer: string;
  cash_rounding: boolean;
  idle_timeout_minutes: number;
}

export interface SettingsIndexProps {
  settings: StoreSettings;
  is_owner?: boolean;
}

export const SettingsIndex: React.FC<SettingsIndexProps> = ({
  settings = {
    store_name: 'GROSSMART TOKO KELONTONG',
    store_address: 'Jl. Raya Desa No. 12',
    store_phone: '081234567890',
    receipt_footer: 'Barang yang sudah dibeli dapat ditukar 1x24 jam dengan membawa nota.',
    cash_rounding: true,
    idle_timeout_minutes: 45,
  },
  is_owner = false,
}) => {
  const toast = useToast();
  const [storeName, setStoreName] = useState<string>(settings.store_name);
  const [storeAddress, setStoreAddress] = useState<string>(settings.store_address);
  const [storePhone, setStorePhone] = useState<string>(settings.store_phone);
  const [receiptFooter, setReceiptFooter] = useState<string>(settings.receipt_footer);
  const [cashRounding, setCashRounding] = useState<boolean>(settings.cash_rounding);
  const [idleTimeout, setIdleTimeout] = useState<number>(settings.idle_timeout_minutes);

  // Audio Settings (Langsung tersimpan di SoundManager & LocalStorage)
  const [volume, setVolumeState] = useState<number>(sound.volume);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolumeState(val);
    sound.setVolume(val);
  };

  const handleTestSound = (type: 'beep' | 'error' | 'chime') => {
    if (type === 'beep') sound.playBeep();
    if (type === 'error') sound.playError();
    if (type === 'chime') sound.playChime();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSaving(true);

    router.post('/settings', {
      store_name: storeName,
      store_address: storeAddress,
      store_phone: storePhone,
      receipt_footer: receiptFooter,
      cash_rounding: cashRounding,
      idle_timeout_minutes: idleTimeout,
    }, {
      onSuccess: () => {
        setIsSaving(false);
        sound.playChime();
        toast.success('Pengaturan toko berhasil disimpan');
      },
      onError: () => {
        setIsSaving(false);
        sound.playError();
        toast.error('Gagal menyimpan pengaturan');
      },
    });
  };

  return (
    <PosLayout title="Pengaturan Toko - Grossmart">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm">
          <h2 className="text-2xl font-black text-gray-950">
            Pengaturan Aplikasi Toko & Audio
          </h2>
          <p className="text-base font-bold text-gray-600 mt-0.5">
            Atur nama toko pada struk, volume audio umpan balik bip, dan instalasi PWA.
          </p>
        </div>

        {/* 1. Pengaturan Suara & Audio Feedback */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-gray-950 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>Umpan Balik Suara (Audio Feedback Ramah Lansia)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label htmlFor="volume-range-input" className="block text-sm font-bold text-gray-700 mb-2">
                Tingkat Kekerasan Suara: {Math.round(volume * 100)}%
              </label>
              <input
                id="volume-range-input"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleTestSound('beep')}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-800 font-extrabold text-sm border-2 border-gray-300 cursor-pointer"
              >
                Tes Bip Barcode
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('error')}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-800 font-extrabold text-sm border-2 border-gray-300 cursor-pointer"
              >
                Tes Buzz Salah
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('chime')}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-800 font-extrabold text-sm border-2 border-gray-300 cursor-pointer"
              >
                Tes Chime Lunas
              </button>
            </div>
          </div>
        </div>

        {/* 2. PWA & Pemasangan Aplikasi di HP */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-950">
              Pemasangan Aplikasi di HP / Komputer (PWA)
            </h3>
            <p className="text-sm font-bold text-gray-600 mt-1">
              Pasang Grossmart langsung di layar utama agar berjalan layar penuh tanpa address bar browser.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            soundFeedback="click"
            onClick={promptPWAInstall}
            className="text-base font-black px-6"
          >
            Pasang Aplikasi Sekarang
          </Button>
        </div>

        {/* 3. Formulir Identitas Toko (Khusus Pemilik) */}
        {is_owner && (
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-gray-950">
              Identitas Toko pada Struk Belanja
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nama Toko / Warung:"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: TOKO KELONTONG BERKAH"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Alamat Toko Lengkap:"
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Contoh: Jl. Diponegoro No. 45, Pasar Anyar"
                  required
                />
              </div>

              <Input
                label="Nomor Telepon / WhatsApp Toko:"
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
              />

              <Input
                label="Waktu Idle Kunci Sesi Kasir (Menit):"
                type="number"
                min="5"
                max="120"
                value={idleTimeout}
                onChange={(e) => setIdleTimeout(parseInt(e.target.value, 10) || 45)}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Catatan Kaki Struk (Footer):"
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Contoh: Terima kasih atas kunjungan Anda!"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cashRounding}
                    onChange={(e) => setCashRounding(e.target.checked)}
                    className="w-6 h-6 rounded text-emerald-600 border-2 border-gray-300"
                  />
                  <span className="text-base font-extrabold text-gray-900">
                    Aktifkan Pembulatan Kasir Otomatis (Cash Rounding ke Rp 100 terdekat untuk uang tunai)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSaving}
                soundFeedback="chime"
                className="text-lg font-black px-8"
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </div>
    </PosLayout>
  );
};

export default SettingsIndex;
