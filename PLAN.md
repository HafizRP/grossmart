# Dokumen Rencana Implementasi Lengkap: Grossmart (Aplikasi Web & PWA Toko Kelontong)

> **File:** `PLAN.md`  
> **Status:** FINAL ARCHITECTURE & EXECUTION BLUEPRINT (Production-Grade, PWA Ready, Elderly-Friendly, Enterprise Security)  
> **Peran:** Senior Project Manager & System Architect  
> **Target:** Toko Kelontong Mandiri (Satu Toko Fisik, Multi-Kasir Paralel, LAN / Hosting cPanel / VPS)  
> **Fokus Utama:** 100% Bahasa Indonesia, Kemudahan Pengoperasian untuk Orang Tua / Pengguna Gaptek, Responsif & PWA di HP / Tablet / PC Kasir, Keamanan Finansial & Data Teruji.  
> **Tech Stack:** Laravel 11 (PHP 8.2+), MySQL/MariaDB (InnoDB), Inertia.js, React 18/19 (TypeScript), Tailwind CSS, Lucide React, Workbox PWA.

---

## 1. Ikhtisar Eksekutif & Sasaran Produk

Grossmart dibangun untuk memenuhi kebutuhan operasional toko kelontong di Indonesia dengan menyatukan **kecepatan operasional ritel modern**, **kemudahan adaptasi bagi pemilik toko / kasir lansia**, **kemudahan instalasi PWA tanpa ribet**, dan **standar keamanan data yang ketat**:

1. **100% Berbahasa Indonesia Ramah Warung:** Seluruh antarmuka, tombol, label, pesan error, notifikasi, dialog konfirmasi, laporan, dan struk cetak menggunakan Bahasa Indonesia sehari-hari yang mudah dipahami orang tua tanpa istilah teknis asing yang membingungkan.
2. **Aplikasi Web Progresif (PWA - Progressive Web App):** Dapat dipasang (*install*) langsung di layar beranda HP Android/iPhone, Tablet, maupun Desktop Windows kasir seperti aplikasi native. Berjalan dalam mode *Standalone Full-Screen* tanpa address bar browser, dilengkapi ikon aplikasi toko kelontong, dan memiliki *Service Worker Offline Caching* agar aplikasi tetap menyala stabil saat koneksi Wi-Fi toko terputus sejenak.
3. **Desain UI/UX Ramah Orang Tua (Elderly-Friendly Design):** Tipografi jumbo (`text-base` s.d. `text-4xl`), kontras tinggi (WCAG AAA), tombol-tombol sentuh berukuran raksasa (`h-14` / `min-h-[56px]`), tombol cepat uang pas dan lembaran pecahan rupiah (Rp 10rb, 20rb, 50rb, 100rb), dialog konfirmasi aman anti-salah pencet, serta efek suara audio (*beep* barcode, *buzz* error, *chime* lunas).
4. **Responsif di Berbagai Perangkat (Multi-Device Responsive):** Tata letak adaptif otomatis untuk Layar HP (360px - 480px, navigasi jempol bawah & bilah keranjang melayang), Tablet Kasir (768px - 1024px, split 60:40 lanskap), dan PC Desktop/POS Touchscreen (1366px+, dual-panel lebar dengan shortcut keyboard ritel). Dilengkapi pemindai barcode kamera HP (*HTML5 Camera Scanner*) untuk mengecek harga/stok sambil berkeliling rak toko.
5. **Keamanan Finansial & Pencegahan Kecurangan (Security & Anti-Fraud):**
   - **Tutup Kasir Buta (Blind Cash-Up):** Sistem merahasiakan angka kas seharusnya sampai kasir selesai menghitung fisik uang laci.
   - **Setor Kas Laci ke Brankas (Cash Drop):** Menyetor uang tunai ke brankas di tengah shift agar uang di laci tidak menumpuk rawan perampokan.
   - **Proteksi HPP Modal Server-Side:** Harga modal disembunyikan permanen dari akun kasir di level database/model.
   - **Pencegahan Serangan OWASP:** Rate limiting login, proteksi SQL Injection, XSS, CSRF, IDOR, dan sanitasi injeksi formula Excel.
6. **Operasional Ritel Lengkap:** Barcode scanner fisik, cetak struk thermal (58mm/80mm), kirim struk WhatsApp, parkir keranjang belanja (`F3`), pembayaran kombinasi (*split payment*), harga grosir bertingkat, pembulatan kembalian (*cash rounding*), timbangan barcode buah/telur (`EAN-13`), manajemen barang titipan warga (*konsinyasi*), konversi dus ke eceran (*repack*), pencatatan barang rusak/basi (*spoilage*), paket sembako hemat (*bundling*), daftar kulakan otomatis (*smart re-order*), dan backup database otomatis terjadwal.

---

## 2. Standar Desain UI/UX Ramah Orang Tua, Responsif Multi-Device & PWA

### 2.1. Skala Tipografi Jumbo & Kontras Tinggi (WCAG AAA)
- **Ukuran Teks Dasar:** Minimal `16px` (`text-base`) untuk teks biasa, `18px` - `20px` (`text-lg`/`text-xl`) untuk nama barang dan navigasi.
- **Teks Finansial & Total Belanja:** Ukuran raksasa `32px` - `44px` (`text-3xl` / `text-4xl`, `font-extrabold`) berwarna kontras tinggi (Hijau Emerald `#047857` di atas latar putih) agar terbaca jelas dari jarak 1 meter tanpa kacamata.
- **Ketebalan Huruf:** Minimal `font-medium` (500) dan `font-bold` (700). Tidak ada teks tipis (*thin font*).
- **Kontras Tegas:** Teks gelap pekat (`#111827`) di atas latar putih (`#FFFFFF`) atau abu-abu terang (`#F3F4F6`). Dilarang keras memakai teks abu-abu pudar yang menyiksa mata orang tua.

### 2.2. Tombol Raksasa & Target Sentuh Lebar (Anti-Salah Pencet / Fat-Finger Prevention)
- **Tinggi Tombol Minimum:** Minimal `52px` - `60px` (`h-14` di Tailwind) dengan padding horizontal lega `px-6 py-4`.
- **Jarak Antar Tombol (Spacing):** Spasi antar tombol minimal `16px` (`gap-4`) untuk mencegah salah pencet tombol tetangga.
- **Kode Warna Visual Intuitif:**
  - **Hijau Emerald (`bg-emerald-600`):** Tombol aksi positif utama (BAYAR, SIMPAN, BUKA KASIR, KONFIRMASI).
  - **Merah Tegas (`bg-rose-600`):** Tombol bahaya/pembatalan (BATAL, HAPUS, TUTUP KASIR).
  - **Biru Laut (`bg-blue-600`):** Tombol netral/bantuan (CARI BARANG, PARKIR KERANJANG, CETAK ULANG).
  - **Kuning Emas (`bg-amber-500`):** Tombol perhatian khusus (DISKON, UBAH JUMLAH, CATAT TEMPO).

### 2.3. Tombol Cepat Uang Pas & Lembaran Pecahan Rupiah
Orang tua sering lambat mengetik nominal angka di keyboard. Di modal pembayaran kasir, disediakan tombol-tombol cepat:
- Tombol raksasa **[UANG PAS]** (Otomatis mengisi nominal sama persis dengan total belanja).
- Tombol lembaran rupiah instan:
  - **[Rp 10.000]** | **[Rp 20.000]** | **[Rp 50.000]**
  - **[Rp 100.000]** | **[Rp 200.000]** | **[Rp 500.000]**
