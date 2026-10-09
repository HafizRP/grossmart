import React from 'react';
import { sound } from '@/Utils/sound';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  badge?: number | string;
  icon: React.ReactNode;
}

export interface BottomNavBarProps {
  items: NavItem[];
  onSelect?: (id: string, href: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items,
  onSelect,
}) => {
  return (
    <nav
      aria-label="Navigasi Utama Ponsel"
      className="
        fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200
        shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden
        safe-area-bottom pb-safe
      "
    >
      <div className="grid grid-flow-col auto-cols-fr h-18 min-h-[72px] items-center px-2">
        {items.map((item) => {
          const isActive = !!item.active;

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                sound.playClick();
                if (onSelect) {
                  e.preventDefault();
                  onSelect(item.id, item.href);
                }
              }}
              className={`
                relative flex flex-col items-center justify-center py-1 px-1 rounded-2xl
                transition-all duration-100 touch-manipulation cursor-pointer select-none
                ${isActive
                  ? 'text-emerald-700 font-black'
                  : 'text-gray-600 hover:text-gray-900 font-bold'
                }
              `}
            >
              {/* Indikator Aktif Atas */}
              {isActive && (
                <span className="absolute top-0 w-10 h-1.5 bg-emerald-600 rounded-full" />
              )}

              {/* Ikon dengan Container Sentuh */}
              <div className="relative mt-1">
                <div
                  className={`
                    p-1.5 rounded-xl transition-colors
                    ${isActive ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600'}
                  `}
                >
                  {item.icon}
                </div>

                {/* Badge Notifikasi */}
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 min-w-[20px] text-xs font-black bg-rose-600 text-white rounded-full text-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label Jumbo Ramah Warung */}
              <span className="text-xs sm:text-sm tracking-tight truncate max-w-full mt-0.5">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
