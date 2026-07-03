import React, { useState, useRef } from "react";
import { db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// KOMPONEN 1: HALAMAN SALES (KLASIK + KERANJANG)

const SalesView = ({ today, onPrint }) => {
  const [activeCategory, setActiveCategory] = useState("Kopi");
  const [metodeBayar, setMetodeBayar] = useState("CASH");
  const [useOatMilk, setUseOatMilk] = useState(false);

  const [cart, setCart] = useState([]);

  const riwayatTransaksi = useLiveQuery(() => db.transaksi.where({ tanggal: today }).toArray(), [today]) || [];

  const totalHariIni = riwayatTransaksi.reduce((sum, item) => sum + item.harga, 0);
  const totalCash = riwayatTransaksi.filter((i) => i.metode_bayar === "CASH").reduce((sum, item) => sum + item.harga, 0);
  const totalQris = riwayatTransaksi.filter((i) => i.metode_bayar === "QRIS").reduce((sum, item) => sum + item.harga, 0);

  const menuItems = [
    { name: "Reaksi Berry", price: 20000, label: "20k", category: "Kopi" },
    { name: "Irish Gogo", price: 20000, label: "20k", category: "Kopi" },
    { name: "Americano", price: 20000, label: "20k", category: "Kopi" },
    { name: "Cappucino", price: 20000, label: "20k", category: "Kopi" },
    { name: "Flocano", price: 20000, label: "20k", category: "Kopi" },
    { name: "Black Magic", price: 20000, label: "20k", category: "Kopi" },
    { name: "Matcha", price: 20000, label: "20k", category: "Selain Kopi" },
    { name: "Chocolate", price: 20000, label: "20k", category: "Selain Kopi" },
    { name: "Chory", price: 20000, label: "20k", category: "Selain Kopi" },
    { name: "Juliet Son", price: 20000, label: "20k", category: "Selain Kopi" },
    { name: "Marie", price: 20000, label: "20k", category: "Selain Kopi" },
    { name: "Mount Bank", price: 25000, label: "25k", category: "Signature" },
    { name: "Magic", price: 25000, label: "25k", category: "Signature" },
    { name: "Dirty Latte", price: 32000, label: "25k", category: "Signature" },
    { name: "Cloud Matcha", price: 32000, label: "25k", category: "Signature" },
    { name: "Basreng", price: 13000, label: "13k", category: "Makanan" },
    { name: "Cookies", price: 10000, label: "10k", category: "Makanan" },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.category === activeCategory);

  const handleAddToBag = (item) => {
    const isDrink = ["Kopi", "Selain Kopi", "Signature"].includes(item.category);
    const namaFinal = item.name + (useOatMilk && isDrink ? " + Oat Milk" : "");
    const hargaFinal = item.price + (useOatMilk && isDrink ? 5000 : 0);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.name === namaFinal);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].qty += 1;
        return newCart;
      } else {
        return [...prevCart, { name: namaFinal, price: hargaFinal, qty: 1 }];
      }
    });
    setUseOatMilk(false);
  };

  const handleUpdateQty = (index, amount) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[index].qty += amount;
      if (newCart[index].qty <= 0) newCart.splice(index, 1);
      return newCart;
    });
  };

  const grandTotalKeranjang = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSimpanTransaksi = async (harusCetak = false) => {
    if (cart.length === 0) return alert("Pilih minimal satu menu terlebih dahulu!");
    const waktuSaatIni = new Date();
    const ringkasanMenu = cart.map((i) => `${i.qty}x ${i.name}`).join(", ");

    const dataTransaksi = {
      nama_kopi: ringkasanMenu,
      items: cart,
      harga: grandTotalKeranjang,
      metode_bayar: metodeBayar,
      waktu: waktuSaatIni.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      tanggal: waktuSaatIni.toLocaleDateString("id-ID"),
    };

    const insertedId = await db.transaksi.add(dataTransaksi);

    if (harusCetak) {
      onPrint({ id: insertedId, ...dataTransaksi });
    }

    setCart([]);
  };

  const handleHapus = async (id) => {
    if (confirm("Yakin ingin menghapus catatan ini?")) await db.transaksi.delete(id);
  };

  return (
    <main className="flex-1 px-5 pt-24 space-y-6 pb-28">
      {/* Summary Section */}
      <section className="space-y-2">
        <div className="bg-surface-container rounded-2xl p-4 border border-white/10 flex flex-col gap-1 item-card">
          <span className="text-xs text-on-surface-variant">Total Hari Ini</span>
          <span className="text-3xl font-bold text-on-surface">Rp {totalHariIni.toLocaleString("id-ID")}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container rounded-2xl p-4 border border-white/10 flex flex-col gap-1 item-card relative overflow-hidden text-amber">
            <div className="absolute -right-2 -top-2 w-12 h-12 bg-amber/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span className="text-xs">Total Cash</span>
            </div>
            <span className="text-xl font-semibold text-on-surface">Rp {totalCash.toLocaleString("id-ID")}</span>
          </div>
          <div className="bg-surface-container rounded-2xl p-4 border border-white/10 flex flex-col gap-1 item-card relative overflow-hidden text-mint">
            <div className="absolute -right-2 -top-2 w-12 h-12 bg-mint/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span className="text-xs">Total QRIS</span>
            </div>
            <span className="text-xl font-semibold text-on-surface">Rp {totalQris.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </section>

      {/* Form Input Klasik */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-white/10 space-y-4 ambient-glow">
        <div>
          <label className="text-xs text-on-surface-variant block mb-3">Pilih Kategori & Menu</label>
          <div className="flex gap-2 mb-3 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
            {["Kopi", "Selain Kopi", "Signature", "Makanan"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setUseOatMilk(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? "bg-primary text-on-primary shadow-[0_2px_10px_rgba(131,217,156,0.3)]" : "bg-surface-container text-on-surface-variant border border-white/5"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Menu */}
          <div className="grid grid-cols-3 gap-2">
            {filteredMenuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddToBag(item)}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center gap-1 min-h-[65px] active:scale-95 transition-transform"
              >
                <span className="text-[11px] text-center font-medium leading-tight">{item.name}</span>
                <span className="text-[9px] text-on-surface-variant">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION ADD-ONS OAT MILK */}
        {["Kopi", "Selain Kopi", "Signature"].includes(activeCategory) && (
          <button
            type="button"
            onClick={() => setUseOatMilk(!useOatMilk)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex justify-between items-center transition-all border ${useOatMilk ? "bg-primary/20 text-primary border-primary/40" : "bg-surface-container text-on-surface-variant border-white/5"}`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>Aktifkan Oat Milk (Klik sebelum pilih menu)</span>
            </div>
            <span className="font-bold text-primary">+Rp 5k</span>
          </button>
        )}

        {/* MINI KERANJANG - Tampil elegan hanya saat ada barang dipilih */}
        {cart.length > 0 && (
          <div className="bg-surface-container-lowest border border-white/10 rounded-xl p-3 space-y-2 max-h-[140px] overflow-y-auto">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="text-xs">
                  <span className="font-semibold text-on-surface">{item.name}</span>
                  <span className="text-[10px] text-on-surface-variant block">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-1">
                  <button type="button" onClick={() => handleUpdateQty(index, -1)} className="text-on-surface-variant font-bold px-1 hover:text-white">
                    -
                  </button>
                  <span className="text-xs font-bold w-3 text-center">{item.qty}</span>
                  <button type="button" onClick={() => handleUpdateQty(index, 1)} className="text-on-surface-variant font-bold px-1 hover:text-white">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KOLOM HARGA KLASIK - Sekarang otomatis menghitung dari keranjang */}
        <div className="relative pt-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xl font-bold text-on-surface-variant pt-2">Rp</span>
          <input
            readOnly
            className="block w-full pl-12 pr-10 py-3 bg-transparent border-0 border-b-2 border-outline-variant text-2xl font-bold text-primary outline-none cursor-default"
            type="text"
            value={grandTotalKeranjang === 0 ? "0" : grandTotalKeranjang.toLocaleString("id-ID")}
            placeholder="0"
          />
        </div>

        {/* Tombol Pembayaran */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMetodeBayar("CASH")}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold border transition-all ${metodeBayar === "CASH" ? "bg-amber/20 text-amber border-amber/50" : "bg-surface-container text-on-surface-variant border-white/10"}`}
          >
            <span className="material-symbols-outlined text-[20px]">payments</span> CASH
          </button>
          <button
            type="button"
            onClick={() => setMetodeBayar("QRIS")}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold border transition-all ${metodeBayar === "QRIS" ? "bg-mint/20 text-mint border-mint/50" : "bg-surface-container text-on-surface-variant border-white/10"}`}
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span> QRIS
          </button>
        </div>

        {/* Tombol Simpan */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => handleSimpanTransaksi(false)} className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs py-4 rounded-xl font-bold transition-all border border-white/5">
            SIMPAN SAJA
          </button>
          <button
            type="button"
            onClick={() => handleSimpanTransaksi(true)}
            className="flex-[2] bg-primary text-on-primary text-xs py-4 rounded-xl font-bold shadow-[0_4px_15px_rgba(131,217,156,0.3)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">print</span> SIMPAN & CETAK
          </button>
        </div>
      </section>

      {/* Log Hari Ini */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-on-surface">Pesanan Hari Ini</h2>
        <div className="flex flex-col gap-2">
          {[...riwayatTransaksi].reverse().map((log) => (
            <div key={log.id} className="bg-surface-container rounded-xl p-3 border border-white/10 flex items-center justify-between item-card">
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant w-10">{log.waktu}</span>
                <div>
                  <p className="text-xs font-semibold text-on-surface truncate max-w-[140px]">{log.nama_kopi}</p>
                  <p className="text-xs text-on-surface-variant">Rp {log.harga.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`border px-2 py-1 rounded text-[8px] font-bold uppercase ${log.metode_bayar === "QRIS" ? "bg-mint/10 text-mint border-mint/20" : "bg-amber/10 text-amber border-amber/20"}`}>{log.metode_bayar}</span>
                <button type="button" onClick={() => onPrint(log)} className="p-1.5 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[16px]">print</span>
                </button>
                <button type="button" onClick={() => handleHapus(log.id)} className="p-1.5 text-on-surface-variant hover:text-red-400">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
          {riwayatTransaksi.length === 0 && <p className="text-center text-sm text-on-surface-variant py-4">Belum ada pesanan hari ini.</p>}
        </div>
      </section>
    </main>
  );
};

// KOMPONEN 2 & 3: HISTORY & EXPORT (Standar)

const HistoryView = ({ onPrint }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const semuaTransaksi = useLiveQuery(() => db.transaksi.reverse().toArray(), []) || [];

  const filteredData = semuaTransaksi.filter((item) => item.nama_kopi.toLowerCase().includes(searchQuery.toLowerCase()) || item.tanggal.includes(searchQuery));

  const groupedData = filteredData.reduce((groups, item) => {
    const date = item.tanggal;
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <main className="flex-1 px-5 pt-24 space-y-6 pb-28">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant">search</span>
        <input
          type="text"
          placeholder="Search menu item or date..."
          className="w-full bg-surface-container border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface focus:border-primary outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {Object.keys(groupedData).map((date) => {
          const txs = groupedData[date];
          const total = txs.reduce((sum, t) => sum + t.harga, 0);
          return (
            <div key={date} className="space-y-3">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-on-surface">{date === new Date().toLocaleDateString("id-ID") ? "Today" : date}</h3>
                <p className="text-sm font-bold text-primary">Rp {total.toLocaleString("id-ID")}</p>
              </div>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div key={tx.id} className="bg-surface-container rounded-xl p-3 border border-white/5 flex items-center justify-between">
                    <div className="max-w-[70%]">
                      <p className="text-xs font-semibold text-on-surface truncate">{tx.nama_kopi}</p>
                      <span className="text-[9px] text-on-surface-variant uppercase">
                        {tx.waktu} • {tx.metode_bayar}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold text-on-surface">Rp {tx.harga.toLocaleString("id-ID")}</p>
                      <button type="button" onClick={() => onPrint(tx)} className="p-1 text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined text-[18px]">print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

const ExportView = () => {
  const [dateRange, setDateRange] = useState("This Week");
  const semuaTransaksi = useLiveQuery(() => db.transaksi.toArray(), []) || [];
  const parseDateStr = (dateStr) => {
    if (!dateStr) return new Date(0);
    const [day, month, year] = dateStr.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const filteredData = semuaTransaksi.filter((tx) => {
    const txDate = parseDateStr(tx.tanggal);
    if (dateRange === "Today") return txDate >= today;
    if (dateRange === "This Week") return txDate >= startOfWeek;
    if (dateRange === "This Month") return txDate >= startOfMonth;
    return true;
  });

  const totalSales = filteredData.reduce((sum, tx) => sum + tx.harga, 0);
  const totalTxs = filteredData.length;

  const handleDownloadPDF = () => {
    if (filteredData.length === 0) return alert("Tidak ada transaksi.");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Laporan Penjualan Reaksi Haus", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Rentang: ${dateRange} | Total Nota: ${totalTxs} | Pendapatan: Rp ${totalSales.toLocaleString("id-ID")}`, 14, 28);

    const tableRows = filteredData.map((item) => [item.tanggal, item.waktu, item.nama_kopi, `Rp ${item.harga.toLocaleString("id-ID")}`, item.metode_bayar]);
    autoTable(doc, { head: [["Tanggal", "Waktu", "Menu", "Harga", "Bayar"]], body: tableRows, startY: 36, theme: "grid", headStyles: { fillColor: [46, 125, 50] }, styles: { fontSize: 8 } });

    let namaFile = `Laporan_Reaksi_Haus_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.pdf`;
    if (dateRange === "This Week") namaFile = "Laporan_Reaksi_Haus_Mingguan.pdf";
    if (dateRange === "This Month") namaFile = "Laporan_Reaksi_Haus_Bulanan.pdf";
    doc.save(namaFile);
  };

  return (
    <main className="flex-1 px-5 pt-24 space-y-8 pb-28">
      <div className="grid grid-cols-2 gap-3">
        {["Today", "This Week", "This Month", "All Time"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${dateRange === range ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant border border-white/5"}`}
          >
            {range}
          </button>
        ))}
      </div>
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase">Preview: {dateRange}</p>
        <p className="text-3xl font-bold text-on-surface">Rp {totalSales.toLocaleString("id-ID")}</p>
        <p className="text-xs text-on-surface-variant">{totalTxs} Total transaksi</p>
      </section>
      <button onClick={handleDownloadPDF} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold flex justify-center gap-2">
        <span className="material-symbols-outlined">picture_as_pdf</span> UNDUH LAPORAN PDF
      </button>
    </main>
  );
};

// KOMPONEN UTAMA (SISTEM DIRECT BLUETOOTH ESC/POS)

export default function App() {
  const [activeTab, setActiveTab] = useState("sales");
  const today = new Date().toLocaleDateString("id-ID");

  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const printCharacteristicRef = useRef(null);

  const connectBluetoothPrinter = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2", "49535343-fe7d-4ae5-8fa9-9fafd205e455"],
      });

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const characteristic of characteristics) {
          if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
            printCharacteristicRef.current = characteristic;
            setIsPrinterConnected(true);
            device.addEventListener("gattserverdisconnected", () => {
              setIsPrinterConnected(false);
              printCharacteristicRef.current = null;
            });
            alert("✅ Printer Berhasil Terhubung!");
            return true;
          }
        }
      }
      alert("❌ Printer tidak memiliki saluran komunikasi yang cocok.");
      return false;
    } catch (error) {
      if (error.name !== "NotFoundError") alert("❌ Gagal hubungkan printer. Pastikan Bluetooth aktif. Detail: " + error.message);
      return false;
    }
  };

  const handleTriggerPrint = async (item) => {
    if (!printCharacteristicRef.current) {
      const connected = await connectBluetoothPrinter();
      if (!connected) return;
    }

    try {
      const encoder = new TextEncoder();
      let buffer = [];

      const addCmd = (cmd) => buffer.push(...cmd);
      const addText = (text) => buffer.push(...encoder.encode(text));
      const addLine = (text) => addText(text + "\n");

      const CMD_INIT = [0x1b, 0x40];
      const CMD_ALIGN_LEFT = [0x1b, 0x61, 0x00];
      const CMD_ALIGN_CENTER = [0x1b, 0x61, 0x01];
      const CMD_BOLD_ON = [0x1b, 0x45, 0x01];
      const CMD_BOLD_OFF = [0x1b, 0x45, 0x00];
      const CMD_FEED_LINES = [0x0a, 0x0a, 0x0a, 0x0a];

      // Header
      addCmd(CMD_INIT);
      addCmd(CMD_ALIGN_CENTER);
      addCmd(CMD_BOLD_ON);
      addLine("REAKSI HAUS");
      addCmd(CMD_BOLD_OFF);
      addLine('"My House Still Haus"');
      addLine("--------------------------------");

      addCmd(CMD_ALIGN_LEFT);
      addLine(`Nota   : #RH-${item.id}`);
      addLine(`Waktu  : ${item.tanggal} ${item.waktu}`);
      addLine("--------------------------------");

      // Looping Belanja (Banyak menu)
      if (item.items) {
        item.items.forEach((i) => {
          const leftText = `${i.qty}x ${i.name}`;
          const rightText = (i.price * i.qty).toLocaleString("id-ID");
          if (leftText.length + rightText.length > 31) {
            addLine(leftText);
            addLine(" ".repeat(32 - rightText.length) + rightText);
          } else {
            addLine(leftText + " ".repeat(32 - leftText.length - rightText.length) + rightText);
          }
        });
      } else {
        const lTxt = `1x ${item.nama_kopi}`;
        const rTxt = item.harga.toLocaleString("id-ID");
        const pad = 32 - lTxt.length - rTxt.length;
        addLine(lTxt + " ".repeat(pad > 0 ? pad : 1) + rTxt);
      }

      // Footer
      addLine("--------------------------------");
      addCmd(CMD_BOLD_ON);
      addLine(`TOTAL DUE : Rp ${item.harga.toLocaleString("id-ID")}`);
      addCmd(CMD_BOLD_OFF);
      addLine(`PAYMENT   : ${item.metode_bayar}`);
      addLine("--------------------------------");
      addCmd(CMD_ALIGN_CENTER);
      addLine("Terima Kasih Atas Kunjungannya!");
      addLine("Powered by Reaksi Haus");
      addCmd(CMD_FEED_LINES);

      const uint8 = new Uint8Array(buffer);
      const CHUNK_SIZE = 100;
      for (let i = 0; i < uint8.length; i += CHUNK_SIZE) {
        const chunk = uint8.slice(i, i + CHUNK_SIZE);
        await printCharacteristicRef.current.writeValue(chunk);
      }
    } catch (err) {
      console.error("Print Error:", err);
      alert("❌ Terjadi kesalahan koneksi saat mencetak. Pastikan printer tidak mati/jauh.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      <header className="fixed top-0 w-full max-w-[480px] z-50 border-b border-white/10 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-5 h-16 glass-header">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            coffee
          </span>
          <h1 className="text-xl font-bold text-primary">{activeTab === "sales" ? "Reaksi Haus Coffee" : activeTab === "history" ? "History" : "Export Reports"}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-on-surface-variant hidden sm:block">{today}</span>
          <button
            onClick={connectBluetoothPrinter}
            className={`p-1.5 rounded-full flex items-center justify-center transition-all ${isPrinterConnected ? "bg-mint/10 text-mint shadow-[0_0_10px_rgba(131,217,156,0.3)]" : "bg-surface-container text-on-surface-variant border border-white/10"}`}
          >
            <span className="material-symbols-outlined text-[18px]">{isPrinterConnected ? "bluetooth_connected" : "bluetooth"}</span>
          </button>
        </div>
      </header>

      {activeTab === "sales" && <SalesView today={today} onPrint={handleTriggerPrint} />}
      {activeTab === "history" && <HistoryView onPrint={handleTriggerPrint} />}
      {activeTab === "export" && <ExportView />}

      <nav className="fixed bottom-0 w-full max-w-[480px] z-50 border-t border-white/10 bg-surface-container-lowest/95 backdrop-blur-xl flex justify-around items-center h-20 px-4 pb-safe">
        <button onClick={() => setActiveTab("sales")} className={`flex flex-col items-center justify-center rounded-xl p-2 w-16 ${activeTab === "sales" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[10px] mt-1 font-semibold">Sales</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center justify-center rounded-xl p-2 w-16 ${activeTab === "history" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] mt-1 font-semibold">History</span>
        </button>
        <button onClick={() => setActiveTab("export")} className={`flex flex-col items-center justify-center rounded-xl p-2 w-16 ${activeTab === "export" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined">ios_share</span>
          <span className="text-[10px] mt-1 font-semibold">Export</span>
        </button>
      </nav>
    </div>
  );
}
