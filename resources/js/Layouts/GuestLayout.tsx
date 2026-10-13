import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 sm:p-6 antialiased selection:bg-emerald-500 selection:text-white">
            <div className="mb-6 text-center">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-3xl shadow-xl border-2 border-emerald-500 group-hover:scale-105 transition-all">
                        G
                    </div>
                    <div className="text-left">
                        <span className="text-2xl font-black text-white tracking-tight block leading-none">
                            GROSSMART
                        </span>
                        <span className="text-xs font-bold text-emerald-400 tracking-wider block mt-1">
                            Aplikasi Kasir & Toko Kelontong
                        </span>
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-lg overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border-4 border-slate-700 shadow-2xl">
                {children}
            </div>
        </div>
    );
}