- Tombol tambah cepat: **[+10.000]**, **[+20.000]**, **[+50.000]**, **[+100.000]**.
- Kasir cukup klik 1 tombol lembaran Rp 100.000, kembalian langsung dihitung otomatis dengan angka font raksasa.

### 2.4. Glosarium 100% Bahasa Indonesia Warung / Toko Kelontong
Seluruh antarmuka menggunakan istilah ramah yang dipahami orang awam Indonesia:

| Istilah Teknis Asing | Istilah Resmi di Aplikasi Grossmart |
| :--- | :--- |
| *POS / Point of Sale* | **Halaman Kasir (Penjualan)** |
| *Void Transaction* | **Batalkan Nota Belanja** |
| *Stock Opname* | **Cek / Cocokkan Stok Fisik Barang** |
| *Hold Cart / Suspend* | **Parkir Keranjang (Tunda Belanjaan)** |
| *Purchase Order (PO)* | **Faktur Kulakan (Barang Masuk dari Agen)** |
| *Consignment Settlement*| **Bagi Hasil Titipan Warga** |
| *Petty Cash Expense* | **Catat Pengeluaran Uang Toko** |
| *Cash Drop* | **Setor Kas Laci ke Brankas** |
| *Customer Receivable* | **Buku Catatan Bon / Utang Pembeli** |
| *Supplier Payable* | **Catatan Utang ke Agen / Pemasok** |
| *Denomination Calculator*| **Kalkulator Hitung Uang Lembar & Koin** |
| *Damage / Spoilage* | **Catat Barang Rusak / Pecah / Basi** |
| *Recycle Bin / Soft Delete*| **Tempat Sampah (Pulihkan Data Terhapus)**|

### 2.5. Umpan Balik Suara & Audio (Audio Feedback)
Untuk membantu kasir orang tua tanpa harus memelototi layar monitor terus-menerus:
- **Suara "Beep" Ringan:** Saat barcode barang berhasil di-scan dan masuk keranjang.
- **Suara "Buzz / Tetot" Rendah:** Saat scan gagal, barang tidak terdaftar, atau stok habis.
- **Suara "Chime / Kring Kassa":** Saat pembayaran berhasil dan transaksi selesai.
*(Volume dapat diatur atau dinonaktifkan di Pengaturan).*

### 2.6. Dialog Konfirmasi Aman & Bebas Gerakan Memusingkan
- Tidak ada animasi transisi berputar/meluncur cepat (*no disorienting animations*) yang membuat orang tua pusing.
- Dialog konfirmasi aksi penting (hapus barang, batalkan nota, tutup shift) menampilkan peringatan jelas dengan ikon besar, ringkasan apa yang akan terjadi, dan tombol konfirmasi yang tidak berhimpitan.

### 2.7. Spesifikasi Responsivitas Multi-Perangkat (HP, Tablet, PC Desktop, Touchscreen POS)
Aplikasi dibangun dengan Tailwind CSS mobile-first, beradaptasi mulus di 3 kelas perangkat utama:

1. **Ponsel Pintar / Smartphone (Layar Sempit 360px - 480px) — HP Pemilik & Kasir Mobile:**
   - **Tata Letak Vertikal Tunggal:** Komponen tersusun 1 kolom vertikal tanpa scroll horizontal (*zero horizontal scroll*).
   - **Navigasi Bawah Ramah Jempol (Thumb-Zone Bottom Bar):** Menu navigasi utama berada di bawah layar (Kasir, Riwayat Nota, Laporan Hari Ini, Menu/Akun) agar mudah dijangkau satu tangan.
   - **Bilah Keranjang Melayang (Sticky Bottom Bar Cart):** Pada layar kasir HP, keranjang belanja diringkas menjadi bilah melayang di bawah layar dengan badge jumlah barang dan grand total font tebal. Mengetuk bilah ini meluncurkan laci penuh (*Bottom Sheet Drawer*) untuk pembayaran.
   - **Scanner Barcode via Kamera HP:** Tombol ikon kamera di samping kolom pencarian mengaktifkan kamera belakang HP (*HTML5 WebCam Barcode Scanner*) agar pemilik toko dapat mengecek harga/stok saat berjalan di lorong rak tanpa perlu alat scanner fisik.

2. **Tablet / iPad (Layar Sedang 768px - 1024px) — Kasir Meja Kompak:**
   - **Mode Lanskap (Landscape):** Tata letak split 60:40 (Kiri: Grid produk kartu sentuh besar 3 kolom, Kanan: Keranjang belanja sticky tinggi penuh layar).
   - **Mode Potret (Portrait):** Tab switcher cepat antara `[Katalog Produk]` dan `[Keranjang Belanja (N)]` dengan indikator badge total harga di tab keranjang.
   - **Target Sentuh Dioptimalkan:** Tombol aksi berukuran minimal `56px` (`h-14`) dengan jarak sentuh lega, bebas ketergantungan pada *hover* kursor mouse.

3. **PC Kasir Desktop / Laptop / Layar Sentuh All-in-One (Layar Lebar 1366px - 1920px+):**
   - **Tampilan Kasir Widescreen (Split-Screen Dual Panel):**
     - Panel Kiri (65%): Kolom input barcode dengan autofocus permanen, Tab Kategori cepat, dan Grid Produk Cepat (4-5 kolom).
     - Panel Kanan (35%): Tabel keranjang belanja tinggi penuh layar (*full-height sticky*), ringkasan harga font raksasa, dan tombol shortcut kasir.
   - **Sidebar Menu Diciutkan (Collapsible Sidebar):** Sidebar navigasi otomatis menciut menjadi ikon saja (*icon-only mode*) saat masuk ke halaman kasir agar area kerja penjualan maksimal.
   - **Navigasi Keyboard 100%:** Seluruh fungsi POS dikendalikan via keyboard ritel (`F1`-`F8`, `Enter`, `Esc`).

4. **Pencegahan Kendala Layar Sentuh Mobile:**
   - Konfigurasi `viewport` dengan `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no` pada halaman POS kasir untuk mencegah pembesaran layar tidak sengaja saat kasir mengetuk cepat.
   - Ukuran font input form minimal `16px` untuk mencegah auto-zoom browser iOS Safari / Android Chrome saat kursor fokus.
   - Mengaktifkan utilitas CSS `touch-action: manipulation` untuk menghilangkan delay sentuh 300ms pada layar sentuh.

### 2.8. Spesifikasi Progressive Web App (PWA)
Aplikasi dikonfigurasi penuh sebagai PWA menggunakan Workbox & Web App Manifest:
- **File Manifest (`public/manifest.json`):**
  - `name`: "Grossmart - Kasir & Toko Kelontong"
  - `short_name`: "Grossmart"
  - `start_url`: "/pos"
  - `display`: "standalone" (Berjalan penuh tanpa URL bar browser)
  - `background_color`: "#FFFFFF"
  - `theme_color`: "#059669" (Hijau Emerald Toko Berkah)
  - `icons`: Kumpulan ikon resolusi 192x192, 512x512, dan maskable icon untuk Android/iOS/Windows.
- **Service Worker & Cache Cerdas (`public/sw.js` / Workbox):**
  - **Pre-caching Asset Statis:** Script JS, bundle CSS, font, logo, suara audio (beep/chime), dan shell aplikasi di-cache di `CacheStorage`.
  - **Resiliensi Wi-Fi Terputus:** Jika Wi-Fi toko putus sejenak, layar tidak memunculkan error dinosaurus browser. Tampilan UI tetap utuh dan menampilkan banner kuning ramah: *"Koneksi terputus sejenak. Menyambungkan kembali..."*.
