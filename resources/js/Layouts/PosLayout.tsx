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

      {/* Container Full-Viewport: Di desktop 100vh tanpa scroll window; di mobile flex responsif */}
      <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col antialiased select-none text-slate-100">
        {/* Header Navigasi Kasir Ramping (56px) */}
        <header className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between z-30">
          {/* Logo & Info Kasir */}
          <div className="flex items-center gap-3">
            <Link href="/pos" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-emerald-500">
                G
              </div>
              <div className="leading-tight">
                <span className="text-base sm:text-lg font-black tracking-tight text-white block">
                  GROSSMART
                </span>
                <span className="text-[10px] font-bold text-emerald-400 hidden sm:block">
                  POS Kelontong Mandiri
                </span>
              </div>
            </Link>

            {/* Status Kasir Aktif */}
            <div className="hidden md:flex items-center gap-2 pl-3 ml-2 border-l border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold text-slate-200">{cashierName}</span>
              {shiftStartTime && (
                <span className="text-slate-400">
                  &bull; Shift: {shiftStartTime}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons (Min-Touch 48px) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {canInstallPWA && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  promptPWAInstall();
                }}
                className="hidden lg:flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs cursor-pointer transition-all active:scale-95"
              >
                <span>📲</span>
                <span>Pasang Aplikasi</span>
              </button>
            )}

            {onOpenCashDrop && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCashDrop();
                }}
                className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-black text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                title="Setor kas laci ke brankas pemilik"
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Setor Brankas</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleAudio}
              className={`min-h-[44px] min-w-[44px] p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                isAudioMuted
                  ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                  : 'bg-slate-800 text-emerald-400 border-slate-700'
              }`}
              title={isAudioMuted ? 'Suara dimatikan' : 'Suara aktif'}
              aria-label="Toggle Suara"
            >
              {isAudioMuted ? '🔇' : '🔊'}
            </button>

            {onCloseShift && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onCloseShift();
                }}
                className="min-h-[44px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-md border border-rose-500"
              >
                <span>🔒</span>
                <span>Tutup Shift</span>
              </button>
            )}
          </div>
        </header>

        {/* Konten Utama Aplikasi: 100% Mengisi Sisa Viewport */}
        <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col p-2 sm:p-3 lg:p-4 pb-20 sm:pb-3">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Hanya di Layar Kecil) */}
        <BottomNavBar items={navItems} />
      </div>
    </ToastProvider>
  );
};

export default PosLayout;
