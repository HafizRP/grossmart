import React, { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { sound } from '@/Utils/sound';
import { ToastProvider } from '@/Components/UI/Toast';

export interface LoginProps {
  status?: string;
}

export default function Login({ status }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
    remember: true,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    sound.playClick();

    post('/login', {
      onFinish: () => reset('password'),
    });
  };

  const fillQuickAccount = (user: string, pass: string) => {
    sound.playClick();
    setData({
      ...data,
      username: user,
      password: pass,
    });
  };

  return (
    <ToastProvider>
      <Head title="Masuk Akun - Grossmart Toko Kelontong" />

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Logo & Judul Jumbo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-md">
              G
            </div>
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">
              GROSSMART
            </h1>
            <p className="text-base font-bold text-gray-600">
              Aplikasi Kasir & Toko Kelontong Mandiri
            </p>
          </div>

          {status && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-900 font-bold text-center">
              {status}
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Nama Pengguna (Username):"
              type="text"
              value={data.username}
              onChange={(e) => setData('username', e.target.value)}
              error={errors.username}
              placeholder="Contoh: owner atau kasir1"
              autoFocus
              autoComplete="username"
            />

            <Input
              label="Kata Sandi (Password):"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={errors.password}
              placeholder="Masukkan kata sandi..."
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="w-6 h-6 rounded-lg text-emerald-600 border-2 border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-base font-bold text-gray-700">Ingat Saya di Perangkat Ini</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="xl"
              fullWidth
              isLoading={processing}
              soundFeedback="chime"
              className="text-2xl font-black shadow-xl mt-4"
            >
              MASUK KE SISTEM
            </Button>
          </form>

          {/* Tombol Cepat Pengisian Akun (Demo Ramah Lansia) */}
          <div className="pt-4 border-t-2 border-gray-100 space-y-3">
            <span className="block text-center text-xs uppercase font-black text-gray-400 tracking-wider">
              Tombol Cepat Masuk Akun (Uji Coba Toko):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('owner', 'password')}
                className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-800 rounded-2xl border-2 border-gray-300 font-black text-sm text-center transition-colors cursor-pointer"
              >
                Isi Akun Pemilik
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount('cashier1', 'password')}
                className="p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-800 text-gray-800 rounded-2xl border-2 border-gray-300 font-black text-sm text-center transition-colors cursor-pointer"
              >
                Isi Akun Kasir 1
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