- **Tombol Pasang Aplikasi Cepat (Install Prompt):**
  - Banner atau tombol di pojok layar: `[Pasang Aplikasi di HP / Komputer Ini]`. Mengetuk tombol langsung memasang shortcut Grossmart di desktop/homescreen.

---

## 3. Arsitektur Keamanan & Pencegahan Kecurangan (Security & Anti-Fraud Architecture)

Sistem dirancang dengan prinsip **Defense-in-Depth** untuk melindungi data toko dari kebocoran finansial, manipulasi kasir, dan serangan siber:

### 3.1. Autentikasi & Manajemen Sesi yang Diperketat
1. **Hashing Password Kuat:** Menggunakan algoritma `bcrypt` (work factor 12) atau `Argon2id`.
2. **Rate Limiting Login (Anti-Brute Force):**
   - Middleware `throttle:5,1` diterapkan pada rute login: maksimal 5 kali percobaan gagal per menit per IP & username. Jika terlampaui, akun dikunci sementara selama 60 detik dengan pesan peringatan berbahasa Indonesia.
3. **Pencegahan Pembajakan Sesi (Session Fixation & Hijacking):**
   - Sesi di-regenerate otomatis setiap kali pengguna berhasil login (`$request->session()->regenerate()`).
   - Cookie sesi dikonfigurasi aman: `HttpOnly = true` (tidak bisa dibaca JavaScript/XSS), `SameSite = 'lax'`, dan `Secure = true` saat berjalan di HTTPS.
4. **Batas Waktu Sesi Kasir (Idle Timeout):**
   - Kasir otomatis logout jika tidak ada interaksi selama 45 menit (dapat dikonfigurasi di Pengaturan).
5. **Larangan Sesi Paralel Ganda (Single Session per Shift):**
   - Satu akun kasir tidak boleh login di dua perangkat sekaligus saat sedang memiliki shift berstatus `open`.

### 3.2. Otorisasi Server-Side & Penyembunyian HPP Modal
1. **Enforcement di Level Server (Bukan Hanya Sembunyi di UI):**
   - Seluruh rute pemilik diproteksi middleware `role:owner`.
   - Form Requests dan Controllers memverifikasi otorisasi via Laravel Policy (`ProductPolicy`, `SalePolicy`, `ShiftPolicy`, `PurchasePolicy`).
2. **Penyembunyian HPP Modal (`cost_price` Data Leaking Prevention):**
   - Nilai HPP modal barang disembunyikan permanen dari akun kasir di level model Eloquent (`$product->makeHidden(['cost_price'])`).
   - Kasir yang memeriksa *Inspect Element / Network Tab* di browser **sama sekali tidak akan menemukan** data HPP modal barang.
3. **Pencegahan Akses Ilegal Antar Kasir (IDOR Protection):**
   - Kasir A dilarang melihat riwayat kas atau mencetak ulang nota milik Kasir B. Verifikasi kepemilikan data selalu ditegakkan: `$shift->cashier_id === auth()->id()`.

### 3.3. Pencegahan Kecurangan Kasir (Anti-Fraud & Audit Finansial)
1. **Tutup Kasir Buta (Blind Cash-Up):**
   - Saat kasir menutup shift, sistem **SENGAJA TIDAK MENAMPILKAN** angka `expected_cash_ending` terlebih dahulu!
   - Kasir wajib menghitung uang fisik secara murni dan menginputnya ke kalkulator pecahan.
   - Hanya setelah kasir menekan tombol *"Simpan & Tutup Shift"*, sistem membuka selisih kas (*difference*).
   - Hal ini menutup celah kasir "mengarang" hitungan fisik agar pas dengan sistem saat ada uang laci yang hilang.
2. **Audit Log Permanen (Immutable Audit Trail):**
   - Tabel `audit_logs` mencatat alamat IP, ID pengguna, waktu, aksi, data lama (JSON), dan data baru (JSON).
   - Log tidak memiliki tombol hapus (*immutable*) di antarmuka manapun.
3. **Pengamanan Void / Pembatalan Nota:**
   - Hanya akun Pemilik yang berhak mem-void nota.
   - Void wajib menyertakan alasan tertulis, mencatat identitas pemilik yang mem-void, dan transaksi yang berusia > 30 hari otomatis terkunci tidak bisa di-void.

### 3.4. Proteksi Terhadap Kerentanan OWASP Top 10
1. **SQL Injection:** 100% menggunakan Eloquent ORM & Query Builder dengan *parameter binding*, nol query string konkatenasi mentah.
2. **Cross-Site Scripting (XSS):** Seluruh output teks di-escape otomatis oleh React/JSX. Dilarang memakai `dangerouslySetInnerHTML`.
3. **Cross-Site Request Forgery (CSRF):** Dilindungi token CSRF otomatis di setiap request Inertia.js (`X-XSRF-TOKEN`).
4. **Sanitasi Injeksi Formula Excel (CSV/Formula Injection):** Saat mengekspor data ke Excel/CSV, karakter awalan berbahaya (`=`, `+`, `-`, `@`) disanitasi otomatis agar tidak mengeksekusi perintah berbahaya saat dibuka di Microsoft Excel.
5. **Validasi File Upload Ketat:** Foto produk divalidasi MIME type (`image/jpeg`, `image/png`, `image/webp`, maks 2MB), nama file diacak dengan UUID, dan disimpan di direktori privat non-executable.
6. **Keamanan Unduhan Backup Database:** File backup `.sql.gz` disimpan di direktori privat (`storage/app/backups/`) yang tidak dapat diakses via URL publik browser, dan pengunduhannya diverifikasi khusus peran Pemilik (`role:owner`).

---

## 4. Arsitektur Teknis & Pola Concurrency Locking

### 4.1. Arsitektur Sistem
```
[ Klien: PWA di HP Android/iOS / Tablet / PC Kasir ]
       │
       │ HTTP/HTTPS (LAN Lokal / Cloud Domain)
       ▼
[ Laravel 11 + Inertia.js Monolith ]
  ├── Middleware (SecurityHeaders, RateLimiter, RBAC, ShiftGuard)
  ├── Controllers & Form Requests (Validasi Ketat & Sanitasi)
  ├── Eloquent ORM + Database Transactions (DB::transaction)
  │    └── Row-Level Locking (lockForUpdate()) untuk Stok & Sequence
  └── Inertia.js Response Adapter -> React + TypeScript PWA Pages
       │
       │ MySQL Connection (InnoDB Engine)
       ▼
[ MySQL / MariaDB Database (grossmart) ]
```

### 4.2. Pola Penanganan Concurrency (Anti-Minus & Anti-Duplikasi Invoice)
```php
// app/Services/PosService.php
DB::transaction(function () use ($items, $cashierId, $shiftId, $salePayments, ...) {
    foreach ($items as $item) {
        // Kunci baris produk agar tidak bisa diubah transaksi kasir lain serentak
        $product = Product::where('id', $item['product_id'])->lockForUpdate()->firstOrFail();

        if ($product->current_stock < $item['quantity']) {
            throw new InsufficientStockException("Stok tidak mencukupi untuk: {$product->name}. Sisa stok: {$product->current_stock}");
        }

        $stockBefore = $product->current_stock;
        $product->decrement('current_stock', $item['quantity']);
        $stockAfter = $product->current_stock;

        StockMutation::create([
            'product_id' => $product->id,
            'type' => 'SALE',
            'quantity_change' => -$item['quantity'],
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'reference_number' => $invoiceNumber,
            'created_by' => $cashierId,
        ]);
    }
});
```

