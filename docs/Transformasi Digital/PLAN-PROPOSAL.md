# Plan Proposal Transformasi Digital — Grossmart

> **Mata Kuliah:** Transformasi Digital (0832)  
> **Standar Acuan:** GEMASTIK (Kategori Pengembangan Perangkat Lunak)  
> **Template Resmi:** `Template proposal - Transformasi Digital.docx` & `TEMPLATE_PROPOSAL.md`  
> **Batas Volume Naskah:** Maksimal **30 halaman** (termasuk cover, naskah utama, daftar pustaka, dan lampiran); jumlah halaman bersifat fleksibel dan proporsional terhadap isi.
> **Sumber Utama:** `PLAN.md` & Codebase Grossmart (Laravel 11, React Inertia, TypeScript, Tailwind)

---

## 1. Status Dokumen Terkini & Kebijakan Eksekusi

### Keputusan Tegas Berdasarkan Arahan:
1. **Kepatuhan Mutlak Template Asli:**
   - **Tanpa Daftar Isi:** Sesuai template DOCX asli, halaman cover langsung lanjut ke `ABSTRAK`. Tidak disisipi Daftar Isi.
   - **Gambar Hanya di Lampiran:** Semua 7 figur diagram dan mockup antarmuka dipusatkan di bab `Lampiran` di akhir naskah. Bab utama hanya memuat rujukan silang (misalnya: *"dapat dilihat pada Lampiran 1"*).
2. **Status Produk Grossmart:**
   - **Tahap Pengembangan (*In-Development*):** Grossmart adalah aplikasi yang **sedang dikembangkan dan diusulkan**, bukan sistem yang sudah aktif beroperasi di toko *production*.
   - **Metrik adalah Target Hipotesis:** Penurunan waktu rekap <15 menit, akurasi persediaan >95%, dan target skor SUS >75 diperlakukan sebagai **target evaluasi kuantitatif** yang akan divalidasi pada fase uji coba.

### Kebijakan Freeze Naskah Word:
> **PERINGATAN:** Berkas `Proposal Transformasi Digital - Grossmart.docx` **TIDAK AKAN DISENTUH** sampai naskah `PROPOSAL_FULL.md` tuntas 100% dan terverifikasi.

### Protokol Penanda Dummy:
- Format penanda seragam: `[DUMMY_REPLACE: <nilai_dummy>]`.
- Pencarian cepat: cari string `[DUMMY_REPLACE:` di seluruh folder `docs/Transformasi Digital/`.
- Lokasi penanda:
  - `INPUT_DATA.md`: Identitas tim pengusul, profil mitra toko, tanggal akses web kompetitor, kutipan wawancara, daftar sitasi.
  - `PROPOSAL_FULL.md`: Tabel tim penyusun pada cover, kutipan mitra pada latar belakang, tanggal akses pada tinjauan pustaka.
---

## 2. Rencana Volume Naskah Fleksibel (Batas Maksimal 30 Halaman)

### Estimasi Halaman (A4, Spasi 1.5, Font Times New Roman 12pt, Margin 2.54 cm):
- Kapasitas rata-rata naskah teks sekitar **250–280 kata per halaman**; untuk estimasi kerja gunakan **270 kata per halaman**. Tabel, judul, jeda halaman, dan gambar dapat menambah kebutuhan ruang.
- PROPOSAL_FULL.md saat ini berisi sekitar **5.450 kata** menurut hitungan berbasis spasi, termasuk cover, judul, tabel, daftar pustaka, dan uraian lampiran; setara sekitar **20 halaman teks** pada 270 kata per halaman. Ini estimasi, bukan target panjang wajib.
- Cover, tabel, dan jeda tata letak memerlukan ruang tersendiri; tujuh gambar lampiran diperkirakan memakai sekitar **4.5–5 halaman** setelah ditata proporsional.
- Perkiraan awal keseluruhan sekitar **25–27 halaman**. Angka ini indikatif; tata letak akhir wajib diperiksa setelah render, dan isi boleh lebih pendek atau panjang sesuai kebutuhan selama proporsional serta **tidak melebihi 30 halaman**.

### Pembagian Bobot Kata dan Halaman per Bagian (Estimasi Indikatif, Bukan Kuota):

