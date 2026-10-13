import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black leading-tight text-slate-900 tracking-tight">
                            Pengaturan Profil Pengguna
                        </h2>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                            Kelola informasi data akun dan keamanan kata sandi Anda
                        </p>
                    </div>

                    <Link
                        href="/pos"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow"
                    >
                        Ke Layar Kasir ➔
                    </Link>
                </div>
            }
        >
            <Head title="Profil Akun - Grossmart" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* 1. Informasi Profil */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-slate-200 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>

                    {/* 2. Ganti Kata Sandi */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-slate-200 shadow-sm">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>

                    {/* 3. Zona Berbahaya: Hapus Akun */}
                    <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border-3 border-rose-200 shadow-sm">
                        <DeleteUserForm className="max-w-2xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
