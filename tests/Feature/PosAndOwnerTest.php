<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\CashDrop;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosAndOwnerTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $cashier;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->owner()->create([
            'username' => 'owner_test',
            'name' => 'Owner Test',
        ]);

        $this->cashier = User::factory()->create([
            'username' => 'cashier_test',
            'name' => 'Kasir Test',
            'role' => 'cashier',
        ]);

        $category = Category::create(['name' => 'Sembako']);

        $this->product = Product::create([
            'name' => 'Minyak Goreng 1L',
            'barcode' => '8991234567890',
            'category_id' => $category->id,
            'product_type' => 'REGULAR',
            'unit' => 'pouch',
            'selling_price' => 18000,
            'cost_price' => 15000,
            'current_stock' => 50,
            'min_stock_alert' => 5,
            'is_active' => true,
        ]);
    }

    public function test_shift_guard_redirects_pos_when_shift_is_not_open(): void
    {
        $response = $this->actingAs($this->cashier)->get('/pos');
        $response->assertRedirect(route('pos.shifts.open'));
    }

    public function test_cashier_can_open_shift(): void
    {
        $response = $this->actingAs($this->cashier)->post('/pos/shifts/open', [
            'starting_cash' => 200000,
            'notes' => 'Shift pagi',
        ]);

        $response->assertRedirect(route('pos.index'));
        $this->assertDatabaseHas('cashier_shifts', [
            'cashier_id' => $this->cashier->id,
            'starting_cash' => 200000,
            'status' => 'open',
        ]);
    }

    public function test_cashier_cannot_see_cost_price_in_pos(): void
    {
        CashierShift::create([
            'cashier_id' => $this->cashier->id,
            'starting_cash' => 100000,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->cashier)->get('/pos');
        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('POS/Index')
                ->missing('products.0.cost_price')
                ->where('products.0.name', 'Minyak Goreng 1L')
        );
    }

    public function test_pos_checkout_deducts_stock_and_creates_sales(): void
    {
        $shift = CashierShift::create([
            'cashier_id' => $this->cashier->id,
            'starting_cash' => 100000,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->cashier)->postJson('/pos/checkout', [
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'selling_price' => 18000,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'CASH',
                    'amount' => 36000,
                ],
            ],
            'cash_received' => 50000,
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertEquals(48, $this->product->fresh()->current_stock);

        $shift->refresh();
        $this->assertEquals(36000, $shift->total_cash_sales);

        $this->assertDatabaseHas('sales', [
            'cashier_id' => $this->cashier->id,
            'final_amount' => 36000,
            'cash_received' => 50000,
            'cash_change' => 14000,
        ]);
    }

    public function test_blind_cash_up_and_shift_close(): void
    {
        $shift = CashierShift::create([
            'cashier_id' => $this->cashier->id,
            'starting_cash' => 100000,
            'total_cash_sales' => 50000,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->cashier)->post('/pos/shifts/close', [
            'actual_cash_ending' => 150000,
            'notes' => 'Tutup shift pas',
        ]);

        $response->assertOk();
        $shift->refresh();

        $this->assertEquals('closed', $shift->status);
        $this->assertEquals(150000, $shift->expected_cash_ending);
        $this->assertEquals(150000, $shift->actual_cash_ending);
        $this->assertEquals(0, $shift->cash_difference);
    }

    public function test_cash_drop_to_owner_safe(): void
    {
        $shift = CashierShift::create([
            'cashier_id' => $this->cashier->id,
            'starting_cash' => 100000,
            'total_cash_sales' => 300000,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->cashier)->post('/pos/cash-drops', [
            'amount' => 200000,
            'received_by' => $this->owner->id,
            'notes' => 'Setor uang laci siang',
        ]);

        $response->assertRedirect(route('pos.index'));

        $shift->refresh();
        $this->assertEquals(200000, $shift->total_cash_drops);
        $this->assertDatabaseHas('cash_drops', [
            'shift_id' => $shift->id,
            'amount' => 200000,
            'received_by' => $this->owner->id,
        ]);
    }

    public function test_owner_route_forbidden_for_cashier(): void
    {
        $response = $this->actingAs($this->cashier)->get('/owner/dashboard');
        $response->assertRedirect(route('pos.index'));
    }

    public function test_owner_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->owner)->get('/owner/dashboard');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Owner/Dashboard'));
    }

    public function test_owner_can_void_transaction_and_restore_stock(): void
    {
        $shift = CashierShift::create([
            'cashier_id' => $this->cashier->id,
            'starting_cash' => 100000,
            'total_cash_sales' => 36000,
            'status' => 'open',
        ]);

        $this->product->update(['current_stock' => 48]);

        $sale = Sale::create([
            'invoice_number' => 'TRX-20261008-0001',
            'cashier_id' => $this->cashier->id,
            'shift_id' => $shift->id,
            'subtotal' => 36000,
            'grand_total' => 36000,
            'final_amount' => 36000,
            'total_cost_price' => 30000,
            'cash_received' => 36000,
            'cash_change' => 0,
            'status' => 'COMPLETED',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $this->product->id,
            'product_name_snapshot' => $this->product->name,
            'unit_snapshot' => 'pouch',
            'cost_price_snapshot' => 15000,
            'selling_price_snapshot' => 18000,
            'quantity' => 2,
            'subtotal' => 36000,
        ]);

        SalePayment::create([
            'sale_id' => $sale->id,
            'payment_method' => 'CASH',
            'amount' => 36000,
        ]);

        $response = $this->actingAs($this->owner)->post("/sales/{$sale->id}/void", [
            'reason' => 'Pelanggan salah ambil barang',
        ]);

        $response->assertRedirect();

        // Stok bertambah kembali 48 -> 50
        $this->assertEquals(50, $this->product->fresh()->current_stock);

        // Status berubah menjadi VOID
        $sale->refresh();
        $this->assertEquals('VOID', $sale->status);
        $this->assertEquals('Pelanggan salah ambil barang', $sale->void_reason);

        // Total cash voided di shift terisi
        $shift->refresh();
        $this->assertEquals(36000, $shift->total_cash_voided);
    }

    public function test_cashier_cannot_void_transaction(): void
    {
        $sale = Sale::create([
            'invoice_number' => 'TRX-20261008-0002',
            'cashier_id' => $this->cashier->id,
            'subtotal' => 18000,
            'grand_total' => 18000,
            'final_amount' => 18000,
            'total_cost_price' => 15000,
            'status' => 'COMPLETED',
        ]);

        $response = $this->actingAs($this->cashier)->post("/sales/{$sale->id}/void", [
            'reason' => 'Salah barang',
        ]);

        $response->assertRedirect(route('pos.index'));
        $this->assertEquals('COMPLETED', $sale->fresh()->status);
    }

    public function test_owner_can_update_store_settings(): void
    {
        $response = $this->actingAs($this->owner)->post('/owner/settings', [
            'store_name' => 'Toko Kelontong Berkah Baru',
            'store_address' => 'Jl. Mawar No. 10',
            'store_phone' => '081987654321',
            'receipt_footer' => 'Terima kasih atas kunjungan Anda!',
            'cash_rounding' => true,
            'idle_timeout_minutes' => 60,
        ]);

        $response->assertRedirect();
        $this->assertEquals('Toko Kelontong Berkah Baru', AppSetting::get('store_name'));
        $this->assertEquals('081987654321', AppSetting::get('store_phone'));
        $this->assertEquals('60', AppSetting::get('cashier_idle_timeout_minutes'));
    }
}
