import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ToastProvider } from '@/Components/UI/Toast';
import { OfflineBanner } from '@/Components/UI/OfflineBanner';
import { sound } from '@/Utils/sound';

export interface OwnerLayoutProps {
  title?: string;
  userName?: string;
  children: React.ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  title = 'Pemilik Toko - Grossmart',
  userName = 'Pemilik Toko',
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { label: 'Ringkasan Warung', href: '/owner/dashboard', icon: '📊' },
    { label: 'Layar Kasir (POS)', href: '/pos', icon: '🛒' },
    { label: 'Katalog Barang & Stok', href: '/owner/products', icon: '📦' },
    { label: 'Laporan Laba & Bon', href: '/owner/reports', icon: '📈' },
    { label: 'Pengaturan Toko', href: '/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    sound.playClick();
    router.post('/logout');
  };

  return (
    <ToastProvider>
      <Head title={title} />
      <OfflineBanner />

      {/* Layout Shell: Desktop Sidebar Kiri Tetap + Mobile Header & Bottom Bar */}
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-white">
        {/* ============================================================== */}
        {/* SIDEBAR DESKTOP PERMANEN (Hanya Tampil di Tablet/Desktop: md:flex) */}
        {/* ============================================================== */}
        <aside className="hidden md:flex w-64 lg:w-72 shrink-0 bg-slate-900 border-r border-slate-800 flex-col justify-between p-5 sticky top-0 h-screen select-none">
          <div className="space-y-6">
            {/* Brand Logo & Title */}
            <Link href="/owner/dashboard" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-2xl text-white shadow-lg border-2 border-emerald-500 group-hover:scale-105 transition-all">
                G
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-none">
                  GROSSMART
                </span>
                <span className="text-xs font-bold text-emerald-400 block mt-1">
                  Panel Pemilik Warung
                </span>
              </div>
            </Link>

            {/* Menu Navigasi Samping */}
            <nav className="space-y-1.5 pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-2">
                Menu Utama Warung:
              </span>
              {navLinks.map((link) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`min-h-[52px] px-3.5 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg border border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Tombol Keluar di Bawah Sidebar */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="px-2">
              <span className="text-sm font-black text-white block truncate">
                {userName}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Pemilik Terverifikasi
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>🚪</span>
              <span>Keluar Akun</span>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* HEADER TOP NAV KHUSUS MOBILE (Hanya Tampil di Layar HP: md:hidden) */}
        {/* ============================================================== */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <Link href="/owner/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xl text-white shadow">
              G
            </div>
            <div>
              <span className="text-base font-black text-white block leading-none">
                GROSSMART
              </span>
              <span className="text-[10px] font-bold text-emerald-400">
                Pemilik Warung
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-800 text-white border border-slate-700 flex items-center justify-center cursor-pointer"
              aria-label="Menu Navigasi"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 shadow-2xl z-20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-[50px] px-4 py-3 rounded-xl text-base font-black text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-3"
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full min-h-[50px] px-4 py-3 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 font-black text-base flex items-center justify-center gap-2 mt-3"
            >
              <span>🚪</span>
              <span>Keluar Sesi</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* KONTEN UTAMA HALAMAN PEMILIK (100% Flex-1 dengan Padding Rapi)  */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
};

export default OwnerLayout;
