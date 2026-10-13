import React from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi - Grossmart" />

            <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mx-auto mb-2">
                    🔑
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Lupa Kata Sandi?
                </h2>
                <p className="text-sm font-bold text-slate-500 mt-1 leading-relaxed">
                    Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
                </p>
            </div>

            {status && (
                <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-sm font-black text-emerald-900 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-1.5">
                        Alamat Email Akun:
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="Contoh: pemilik@warung.id"
                        className="w-full min-h-[56px] px-4 text-base font-bold bg-white border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 text-slate-900"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full min-h-[60px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-lg shadow-xl border-2 border-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>Kirim Tautan Buat Sandi Baru</span>
                        <span>➔</span>
                    </button>

                    <Link
                        href={route('login')}
                        className="min-h-[46px] flex items-center justify-center text-sm font-black text-slate-700 hover:text-emerald-800 transition-colors"
                    >
                        ← Kembali ke Halaman Masuk
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
