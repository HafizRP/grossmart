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
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
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
    <div className="flex flex-col h-full space-y-3">
      {/* Kolom Pencarian & Tombol Kamera HP */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang / ketik barcode..."
            className="
              w-full min-h-[54px] pl-12 pr-10 py-3 text-lg font-bold text-gray-900 bg-white
              border-2 border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100
              placeholder-gray-400 touch-manipulation
            "
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSearchQuery('');
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700"
              aria-label="Bersihkan pencarian"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tombol Kamera Barcode Scanner untuk HP */}
        {onOpenScanner && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenScanner();
            }}
            className="
              min-h-[54px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
              text-white flex items-center justify-center gap-2 shadow-md focus:ring-4 focus:ring-emerald-300
              touch-manipulation border-b-4 border-emerald-800 cursor-pointer
            "
            title="Scan Barcode via Kamera HP"
            aria-label="Scan Barcode Kamera"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline text-base font-extrabold">Scan Kamera</span>
          </button>
        )}
      </div>

      {/* Tab Kategori Cepat */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none touch-manipulation">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setSelectedCategory(null);
          }}
          className={`
            px-4 py-2.5 rounded-xl font-black text-base whitespace-nowrap border-2 transition-all cursor-pointer
            ${selectedCategory === null
              ? 'bg-emerald-700 text-white border-emerald-800 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }
          `}
        >
          Semua Barang
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat.id);
            }}
            className={`
              px-4 py-2.5 rounded-xl font-black text-base whitespace-nowrap border-2 transition-all cursor-pointer
              ${selectedCategory === cat.id
                ? 'bg-emerald-700 text-white border-emerald-800 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid Kartu Produk Jumbo */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl font-black text-gray-700">Barang tidak ditemukan</p>
            <p className="text-base font-bold text-gray-500 mt-1">Coba kata kunci lain atau pilih Semua Barang</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.current_stock <= 0;
              const isLowStock = p.current_stock > 0 && p.current_stock <= p.min_stock_alert;

              return (
                <div
                  key={p.id}
                  onClick={() => handleCardClick(p)}
                  className={`
                    relative flex flex-col justify-between p-3.5 sm:p-4 rounded-3xl border-3 bg-white
                    shadow-sm hover:shadow-md transition-all duration-75 select-none touch-manipulation
                    ${isOutOfStock
                      ? 'border-gray-200 opacity-60 cursor-not-allowed bg-gray-100'
                      : 'border-gray-200 hover:border-emerald-500 active:scale-[0.98] cursor-pointer'
                    }
                  `}
                >
                  <div>
                    {/* Badge Sisa Stok */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`
                          px-2.5 py-0.5 rounded-lg text-xs sm:text-sm font-black tracking-wide
                          ${isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                          }
                        `}
                      >
                        {isOutOfStock ? 'STOK HABIS' : `Stok: ${p.current_stock} ${p.unit}`}
                      </span>

                      {p.wholesale_price && p.wholesale_min_qty && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-blue-100 text-blue-800" title={`Grosir min ${p.wholesale_min_qty}: ${formatRupiah(p.wholesale_price)}`}>
                          GROSIR
                        </span>
                      )}
                    </div>

                    {/* Nama Barang Font Tebal */}
                    <h4 className="text-base sm:text-lg font-black text-gray-900 leading-snug line-clamp-2 min-h-[44px]">
                      {p.name}
                    </h4>

                    {/* Info Grosir */}
                    {p.wholesale_price && p.wholesale_min_qty && (
                      <p className="text-xs sm:text-sm font-bold text-blue-700 mt-1">
                        Beli ≥ {p.wholesale_min_qty}: {formatRupiah(p.wholesale_price)}
                      </p>
                    )}
                  </div>

                  {/* Bagian Bawah: Harga Jumbo & Tombol Tambah */}
                  <div className="mt-3 pt-2 border-t-2 border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-lg sm:text-xl font-black text-emerald-700 block">
                        {formatRupiah(p.selling_price)}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        per {p.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(p);
                      }}
                      className="
                        min-h-[44px] h-11 w-11 sm:w-auto sm:px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                        text-white font-black text-lg flex items-center justify-center gap-1 shadow
                        disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation cursor-pointer
                      "
                      aria-label={`Tambah ${p.name}`}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline text-sm font-extrabold">Beli</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