---

## 5. Skema Database & Migrasi MySQL (29 Entitas/Tabel Lengkap)

Seluruh tabel menggunakan engine **InnoDB** dengan `utf8mb4_unicode_ci` dan mendukung soft delete `deleted_at` untuk pemulihan data tempat sampah (*recycle bin*).

### 5.1. Tabel `users`
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('username')->unique();
    $table->string('password');
    $table->string('name');
    $table->enum('role', ['owner', 'cashier'])->default('cashier');
    $table->boolean('is_active')->default(true);
    $table->softDeletes();
    $table->rememberToken();
    $table->timestamps();
});
```

### 5.2. Tabel `cashier_shifts` & `cash_drops` (Setor Kas Laci ke Brankas)
```php
Schema::create('cashier_shifts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cashier_id')->constrained('users');
    $table->timestamp('start_time')->useCurrent();
    $table->timestamp('end_time')->nullable();
    $table->unsignedInteger('starting_cash')->default(0); // Modal awal laci
    $table->unsignedInteger('total_cash_sales')->default(0); // Penjualan porsi tunai
    $table->unsignedInteger('total_down_payment_cash')->default(0); // DP tunai tempo
    $table->unsignedInteger('total_transfer_sales')->default(0); // Penjualan porsi transfer
    $table->unsignedInteger('total_receivable_cash_paid')->default(0); // Setoran piutang tunai diterima kasir
    $table->unsignedInteger('total_cash_expenses')->default(0); // Pengeluaran kas kecil dari laci
    $table->unsignedInteger('total_cash_drops')->default(0); // Total uang laci disetor ke brankas pemilik di tengah shift
    $table->unsignedInteger('total_supplier_paid_from_drawer')->default(0); // Bayar utang supplier dari laci
    $table->unsignedInteger('total_cash_voided')->default(0); // Uang tunai keluar karena void nota shift aktif
    $table->unsignedInteger('expected_cash_ending')->default(0); // Saldo kas seharusnya di laci
    $table->unsignedInteger('actual_cash_ending')->nullable(); // Fisik uang dihitung saat tutup (Blind count)
    $table->integer('cash_difference')->nullable(); // actual - expected
    $table->json('denomination_details')->nullable(); // Rincian lembar & keping uang fisik
    $table->text('notes')->nullable();
    $table->enum('status', ['open', 'closed'])->default('open');
    $table->timestamps();

    $table->index(['cashier_id', 'status']);
    $table->index('start_time');
});

Schema::create('cash_drops', function (Blueprint $table) {
    $table->id();
    $table->string('drop_number')->unique(); // DRP-YYYYMMDD-XXXX
    $table->foreignId('shift_id')->constrained('cashier_shifts');
    $table->foreignId('cashier_id')->constrained('users');
    $table->unsignedInteger('amount'); // Nominal uang tunai yang diserahkan ke brankas
    $table->text('notes')->nullable();
    $table->foreignId('received_by')->constrained('users'); // Akun Pemilik yang menerima
    $table->timestamp('created_at')->useCurrent();

    $table->index('shift_id');
});
```

### 5.3. Tabel `categories`, `consignors`, & `products`
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->boolean('is_active')->default(true);
    $table->softDeletes();
    $table->timestamps();
});

Schema::create('consignors', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->boolean('is_active')->default(true);
    $table->softDeletes();
    $table->timestamps();

    $table->index('name');
});

Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('barcode')->nullable()->unique();
    $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
    $table->enum('product_type', ['REGULAR', 'CONSIGNMENT', 'BUNDLE'])->default('REGULAR');
    $table->foreignId('consignor_id')->nullable()->constrained('consignors')->nullOnDelete();
    $table->unsignedInteger('consignor_split_price')->nullable(); // Harga setor penitip
    $table->string('unit')->default('pcs'); // pcs, botol, bungkus, renceng, dus, kg
    $table->string('image_url')->nullable();
    $table->unsignedInteger('selling_price'); // Rupiah (Harga Eceran Dasar)
    $table->unsignedInteger('cost_price'); // Rupiah (HPP Rata-rata Tertimbang)
    $table->decimal('current_stock', 10, 2)->default(0);
    $table->unsignedInteger('min_stock_alert')->default(5);
    $table->date('expiry_date')->nullable();
    $table->boolean('is_active')->default(true);
    $table->softDeletes();
    $table->timestamps();

    $table->index('name');
    $table->index('barcode');
    $table->index('category_id');
    $table->index('product_type');
    $table->index('expiry_date');
});
```

### 5.4. Tabel `product_price_tiers` & `product_bundles`
```php
Schema::create('product_price_tiers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
    $table->decimal('min_quantity', 10, 2);
    $table->unsignedInteger('unit_price');
    $table->timestamps();

    $table->unique(['product_id', 'min_quantity']);
    $table->index('product_id');
});

Schema::create('product_bundles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bundle_product_id')->constrained('products')->cascadeOnDelete();
    $table->foreignId('item_product_id')->constrained('products')->cascadeOnDelete();
    $table->decimal('quantity', 10, 2)->default(1);
    $table->timestamps();

    $table->index('bundle_product_id');
});
```

### 5.5. Tabel `product_unit_conversions` (Multi-Satuan per Produk)
```php
Schema::create('product_unit_conversions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
    $table->string('unit_name'); // misal "Bungkus", "Renceng", "Dus"
    $table->decimal('multiplier', 10, 2); // Rasio terhadap satuan dasar (misal 1 Bungkus = 12 Batang)
    $table->unsignedInteger('selling_price'); // Harga jual khusus satuan ini
    $table->string('barcode')->nullable()->unique();
    $table->timestamps();

    $table->index('product_id');
});
```

### 5.6. Tabel `stock_mutations`, `stock_conversions`, & `spoilage_logs` (Barang Rusak/Basi)
```php
Schema::create('stock_mutations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained('products');
    $table->enum('type', [
        'SALE', 'PURCHASE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT',
        'SALE_VOID', 'PURCHASE_RETURN', 'CONVERSION_IN', 'CONVERSION_OUT', 'DAMAGE_OUT'
    ]);
    $table->decimal('quantity_change', 10, 2);
    $table->decimal('stock_before', 10, 2);
    $table->decimal('stock_after', 10, 2);
    $table->string('reference_number')->nullable();
    $table->text('note')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamp('created_at')->useCurrent();

    $table->index(['product_id', 'created_at']);
    $table->index('reference_number');
});

Schema::create('stock_conversions', function (Blueprint $table) {
    $table->id();
    $table->string('conversion_number')->unique(); // CNV-YYYYMMDD-XXXX
    $table->foreignId('source_product_id')->constrained('products');
    $table->decimal('source_quantity', 10, 2);
    $table->foreignId('target_product_id')->constrained('products');
    $table->decimal('conversion_ratio', 10, 2);
    $table->decimal('target_quantity', 10, 2);
    $table->text('notes')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index('source_product_id');
    $table->index('target_product_id');
});

Schema::create('spoilage_logs', function (Blueprint $table) {
    $table->id();
    $table->string('spoilage_number')->unique(); // DMG-YYYYMMDD-XXXX
    $table->foreignId('product_id')->constrained('products');
    $table->decimal('quantity', 10, 2);
    $table->unsignedInteger('cost_price_snapshot'); // HPP saat barang rusak
    $table->unsignedInteger('total_loss_amount'); // quantity * cost_price_snapshot
    $table->string('reason'); // Pecah, Digigit Tikus, Kadaluarsa, Kemasan Rusak
    $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index('product_id');
});
```

