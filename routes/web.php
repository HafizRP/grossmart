<?php

use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\ProductController;
use App\Http\Controllers\Owner\ReportController;
use App\Http\Controllers\Owner\SettingController;
use App\Http\Controllers\Owner\StockConversionController;
use App\Http\Controllers\Pos\CashDropController;
use App\Http\Controllers\Pos\CashierShiftController;
use App\Http\Controllers\Pos\HeldCartController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Pos\SaleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root landing page: redirect ke modul sesuai role jika login, atau tampilkan Welcome/Login jika guest
Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->isOwner()) {
            return redirect()->route('owner.dashboard');
        }
        return redirect()->route('pos.index');
    }
    return Inertia::render('Welcome', [
        'canLogin' => true,
        'canRegister' => true,
    ]);
});

// Struk Cetak / E-Receipt Publik
Route::get('/receipt/{invoice}', [PosController::class, 'receipt'])->name('receipt.show');

// Modul Kasir (POS)
Route::middleware(['auth'])->group(function () {
    // Alur buka shift (tidak dicegat oleh ShiftGuard)
    Route::get('/pos/shifts/open', [CashierShiftController::class, 'openForm'])->name('pos.shifts.open');
    Route::post('/pos/shifts/open', [CashierShiftController::class, 'open'])->name('pos.shifts.store');

    // Riwayat Penjualan / Nota
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::post('/sales/{id}/void', [SaleController::class, 'void'])->name('sales.void')->middleware('role:owner');

    // Menu POS diproteksi ShiftGuard (harus sudah buka shift)
    Route::middleware(['shift.open'])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

        // Tutup shift kasir (Blind cash-up)
        Route::get('/pos/shifts/close', [CashierShiftController::class, 'closeForm'])->name('pos.shifts.close');
        Route::post('/pos/shifts/close', [CashierShiftController::class, 'close'])->name('pos.shifts.close.store');

        // Setor uang laci ke brankas (Cash drop)
        Route::get('/pos/cash-drops/create', [CashDropController::class, 'create'])->name('pos.cash-drops.create');
        Route::post('/pos/cash-drops', [CashDropController::class, 'store'])->name('pos.cash-drops.store');

        // Parkir keranjang belanja (Held cart F3)
        Route::get('/pos/held-carts', [HeldCartController::class, 'index'])->name('pos.held-carts.index');
        Route::post('/pos/held-carts', [HeldCartController::class, 'store'])->name('pos.held-carts.store');
        Route::delete('/pos/held-carts/{id}', [HeldCartController::class, 'destroy'])->name('pos.held-carts.destroy');
    });
});

// Modul Khusus Pemilik Toko (Owner Only)
Route::middleware(['auth', 'role:owner'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // CRUD Produk & Tempat Sampah
    Route::get('/products/recycle-bin', [ProductController::class, 'recycleBin'])->name('products.recycle-bin');
    Route::post('/products/{id}/restore', [ProductController::class, 'restore'])->name('products.restore');
    Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);

    // Pecah Satuan Dus ke Pcs
    Route::get('/conversions', [StockConversionController::class, 'index'])->name('conversions.index');
    Route::post('/conversions', [StockConversionController::class, 'store'])->name('conversions.store');

    // Laporan Finansial
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('/reports/profit-loss', [ReportController::class, 'profitLoss'])->name('reports.profit-loss');
    Route::get('/reports/cash-flow', [ReportController::class, 'cashFlow'])->name('reports.cash-flow');

    // Pengaturan Toko
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
});

// Profil Pengguna & Universal Dashboard Redirect
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        if (auth()->user()->isOwner()) {
            return redirect()->route('owner.dashboard');
        }
        return redirect()->route('pos.index');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
