import React, { useState, useMemo } from 'react';
import { Product } from '@/types/pos';
import { formatRupiah } from '@/Utils/format';
import { sound } from '@/Utils/sound';

export interface Category {
  id: number;
  name: string;
}

export interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  onOpenScanner?: () => void;
}

// Icon emoji pintar per nama kategori
function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('sembako') || n.includes('beras') || n.includes('minyak')) return '🌾';
  if (n.includes('minum') || n.includes('es') || n.includes('kopi')) return '🧃';
  if (n.includes('snack') || n.includes('jajan') || n.includes('biskuit')) return '🍪';
  if (n.includes('sabun') || n.includes('pembersih') || n.includes('deterjen')) return '🧼';
  if (n.includes('rokok')) return '🚬';
  if (n.includes('bumbu') || n.includes('dapur')) return '🧂';
  if (n.includes('obat') || n.includes('kesehatan')) return '💊';
  return '📦';
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  onAddToCart,
  onOpenScanner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active) return false;
      if (selectedCategory !== null && p.category_id !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = p.name ? p.name.toLowerCase().includes(query) : false;
        const matchSku = p.sku ? p.sku.toLowerCase().includes(query) : false;
        const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(query) : false;
        return matchName || matchSku || matchBarcode;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCardClick = (product: Product) => {
    if (product.current_stock <= 0) {
      sound.playError();
      return;
    }
    sound.playBeep();
    onAddToCart(product);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full min-h-0 gap-2.5 sm:gap-3 overflow-hidden">
      {/* ============================================================== */}
      {/* 1. SIDEBAR KATEGORI VERTIKAL (DESKTOP/TABLET) & PILL (MOBILE)   */}
      {/* ============================================================== */}
      <div className="md:w-36 lg:w-40 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar pb-1 md:pb-0">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setSelectedCategory(null);
          }}
          className={`min-h-[50px] md:min-h-[64px] px-3 py-2 rounded-2xl font-black text-xs md:text-sm transition-all border-2 flex items-center md:flex-col md:justify-center gap-1.5 md:gap-1 text-center shrink-0 md:w-full cursor-pointer select-none active:scale-95 ${
            selectedCategory === null
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-300'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className="text-lg md:text-2xl">⚡</span>
          <span className="truncate">Semua ({products.length})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`min-h-[50px] md:min-h-[64px] px-3 py-2 rounded-2xl font-black text-xs md:text-sm transition-all border-2 flex items-center md:flex-col md:justify-center gap-1.5 md:gap-1 text-center shrink-0 md:w-full cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-300'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg md:text-2xl">{getCategoryIcon(cat.name)}</span>
              <span className="truncate max-w-[100px] md:max-w-none">{cat.name}</span>
              <span className="hidden md:inline text-[10px] font-bold opacity-75">
                {count} item
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. GRID PRODUK DENGAN SMART SEARCH DI ATAS                    */}
      {/* ============================================================== */}
      <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
        {/* Search Bar Ramping & Scanner Barcode */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari barang / scan barcode..."
              className="w-full min-h-[48px] pl-11 pr-9 py-2.5 text-base font-bold text-white bg-slate-900 border-2 border-slate-800 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-500 touch-manipulation"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSearchQuery('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                aria-label="Bersihkan pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {onOpenScanner && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenScanner();
              }}
              className="min-h-[48px] px-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-emerald-400 font-black rounded-2xl flex items-center gap-1.5 border border-slate-800 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="Gunakan kamera perangkat untuk memindai barcode"
            >
              <span className="text-lg">📷</span>
              <span className="text-xs font-black hidden sm:inline">Scan</span>
            </button>
          )}
        </div>

        {/* Area Scrollable Grid Produk (Murni scrolling di dalam container ini) */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-dashed border-slate-800">
              <span className="text-3xl mb-1">🔍</span>
              <p className="text-base font-black text-slate-300">Barang Tidak Ditemukan</p>
              <p className="text-xs text-slate-500 mt-0.5">Periksa kata kunci atau ganti pilihan kategori di samping</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-2.5 pb-2">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.current_stock <= 0;
                const isLowStock = p.current_stock > 0 && p.current_stock <= 5;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleCardClick(p)}
                    disabled={isOutOfStock}
                    className={`
                      p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[110px] sm:min-h-[120px] select-none
                      ${
                        isOutOfStock
                          ? 'bg-slate-950/60 border-slate-900 opacity-50 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800/90 active:scale-[0.97] border-slate-800 hover:border-emerald-500 shadow-md cursor-pointer'
                      }
                    `}
                  >
                    <div>
                      {/* Badge Sisa Stok */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {p.unit}
                        </span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : isLowStock
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `${p.current_stock}`}
                        </span>
                      </div>

                      {/* Nama Produk */}
                      <h4 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                        {p.name}
                      </h4>
                    </div>

                    {/* Harga Jual Font Tebal Kontras */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-baseline justify-between">
                      <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">
                        {formatRupiah(p.selling_price)}
                      </span>
                      {p.wholesale_price && (
                        <span className="text-[9px] font-bold text-purple-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800">
                          Grosir
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