### 5.7. Tabel `customers` & `customer_point_mutations`
```php
Schema::create('customers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->unsignedInteger('credit_limit')->nullable();
    $table->unsignedInteger('loyalty_points')->default(0);
    $table->boolean('is_active')->default(true);
    $table->softDeletes();
    $table->timestamps();

    $table->index('name');
    $table->index('phone');
});

Schema::create('customer_point_mutations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained('customers');
    $table->unsignedBigInteger('sale_id')->nullable();
    $table->enum('type', ['EARN', 'REDEEM', 'ADJUSTMENT']);
    $table->integer('points_change');
    $table->unsignedInteger('points_balance_after');
    $table->text('notes')->nullable();
    $table->timestamp('created_at')->useCurrent();

    $table->index(['customer_id', 'created_at']);
});
```

### 5.8. Tabel `sales`, `sale_items`, & `sale_payments`
```php
Schema::create('sales', function (Blueprint $table) {
    $table->id();
    $table->string('invoice_number')->unique(); // TRX-YYYYMMDD-XXXX
    $table->foreignId('cashier_id')->constrained('users');
    $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
    $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
    $table->unsignedInteger('subtotal');
    $table->unsignedInteger('discount')->default(0);
    $table->unsignedInteger('points_discount_amount')->default(0);
    $table->unsignedInteger('points_redeemed')->default(0);
    $table->unsignedInteger('points_earned')->default(0);
    $table->integer('rounding_amount')->default(0); // Pembulatan uang kembalian
    $table->unsignedInteger('grand_total'); // Sebelum pembulatan
    $table->unsignedInteger('final_amount'); // grand_total + rounding_amount (Wajib bayar)
    $table->unsignedInteger('total_cost_price');
    $table->unsignedInteger('cash_received')->default(0);
    $table->unsignedInteger('cash_change')->default(0);
    $table->enum('status', ['COMPLETED', 'VOID'])->default('COMPLETED');
    $table->text('void_reason')->nullable();
    $table->timestamp('voided_at')->nullable();
    $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();

    $table->index('invoice_number');
    $table->index('cashier_id');
    $table->index('shift_id');
    $table->index('status');
    $table->index('created_at');
});

Schema::create('sale_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products');
    $table->string('product_name_snapshot');
    $table->string('unit_snapshot');
    $table->unsignedInteger('cost_price_snapshot');
    $table->unsignedInteger('selling_price_snapshot');
    $table->decimal('quantity', 10, 2);
    $table->unsignedInteger('discount')->default(0);
    $table->unsignedInteger('subtotal');

    $table->index('sale_id');
    $table->index('product_id');
});

Schema::create('sale_payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
    $table->enum('payment_method', ['CASH', 'TRANSFER', 'TEMPO']);
    $table->unsignedInteger('amount');
    $table->string('payment_reference')->nullable();
    $table->timestamps();

    $table->index('sale_id');
    $table->index('payment_method');
});
```

### 5.9. Tabel `held_carts`, `consignment_settlements`, & `consignment_settlement_items`
```php
Schema::create('held_carts', function (Blueprint $table) {
    $table->id();
    $table->string('hold_number')->unique(); // HLD-01, HLD-02
    $table->foreignId('cashier_id')->constrained('users');
    $table->foreignId('shift_id')->constrained('cashier_shifts');
    $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
    $table->json('cart_data');
    $table->text('notes')->nullable();
    $table->timestamps();

    $table->index(['cashier_id', 'shift_id']);
});

Schema::create('consignment_settlements', function (Blueprint $table) {
    $table->id();
    $table->string('settlement_number')->unique(); // SET-YYYYMMDD-XXXX
    $table->foreignId('consignor_id')->constrained('consignors');
    $table->date('start_date');
    $table->date('end_date');
    $table->decimal('total_sold_quantity', 10, 2);
    $table->unsignedInteger('total_payable_amount');
    $table->unsignedInteger('total_store_profit');
    $table->enum('status', ['UNPAID', 'PAID'])->default('PAID');
    $table->timestamp('paid_at')->nullable();
    $table->text('notes')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index('consignor_id');
});

Schema::create('consignment_settlement_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('settlement_id')->constrained('consignment_settlements')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products');
    $table->decimal('sold_quantity', 10, 2);
    $table->unsignedInteger('consignor_split_price');
    $table->unsignedInteger('selling_price_snapshot');
    $table->unsignedInteger('total_payable');
    $table->unsignedInteger('store_profit');

    $table->index('settlement_id');
});
```

### 5.10. Tabel `customer_receivables`, `receivable_payments`, & `suppliers`
```php
Schema::create('customer_receivables', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sale_id')->unique()->constrained('sales');
    $table->foreignId('customer_id')->constrained('customers');
    $table->unsignedInteger('total_amount');
    $table->unsignedInteger('down_payment');
    $table->unsignedInteger('remaining_balance');
    $table->enum('status', ['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'])->default('UNPAID');
    $table->date('due_date')->nullable();
    $table->timestamps();

    $table->index(['customer_id', 'status']);
});

Schema::create('receivable_payments', function (Blueprint $table) {
    $table->id();
    $table->string('receipt_number')->unique(); // KW-PIUT-YYYYMMDD-XXXX
    $table->foreignId('receivable_id')->constrained('customer_receivables');
    $table->foreignId('customer_id')->constrained('customers');
    $table->unsignedInteger('amount');
    $table->enum('payment_method', ['CASH', 'TRANSFER'])->default('CASH');
    $table->text('notes')->nullable();
    $table->foreignId('received_by')->constrained('users');
    $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
    $table->timestamps();

    $table->index('receivable_id');
    $table->index('shift_id');
});

Schema::create('suppliers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->boolean('is_active')->default(true);
    $table->softDeletes();
    $table->timestamps();

    $table->index('name');
});
```

### 5.11. Tabel `purchases`, `purchase_items`, & `supplier_payable_payments`
```php
Schema::create('purchases', function (Blueprint $table) {
    $table->id();
    $table->string('invoice_number')->unique(); // PO-YYYYMMDD-XXXX
    $table->foreignId('supplier_id')->constrained('suppliers');
    $table->date('purchase_date');
    $table->unsignedInteger('total_amount');
    $table->unsignedInteger('paid_amount')->default(0);
    $table->unsignedInteger('remaining_balance')->default(0);
    $table->enum('status', ['PAID', 'PARTIAL', 'UNPAID'])->default('UNPAID');
    $table->text('notes')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index('invoice_number');
    $table->index('supplier_id');
    $table->index('status');
});

Schema::create('purchase_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products');
    $table->string('product_name_snapshot');
    $table->string('unit_snapshot');
    $table->unsignedInteger('cost_price');
    $table->decimal('quantity', 10, 2);
    $table->unsignedInteger('subtotal');

    $table->index('purchase_id');
    $table->index('product_id');
});

Schema::create('supplier_payable_payments', function (Blueprint $table) {
    $table->id();
    $table->string('receipt_number')->unique(); // KW-UTANG-YYYYMMDD-XXXX
    $table->foreignId('purchase_id')->constrained('purchases');
    $table->foreignId('supplier_id')->constrained('suppliers');
    $table->unsignedInteger('amount');
    $table->enum('payment_method', ['CASH', 'TRANSFER'])->default('CASH');
    $table->text('notes')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
    $table->timestamps();

    $table->index('purchase_id');
    $table->index('shift_id');
});
```