| No | Bab / Bagian Proposal | Estimasi Kata | Estimasi Halaman | Konten Kunci & Bukti Implementasi Codebase |
|---|---|:---:|:---:|---|
| 1 | **Cover, Identitas Tim & Abstrak** | ~250 kata | 1.0 hal | Format cover GEMASTIK, tabel tim (`[DUMMY_REPLACE: <nama>]`), abstrak 1 paragraf padat bahasa Indonesia, 5 kata kunci. |
| 2 | **Judul (Bab Pembuka Pasca-Abstrak)** | ~120 kata | 0.5 hal | Penjelasan 3 elemen judul: sasaran warung kelontong, pendekatan web lokal ramah lansia, tujuan efisiensi & proteksi kas laci. |
| 3 | **Latar Belakang** | ~750 kata | 2.5 hal | Realitas 3,9 juta warung kelontong, kesenjangan pencatatan manual vs ritel modern, 4 titik kendala operasional (selisih laci malam hari, salah ketik kalkulator kecil, buku utang basah, titipan kue tetangga), rumusan & batasan masalah. |
| 4 | **Tujuan dan Manfaat Aplikasi** | ~350 kata | 1.0 hal | 4 tujuan terukur (eliminasi salah hitung kembalian, rekap <15 menit, akurasi stok >95%, kemandirian kasir lansia), 4 manfaat multi-pihak (pemilik, kasir, warga penitip, ekonomi warung). |
| 5 | **Tinjauan Singkat dan Posisi Kebaruan** | ~700 kata | 2.5 hal | Tinjauan objektif 4 POS (Moka, Majoo, Kasir Pintar, iReap), kesenjangan biaya SaaS & antarmuka rapat, **Tabel 1: Komparasi Solusi vs Grossmart**, 4 kebaruan utama (*blind cash-up*, kalkulator pecahan rupiah, arsitektur tanpa biaya sewa bulanan, aksesibilitas lansia). |
| 6 | **Deskripsi dan Solusi Digital** | ~800 kata | 3.0 hal | Konsep aplikasi Laravel 11 + React 18 Inertia, 5 fungsi operasional, alur kerja buka kasir s.d. tutup toko (*rujuk Lampiran 2*), skema data 39 tabel (32 model Eloquent), PWA offline resilience. |
| 7 | **Metodologi dan Rancangan Teknis** | ~500 kata | 1.5 hal | 4 tahapan rekayasa perangkat lunak iteratif berorientasi pengguna, arsitektur sistem (*rujuk Lampiran 1*), hak akses RBAC (pemilik vs kasir), proteksi transaksi ACID dan pengujian otomatis PHPUnit. |
| 8 | **Analisis Kebutuhan Pengguna** | ~400 kata | 1.5 hal | Karakteristik persona pengelola (Pak Bambang 58 th) dan kasir (Ibu Sumiyati 61 th) pada gerai mitra RPTRA Jatinegara, solusi ergonomi (tombol 56px, huruf besar 16–44px, suara *beep* & *chime*), 100% istilah bahasa Indonesia ramah warung. |
| 9 | **Dampak Kebermanfaatan dan Keberlanjutan** | ~350 kata | 1.0 hal | Target terukur (waktu rekap, selisih kas, akurasi persediaan), target uji usabilitas SUS > 75, model mandiri tanpa biaya langganan, prosedur nota darurat saat mati listrik. |
| 10 | **Aspek Etika, Legalitas dan Potensi HKI** | ~200 kata | 0.5 hal | Kepatuhan UU PDP No. 27/2022 (data utang pelanggan terlindungi), audit log kasir transparan non-intimidatif, rencana pendaftaran Hak Cipta ke DJKI. |
| 11 | **Penutup** | ~130 kata | 0.5 hal | Sintesis kesiapan sistem dalam tahap perancangan, relevansi solusi bagi warung tradisional, penegasan nilai guna. |
| 12 | **Daftar Pustaka** | ~300 kata | 1.0 hal | 10–12 referensi standar APA 7 (regulasi, jurnal HCI lansia, SUS, OWASP, dokumentasi resmi framework). |
| 13 | **Lampiran (7 Gambar & Tabel Evaluasi)** | Ringkas | 4.5 hal | Lampiran 1 s.d. Lampiran 7 (Gambar arsitektur, user flow, dan 5 tangkapan layar UI dengan takarir penjelas) + Lampiran 8 (Skenario pengujian dan pembagian tugas). |
| | **Estimasi saat ini** | **~5.450 kata termasuk cover, tabel, pustaka, dan uraian lampiran; estimasi awal 25–27 halaman termasuk ruang gambar** | **Batas akhir 30 halaman; volume fleksibel dan proporsional, bukan target halaman tetap** |

---

### Prinsip Bahasa Manusiawi & Anti-Jargon:
Proposal harus nyaman dibaca oleh dosen penguji maupun reviewer tanpa kalimat berbelit-belit (*robotic/pseudo-academic filler*):
1. **Lugas dan Konkret:** Jelaskan masalah dengan fakta operasional warung, bukan konsep abstrak melayang (contoh: gunakan *"kasir lansia sering salah membedakan tombol Rp 10.000 dan Rp 100.000 karena tombolnya kecil"* alih-alih *"degradasi kognitif visual memicu distorsi perseptual"*).
2. **Kamus Padanan Istilah Warung (Wajib Digunakan Konsisten):**
   - *Blind cash-up* -> **Tutup kasir buta** (penghitungan uang fisik laci tanpa melihat angka saldo di layar agar rekonsiliasi objektif).
   - *Fat-finger error* -> **Salah sentuh tombol** (kesalahan akibat tombol layar sentuh terlalu kecil atau terlalu rapat).
   - *Repack* -> **Pemecahan satuan eceran** (konversi dari kemasan dus/karton menjadi satuan butir, bungkus, atau renceng).
   - *Cash drop* -> **Setor kas aman ke pemilik** (pengamanan berkala sebagian uang laci saat nominal kas melampaui batas aman).
   - *Hold cart / Parkir keranjang* -> **Simpan belanjaan sementara** (menahan transaksi saat pembeli menambah belanjaan tanpa menghambat antrean pembeli lain).
   - *Void* -> **Batal transaksi** (pembatalan nota yang membutuhkan otorisasi sesi pemilik toko).
3. **Struktur Kalimat Bernalar Bersih:** Setiap paragraf memuat ide pokok yang jelas: apa masalahnya, apa tindakan sistemnya, dan apa dampak nyatanya bagi toko.

