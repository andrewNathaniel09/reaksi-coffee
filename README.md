# ☕ Kopi Logbook - Reaksi Haus POS

Aplikasi Point of Sale (POS) berbasis Web/Progressive Web App (PWA) yang dirancang khusus untuk kedai kopi **Reaksi Haus**. Aplikasi ini beroperasi secara _offline-first_ di sisi klien dan dapat langsung terhubung ke mesin printer thermal kasir tanpa memerlukan aplikasi pihak ketiga.

## ✨ Fitur Utama

- **Sistem Keranjang Belanja (Cart):** Memproses pesanan ganda dengan mudah, lengkap dengan fitur perhitungan kuantitas otomatis.
- **Direct Bluetooth Thermal Printing:** Mencetak struk langsung ke printer thermal (ESC/POS) dari _browser_ web menggunakan teknologi **Web Bluetooth API**.
- **Add-ons & Kategori Fleksibel:** Pengelompokan menu (Kopi, Non-Kopi, Makanan) dan tambahan dinamis (contoh: _Add-on Oat Milk_).
- **Laporan Otomatis (Export to PDF):** Menghasilkan rekapitulasi penjualan (Harian, Mingguan, Bulanan) dalam format PDF yang rapi menggunakan `jsPDF` & `jspdf-autotable`.
- **Offline-First Database:** Semua data transaksi tersimpan aman di penyimpanan lokal perangkat kasir menggunakan IndexedDB (`Dexie.js`).
- **Antarmuka Mobile-Friendly:** Desain UI/UX yang disesuaikan secara khusus untuk kenyamanan operasional kasir via _smartphone_.

## 🛠️ Teknologi yang Digunakan

- **Frontend:** React.js, Vite
- **Styling:** Tailwind CSS (dengan _custom glassmorphism UI_)
- **Database:** Dexie.js (IndexedDB wrapper)
- **Cetak Laporan:** jsPDF, jsPDF-AutoTable
- **Integrasi Hardware:** Web Bluetooth API (ESC/POS Commands)
- **Deployment:** Vercel

## 🚀 Cara Menjalankan Secara Lokal

1. Clone repositori ini:
   ```bash
   git clone [https://github.com/USERNAME_ANDA/reaksi-coffee.git](https://github.com/USERNAME_ANDA/reaksi-coffee.git)
   ```