### 5.12. Tabel `purchase_returns`, `purchase_return_items`, `expenses`, `sequences`, `audit_logs`, & `app_settings`
```php
Schema::create('purchase_returns', function (Blueprint $table) {
    $table->id();
    $table->string('return_number')->unique(); // RET-YYYYMMDD-XXXX
    $table->foreignId('purchase_id')->constrained('purchases');
    $table->foreignId('supplier_id')->constrained('suppliers');
    $table->unsignedInteger('total_amount');
    $table->text('reason');
    $table->enum('status', ['PENDING', 'COMPLETED'])->default('COMPLETED');
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index('purchase_id');
    $table->index('supplier_id');
});

Schema::create('purchase_return_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('return_id')->constrained('purchase_returns')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products');
    $table->string('product_name_snapshot');
    $table->string('unit_snapshot');
    $table->unsignedInteger('cost_price');
    $table->decimal('quantity', 10, 2);
    $table->unsignedInteger('subtotal');

    $table->index('return_id');
    $table->index('product_id');
});

Schema::create('expenses', function (Blueprint $table) {
    $table->id();
    $table->string('category');
    $table->unsignedInteger('amount');
    $table->enum('source', ['CASHIER_DRAWER', 'OWNER_FUNDS'])->default('CASHIER_DRAWER');
    $table->foreignId('shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
    $table->text('note');
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index('shift_id');
    $table->index('created_at');
});

Schema::create('sequences', function (Blueprint $table) {
    $table->id();
    $table->string('prefix');
    $table->string('current_date'); // Format Ymd
    $table->unsignedInteger('last_number')->default(0);
    $table->timestamps();

    $table->unique(['prefix', 'current_date']);
});

Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('action'); // CREATE, UPDATE, DELETE, RESTORE, VOID, LOGIN, LOGOUT, SHIFT_OPEN, SHIFT_CLOSE, CASH_DROP
    $table->string('entity_type');
    $table->string('entity_id')->nullable();
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->string('ip_address')->nullable();
    $table->timestamp('created_at')->useCurrent();

    $table->index('user_id');
    $table->index(['entity_type', 'entity_id']);
    $table->index('created_at');
});

Schema::create('app_settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->text('value');
    $table->timestamps();
});
```

---

## 6. Struktur Direktori Proyek Laravel + Inertia React (Termasuk PWA)

```
grossmart/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── BackupDatabaseCommand.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthenticatedSessionController.php
│   │   │   ├── Owner/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── ProductImportExportController.php
│   │   │   │   ├── ProductPriceTierController.php
│   │   │   │   ├── ProductBundleController.php
│   │   │   │   ├── ProductUnitConversionController.php
│   │   │   │   ├── ProductLabelController.php
│   │   │   │   ├── ConsignorController.php
│   │   │   │   ├── ConsignmentSettlementController.php
│   │   │   │   ├── ReorderSuggestionController.php
│   │   │   │   ├── SpoilageController.php
│   │   │   │   ├── StockOpnameController.php
│   │   │   │   ├── StockConversionController.php
│   │   │   │   ├── SupplierController.php
│   │   │   │   ├── PurchaseController.php
│   │   │   │   ├── PurchaseReturnController.php
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── ExpenseController.php
│   │   │   │   ├── ShiftController.php
│   │   │   │   ├── RecycleBinController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   ├── AuditLogController.php
│   │   │   │   └── SettingController.php
│   │   │   ├── Pos/
│   │   │   │   ├── PosController.php
│   │   │   │   ├── CashierShiftController.php
│   │   │   │   ├── CashDropController.php
│   │   │   │   ├── HeldCartController.php
│   │   │   │   └── SaleVoidController.php
│   │   │   ├── PublicReceiptController.php
│   │   │   └── ExportController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureRole.php
│   │   │   ├── EnsureShiftIsOpen.php
│   │   │   ├── SecurityHeaders.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/
│   │       ├── CreateSaleRequest.php
│   │       ├── OpenShiftRequest.php
│   │       ├── CloseShiftRequest.php
│   │       ├── CashDropRequest.php
│   │       ├── StoreProductRequest.php
│   │       ├── ConvertStockRequest.php
│   │       ├── StorePurchaseRequest.php
│   │       ├── SpoilageRequest.php
│   │       └── ConsignmentSettlementRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── CashierShift.php
│   │   ├── CashDrop.php
│   │   ├── Category.php
│   │   ├── Consignor.php
│   │   ├── ConsignmentSettlement.php
│   │   ├── ConsignmentSettlementItem.php
│   │   ├── Product.php
│   │   ├── ProductPriceTier.php
│   │   ├── ProductBundle.php
│   │   ├── ProductUnitConversion.php
│   │   ├── StockMutation.php
│   │   ├── StockConversion.php
│   │   ├── SpoilageLog.php
│   │   ├── Customer.php
│   │   ├── CustomerPointMutation.php
│   │   ├── CustomerReceivable.php
│   │   ├── ReceivablePayment.php
│   │   ├── HeldCart.php
│   │   ├── Supplier.php
│   │   ├── Purchase.php
│   │   ├── PurchaseItem.php
│   │   ├── SupplierPayablePayment.php
│   │   ├── PurchaseReturn.php
│   │   ├── PurchaseReturnItem.php
│   │   ├── Sale.php
│   │   ├── SaleItem.php
│   │   ├── SalePayment.php
│   │   ├── Expense.php
│   │   ├── Sequence.php
│   │   ├── AuditLog.php
│   │   └── AppSetting.php
│   └── Services/
│       ├── PosService.php
│       ├── ShiftService.php
│       ├── SequenceService.php
│       ├── StockService.php
│       ├── CostCalculationService.php
│       ├── ReorderService.php
│       ├── LoyaltyPointService.php
│       ├── ConsignmentService.php
│       ├── CashRoundingService.php
│       └── AuditService.php
├── database/
│   ├── migrations/
│   │   ├── 2026_10_08_000001_create_users_table.php
│   │   ├── ... (29 file migrasi)
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── SettingSeeder.php
│       └── DummySampleSeeder.php
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── maskable-icon.png
│   └── sounds/
│       ├── beep.mp3
│       ├── error.mp3
│       └── chime.mp3
├── resources/
│   ├── css/
│   │   └── app.css
│   └── js/
│       ├── app.tsx
│       ├── bootstrap.ts
│       ├── registerServiceWorker.ts
│       ├── Components/
│       │   ├── UI/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Toast.tsx
│       │   │   ├── BottomNavBar.tsx
│       │   │   ├── OfflineBanner.tsx
│       │   │   ├── PwaInstallButton.tsx
│       │   │   └── Pagination.tsx
│       │   ├── POS/
│       │   │   ├── BarcodeListener.tsx
│       │   │   ├── CameraScannerModal.tsx
│       │   │   ├── KeyboardShortcuts.tsx
│       │   │   ├── ProductGrid.tsx
│       │   │   ├── CartTable.tsx
│       │   │   ├── MobileCartDrawer.tsx
│       │   │   ├── HeldCartsModal.tsx
│       │   │   ├── PaymentDialog.tsx
│       │   │   ├── QuickCashButtons.tsx
│       │   │   ├── DenominationCalculatorModal.tsx
│       │   │   ├── CashDropModal.tsx
│       │   │   ├── LoyaltyRedeemModal.tsx
│       │   │   ├── WhatsAppReceiptModal.tsx
│       │   │   └── ThermalReceipt.tsx
│       │   └── Layouts/
│       │       ├── AuthenticatedLayout.tsx
│       │       ├── PosLayout.tsx
│       │       └── OwnerLayout.tsx
│       ├── Pages/
│       │   ├── Auth/
│       │   │   └── Login.tsx
│       │   ├── POS/
│       │   │   ├── Index.tsx
│       │   │   ├── ShiftOpen.tsx
│       │   │   └── ShiftClose.tsx
│       │   ├── Public/
│       │   │   └── Receipt.tsx
│       │   └── Owner/
│       │       ├── Dashboard.tsx
│       │       ├── Products/
│       │       │   ├── Index.tsx
│       │       │   ├── ImportExportModal.tsx
│       │       │   ├── PriceTiersModal.tsx
│       │       │   ├── BundlesModal.tsx
│       │       │   └── BarcodeLabels.tsx
│       │       ├── Consignors/
│       │       │   ├── Index.tsx
│       │       │   └── Settlement.tsx
│       │       ├── Categories/Index.tsx
│       │       ├── Spoilage/Index.tsx
│       │       ├── Conversions/Index.tsx
│       │       ├── Sales/Index.tsx
│       │       ├── Customers/
│       │       │   ├── Index.tsx
│       │       │   └── PointsHistory.tsx
│       │       ├── Suppliers/Index.tsx
│       │       ├── Purchases/
│       │       │   ├── Index.tsx
│       │       │   └── ReorderSuggestions.tsx
│       │       ├── Expenses/Index.tsx
│       │       ├── Shifts/
│       │       │   ├── Index.tsx
│       │       │   └── CashDrops.tsx
│       │       ├── RecycleBin/Index.tsx
│       │       ├── Reports/Index.tsx
│       │       ├── AuditLogs/Index.tsx
│       │       └── Settings/Index.tsx
│       └── types/
│           ├── index.d.ts
│           └── pos.ts
├── routes/
│   ├── web.php
│   ├── auth.php
│   └── console.php
├── composer.json
├── package.json
├── vite.config.ts
└── PLAN.md
```