## 3. Bedah Panduan Template Resmi & Rencana Pengisian Setiap Point dan Subpoint

Setiap butir di bawah membedah instruksi resmi dari berkas `Template proposal - Transformasi Digital.docx` beserta strategi implementasi, konten, dan bukti teknis yang wajib dituangkan ke naskah:

---

### Point 1: JUDUL PROPOSAL & Disusun Oleh :
- **Instruksi Template:**
  - Judul proposal di halaman muka dalam huruf kapital dan tebal.
  - Format penyusun berupa tabel 1 baris x 2 kolom: Kolom 1 memuat susunan Nama, Kolom 2 memuat susunan NIM.
- **Rencana Pengisian Subpoint:**
  - Judul: `GROSSMART: APLIKASI KASIR DAN PENGELOLAAN OPERASIONAL TOKO KELONTONG YANG RAMAH PENGGUNA LANJUT USIA`
  - Tabel Tim: Memuat `[DUMMY_REPLACE: Muhammad Fakhri Al-Faruq]`, `[DUMMY_REPLACE: Budi Prasetyo Utomo]`, `[DUMMY_REPLACE: Siti Rahmawati Dewi]` beserta NIM dan nama perguruan tinggi (Universitas Bina Sarana Informatika).

---

### Point 2: ABSTRAK
- **Instruksi Template (P22–P26):**
  - Ringkasan singkat dan komprehensif dari keseluruhan proposal (urgensi masalah, pendekatan teknologi, solusi digital, tujuan, manfaat utama, dan nilai kebaruan).
  - Ditulis dalam 1 paragraf utuh, bahasa formal, lugas, tanpa penjelasan teknis terlalu mendalam.
  - Menjadi pintu masuk utama penilaian kelayakan ide.
- **Rencana Pengisian Subpoint:**
  - *Kalimat 1–2 (Urgensi Masalah):* Realitas toko kelontong mandiri (3,9 juta unit) yang rentan tergerus ritel modern akibat pencatatan manual, selisih uang laci harian, dan kasir lansia yang kesulitan mengoperasikan kalkulator kecil/nota kertas.
  - *Kalimat 3–4 (Solusi & Pendekatan Teknologi):* Grossmart sebagai aplikasi web kasir operasional mandiri berbasis Laravel 11, React 18, Inertia.js, dan MySQL/MariaDB dengan arsitektur PWA lokal bebas biaya langganan bulanan.
  - *Kalimat 5–6 (Fitur Unggulan & Kebaruan):* Tutup kasir buta (*blind cash-up*), kalkulator pecahan fisik Rupiah, fondasi data titipan warga, dan desain ergonomis lansia berstandar target sentuh 56px serta nada audio penanda aksi.
  - *Kalimat 7 (Tujuan & Dampak):* Memangkas waktu rekap harian dari 60 menit menjadi <15 menit, mengeliminasi selisih kas tak terjelaskan, serta meningkatkan kemandirian pedagang lansia.
  - *Kata Kunci:* 5 kata kunci baku (toko kelontong, aplikasi kasir, transformasi digital, aksesibilitas lansia, blind cash-up).

---

### Point 3: Judul
- **Instruksi Template (P38–P42):**
  - Representasi singkat dan padat dari keseluruhan ide tanpa ambiguitas.
  - Mencerminkan unsur kebaruan ide dan pemanfaatan teknologi informasi (hindari generik/normatif).
  - Memuat 3 elemen utama: (1) objek/sasaran solusi, (2) pendekatan/teknologi yang digunakan, dan (3) tujuan/dampak yang ingin dicapai.
  - Formal, proporsional, tanpa singkatan tidak umum.
- **Rencana Pengisian Subpoint:**
  - *Rumusan Judul:* "Grossmart: Aplikasi Kasir dan Pengelolaan Operasional Toko Kelontong yang Ramah Pengguna Lanjut Usia".
  - *Bedah 3 Elemen Wajib:*
    1. Sasaran Solusi: Toko kelontong mandiri dan pedagang/kasir berusia lanjut.
    2. Pendekatan Teknologi: Aplikasi web monolitik modern (Laravel, React Inertia, PWA lokal, audio feedback).
    3. Tujuan & Dampak: Efisiensi rekap harian, proteksi kas laci bebas moral hazard, dan inklusi digital lansia.

---

### Point 4: Latar Belakang
- **Instruksi Template (P44–P48):**
  - Diawali gambaran umum fenomena makro/isu nyata di masyarakat, lalu dipersempit ke masalah spesifik yang diselesaikan.
  - Menunjukkan kesenjangan nyata antara kondisi ideal vs kondisi aktual (efisiensi, transparansi, pemanfaatan teknologi).
  - Menjelaskan dampak fatal jika masalah tidak ditangani (aspek sosial, ekonomi warung).
  - Menggunakan data pendukung objektif (data publik/regulasi/observasi mitra).
  - Menghubungkan masalah secara logis dan realistis dengan solusi digital berbasis TI.
