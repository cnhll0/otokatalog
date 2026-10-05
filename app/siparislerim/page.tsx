"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SiparislerimPage() {
  const [sorguId, setSorguId] = useState("");
  const [siparis, setSiparis] = useState<any | null>(null);
  const [siparisKalemleri, setSiparisKalemleri] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const sorgula = async (e: React.FormEvent) => {
    e.preventDefault();
    const aranan = sorguId.replace("#", "").trim().toLowerCase();
    if (!aranan) return;

    setYukleniyor(true);
    setHata(null);
    setSiparis(null);
    setSiparisKalemleri([]);

    try {
      // 1. Siparişleri getir (UUID hatasını engellemek için tüm id'leri kontrol et veya tam eşleştir)
      let secilenSiparis: any = null;

      if (aranan.length === 36) {
        // Tam UUID girildiyse direkt eq
        const { data } = await supabase.from("orders").select("*").eq("id", aranan).maybeSingle();
        secilenSiparis = data;
      } else {
        // Kısa kod (ilk 8 karakter) girildiyse son siparişler arasından eşleştir
        const { data: sonSiparisler } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (sonSiparisler) {
          secilenSiparis = sonSiparisler.find((s) =>
            s.id.toLowerCase().startsWith(aranan)
          );
        }
      }

      if (!secilenSiparis) {
        setHata("Sipariş bulunamadı. Lütfen 8 haneli takip kodunuzu doğru girdiğinizden emin olun.");
        setYukleniyor(false);
        return;
      }

      setSiparis(secilenSiparis);

      // 2. Sipariş kalemlerini ve ürün başlıklarını güvenli biçimde çek
      const { data: items } = await supabase
        .from("order_items")
        .select("*, products(title, oem_code)")
        .eq("order_id", secilenSiparis.id);

      if (items) {
        setSiparisKalemleri(items);
      }
    } catch (err: any) {
      setHata("Sorgulama esnasında bir hata oluştu: " + err.message);
    }

    setYukleniyor(false);
  };

  const faturaYazdir = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 print:bg-white print:text-black print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* ÜST GEZİNTİ */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition">
            ← Vitrine Geri Dön
          </Link>
          <span className="text-xs font-bold text-blue-400">OtoKatalog Lojistik & Sipariş Sorgulama</span>
        </div>

        {/* SORGULAMA KARTI */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-white">Sipariş & Fatura Sorgulama</h1>
            <p className="text-xs text-slate-400 mt-1">
              8 haneli takip kodunuzu girerek sipariş durumunu görebilir ve resmi satış fişinizi/faturanızı yazdırabilirsiniz.
            </p>
          </div>

          <form onSubmit={sorgula} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Örn: 3f8a91bc"
              value={sorguId}
              onChange={(e) => setSorguId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={yukleniyor}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              {yukleniyor ? "Aranıyor..." : "Sorgula"}
            </button>
          </form>

          {hata && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {hata}
            </p>
          )}
        </div>

        {/* FATURA & SİPARİŞ FİŞİ */}
        {siparis && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl print:border-none print:shadow-none print:p-4 print:bg-white print:text-black">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 print:border-black/20 pb-5">
              <div>
                <div className="text-2xl font-black text-white print:text-black tracking-tight">
                  Oto<span className="text-blue-500 print:text-black">Katalog</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                  Dijital Çıkma Yedek Parça Envanter & Dağıtım Ltd. Şti.
                </p>
                <span className="text-[11px] font-mono text-blue-400 print:text-slate-700 block mt-1">
                  Sipariş No: #{siparis.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl">
                  {siparis.status}
                </span>
                <button
                  onClick={faturaYazdir}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <span>🖨️ Fatura / Fiş Yazdır</span>
                </button>
              </div>
            </div>

            {siparis.tracking_number && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs print:border-slate-300">
                <span className="text-slate-300 print:text-slate-700">
                  Lojistik: <strong>{siparis.cargo_company || "Yurtiçi Kargo"}</strong>
                </span>
                <span className="font-mono font-bold text-blue-400 print:text-black">
                  Takip No: {siparis.tracking_number}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800/80 print:bg-slate-50 print:border-slate-300">
              <div>
                <span className="text-slate-500 print:text-slate-600 block text-[11px] font-semibold uppercase">Sayın Müşteri:</span>
                <span className="font-bold text-white print:text-black text-sm block mt-0.5">{siparis.customer_name}</span>
                <span className="text-slate-400 print:text-slate-600 block mt-0.5">{siparis.phone}</span>
                <span className="text-slate-400 print:text-slate-600 block">{siparis.customer_email}</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-slate-600 block text-[11px] font-semibold uppercase">Teslimat Adresi:</span>
                <span className="text-slate-200 print:text-black block mt-0.5 leading-relaxed">{siparis.address}</span>
                <span className="text-slate-500 print:text-slate-500 block text-[10px] mt-2">
                  Tarih: {new Date(siparis.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-800">
                Sipariş Edilen Parçalar
              </h3>
              <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Açıklama / Parça Adı</th>
                    <th className="p-3">OEM Kodu</th>
                    <th className="p-3 text-center">Adet</th>
                    <th className="p-3 text-right">Birim Fiyat</th>
                    <th className="p-3 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {siparisKalemleri.map((item: any) => (
                    <tr key={item.id} className="text-slate-200 print:text-black">
                      <td className="p-3 font-medium">{item.products?.title || "Yedek Parça"}</td>
                      <td className="p-3 font-mono text-blue-400 print:text-slate-600">{item.products?.oem_code || "-"}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">₺{item.unit_price}</td>
                      <td className="p-3 text-right font-bold">₺{item.unit_price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-800 print:border-black/20 pt-4 flex flex-col items-end gap-1 text-xs">
              <div className="text-slate-400 print:text-slate-600">
                KDV Dahil Net Tutar
              </div>
              <div className="text-2xl font-black text-emerald-400 print:text-black">
                ₺{siparis.total_price.toLocaleString("tr-TR")}
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}