---

## 7. Rencana Eksekusi Bertahap (Bite-Sized Milestones & DoD)

### Milestone 1: Inisialisasi Proyek Laravel 11, Breeze Inertia React, Migrasi MySQL, Seed Data & Setup PWA
- [ ] Buat proyek Laravel 11 baru dan install Breeze (React + TypeScript).
- [ ] Konfigurasi file `.env` ke database MySQL/MariaDB `grossmart`.
- [ ] Buat dan jalankan seluruh 29 file migrasi tabel (Engine InnoDB, foreign keys, indeks, soft deletes).
- [ ] Buat seeder berbahasa Indonesia: akun `owner` (password terenkripsi `bcrypt`), akun `cashier1`, kategori sembako, penitip sampel, sampel produk reguler & konsinyasi, price tiers, bundle sembako, sequence prefixes, pengaturan toko awal.
- [ ] Konfigurasi `manifest.json`, icon PWA di `public/icons/`, dan register service worker di `resources/js/registerServiceWorker.ts`.
- **DoD:** `php artisan migrate --seed` sukses 100%, 29 tabel siap di MySQL, manifest PWA valid dan dapat dideteksi browser.

### Milestone 2: Autentikasi Sesi, Keamanan Akun, Middleware RBAC & Guard Shift
- [ ] Halaman Login berbahasa Indonesia dengan tipografi besar, kontras tinggi, dan pesan validasi ramah orang tua.
- [ ] Implementasikan rate limiting ketat pada login (`throttle:5,1`) dan regenerasi session ID.
- [ ] Buat middleware `EnsureRole` (`owner` vs `cashier`) dan middleware `SecurityHeaders` (CSP, X-Frame-Options, HSTS).
- [ ] Buat middleware `EnsureShiftIsOpen` untuk memproteksi halaman POS.
- [ ] Redirect otomatis: Owner ke `/owner/dashboard`, Kasir ke `/pos`.
- [ ] Pencatatan Audit Log saat login dan logout berhasil (mencatat IP & User ID).
- **DoD:** Login owner masuk dashboard, login kasir diarahkan ke shift/pos, akses kasir ke `/owner/*` tertolak (HTTP 403 / redirect), rate limit memblokir percobaan brute force.

### Milestone 3: Master Data Produk, Impor Excel, Konsinyasi, Bundling, Stok & Konversi Satuan
- [ ] CRUD Kategori dan CRUD Penitip Barang Konsinyasi (`consignors`) berbahasa Indonesia.
- [ ] CRUD Produk dengan dukungan tipe produk `REGULAR`, `CONSIGNMENT`, dan `BUNDLE`.
- [ ] Sembunyikan atribut `cost_price` pada seluruh model/resource Inertia kasir (`makeHidden('cost_price')`).
- [ ] Fitur **Impor & Ekspor Massal Excel** untuk data produk dengan sanitasi formula CSV (`ProductImportExportController`).
- [ ] Fitur Pengaturan Harga Grosir Bertingkat (`ProductPriceTierController`) dan Multi-Satuan (`ProductUnitConversionController`).
- [ ] Fitur Cetak Label Barcode & Label Rak Harga (`ProductLabelController`).
- [ ] Menu Stock Opname & Pencatatan Barang Rusak/Kadaluarsa (`SpoilageController`).
- [ ] Fitur **Pecah Satuan / Konversi Stok** (`StockConversionController`): Dus ke Pcs dengan mutasi atomik.
- [ ] Tab **Tempat Sampah (Recycle Bin)** untuk memulihkan (*restore*) data yang terhapus secara sengaja/tidak sengaja.
- **DoD:** CRUD produk lancar, impor excel berhasil, barang konsinyasi tercatat, HPP tersembunyi dari kasir, konversi dus ke pcs presisi, restore data terhapus sukses.

### Milestone 4: Modul Kasir (POS) Ergonomis, Elderly-Friendly, Multi-Device & PWA
- [ ] Tampilan POS React ramah orang tua di 3 breakpoint:
  - **HP (360px - 480px):** Layout 1 kolom, Bottom Navigation Bar, bilah keranjang melayang (*Sticky Bottom Sheet*), modal pemindai kamera HP (*CameraScannerModal*).
  - **Tablet (768px - 1024px):** Split 60:40 lanskap / tab switcher potret dengan target sentuh minimal 56px (`h-14`).
  - **PC Desktop / POS Touch (1366px+):** Dual panel lebar, collapsible sidebar, shortcut keyboard ritel (`F1`-`F8`, `Enter`, `Esc`).