- **Rencana Pengisian Subpoint:**
  - *Subpoint 4.1 — Fenomena Makro UMKM Ritel Tradisional:* Penurunan populasi toko kelontong mandiri (data Asosiasi Pedagang/ANTARA 2026: tersisa 3,9 juta gerai) akibat ekspansi jaringan minimarket modern waralaba yang terkomputerisasi.
  - *Subpoint 4.2 — Kesenjangan Ideal vs Aktual di Toko Kelontong:*
    - Ideal: Transaksi cepat, pencatatan kas presisi, stok terpantau *real-time*, utang pelanggan terkontrol, barang titipan warga tertata rapi.
    - Aktual: Kasir merangkap pemilik sibuk melayani; pencatatan di nota kertas robek atau buku tulis terpisah; uang belanja kulakan bercampur dengan uang hasil jualan di laci.
  - *Subpoint 4.3 — Empat Titik Kritis Hambatan Operasional:*
    1. *Kebocoran Kas Laci:* Rekonsiliasi malam hari butuh 45–60 menit; uang receh sering selisih tanpa jejak audit.
    2. *Kerentanan Sensorik Kasir Lansia:* Kasir berusia 50+ tahun mengalami penurunan akomodasi visual (presbiopi) dan tremor motorik halus, memicu salah ketik angka nol (*fat-finger error*).
    3. *Kemacetan Arus Kas Piutang (Buku Bon):* Buku utang basah, tercecer, atau lupa ditagih menimbulkan sengketa sosial dengan tetangga.
    4. *Ketidakpastian Barang Konsinyasi:* Titipan makanan/jajanan warga sekitar sering salah hitung bagi hasil atau telat pelunasan.
  - *Subpoint 4.4 — Dampak Jika Masalah Dibiarkan:* Beban mental pemilik warung memicu kelelahan fisik, potensi kebangkrutan modal kerja akibat selisih kas terakumulasi, dan hilangnya daya saing warung lokal.
  - *Subpoint 4.5 — Relevansi Solusi Digital:* Grossmart sebagai solusi aplikasi kasir mandiri (*self-hosted*) berlayar lebar dengan tombol fisik Rupiah, kontrol *blind cash-up*, dan antarmuka ramah lansia.
  - *Subpoint 4.6 — Rumusan Masalah (3 Butir Spesifik) & Batasan Masalah (3 Butir Realistis).*

---

### Point 5: Tujuan dan Manfaat Aplikasi

#### Subpoint 5.1: Tujuan Aplikasi
- **Instruksi Template (P51–P55):**
  - Menjelaskan hasil yang ingin dicapai secara jelas, terarah, dan terukur berdasarkan kebutuhan nyata pengguna (bukan normatif).
  - Menunjukkan hubungan logis antara fitur aplikasi, teknologi, dan dampak yang diharapkan.
  - Menekankan manfaat langsung pengguna dalam aktivitas harian dan pengambilan keputusan.
  - Selaras dengan tema Transformasi Digital GEMASTIK serta aspek etika, keamanan, dan legalitas.
- **Rencana Pengisian:**
  1. *Tujuan Operasional Kasir:* Mengembangkan sistem POS dengan kalkulator pecahan fisik rupiah dan tombol target sentuh 56px guna meniadakan salah hitung kembalian oleh kasir lansia.
  2. *Tujuan Rekonsiliasi Finansial:* Menerapkan alur tutup shift buta (*blind cash-up*) untuk memangkas durasi rekap harian dari 60 menit menjadi <15 menit dengan toleransi selisih mendekati Rp 0.
  3. *Tujuan Tata Kelola Persediaan:* Mengintegrasikan konversi satuan dus-ke-eceran (*repack*) dan skema penataan titipan warga untuk menjamin akurasi fisik vs sistem >95%.
  4. *Tujuan Aksesibilitas Terukur:* Mencapai skor System Usability Scale (SUS) > 75 pada pengujian bersama pengguna lansia tanpa pelatihan teknis rumit.

#### Subpoint 5.2: Manfaat Aplikasi
- **Instruksi Template (P57–P61):**
  - Menguraikan nilai guna langsung bagi pengguna serta dampak dalam konteks yang lebih luas (produktivitas, transparansi, akuntabilitas).
  - Menunjukkan potensi keberlanjutan dan adopsi jangka panjang, bukan sekadar prototipe kompetisi.
  - Menjelaskan kontribusi pada peningkatan pengetahuan/keterampilan digital pedagang tradisional.
- **Rencana Pengisian:**
  1. *Manfaat Langsung Pemilik Toko:* Transparansi arus kas laci tanpa kecurigaan moral hazard, kemudahan analisis laba kotor, dan perlindungan modal kerja.
  2. *Manfaat Langsung Kasir Lanjut Usia:* Rasa percaya diri dan tenang saat bertransaksi berkat teks berukuran 16–44px, konfirmasi dialog anti-salah sentuh, dan asistensi audio nada konfirmasi.
  3. *Manfaat Ekosistem Warga Mitra (Konsinyor):* Rekap penjualan titipan kue/snack tercatat otomatis, perhitungan komisi transparan, dan pencairan hak tepat waktu.
  4. *Manfaat Dampak Ekonomi Makro:* Memperkuat ketahanan warung kelontong sebagai penyangga ekonomi kerakyatan melalui digitalisasi mandiri berbiaya Rp 0 lisensi.

---

