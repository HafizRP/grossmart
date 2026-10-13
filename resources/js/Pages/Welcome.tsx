import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Grossmart - Aplikasi Kasir Toko Kelontong Ramah Lansia" />

            <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
                {/* Header Navbar */}
                <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-2xl text-white shadow-lg border-2 border-emerald-500">
                                G
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                                    GROSSMART
                                </h1>
                                <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                                    Sistem Operasional Warung Kelontong
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href="/pos"
                                    className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-md flex items-center gap-2"
                                >
                                    <span>🛒 Masuk ke Kasir</span>
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="min-h-[48px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-700 transition-all flex items-center gap-2"
                                >
                                    <span>🔑 Masuk Akun</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section Utama Ramah Lansia */}
                <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center justify-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-black">
                        <span>✨</span>
                        <span>Didesain Khusus Ergonomis untuk Pengguna Lanjut Usia</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl">
                        Aplikasi Kasir Warung yang <span className="text-emerald-400 underline decoration-emerald-500 underline-offset-8">Mudah Dibaca</span> & Cepat Digunakan
                    </h2>

                    <p className="text-base sm:text-xl font-bold text-slate-300 max-w-2xl leading-relaxed">
                        Tombol besar anti-salah sentuh, rincian uang kembalian otomatis di laci, dan pencatatan buku bon pembeli tanpa pusing hitung manual.
                    </p>

                    {/* Dua Tombol Masuk Pilihan Peran Raksasa */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl pt-4">
                        <Link
                            href="/pos"
                            className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 rounded-3xl border-3 border-emerald-500 shadow-2xl transition-all text-left group"
                        >
                            <span className="text-4xl block mb-2">🛒</span>
                            <span className="text-xs uppercase font-black text-emerald-200 tracking-wider block">
                                Kasir & Penjualan
                            </span>
                            <span className="text-2xl font-black text-white block mt-1">
                                Buka Layar Kasir
                            </span>
                            <span className="text-xs font-semibold text-emerald-100 block mt-2">
                                Khusus kasir jaga toko untuk catat belanjaan ➔
                            </span>
                        </Link>

                        <Link
                            href="/owner/dashboard"
                            className="p-6 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-3xl border-3 border-slate-700 shadow-2xl transition-all text-left group"
                        >
                            <span className="text-4xl block mb-2">📊</span>
                            <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">
                                Pemilik Toko
                            </span>
                            <span className="text-2xl font-black text-white block mt-1">
                                Ringkasan Warung
                            </span>
                            <span className="text-xs font-semibold text-slate-400 block mt-2">
                                Pantau omzet, stok kulakan, dan buku bon ➔
                            </span>
                        </Link>
                    </div>

                    {/* 3 Pilar Ergonomi Warung */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 text-left">
                        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                            <span className="text-2xl">👀</span>
                            <h4 className="text-base font-black text-white mt-1">Huruf & Angka Besar</h4>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                                Teks kontras tinggi terbaca jelas tanpa perlu memicingkan mata.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                            <span className="text-2xl">💵</span>
                            <h4 className="text-base font-black text-white mt-1">Panduan Lembaran Laci</h4>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                                Kasir diarahkan langsung mengambil pecahan uang kembalian yang pas.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                            <span className="text-2xl">🔒</span>
                            <h4 className="text-base font-black text-white mt-1">Tutup Kasir Buta</h4>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                                Rekonsiliasi fisik laci bebas manipulasi untuk rasa tenang pemilik.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-800 py-6 text-center text-xs font-bold text-slate-500">
                    &copy; {new Date().getFullYear()} Grossmart &bull; Sistem POS Warung Kelontong Mandiri
                </footer>
            </div>
        </>
    );
}
