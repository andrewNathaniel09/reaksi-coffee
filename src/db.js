import Dexie from "dexie";

export const db = new Dexie("ReaksiDB");

db.version(1).stores({
  transaksi: "++id, nama_kopi, harga, metode_bayar, waktu, tanggal",
});