- [ ] PWA Standalone Mode: Tombol install PWA di layar utama kasir, cache offline asset via Service Worker.
- [ ] Integrasi barcode scanner via keyboard listener (deteksi typing < 35ms), pemindai kamera HP, dan parser barcode timbangan EAN-13 (prefix `20`).
- [ ] Efek suara audio feedback (*beep* scan sukses, *buzz* error, *chime* bayar lunas).
- [ ] Fitur **Parkir Keranjang (Hold & Resume Cart)** via shortcut `F3` (`HeldCartController`).
- [ ] Dialog Pembayaran Ramah Orang Tua: tombol raksasa **[UANG PAS]** dan **[Rp 10rb / 20rb / 50rb / 100rb / 200rb]**.
- [ ] Mendukung Pembayaran Tunggal maupun **Split Payment** (Kombinasi Tunai, Transfer QRIS, dan Tempo).
- [ ] Integrasi Poin Loyalitas Member & Pembulatan Uang Kembalian (*cash rounding* ke kelipatan Rp 100/500).
- [ ] Pemotongan stok atomik (`lockForUpdate()`) & generate invoice atomik via tabel `sequences`.
- [ ] Modal cetak struk thermal 58mm/80mm via `@media print` dan tombol kirim struk WhatsApp.
- [ ] Halaman E-Receipt publik mobile-friendly (`/receipt/{invoice}`).
- **DoD:** Kasir lansia dapat bertransaksi mudah di HP/tablet/PC dengan tombol pecahan cepat, kamera scanner HP berfungsi, suara audio terdengar, parkir keranjang lancar, PWA dapat di-install, dan cetak struk sukses.

### Milestone 5: Pembelian (Supplier & Utang), HPP Moving Average, Smart Re-Order, Retur & Piutang
- [ ] CRUD Pemasok dan Faktur Pembelian (PO) dengan tanggal faktur, menambah stok otomatis, mencatat utang toko.
- [ ] **Kalkulasi HPP Rata-rata Bergerak Otomatis (Weighted Moving Average Cost)** saat faktur pembelian disimpan.
- [ ] Fitur **Smart Re-Order (Daftar Kulakan Otomatis)** berdasarkan tren penjualan 14 hari terakhir dikelompokkan per supplier.
- [ ] Pembayaran cicilan utang supplier dengan opsi sumber dana (Laci Kasir / Dana Owner).
- [ ] Modul Retur Pembelian ke supplier (validasi sisa PO, pemotongan stok `PURCHASE_RETURN`, dan pemotongan saldo utang).
- [ ] CRUD Pelanggan dengan `credit_limit` dan riwayat mutasi poin member.
- [ ] Buku Piutang & Formulir Penerimaan Setoran Piutang (menghasilkan kwitansi `KW-PIUT`).
- **DoD:** Pembelian memperbarui HPP moving average, rekomendasi reorder akurat, retur memotong utang, cicilan utang/piutang tercatat rapi di HP maupun desktop.

### Milestone 6: Manajemen Shift Kasir (Blind Cash-Up), Cash Drop, Konsinyasi Settlement & Laporan Finansial
- [ ] Alur Buka Kasir & Tutup Kasir dilengkapi **Kalkulator Pecahan Uang Fisik (Denomination Calculator)** raksasa.
- [ ] Penerapan **Tutup Kasir Buta (Blind Cash-Up)**: Nominal seharusnya dirahasiakan sampai uang fisik di-submit kasir.
- [ ] Fitur **Setor Kas Laci ke Brankas (Cash Drop)** di tengah shift dengan pencatatan `total_cash_drops` dan tanda terima digital.
- [ ] Formula rekonsiliasi kas shift presisi:
  $$\text{expectedCashEnding} = \text{startingCash} + \text{totalCashSales} + \text{totalDownPaymentCash} + \text{totalReceivableCashPaid} - \text{totalCashExpenses} - \text{totalCashDrops} - \text{totalSupplierPaidFromDrawer} - \text{totalCashVoided}$$
- [ ] Shift Guard: POS terkunci jika shift belum dibuka. Wewenang Force Close bagi Pemilik.
- [ ] Menu **Settlement Barang Konsinyasi Warga**: menghitung barang titipan yang laku, mencetak nota pembayaran penitip, dan membukukan laba toko.
- [ ] Dashboard Pemilik Ramah Pengguna: Ringkasan omzet, laba kotor, barang menipis, barang rusak, dan rekomendasi belanja.
- [ ] Laporan Penjualan, Laba Rugi, dan Arus Kas dengan filter tanggal.
- [ ] Fitur Void Penjualan khusus Pemilik dengan rollback stok, piutang, dan kas shift aktif.
- [ ] Halaman Audit Log, Pengaturan Toko, tombol download backup `.sql`, dan konfigurasi backup terjadwal harian.
- **DoD:** Rekonsiliasi kas shift akurat dengan blind cash-up dan cash drop, settlement konsinyasi berjalan tepat, backup terjadwal aktif.

### Milestone 7: Verifikasi Menyeluruh (End-to-End, Multi-Device, Security & Usability Testing)
- [ ] Uji instalasi PWA di Android, iOS, dan Desktop (standalone window, manifest, service worker).
- [ ] Uji responsivitas di 3 ukuran layar: HP (375px), Tablet (768px), dan Desktop Widescreen (1366px+).
- [ ] Uji usability kemudahan transaksi kasir lansia dengan tombol uang pas dan pecahan cepat.
- [ ] Uji audio feedback saat scan barcode dan transaksi lunas.
- [ ] Uji scanner kamera HP (*HTML5 WebCam Scanner*) pada HP Android & iOS.
- [ ] Uji keamanan OWASP: rate limiting login, verifikasi HPP tersembunyi dari akun kasir, IDOR protection pada transaksi kasir lain, dan pencegahan SQL Injection/XSS.
- [ ] Uji fitur blind cash-up saat tutup kasir (sistem tidak membocorkan angka sebelum submit).
- [ ] Uji fitur cash drop di tengah shift dan verifikasi saldo akhir shift kasir.
- [ ] Uji impor massal data produk dari file Excel dengan sanitasi formula CSV.
- [ ] Uji pencatatan barang rusak/basi (*spoilage log*) dan pembukuan kerugian HPP.
- [ ] Uji transaksi barang paket hemat (*bundle*) dan verifikasi pemotongan stok masing-masing item penyusunnya.
- [ ] Uji pemulihan data terhapus dari tempat sampah (*recycle bin*).
- [ ] Uji transaksi tunai normal, pembayaran split (Tunai + QRIS), dan pembulatan kembalian.
- [ ] Uji fitur parkir keranjang (Hold Cart Pelanggan A, layani Pelanggan B, resume Pelanggan A).
- [ ] Uji barcode timbangan EAN-13 (ekstraksi SKU & berat gram otomatis).
- [ ] Uji kirim struk digital via WhatsApp dan tampilan halaman publik e-receipt.
- [ ] Uji settlement barang konsinyasi warga dan pembagian hasil laba toko.
- [ ] Uji aktivasi harga grosir bertingkat saat kuantitas mencapai batas tier.
- [ ] Uji kalkulasi HPP moving average saat pembelian barang dengan harga modal baru.
- [ ] Uji smart reorder suggestion berdasarkan tren transaksi.
- [ ] Uji kalkulator pecahan uang saat buka & tutup shift kasir.
- [ ] Uji anti-stok minus dengan dua transaksi serentak pada item stok 1 (`lockForUpdate()`).
- [ ] Uji konversi satuan grosir ke eceran (dus ke pcs).
- [ ] Uji retur pembelian ke supplier dan verifikasi pengurangan utang.
- [ ] Uji rekonsiliasi shift dengan seluruh skenario kas masuk & keluar laci.
- [ ] Uji void transaksi dan verifikasi penyesuaian kas shift aktif (`total_cash_voided`).
- [ ] Uji keamanan RBAC (blokir kasir dari URL/API pemilik).
- [ ] Uji ekspor laporan ke Excel & PDF serta eksekusi artisan backup database.
- **DoD:** Seluruh pengujian lolos 100%, sistem 100% Bahasa Indonesia, aman, PWA terpasang, ramah lansia, dan siap produksi di toko fisik.
