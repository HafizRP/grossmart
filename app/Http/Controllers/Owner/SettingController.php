<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Tampilkan Halaman Pengaturan Toko
     */
    public function index(Request $request): Response
    {
        $settings = [
            'store_name' => (string) AppSetting::get('store_name', 'Toko Kelontong Berkah Grossmart'),
            'store_address' => (string) AppSetting::get('store_address', 'Jl. Pasar Tradisional No. 18'),
            'store_phone' => (string) AppSetting::get('store_phone', '081234567890'),
            'receipt_footer' => (string) AppSetting::get('receipt_footer', 'Terima kasih telah berbelanja di Grossmart!'),
            'cash_rounding' => AppSetting::get('cash_rounding_unit', '100') !== '0',
            'idle_timeout_minutes' => (int) AppSetting::get('cashier_idle_timeout_minutes', 45),
        ];

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'is_owner' => $request->user()->isOwner(),
        ]);
    }

    /**
     * Simpan Perubahan Pengaturan Toko
     */
    public function update(Request $request)
    {
        $request->validate([
            'store_name' => 'required|string|max:100',
            'store_address' => 'required|string|max:255',
            'store_phone' => 'required|string|max:30',
            'receipt_footer' => 'required|string|max:255',
            'cash_rounding' => 'nullable|boolean',
            'idle_timeout_minutes' => 'required|integer|min:5|max:240',
        ]);

        $user = $request->user();

        AppSetting::set('store_name', $request->store_name);
        AppSetting::set('store_address', $request->store_address);
        AppSetting::set('store_phone', $request->store_phone);
        AppSetting::set('receipt_footer', $request->receipt_footer);
        AppSetting::set('cash_rounding_unit', $request->boolean('cash_rounding') ? '100' : '0');
        AppSetting::set('cashier_idle_timeout_minutes', (string) $request->idle_timeout_minutes);

        AuditLog::log('UPDATE', 'AppSetting', null, null, $request->all());

        return redirect()->back()->with('success', 'Pengaturan toko berhasil diperbarui.');
    }
}