### Point 6: Tinjauan Singkat dan Posisi Kebaruan
- **Instruksi Template (P64–P68):**
  - Menguraikan solusi sejenis/eksisting dan pendekatan konvensional beserta kekurangan atau celah yang belum teratasi.
  - Menjelaskan aspek kebaruan (*novelty*) solusi yang diusulkan (pengembangan fitur, integrasi sistem, konteks pengguna khusus).
  - Menunjukkan peningkatan efektivitas, efisiensi, kemudahan penggunaan, atau dampak yang lebih luas secara logis.
- **Rencana Pengisian Subpoint:**
  - *Subpoint 6.1 — Tinjauan Solusi Komersial Eksisting:*
    1. Moka POS (PT Moka Teknologi Indonesia): Kuat di F&B/ritel modern, namun model sewa SaaS Rp 299rb/bln membebani warung, cloud-only, antarmuka tablet rapat.
    2. Majoo (PT Majoo Teknologi Indonesia): Ekosistem luas namun hirarki modul sangat kompleks dan membingungkan pengguna non-akademisi.
    3. Kasir Pintar (PT Kasir Pintar Internasional): Berorientasi smartphone layar kecil (5–6 inci), menyulitkan mata rabun dan jari tremor kasir lansia.
    4. iReap POS (PT Sterling Tulus Cemerlang): Kasir ritel standar, tanpa pengelolaan titipan warga dan tanpa proteksi *blind cash-up*.
  - *Subpoint 6.2 — Analisis Kesenjangan Pasar (Market Gap):*
    - Kesenjangan Biaya: Beban SaaS menggerus margin tipis (2–5%) warung kelontong.
    - Kesenjangan Aksesibilitas: Ketiadaan desain ergonomis ramah lansia (semua POS dirancang untuk operator muda).
    - Kesenjangan Kontrol Keuangan: Aplikasi komersial menampilkan saldo sebelum uang dihitung fisik (membuka moral hazard).
    - Kesenjangan Lokalitas: Tidak ada fitur repack dus-ke-renceng dan titipan warga.
  - *Subpoint 6.3 — Matriks Komparasi Solusi (Tabel 1):* 7 parameter komparasi teknis dan ekonomis.
  - *Subpoint 6.4 — Empat Pilar Kebaruan Grossmart:*
    1. Alur Tutup Kasir Buta (*Blind Cash-Up*) Berbasis Kalkulator Pecahan Rupiah.
    2. Aksesibilitas Sensorik Lanjut Usia Mengacu WCAG 2.1 (Target sentuh 56px, kontras >7:1, audio feedback).
    3. Arsitektur Mandiri Tanpa Biaya Berlangganan (Aplikasi Kasir Mandiri Bebas Biaya Sewa).
    4. Digitalisasi Dinamika Komunitas Warung (Skema titipan tetangga & konversi repack dus-ke-saset).

---

### Point 7: Deskripsi dan Solusi Digital
- **Instruksi Template (P71–P76):**
  - Gambaran menyeluruh konsep sistem, fungsi utama, dan alur kerja pengguna interaktif.
  - Menekankan kesesuaian antara fitur yang dibangun dengan kebutuhan nyata pengguna (fokus, efisien, tanpa fitur berlebih).
  - Pendekatan teknologi secara konseptual yang realistis dan aplikatif.
  - Memperhatikan aspek etika, perlindungan data, keamanan sistem, dan keberlanjutan.
- **Rencana Pengisian Subpoint:**
  - *Subpoint 7.1 — Konsep Solusi & Arsitektur Monolitik Modern:* Framework Laravel 11 (backend bisnis & integritas data), React 18 + TypeScript (antarmuka reaktif), Inertia.js (integrasi tanpa API boilerplate terpisah), MySQL/MariaDB InnoDB (transaksi ACID).
  - *Subpoint 7.2 — Lima Pilar Fungsional Grossmart:*
    1. Modul Kasir POS Cepat Ergonomis: Tombol uang pas, tombol pecahan lembaran rupiah, parkir keranjang belanja.
    2. Modul Kontrol Shift & Laci Kas: Pencatatan modal awal, setor kas aman ke pemilik (*cash drop*), tutup kasir buta.
    3. Modul Manajemen Katalog, Stok & Repack: Audit stok berkala, konversi satuan dus ke renceng/butir otomatis mengkalkulasi HPP.
    4. Modul Transaksi Komunitas: Fondasi skema titipan warga dan pencatatan buku utang tempo pelanggan.
    5. Modul Dashboard Pemilik Toko: Ringkasan omzet, laba kotor, dan log audit operasional.
- *Subpoint 7.3 — Alur Pengguna Terpadu (Unified User Flow):* Narasi alur operasional dari buka toko jam 06.00 hingga tutup toko jam 21.00; rujuk *Gambar 2 di Lampiran 2*.
  - *Subpoint 7.4 — Skema Basis Data Terstruktur:* Penjelasan relasi 31 tabel domain bisnis (plus 8 tabel framework Laravel, total 39 tabel dengan 32 model Eloquent) dengan penegakan *foreign key constraints* dan *indexing*.
  - *Subpoint 7.5 — Arsitektur PWA & Strategi Offline Resilience:* Service Worker caching mandiri (*Cache-First* untuk antarmuka aset CSS/JS; *Network-Only* dengan penanganan error ramah untuk transaksi uang kas).

---

