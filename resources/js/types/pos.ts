/**
 * Definisi Tipe TypeScript untuk Sistem POS Grossmart
 * 100% Sesuai Spesifikasi PLAN.md
 */

export interface Product {
  id: number;
  sku?: string | null;
  barcode?: string | null;
  name: string;
  category_id?: number | null;
  category_name?: string | null;
  unit: string;
  selling_price: number;
  current_stock: number;
  min_stock_alert: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  image_url?: string | null;
  is_consignment?: boolean;
  is_active: boolean;
}

export interface CartItem {
  cart_id: string;
  product_id: number;
  name: string;
  barcode?: string | null;
  unit: string;
  unit_price: number;
  regular_price: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  is_wholesale_applied: boolean;
  quantity: number;
  discount_amount: number; // Diskon manual per baris
  subtotal: number;
  current_stock: number;
  notes?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string | null;
  current_receivable: number;
  max_receivable_limit: number;
  points: number;
}

export interface HeldCart {
  id: string;
  note: string;
  held_at: string;
  items: CartItem[];
  total_items: number;
  grand_total: number;
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'RECEIVABLE' | 'SPLIT';

export interface PaymentData {
  payment_method: PaymentMethod;
  cash_amount: number;
  transfer_amount: number;
  receivable_amount: number;
  receivable_due_date?: string;
  points_redeemed?: number;
  points_discount_value?: number;
  rounding_amount: number;
  cash_given: number;
  change_due: number;
  customer_id?: number | null;
  customer_name?: string;
  transfer_bank_name?: string;
  transfer_reference_number?: string;
}

export interface ReceiptData {
  invoice_number: string;
  transaction_date: string;
  cashier_name: string;
  customer_name?: string;
  customer_phone?: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  receipt_footer_text: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_amount: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount_total: number;
  points_discount: number;
  rounding_amount: number;
  grand_total: number;
  payment_method: PaymentMethod;
  cash_paid: number;
  transfer_paid: number;
  receivable_paid: number;
  change_returned: number;
  earned_points?: number;
  new_customer_receivable_balance?: number;
}
