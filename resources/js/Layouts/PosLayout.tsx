import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { sound } from '@/Utils/sound';
import { ToastProvider } from '@/Components/UI/Toast';
import { OfflineBanner } from '@/Components/UI/OfflineBanner';
import { BottomNavBar } from '@/Components/UI/BottomNavBar';
import { subscribeInstallPrompt, promptPWAInstall } from '@/registerServiceWorker';

export interface PosLayoutProps {
  title?: string;
  cashierName?: string;
  shiftStartTime?: string;
  children: React.ReactNode;
  onOpenCashDrop?: () => void;
  onCloseShift?: () => void;
}

export const PosLayout: React.FC<PosLayoutProps> = ({
  title = 'Kasir Grossmart',
  cashierName = 'Kasir',
  shiftStartTime,
  children,
  onOpenCashDrop,
  onCloseShift,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(sound.isMuted);
  const [canInstallPWA, setCanInstallPWA] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeInstallPrompt((canInstall) => {
      setCanInstallPWA(canInstall);
    });
    return unsubscribe;
  }, []);

  const toggleAudio = () => {
    const nextState = !isAudioMuted;
    sound.setMuted(nextState);
    setIsAudioMuted(nextState);
    if (!nextState) {
      sound.playBeep();
    }
  };

  const navItems = [
    {
      id: 'pos',
      label: 'Kasir',
      href: '/pos',
      active: true,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: 'sales',
      label: 'Riwayat Nota',
      href: '/sales',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Laporan Kas',
      href: '/reports',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      href: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <ToastProvider>
      <Head title={title} />
      <OfflineBanner />

      <div className="min-h-screen bg-gray-100 flex flex-col antialiased select-none">
        {/* Header Kasir Utama */}
        <header className="sticky top-0 z-40 bg-white border-b-3 border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            {/* Logo & Judul Toko */}
            <div className="flex items-center gap-3">
              <Link href="/pos" className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow">
                  G
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-none">
                    GROSSMART
                  </h1>
                  <span className="text-xs font-bold text-emerald-700 tracking-wide block">
                    Toko Kelontong Mandiri
                  </span>
                </div>
              </Link>

              {/* Status Shift Kasir Aktif */}
              <div className="hidden md:flex items-center gap-2 pl-4 border-l-2 border-gray-200 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-gray-900">{cashierName}</span>
                {shiftStartTime && (
                  <span className="text-gray-500 font-medium">
                    (Shift aktif sejak {shiftStartTime})
                  </span>
                )}
              </div>
            </div>

            {/* Aksi Cepat Header */}
            <div className="flex items-center gap-2">
              {/* Tombol Pasang PWA */}
              {canInstallPWA && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    promptPWAInstall();
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-bold text-sm cursor-pointer"
                >
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Pasang Aplikasi</span>
                </button>
              )}

              {/* Tombol Setor Uang ke Brankas (Cash Drop) */}
              {onOpenCashDrop && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenCashDrop();
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-300 font-bold text-sm cursor-pointer"
                  title="Setor uang laci kasir ke brankas pemilik di tengah shift"
                >
                  Setor Brankas
                </button>
              )}

              {/* Toggle Suara Audio Bip */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-2.5 rounded-2xl border-2 transition-colors cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}
                title={isAudioMuted ? 'Suara dimatikan (Klik untuk aktifkan)' : 'Suara aktif (Klik untuk bisukan)'}
                aria-label="Toggle Suara"
              >
                {isAudioMuted ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>

              {/* Tombol Tutup Shift Kasir */}
              {onCloseShift && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onCloseShift();
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-sm shadow cursor-pointer border-b-2 border-rose-800"
                >
                  Tutup Shift
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 pb-24 sm:pb-6 flex flex-col">
          {children}
        </main>

        {/* Navigasi Bawah Khusus Layar HP */}
        <BottomNavBar items={navItems} />
      </div>
    </ToastProvider>
  );
};

export default PosLayout;
