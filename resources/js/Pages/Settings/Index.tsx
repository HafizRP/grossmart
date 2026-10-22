import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { OwnerLayout } from '@/Layouts/OwnerLayout';
import { Button } from '@/Components/UI/Button';
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
  user_name?: string;
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
  is_owner = true,
  user_name = 'Pemilik Toko',
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

    router.post('/owner/settings', {
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
      onError: (errors) => {
        setIsSaving(false);
        sound.playError();
        const errFirst = Object.values(errors)[0];
        toast.error(typeof errFirst === 'string' ? errFirst : 'Gagal menyimpan pengaturan');
      },
    });
  };

  return (
    <OwnerLayout title="Pengaturan Toko - Grossmart" userName={user_name}>
      <Head title="Pengaturan Toko - Grossmart" />

      <div className="max-w-4xl space-y-6">
        {/* Header Banner */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pengaturan Aplikasi Toko & Audio
              </h2>
              <p className="text-sm font-bold text-slate-400 mt-1">
                Atur identitas warung pada struk belanja, volume audio bip kasir, dan instalasi PWA.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Pengaturan Suara & Audio Feedback */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="text-2xl">🔊</span>
            <span>Umpan Balik Suara (Audio Feedback Ramah Lansia)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label htmlFor="volume-range-input" className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
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
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleTestSound('beep')}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm border border-slate-700 cursor-pointer transition-all active:scale-95"
              >
                🔊 Tes Bip Barcode
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('error')}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-300 font-black text-sm border border-slate-700 hover:border-rose-800 cursor-pointer transition-all active:scale-95"
              >
                ⚠️ Tes Buzz Salah
              </button>
              <button
                type="button"
                onClick={() => handleTestSound('chime')}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950 text-emerald-300 font-black text-sm border border-slate-700 hover:border-emerald-800 cursor-pointer transition-all active:scale-95"
              >
                🔔 Tes Chime Lunas
              </button>
            </div>
          </div>
        </div>

        {/* 2. PWA & Pemasangan Aplikasi di HP */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2.5">
              <span className="text-2xl">📱</span>
              <span>Pemasangan Aplikasi di HP / Tablet (PWA)</span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
              Pasang Grossmart langsung di layar utama agar berjalan layar penuh tanpa address bar browser.
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            soundFeedback="click"
            onClick={promptPWAInstall}
            className="text-sm font-black px-6 min-h-[50px] bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
          >
            Pasang Aplikasi Sekarang
          </Button>
        </div>

        {/* 3. Formulir Identitas Toko (Khusus Pemilik) */}
        {is_owner && (
          <form onSubmit={handleSaveSettings} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-xl font-black text-white flex items-center gap-2.5">
              <span className="text-2xl">🧾</span>
              <span>Identitas Warung pada Struk Belanja & Kasir</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="store-name-input" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Nama Warung / Toko:
                </label>
                <input
                  id="store-name-input"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: TOKO KELONTONG BERKAH"
                  required
                  className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="store-address-input" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Alamat Lengkap Toko:
                </label>
                <input
                  id="store-address-input"
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Contoh: Jl. Diponegoro No. 45, Pasar Anyar"
                  required
                  className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="store-phone-input" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Nomor HP / WhatsApp Toko:
                </label>
                <input
                  id="store-phone-input"
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  required
                  className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="idle-timeout-input" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Waktu Kunci Sesi Kasir Otomatis (Menit):
                </label>
                <input
                  id="idle-timeout-input"
                  type="number"
                  min="5"
                  max="240"
                  value={idleTimeout}
                  onChange={(e) => setIdleTimeout(parseInt(e.target.value, 10) || 45)}
                  required
                  className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none tabular-nums"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="receipt-footer-input" className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Catatan Kaki Struk Belanja (Footer):
                </label>
                <input
                  id="receipt-footer-input"
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Contoh: Terima kasih atas kunjungan Anda!"
                  required
                  className="w-full min-h-[50px] px-3.5 text-base font-bold bg-slate-950 text-white border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={cashRounding}
                    onChange={(e) => setCashRounding(e.target.checked)}
                    className="w-6 h-6 rounded text-emerald-600 border-2 border-slate-700 bg-slate-900 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-black text-white block">
                      Aktifkan Pembulatan Kasir Otomatis (Cash Rounding)
                    </span>
                    <span className="text-xs text-slate-400 font-bold block mt-0.5">
                      Membulatkan nominal kembalian ke kelipatan Rp 100 terdekat agar kasir tidak kekurangan koin receh.
                    </span>
                  </div>
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
                className="text-base font-black px-8 min-h-[52px] bg-emerald-600 hover:bg-emerald-500 shadow-xl"
              >
                Simpan Perubahan Pengaturan ➔
              </Button>
            </div>
          </form>
        )}
      </div>
    </OwnerLayout>
  );
};

export default SettingsIndex;