### Point 8: Metodologi dan Rancangan Teknis
- **Instruksi Template (P79–P83):**
  - Pendekatan metodologi pengembangan aplikasi yang sistematis, terencana, dan dapat dipertanggungjawabkan.
  - Tahapan kerja terstruktur: analisis kebutuhan, perancangan sistem, pengkodean, dan pengujian.
  - Rancangan teknis konseptual: arsitektur sistem, struktur modul, pemrosesan data, interaksi sistem-pengguna.
  - Aspek keamanan dan keandalan sistem: manajemen hak akses (*Role-Based Access Control*), keamanan data, dan mekanisme penanganan kesalahan.
- **Rencana Pengisian Subpoint:**
  - *Subpoint 8.1 — Metodologi Rekayasa Perangkat Lunak:* Siklus iteratif menggabungkan ketegasan rekayasa backend dengan ketangkasan Human-Centered Design (HCD) antarmuka.
    - Tahap 1: Wawancara lapangan & pemodelan domain warung.
    - Tahap 2: Perancangan ergonomis antarmuka & skema relasi database.
    - Tahap 3: Pengkodean terstruktur komponen React & controller Laravel.
    - Tahap 4: Pengujian otomatis PHPUnit & UAT bersama kasir lansia.
- *Subpoint 8.2 — Rancangan Teknis & Alur Data:* Komunikasi client-server melalui Inertia.js protocol; rujuk *Gambar 1 di Lampiran 1*.
  - *Subpoint 8.3 — Integritas & Keamanan Transaksional:*
    - Database Transactions (`DB::transaction`) dengan isolasi level `REPEATABLE READ` untuk mencegah stok minus atau uang gantung saat transaksi serentak.
    - Manajemen Hak Akses RBAC (Peran Pemilik vs Kasir): Kasir tidak memiliki akses melihat HPP, laba kotor, atau membatalkan transaksi sepihak tanpa otorisasi sesi pemilik (RBAC role:owner).
    - Proteksi CSRF, sanitasi input Form Request, dan audit trail log aktivitas pada setiap perubahan data finansial.

---

### Point 9: Analisis Kebutuhan Pengguna
- **Instruksi Template (P86–P90):**
  - Pemahaman karakteristik pengguna sasaran, aktivitas operasional, dan kendala nyata dalam kondisi eksisting.
  - Ekspektasi fungsional dan kenyamanan interaksi (mudah dipahami, tidak rumit, tidak membuat panik).
  - Kebutuhan pendukung: keandalan sistem, privasi data, dan fleksibilitas penggunaan lintas perangkat.
- **Rencana Pengisian Subpoint:**
  - *Subpoint 9.1 — Persona Pengguna Sasaran:*
    1. Persona 1: [DUMMY_REPLACE: H. Bambang Sudarsono] (58 tahun, Pengelola Gerai Mitra RPTRA Jatinegara) — fokus pada rekap cepat, keamanan arus kas, dan kejelasan laporan.
    2. Persona 2: [DUMMY_REPLACE: Ibu Sumiyati] (61 tahun, Kasir/Keluarga Pemilik) — fokus pada kemudahan membaca teks, tombol besar, kepastian uang kembalian, dan ketiadaan istilah bahasa Inggris.
  - *Subpoint 9.2 — Analisis Kendala Sensorik dan Solusi Ergonomi:*
    - Penurunan visual diatasi dengan tipografi 16–44px dan rasio kontras >7:1.
    - Tremor jari tangan diatasi dengan target sentuh tombol minimal 56px dan spasi antar tombol lebar (pencegahan salah sentuh tombol).
    - Beban kognitif diatasi dengan alur linear satu layar dan tombol cepat nominal uang pas/pecahan rupiah.
  - *Subpoint 9.3 — Umpan Balik Nada Audio Penanda Aksi:* Web Audio API sintesis lokal (*beep* saat scan sukses, *chime* saat pembayaran tuntas, *buzz* rendah saat ada peringatan).
  - *Subpoint 9.4 — Lokalisasi Bahasa Ramah Warung:* 100% kosakata bahasa Indonesia komunikatif (Batal Transaksi bukan *Void*, Bayar bukan *Checkout*, Parkir Keranjang bukan *Hold Cart*).

---

### Point 10: Dampak Kebermanfaatan Dan Keberlanjutan
- **Instruksi Template (P93–P97):**
  - Perubahan positif nyata dan terukur setelah aplikasi diterapkan (efisiensi, akurasi, kualitas layanan, transparansi).
  - Kebermanfaatan langsung yang dirasakan pengguna dalam aktivitas sehari-hari.
  - Aspek keberlanjutan dari sisi teknologi, operasional, dan pengelolaan (kemudahan pemeliharaan, tanpa biaya lisensi berkelanjutan, fleksibilitas integrasi masa depan).
- **Rencana Pengisian Subpoint:**
  - *Subpoint 10.1 — Indikator Kuantitatif Keberhasilan (Tabel 5):*
    - Waktu rekap harian: dari 60 menit menjadi <15 menit per hari.
    - Kesesuaian stok fisik dan sistem: meningkat dari <75% menjadi >95%.
    - Kejadian selisih kas tak terjelaskan: turun drastis hingga mendekati Rp 0.
    - Waktu layanan kasir: rata-rata transaksi diselesaikan dalam <45 detik.
  - *Subpoint 10.2 — Instrumen Pengujian Usabilitas SUS (Tabel 6):* Evaluasi kemudahan sistem bagi lansia menggunakan kuesioner System Usability Scale dengan target skor rata-rata >75 (Grade B / Good) hingga >80 (Grade A / Excellent).
  - *Subpoint 10.3 — Keberlanjutan Teknologi & Finansial:* Bebas ketergantungan langganan SaaS, berjalan pada komputer bekas/murah di warung, dan kode program mudah dipelihara secara mandiri.
  - *Subpoint 10.4 — Manajemen Risiko & Prosedur Mitigasi (Tabel 7):* Prosedur darurat nota fisik saat pemadaman listrik/server lokal mati, disusul entri susulan tanpa merusak integritas data.

