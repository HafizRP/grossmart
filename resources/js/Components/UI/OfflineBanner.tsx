import React, { useState, useEffect } from 'react';
import { sound } from '@/Utils/sound';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      sound.playBeep();
    };

    const handleOffline = () => {
      setIsOnline(false);
      sound.playError();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = async () => {
    setIsReconnecting(true);
    sound.playClick();
    try {
      // Ping ringan ke server atau cek fetch favicon/manifest
      await fetch('/manifest.json', { cache: 'no-store', method: 'HEAD' });
      setIsOnline(true);
      setIsReconnecting(false);
      sound.playBeep();
    } catch {
      setIsReconnecting(false);
      sound.playError();
    }
  };

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed top-0 left-0 right-0 z-50 bg-amber-500 text-gray-950
        px-4 py-3 shadow-lg border-b-4 border-amber-700
        flex flex-wrap items-center justify-between gap-3
      "
    >
      <div className="flex items-center gap-3">
        {/* Ikon Wi-Fi Terputus */}
        <span className="p-2 bg-amber-600/30 rounded-xl text-gray-950 flex-shrink-0">
          <svg className="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a5 5 0 01-1.414-3.536 5 5 0 011.414-3.536m-4.243 7.072a9 9 0 010-12.728M3 3l18 18" />
          </svg>
        </span>

        <div>
          <h4 className="text-base sm:text-lg font-black tracking-tight leading-tight">
            Koneksi Internet Toko Terputus Sejenak
          </h4>
          <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
            Grossmart tetap aktif. Data lokal tersimpan dan otomatis sinkron saat Wi-Fi kembali terhubung.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isReconnecting}
        onClick={handleManualCheck}
        className="
          px-5 py-2.5 rounded-xl font-black text-base bg-gray-950 text-white
          hover:bg-gray-800 active:bg-black transition-colors focus:ring-4 focus:ring-amber-300
          border-b-2 border-black touch-manipulation cursor-pointer flex items-center gap-2
          disabled:opacity-60
        "
      >
        {isReconnecting && (
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        )}
        <span>{isReconnecting ? 'Mencoba Sambung...' : 'Coba Hubungkan Ulang'}</span>
      </button>
    </div>
  );
};

export default OfflineBanner;
