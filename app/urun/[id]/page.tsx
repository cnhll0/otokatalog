"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
  oem_code: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image_url?: string;
  created_at?: string;
};

type CompatibleVehicle = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  engine_details: string;
};

export default function UrunDetayPage() {
  const params = useParams();
  const router = useRouter();
  const urunId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [uyumluAraclar, setUyumluAraclar] = useState<CompatibleVehicle[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [eklendiMesaji, setEklendiMesaji] = useState(false);

  useEffect(() => {
    if (!urunId) return;

    async function urunDetayGetir() {
      setYukleniyor(true);

      // 1. Ürün bilgilerini çek
      const { data: urun, error: urunHata } = await supabase
        .from("products")
        .select("*")
        .eq("id", urunId)
        .single();

      if (urunHata || !urun) {
        console.error("Ürün bulunamadı:", urunHata);
        setYukleniyor(false);
        return;
      }

      setProduct(urun);

      // 2. Bu ürünün uyumlu olduğu araçları çek
      const { data: compData } = await supabase
        .from("product_vehicle_compatibility")
        .select("vehicle_id")
        .eq("product_id", urunId);

      if (compData && compData.length > 0) {
        const vehicleIds = compData.map((c) => c.vehicle_id);
        const { data: araclar } = await supabase
          .from("vehicles")
          .select("*")
          .in("id", vehicleIds);

        if (araclar) setUyumluAraclar(araclar);
      }

      setYukleniyor(false);
    }

    urunDetayGetir();
  }, [urunId]);

  const sepeteEkle = () => {
    if (!product) return;

    const kayitliSepet = localStorage.getItem("oto_sepet");
    let sepet = kayitliSepet ? JSON.parse(kayitliSepet) : [];

    const mevcutIndex = sepet.findIndex((i: any) => i.product.id === product.id);

    if (mevcutIndex > -1) {
      if (sepet[mevcutIndex].quantity >= product.stock) {
        alert("Stok adedinden fazlasını ekleyemezsiniz!");
        return;
      }
      sepet[mevcutIndex].quantity += 1;
    } else {
      sepet.push({ product, quantity: 1 });
    }

    localStorage.setItem("oto_sepet", JSON.stringify(sepet));
    setEklendiMesaji(true);
    setTimeout(() => setEklendiMesaji(false), 2500);
  };

  const hemenSatinAl = () => {
    sepeteEkle();
    router.push("/");
  };

  if (yukleniyor) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Ürün detayları yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-rose-400 font-semibold text-lg">Ürün bulunamadı veya yayından kaldırılmış.</p>
        <Link href="/" className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs hover:border-slate-700">
          ← Kataloğa Dön
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ÜST GEZİNME (BREADCRUMB) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            ← Kataloğa Geri Dön
          </Link>

          <span className="text-xs px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
            Parça No: <span className="font-mono text-slate-200">#{product.id.slice(0, 8)}</span>
          </span>
        </div>

        {/* BİLDİRİM KARTI */}
        {eklendiMesaji && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between animate-fadeIn">
            <span>✅ Ürün başarıyla sepete eklendi!</span>
            <Link href="/" className="underline text-xs hover:text-emerald-300">
              Sepete Git →
            </Link>
          </div>
        )}

        {/* ANA DETAY BLOKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* SOL: GÖRSEL ALANI */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 flex items-center justify-center min-h-[380px] shadow-2xl relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="max-h-[450px] w-full object-contain rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600">
                <span className="text-6xl">🚗</span>
                <span className="text-xs mt-2">Bu ürün için fotoğraf bulunmuyor</span>
              </div>
            )}

            <span className="absolute top-6 left-6 px-3 py-1 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300">
              {product.category || "Çıkma Parça"}
            </span>

            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-4 py-2 bg-rose-600 text-white font-bold text-sm uppercase tracking-widest rounded-full shadow-xl">
                  Stokta Yok / Tükendi
                </span>
              </div>
            )}
          </div>

          {/* SAĞ: ÜRÜN BİLGİLERİ VE SATIN ALMA */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {product.oem_code && (
                <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-mono font-semibold">
                  OEM Kodu: {product.oem_code}
                </div>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                {product.title}
              </h1>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Fiyat</span>
                  <span className="text-3xl font-black text-emerald-400">
                    ₺{product.price.toLocaleString("tr-TR")}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Stok Durumu</span>
                  <span className={`text-xs font-bold ${product.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {product.stock > 0 ? `Stokta Var (${product.stock} Adet)` : "Tükendi"}
                  </span>
                </div>
              </div>

              {/* AÇIKLAMA */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Parça Detayları & Açıklama
                </h3>
                <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs text-slate-300 leading-relaxed">
                  {product.description || "Bu parça orijinal çıkma temiz durumdadır. Test edilerek rafa kaldırılmıştır."}
                </div>
              </div>
            </div>

            {/* BUTONLAR */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex gap-3">
                <button
                  onClick={sepeteEkle}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl transition border border-slate-700 shadow-lg"
                >
                  🛒 Sepete Ekle
                </button>

                <button
                  onClick={hemenSatinAl}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  ⚡ Hemen Satın Al
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 pt-2">
                <span>🚚 Hızlı Kargo İmkanı</span>
                <span>🛡️ Orijinal Çıkma Garantisi</span>
                <span>📦 Güvenli Paketleme</span>
              </div>
            </div>

          </div>
        </div>

        {/* UYUMLU ARAÇLAR TABLOSU */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>🚗 Bu Parçanın Uyumlu Olduğu Araçlar</span>
            <span className="text-xs text-slate-400 font-normal">({uyumluAraclar.length} Araç Modeli)</span>
          </h2>

          {uyumluAraclar.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">
              Bu parça için spesifik araç eşleştirmesi bulunmuyor veya evrensel parça grubunda yer alıyor.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {uyumluAraclar.map((arac) => (
                <div
                  key={arac.id}
                  className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col justify-between"
                >
                  <span className="font-bold text-xs text-slate-200">
                    {arac.brand} {arac.model}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Model Yılı: {arac.year_start} - {arac.year_end || "Günümüz"} | Motor: {arac.engine_details}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}