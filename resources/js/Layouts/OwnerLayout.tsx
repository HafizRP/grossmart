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
    { label: 'Ringkasan Toko', href: '/owner/dashboard' },
    { label: 'Halaman Kasir (POS)', href: '/pos' },
    { label: 'Katalog Produk & Stok', href: '/owner/products' },
    { label: 'Laporan & Keuangan', href: '/owner/reports' },
    { label: 'Tempat Sampah', href: '/owner/trash' },
  ];

  const handleLogout = () => {
    sound.playClick();
    router.post('/logout');
  };

  return (
    <ToastProvider>
      <Head title={title} />
      <OfflineBanner />

      <div className="min-h-screen bg-gray-100 flex flex-col antialiased">
        {/* Navbar Pemilik */}
        <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-18 min-h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/owner/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow">
                  G
                </div>
                <div>
                  <span className="text-xl font-black text-gray-950 block leading-tight">GROSSMART</span>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Panel Pemilik</span>
                </div>
              </Link>

              {/* Navigasi Desktop */}
              <nav className="hidden md:flex items-center gap-1 ml-6">
                {navLinks.map((lnk) => (
                  <Link
                    key={lnk.href}
                    href={lnk.href}
                    className="px-3.5 py-2 rounded-xl text-base font-extrabold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    {lnk.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Profil & Tombol Keluar */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-black text-gray-900">{userName}</span>
                <span className="block text-xs font-bold text-emerald-600">Akun Pemilik Toko</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 font-bold text-sm border border-gray-300 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </div>

            {/* Hamburger Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2.5 rounded-xl bg-gray-100 text-gray-800"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Menu Dropdown Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden p-4 bg-white border-t border-gray-200 space-y-2">
              {navLinks.map((lnk) => (
                <Link
                  key={lnk.href}
                  href={lnk.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-black text-gray-800 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {lnk.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-sm text-gray-700">{userName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-600 font-black text-sm"
                >
                  Keluar Akun
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
};

export default OwnerLayout;