---

### Point 11: Aspek Etika, Legalitas dan Potensi HKI
- **Instruksi Template (P100–P104):**
  - Komitmen pengembangan yang bertanggung jawab (prinsip keadilan, transparansi, non-diskriminatif).
  - Kepatuhan terhadap hukum dan peraturan perundang-undangan (perlindungan data pribadi pengguna, lisensi perangkat lunak).
  - Potensi Hak Kekayaan Intelektual (Hak Cipta program komputer, desain antarmuka, paten metode).
- **Rencana Pengisian Subpoint:**
  - *Subpoint 11.1 — Kepatuhan Etika Kerja Warung:* Pemantauan aktivitas kasir disosialisasikan sebagai instrumen transparansi bersama, bukan pengawasan intimidatif.
  - *Subpoint 11.2 — Kepatuhan Regulasi UU PDP No. 27/2022:* Pembatasan pengumpulan data pribadi (hanya mencatat nama dan kontak pelanggan yang mengambil utang tempo; pembeli tunai bebas dari pencatatan identitas).
  - *Subpoint 11.3 — Lisensi Open-Source Komponen:* Mematuhi lisensi komponen pendukung (MIT License pada Laravel dan React).
  - *Subpoint 11.4 — Rencana Pendaftaran HKI:*
    - Hak Cipta Perangkat Lunak untuk kode program Grossmart ke DJKI Kemenkumham RI.
    - Hak Cipta Desain Antarmuka (*User Interface*) Ergonomis Ramah Lansia.

---

### Point 12: Penutup
- **Instruksi Template (P107–P110):**
  - Rangkuman menyeluruh gagasan, tujuan, dan nilai utama solusi digital.
  - Penegasan bahwa aplikasi memiliki potensi diterapkan nyata dan bernilai guna, bukan sekadar ide di atas kertas.
  - Penegasan keselarasan dengan semangat inovasi dan transformasi digital GEMASTIK.
- **Rencana Pengisian Subpoint:**
  - Sintesis transformasi digital warung tradisional sebagai pilar kedaulatan ekonomi rakyat.
  - Penegasan kesiapan implementasi: arsitektur monolitik yang telah teruji secara fungsional, antarmuka responsif ramah lansia, dan kontrol finansial yang melindungi pedagang.
  - Harapan dampak positif Grossmart sebagai pionir perangkat lunak kasir inklusif di Indonesia.

---

### Point 13: Daftar Pustaka dan lampiran

#### Subpoint 13.1: Daftar Pustaka
- **Instruksi Template (P113–P116):**
  - Memuat rujukan yang berkaitan langsung dengan masalah, solusi digital, metodologi, dan aspek etika/legalitas.
  - Sumber mutakhir dan terpercaya (jurnal ilmiah, regulasi resmi, buku teks, dokumentasi resmi).
  - Format konsisten sesuai standar APA Style (American Psychological Association) 7th Edition.
- **Rencana Pengisian:**
  - 12 entri rujukan lengkap mencakup: UU PDP No. 27/2022, Berita ANTARA 2026, Kurniawan & Zaphiris (HCI Lansia), Brooke (SUS 1996), Sauro & Lewis (2012), WCAG 2.1 (W3C), OWASP Top 10 (2021), Somerville (Software Engineering), dokumentasi resmi Laravel 11, React, Inertia.js, dan Web Audio API.

#### Subpoint 13.2: Lampiran
- **Instruksi Template (P119–P122):**
  - Memuat dokumen pendukung yang relevan tanpa mengganggu alur bacaan utama: mockup antarmuka detail, diagram sistem, alur proses, instrumen evaluasi, dan pembagian tugas tim.
  - Disusun sistematis, diberi takarir penjelas informatif, dan dirujuk langsung pada naskah utama proposal.
- **Rencana Pengisian:**
  - Lampiran 1: Diagram Arsitektur Sistem Monolitik Grossmart (*architecture.png*).
  - Lampiran 2: Diagram Alur Pengguna Terpadu (*user_flow.png*).
  - Lampiran 3: Tangkapan Layar Antarmuka Login Kasir Cepat (*screen_login.png*).
  - Lampiran 4: Tangkapan Layar Antarmuka Kasir POS Ergonomis Lansia (*screen_pos.png*).
  - Lampiran 5: Tangkapan Layar Formulir Tutup Shift Buta (*screen_shift_close.png*).
  - Lampiran 6: Tangkapan Layar Dashboard Pemilik & Rekonsiliasi Kas (*screen_dashboard.png*).
  - Lampiran 7: Tangkapan Layar Manajemen Katalog, Repack & Konsinyasi (*screen_products.png*).
  - Lampiran 8: Skenario Operasional Pengujian Fitur & Pembagian Kontribusi Anggota Tim.

