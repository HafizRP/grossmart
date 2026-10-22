<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Sale;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    /**
     * Unduh File Cadangan Database SQLite Toko
     */
    public function downloadDatabase(Request $request)
    {
        $dbPath = database_path('database.sqlite');

        if (! file_exists($dbPath)) {
            return redirect()->back()->withErrors(['message' => 'Berkas database SQLite tidak ditemukan pada peladen.']);
        }

        AuditLog::log('BACKUP', 'Database', null, null, [
            'action' => 'download_sqlite',
            'user' => $request->user()->name,
        ]);

        $fileName = 'grossmart_backup_'.now()->format('Y-m-d_His').'.sqlite';

        return response()->download($dbPath, $fileName, [
            'Content-Type' => 'application/x-sqlite3',
        ]);
    }

    /**
     * Ekspor Data Transaksi Penjualan ke Format CSV
     */
    public function exportSalesCsv(Request $request): StreamedResponse
    {
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $sales = Sale::with(['cashier', 'customer', 'payments'])
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'COMPLETED')
            ->orderBy('id', 'desc')
            ->get();

        $fileName = 'penjualan_grossmart_'.$startDate.'_sd_'.$endDate.'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($sales) {
            $handle = fopen('php://output', 'w');
            // Menulis BOM UTF-8 agar Excel membuka teks dan simbol dengan sempurna
            fwrite($handle, "\xEF\xBB\xBF");

            // Header kolom CSV
            fputcsv($handle, [
                'No. Nota / Faktur',
                'Tanggal & Waktu',
                'Nama Kasir',
                'Pelanggan',
                'Subtotal (Rp)',
                'Diskon (Rp)',
                'Total Bersih (Rp)',
                'Harga Pokok HPP (Rp)',
                'Laba Kotor (Rp)',
                'Metode Bayar',
                'Uang Diterima (Rp)',
                'Kembalian (Rp)',
            ]);

            foreach ($sales as $sale) {
                $payment = $sale->payments->first();
                $method = $payment ? $payment->payment_method : 'CASH';
                $profit = max(0, $sale->final_amount - $sale->total_cost_price);

                fputcsv($handle, [
                    $sale->invoice_number,
                    $sale->created_at->format('Y-m-d H:i:s'),
                    $sale->cashier ? $sale->cashier->name : 'Kasir',
                    $sale->customer ? $sale->customer->name : 'Umum',
                    $sale->subtotal,
                    $sale->discount,
                    $sale->final_amount,
                    $sale->total_cost_price,
                    $profit,
                    $method,
                    $sale->cash_received,
                    $sale->cash_change,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
