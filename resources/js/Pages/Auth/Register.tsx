import React from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun Baru - Grossmart" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Pendaftaran Akun Baru
                </h2>
                <p className="text-sm font-bold text-slate-500 mt-1">
                    Buat akun pengelola untuk warung kelontong Anda
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
                        Nama Lengkap:
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={data.name}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full min-h-[54px] px-4 text-base font-bold bg-white border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 text-slate-900"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
                        Alamat Email:
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="Contoh: budi@warungberkah.id"
                        className="w-full min-h-[54px] px-4 text-base font-bold bg-white border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 text-slate-900"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
                        Kata Sandi (Password):
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="Minimal 8 karakter..."
                        className="w-full min-h-[54px] px-4 text-base font-bold bg-white border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 text-slate-900"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
                        Ulangi Kata Sandi:
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        placeholder="Ketik ulang kata sandi di atas..."
                        className="w-full min-h-[54px] px-4 text-base font-bold bg-white border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 text-slate-900"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full min-h-[60px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-lg shadow-xl border-2 border-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>Daftar Akun Sekarang</span>
                        <span>➔</span>
                    </button>

                    <Link
                        href={route('login')}
                        className="min-h-[46px] flex items-center justify-center text-sm font-black text-slate-700 hover:text-emerald-800 transition-colors"
                    >
                        Sudah punya akun? Masuk ke sini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
