import React from 'react';
import { sound } from '@/Utils/sound';

export type ButtonVariant = 'primary' | 'danger' | 'info' | 'warning' | 'secondary' | 'dark';
export type ButtonSize = 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  soundFeedback?: 'click' | 'beep' | 'error' | 'chime' | 'none';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Hijau Emerald Toko Berkah - Aksi positif (BAYAR, SIMPAN, BUKA KASIR)
  primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md focus:ring-emerald-500 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1',
  // Merah Tegas - Bahaya/Batal (BATAL, HAPUS, TUTUP KASIR)
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md focus:ring-rose-500 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1',
  // Biru Laut - Netral/Bantuan (CARI BARANG, PARKIR KERANJANG, CETAK)
  info: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md focus:ring-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1',
  // Kuning Emas - Perhatian khusus (DISKON, UBAH JUMLAH, TEMPO)
  warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-gray-900 shadow-md focus:ring-amber-400 font-extrabold border-b-4 border-amber-700 active:border-b-0 active:translate-y-1',
  // Abu-abu Tegas - Batal/Sekunder
  secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 shadow-sm focus:ring-gray-400 border border-gray-300 border-b-4 border-b-gray-400 active:border-b-0 active:translate-y-1',
  // Hitam/Gelap
  dark: 'bg-gray-900 hover:bg-black active:bg-gray-950 text-white shadow-md focus:ring-gray-700 border-b-4 border-black active:border-b-0 active:translate-y-1',
};

const sizeStyles: Record<ButtonSize, string> = {
  md: 'min-h-[48px] h-12 px-4 text-base font-bold rounded-xl gap-2',
  // Standar Elderly-Friendly: min-h 56px (h-14) dengan font jumbo 18-20px
  lg: 'min-h-[56px] h-14 px-6 text-lg sm:text-xl font-extrabold rounded-2xl gap-3',
  // Ukuran Raksasa (Tombol BAYAR / UANG PAS)
  xl: 'min-h-[64px] h-16 px-8 text-xl sm:text-2xl font-black rounded-2xl gap-3 tracking-wide',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  soundFeedback = 'click',
  fullWidth = false,
  icon,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (soundFeedback === 'click') sound.playClick();
    else if (soundFeedback === 'beep') sound.playBeep();
    else if (soundFeedback === 'error') sound.playError();
    else if (soundFeedback === 'chime') sound.playChime();

    if (onClick) onClick(e);
  };

  const baseClasses = 'inline-flex items-center justify-center select-none transition-all duration-75 focus:outline-none focus:ring-4 focus:ring-offset-2 touch-manipulation cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:border-b-0 disabled:translate-y-0 disabled:shadow-none';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Memproses...</span>
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