## 4. Pemetaan Aset Visual (7 Gambar) dan Tabel Data (7 Tabel)

### A. Pemetaan 7 Figur Visual (Folder `figures/`):
1. **Gambar 1 (`figures/architecture.png`):** Arsitektur Monolitik Modern Grossmart (Laravel 11, React Inertia, MySQL/MariaDB, dan PWA Service Worker caching).
2. **Gambar 2 (`figures/user_flow.png`):** Alur Pengguna Terpadu (*Unified User Flow*) dari Buka Shift, Transaksi Penjualan, Parkir Keranjang, hingga Tutup Kasir Buta (*Blind Cash-Up*).
3. **Gambar 3 (`figures/screen_login.png`):** Antarmuka Autentikasi Pengguna dengan Tombol Akses Cepat Kasir.
4. **Gambar 4 (`figures/screen_dashboard.png`):** Dashboard Pemilik Toko untuk Pemantauan Arus Kas, Ringkasan Laba Kotor, dan Peringatan Stok Minimum.
5. **Gambar 5 (`figures/screen_pos.png`):** Antarmuka Kasir POS Ergonomis Lansia dengan Tombol Sentuh 56px, Pencarian Cepat, dan Kalkulator Pecahan Uang Rupiah.
6. **Gambar 6 (`figures/screen_products.png`):** Antarmuka Manajemen Katalog Barang, Konversi Dus-ke-Eceran (*Repack*), dan Konsinyasi Warga.
7. **Gambar 7 (`figures/screen_shift_close.png`):** Formulir Tutup Shift Buta (*Blind Cash-Up*) dengan Kalkulator Lembaran Fisik Uang Rupiah dan Rekonsiliasi Otomatis.

### B. Pemetaan 7 Tabel Data Utama Naskah:
1. **Tabel 1:** Matriks Komparasi Fitur Solusi Kasir Komersial dan Grossmart.
2. **Tabel 2:** Pemetaan Komponen Arsitektur Sistem Grossmart (32 Model Eloquent / 31 Tabel Domain Warung + 8 Tabel Framework Laravel).
3. **Tabel 3:** Profil Persona Pengguna Toko Kelontong (Pemilik & Kasir Lansia).
4. **Tabel 4:** Kepatuhan Standar Aksesibilitas WCAG 2.1 AAA pada Grossmart.
5. **Tabel 5:** Sasaran Dampak Operasional dan Target Metrik Pengujian Kuantitatif.
6. **Tabel 6:** Instrumen Evaluasi Usability Kasir Lansia (System Usability Scale / SUS).
7. **Tabel 7:** Matriks Risiko Operasional dan Tindakan Mitigasi Toko Kelontong.

## 5. Checklist Validasi Data (`INPUT_DATA.md`)

Status data input saat ini (telah diisi data dummy bertanda `[DUMMY_REPLACE: ...]`):
- [x] **Identitas Tim:** Muhammad Fakhri Al-Faruq (Ketua), Budi Prasetyo Utomo (Anggota 1), Siti Rahmawati Dewi (Anggota 2), Universitas Bina Sarana Informatika.
- [x] **Data Mitra Toko:** RPTRA Jatinegara (unit gerai/koperasi kelontong komunitas warga), Jl. Swadaya No.12A 7, RT.7/RW.14, Jatinegara, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13930 (Lama Usaha: 10 Tahun).
- [x] **Kutipan Wawancara (Dummy Aktif):** Wawancara kendala mata lelah, nota hilang, dan kalkulator kecil.
- [x] **Data Kompetitor (Dummy Aktif):** URL resmi dan verifikasi model biaya per 10 Maret 2026.
- [x] **Sitasi Jurnal & Regulasi (Dummy Aktif):** UU PDP No. 27/2022, Berita ANTARA 2026, Kurniawan & Zaphiris (HCI elderly), Brooke (SUS), WCAG 2.1, OWASP Top 10, dokumentasi Laravel & React.

*Catatan: Seluruh data di atas siap dipakai sementara untuk penyusunan proposal, dan dapat diganti kapan saja dengan data riil melalui pencarian kata kunci `[DUMMY_REPLACE:`.*

---

## 6. Tahapan Eksekusi Berikutnya

1. **Fase 1 (Pengembangan `PROPOSAL_FULL.md`):** Susun naskah secara proporsional dengan isi dan kebutuhan template; jumlah halaman bukan target tetap dan batas akhir maksimal 30 halaman. Sertakan tabel yang relevan, rujukan silang ke tujuh figur lampiran, dan token `[DUMMY_REPLACE: ...]` untuk identitas tim serta mitra.
2. **Fase 2 (Review & Verifikasi Markdown):** Pastikan seluruh alur, terminologi, dan konsistensi naskah telah solid dan tuntas tanpa ada bagian yang terputus.
3. **Fase 3 (Finalisasi Konten Riil):** Pengguna mengganti data `[DUMMY_REPLACE: ...]` dengan nama tim dan toko mitra asli.
4. **Fase 4 (Render Naskah Word Baru):** Berkas `Proposal Transformasi Digital - Grossmart.docx` di-generate ulang dari `PROPOSAL_FULL.md` yang sudah final dan lengkap. Panjang akhir bersifat fleksibel dan proporsional, serta **tidak boleh melebihi 30 halaman**.
