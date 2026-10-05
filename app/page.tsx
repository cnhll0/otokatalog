"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Interactive3DCategories from "@/components/Interactive3DCategories";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  engine_details: string;
};

type Product = {
  id: string;
  title: string;
  oem_code: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image_url?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const KATEGORILER = [
  "Tümü",
  "Aydınlatma",
  "Kaporta & Karoser",
  "Mekanik & Motor",
  "Elektrik & Elektronik",
  "İç Trim & Aksam",
  "Yürüyen & Fren"
];

const SAYFA_BASINA = 24;

export default function Home() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);
  const [aramaMetni, setAramaMetni] = useState<string>("");

  // FİLTRELER
  const [secilenMarka, setSecilenMarka] = useState<string>("");
  const [secilenVehicleId, setSecilenVehicleId] = useState<string>("");
  const [secilenKategori, setSecilenKategori] = useState<string>("Tümü");
  const [minFiyat, setMinFiyat] = useState<string>("");
  const [maxFiyat, setMaxFiyat] = useState<string>("");
  const [siralama, setSiralama] = useState<"varsayilan" | "artan" | "azalan">("varsayilan");

  // SAYFALAMA
  const [aktifSayfa, setAktifSayfa] = useState<number>(1);

  // SEPET & CHECKOUT
  const [sepet, setSepet] = useState<CartItem[]>([]);
  const [sepetAcik, setSepetAcik] = useState<boolean>(false);
  const [checkoutAcik, setCheckoutAcik] = useState<boolean>(false);

  // SİPARİŞ FORMU
  const [musteriAd, setMusteriAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [adres, setAdres] = useState("");
  const [odemeYontemi, setOdemeYontemi] = useState<"kart" | "havale">("kart");
  const [siparisYukleniyor, setSiparisYukleniyor] = useState(false);
  const [siparisBasariliId, setSiparisBasariliId] = useState<string | null>(null);

  // OTURUM
  const [kullaniciMail, setKullaniciMail] = useState<string | null>(null);

  useEffect(() => {
    async function oturumGetir() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) setKullaniciMail(session.user.email);
    }
    oturumGetir();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setKullaniciMail(session?.user?.email || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const cikisYap = async () => {
    await supabase.auth.signOut();
    setKullaniciMail(null);
  };

  useEffect(() => {
    const kayitli = localStorage.getItem("oto_sepet");
    if (kayitli) {
      try { setSepet(JSON.parse(kayitli)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("oto_sepet", JSON.stringify(sepet));
  }, [sepet]);

  // VERİLERİ ÇEK
  useEffect(() => {
    async function verileriGetir() {
      setYukleniyor(true);

      const { data: aracData } = await supabase
        .from("vehicles")
        .select("*")
        .order("brand", { ascending: true });

      const { data: urunData, error } = await supabase
        .from("products")
        .select("*")
        .order("price", { ascending: true })
        .limit(5000);

      if (error) console.error("Ürün çekme hatası:", error);

      if (aracData) setVehicles(aracData);
      if (urunData) setProducts(urunData);
      setYukleniyor(false);
    }

    verileriGetir();
  }, []);

  const markalar = useMemo(() => {
    const unique = Array.from(new Set(vehicles.map((v) => v.brand.trim()))).filter(Boolean);
    return unique.sort((a, b) => a.localeCompare(b, "tr"));
  }, [vehicles]);

  const secilenMarkaModelleri = useMemo(() => {
    if (!secilenMarka) return [];
    return vehicles.filter(
      (v) => v.brand.trim().toLowerCase() === secilenMarka.trim().toLowerCase()
    );
  }, [vehicles, secilenMarka]);

  const filtreleriTemizle = () => {
    setSecilenMarka("");
    setSecilenVehicleId("");
    setSecilenKategori("Tümü");
    setMinFiyat("");
    setMaxFiyat("");
    setSiralama("varsayilan");
    setAramaMetni("");
    setAktifSayfa(1);
  };

  const sepeteEkle = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSepet((eskiSepet) => {
      const mevcut = eskiSepet.find((item) => item.product.id === product.id);
      if (mevcut) {
        if (mevcut.quantity >= product.stock) {
          alert(`Bu parçadan stokta sadece ${product.stock} adet var.`);
          return eskiSepet;
        }
        return eskiSepet.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...eskiSepet, { product, quantity: 1 }];
    });
    setSepetAcik(true);
  };

  const sepettenCikar = (productId: string) => {
    setSepet((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const adetGuncelle = (productId: string, adet: number) => {
    const urun = products.find((p) => p.id === productId);
    if (urun && adet > urun.stock) {
      alert(`Stok miktarını aşamazsınız. Mevcut stok: ${urun.stock}`);
      return;
    }

    if (adet <= 0) {
      sepettenCikar(productId);
      return;
    }
    setSepet((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: adet } : i))
    );
  };

  const toplamTutar = sepet.reduce((top, i) => top + i.product.price * i.quantity, 0);
  const toplamAdet = sepet.reduce((top, i) => top + i.quantity, 0);

  // SİPARİŞ TAMAMLAMA & YÖNLENDİRME
  const siparisiTamamla = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiparisYukleniyor(true);

    try {
      const itemsPayload = sepet.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { data, error } = await supabase.rpc("complete_order_and_reduce_stock", {
        p_customer_email: kullaniciMail || "Misafir",
        p_customer_name: musteriAd,
        p_phone: telefon,
        p_address: adres,
        p_total_price: toplamTutar,
        p_items: itemsPayload,
      });

      if (error) throw error;

      const yeniOrderId = data.order_id;

      // UI stoklarını güncelle
      setProducts((prev) =>
        prev.map((urun) => {
          const sepetKalemi = sepet.find((s) => s.product.id === urun.id);
          if (sepetKalemi) {
            return { ...urun, stock: Math.max(0, urun.stock - sepetKalemi.quantity) };
          }
          return urun;
        })
      );

      setSepet([]);
      localStorage.removeItem("oto_sepet");
      setCheckoutAcik(false);

      if (odemeYontemi === "kart") {
        router.push(`/odeme-sonuc?orderId=${yeniOrderId}&status=success`);
      } else {
        setSiparisBasariliId(String(yeniOrderId).slice(0, 8));
        setMusteriAd("");
        setTelefon("");
        setAdres("");
      }
    } catch (hata: any) {
      alert("Sipariş verilemedi: " + (hata.message || "Bilinmeyen hata"));
    }
    setSiparisYukleniyor(false);
  };

  const kategoriUyuyorMu = (title: string, cat: string) => {
    if (cat === "Tümü") return true;
    const t = title.toLowerCase();
    if (cat.includes("Aydınlatma")) return t.includes("far") || t.includes("stop") || t.includes("sinyal") || t.includes("sis");
    if (cat.includes("Kaporta")) return t.includes("kapı") || t.includes("kapi") || t.includes("tampon") || t.includes("çamurluk") || t.includes("camurluk") || t.includes("kaput") || t.includes("bagaj");
    if (cat.includes("Mekanik")) return t.includes("motor") || t.includes("şanzıman") || t.includes("sanziman") || t.includes("turbo") || t.includes("enjektör") || t.includes("pompa") || t.includes("radyatör");
    if (cat.includes("Elektrik")) return t.includes("beyin") || t.includes("gösterge") || t.includes("gosterge") || t.includes("sensör") || t.includes("sensor") || t.includes("dinamo") || t.includes("sigorta");
    if (cat.includes("İç Trim")) return t.includes("koltuk") || t.includes("direksiyon") || t.includes("torpido") || t.includes("döşeme") || t.includes("doseme") || t.includes("panel");
    if (cat.includes("Yürüyen")) return t.includes("amortisör") || t.includes("amortisor") || t.includes("fren") || t.includes("kaliper") || t.includes("aks") || t.includes("salıncak") || t.includes("taşıyıcı");
    return true;
  };

  const filtrelenmisUrunler = useMemo(() => {
    let sonuc = products.filter((p) => {
      const baslik = (p.title || "").toLowerCase();
      const aciklama = (p.description || "").toLowerCase();
      const oem = (p.oem_code || "").toLowerCase();

      if (secilenVehicleId) {
        const seciliArac = vehicles.find((v) => v.id === secilenVehicleId);
        if (seciliArac) {
          const modelKelime = seciliArac.model.toLowerCase().split(" ")[0];
          if (!baslik.includes(modelKelime) && !aciklama.includes(modelKelime)) return false;
        }
      } else if (secilenMarka) {
        const markaKelime = secilenMarka.toLowerCase();
        if (!baslik.includes(markaKelime) && !aciklama.includes(markaKelime)) return false;
      }

      if (!kategoriUyuyorMu(p.title, secilenKategori)) return false;

      const min = parseFloat(minFiyat);
      const max = parseFloat(maxFiyat);
      if (!isNaN(min) && p.price < min) return false;
      if (!isNaN(max) && p.price > max) return false;

      if (aramaMetni.trim()) {
        const aranan = aramaMetni.toLowerCase();
        const eslesme = baslik.includes(aranan) || oem.includes(aranan) || aciklama.includes(aranan);
        if (!eslesme) return false;
      }

      return true;
    });

    if (siralama === "artan") {
      sonuc.sort((a, b) => a.price - b.price);
    } else if (siralama === "azalan") {
      sonuc.sort((a, b) => b.price - a.price);
    }

    return sonuc;
  }, [products, vehicles, secilenMarka, secilenVehicleId, secilenKategori, minFiyat, maxFiyat, aramaMetni, siralama]);

  const toplamSayfaSayisi = Math.ceil(filtrelenmisUrunler.length / SAYFA_BASINA) || 1;

  const gosterilenParcalar = useMemo(() => {
    const baslangic = (aktifSayfa - 1) * SAYFA_BASINA;
    return filtrelenmisUrunler.slice(baslangic, baslangic + SAYFA_BASINA);
  }, [filtrelenmisUrunler, aktifSayfa]);

  const sayfayaGit = (yeniSayfa: number) => {
    setAktifSayfa(yeniSayfa);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative overflow-x-hidden pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ÜST BAR / KURUMSAL OTOKATALOG LOGO (Admin butonu kaldırıldı, /admin ile doğrudan erişilir) */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/25">
                OK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Oto<span className="text-blue-500">Katalog</span>
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                    B2B & B2C
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Türkiye'nin Dijital Çıkma Yedek Parça & OEM Ağı
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
            {kullaniciMail ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-300">👤 {kullaniciMail}</span>
                <button onClick={cikisYap} className="text-rose-400 hover:text-rose-300 font-semibold ml-1 cursor-pointer">
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition"
              >
                Giriş / Kayıt Ol
              </Link>
            )}

            <button
              onClick={() => setSepetAcik(true)}
              className="relative px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <span>🛒 Sepetim</span>
              {toplamAdet > 0 && (
                <span className="bg-white text-blue-700 font-bold px-1.5 py-0.2 rounded-full text-[11px]">
                  {toplamAdet}
                </span>
              )}
            </button>

            <Link
              href="/siparislerim"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition"
            >
              📦 Sipariş Takibi
            </Link>
          </div>
        </div>

        {/* 3D İNTERAKTİF PARÇA ANİMASYONLARI (FAR, MOTOR, FREN, KAPUT, TURBO, ECU) */}
        <Interactive3DCategories />

        {/* HAVALE İÇİN SİPARİŞ BİLDİRİMİ */}
        {siparisBasariliId && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
            <div>
              <p className="font-bold">🎉 Siparişiniz başarıyla alındı ve stoktan düşüldü!</p>
              <p className="text-xs text-emerald-500/80 mt-0.5">
                Sipariş Takip Kodu: <span className="font-mono font-bold text-white">#{siparisBasariliId}</span>
              </p>
            </div>
            <button onClick={() => setSiparisBasariliId(null)} className="text-xs text-slate-400 hover:text-white cursor-pointer">
              Kapat ✕
            </button>
          </div>
        )}

        {/* FİLTRELEME PANELİ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              🔍 Akıllı Parça ve Araç Filtresi
            </h2>
            {(secilenMarka || secilenVehicleId || secilenKategori !== "Tümü" || minFiyat || maxFiyat || aramaMetni || siralama !== "varsayilan") && (
              <button
                onClick={filtreleriTemizle}
                className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Marka</label>
              <select
                value={secilenMarka}
                onChange={(e) => {
                  setSecilenMarka(e.target.value);
                  setSecilenVehicleId("");
                  setAktifSayfa(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Tüm Markalar ({markalar.length})</option>
                {markalar.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Model {secilenMarka && `(${secilenMarkaModelleri.length})`}
              </label>
              <select
                disabled={!secilenMarka || secilenMarkaModelleri.length === 0}
                value={secilenVehicleId}
                onChange={(e) => { setSecilenVehicleId(e.target.value); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
              >
                <option value="">
                  {secilenMarka ? `${secilenMarka} - Tüm Modeller` : "Önce Marka Seçin"}
                </option>
                {secilenMarkaModelleri.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.year_start} - {v.year_end || "Günümüz"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Kategori</label>
              <select
                value={secilenKategori}
                onChange={(e) => { setSecilenKategori(e.target.value); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {KATEGORILER.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Sıralama</label>
              <select
                value={siralama}
                onChange={(e) => { setSiralama(e.target.value as any); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="varsayilan">Varsayılan Sıralama</option>
                <option value="artan">Fiyat: Düşükten Yükseğe</option>
                <option value="azalan">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Hızlı Arama (Parça adı veya OEM kodu)
              </label>
              <input
                type="text"
                placeholder="Örn: Stop Lambası, Far, Tampon, Kapı..."
                value={aramaMetni}
                onChange={(e) => { setAramaMetni(e.target.value); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fiyat Aralığı (₺)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₺"
                  value={minFiyat}
                  onChange={(e) => { setMinFiyat(e.target.value); setAktifSayfa(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  placeholder="Max ₺"
                  value={maxFiyat}
                  onChange={(e) => { setMaxFiyat(e.target.value); setAktifSayfa(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PARÇA LİSTESİ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Listelenen: {filtrelenmisUrunler.length} Parça
            </h2>
            <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
              Sayfa {aktifSayfa} / {toplamSayfaSayisi}
            </span>
          </div>

          {yukleniyor ? (
            <div className="p-20 text-center text-slate-500 text-sm animate-pulse flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Parçalar getiriliyor...</span>
            </div>
          ) : gosterilenParcalar.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">
                Seçtiğiniz kriterlere uygun parça bulunamadı. Filtreleri temizleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gosterilenParcalar.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-lg group"
                >
                  <Link
                    href={`/urun/${product.id}`}
                    className="w-full h-44 bg-slate-950 flex items-center justify-center overflow-hidden relative border-b border-slate-800 cursor-pointer"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center">
                        <span className="text-3xl">🚗</span>
                        <span className="text-[11px] mt-1">Görsel Yok</span>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-950/80 backdrop-blur text-slate-300 rounded border border-slate-700">
                      {product.category || "Çıkma"}
                    </span>
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          Tükendi
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      {product.oem_code && (
                        <span className="text-[11px] font-mono text-blue-400 block mb-1">
                          OEM: {product.oem_code}
                        </span>
                      )}
                      <Link href={`/urun/${product.id}`} className="hover:text-blue-400 transition">
                        <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">
                          {product.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-slate-500 block">Fiyat</span>
                        <span className="text-base font-bold text-emerald-400">
                          ₺{product.price.toLocaleString("tr-TR")}
                        </span>
                      </div>

                      <button
                        onClick={(e) => sepeteEkle(product, e)}
                        disabled={product.stock <= 0}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        {product.stock > 0 ? "Sepete Ekle" : "Tükendi"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SAYFA GEÇİŞ BARLARI */}
          {!yukleniyor && toplamSayfaSayisi > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-10 border-t border-slate-800 mt-8">
              <button
                disabled={aktifSayfa === 1}
                onClick={() => sayfayaGit(aktifSayfa - 1)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 disabled:opacity-30 rounded-xl text-xs font-semibold hover:border-slate-700 transition cursor-pointer"
              >
                ← Önceki
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(toplamSayfaSayisi, 7) }, (_, i) => {
                  let sayfaNo = i + 1;
                  if (toplamSayfaSayisi > 7 && aktifSayfa > 4) {
                    sayfaNo = aktifSayfa - 3 + i;
                    if (sayfaNo > toplamSayfaSayisi) sayfaNo = toplamSayfaSayisi - (6 - i);
                  }

                  const aktif = aktifSayfa === sayfaNo;

                  return (
                    <button
                      key={sayfaNo}
                      onClick={() => sayfayaGit(sayfaNo)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                        aktif
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {sayfaNo}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={aktifSayfa >= toplamSayfaSayisi}
                onClick={() => sayfayaGit(aktifSayfa + 1)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 disabled:opacity-30 rounded-xl text-xs font-semibold hover:border-slate-700 transition cursor-pointer"
              >
                Sonraki →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* SEPET ÇEKMECESİ */}
      {sepetAcik && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setSepetAcik(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🛒 Sepetim</span>
                  <span className="text-xs font-normal text-slate-400">({toplamAdet} ürün)</span>
                </h3>
                <button onClick={() => setSepetAcik(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">
                  ✕ Kapat
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {sepet.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-12">Sepetiniz henüz boş.</p>
                ) : (
                  sepet.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      {item.product.image_url && (
                        <img src={item.product.image_url} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.title}</h4>
                        <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">₺{item.product.price}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
                        <button onClick={() => adetGuncelle(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded">-</button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => adetGuncelle(item.product.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded">+</button>
                      </div>

                      <button onClick={() => sepettenCikar(item.product.id)} className="text-slate-500 hover:text-rose-400 text-xs p-1 cursor-pointer">
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Genel Toplam:</span>
                <span className="text-2xl font-bold text-emerald-400">₺{toplamTutar.toLocaleString("tr-TR")}</span>
              </div>
              <button
                disabled={sepet.length === 0}
                onClick={() => { setSepetAcik(false); setCheckoutAcik(true); }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Siparişi Tamamla (₺{toplamTutar.toLocaleString("tr-TR")})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODALI / ÖDEME YÖNTEMİ SEÇİMLİ */}
      {checkoutAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setCheckoutAcik(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Teslimat & Sipariş Onayı</h3>
              <button onClick={() => setCheckoutAcik(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={siparisiTamamla} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={musteriAd}
                  onChange={(e) => setMusteriAd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon *</label>
                <input
                  type="tel"
                  required
                  placeholder="0555 123 45 67"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teslimat Adresi *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mahalle, sokak, kapı no..."
                  value={adres}
                  onChange={(e) => setAdres(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* ÖDEME YÖNTEMİ SEÇİMİ */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Ödeme Yöntemi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOdemeYontemi("kart")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      odemeYontemi === "kart"
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span>💳 Kredi Kartı / 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOdemeYontemi("havale")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      odemeYontemi === "havale"
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span>🏦 Havale / EFT</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={siparisYukleniyor}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                {siparisYukleniyor
                  ? "İşlem Yapılıyor..."
                  : odemeYontemi === "kart"
                  ? "Kartla Güvenli Öde (3D Secure)"
                  : "Siparişi Onayla"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBİL İÇİN SABİT ALT NAVİGASYON */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex items-center justify-around z-40">
        <Link href="/" className="flex flex-col items-center text-[10px] text-slate-300 hover:text-white">
          <span className="text-base">🏠</span>
          <span>Vitrin</span>
        </Link>
        <button onClick={() => setSepetAcik(true)} className="flex flex-col items-center text-[10px] text-blue-400 relative cursor-pointer">
          <span className="text-base">🛒</span>
          <span>Sepet ({toplamAdet})</span>
        </button>
        <Link href="/siparislerim" className="flex flex-col items-center text-[10px] text-slate-300 hover:text-white">
          <span className="text-base">📦</span>
          <span>Takip</span>
        </Link>
        <Link href={kullaniciMail ? "/profil" : "/login"} className="flex flex-col items-center text-[10px] text-slate-300 hover:text-white">
          <span className="text-base">👤</span>
          <span>{kullaniciMail ? "Profil" : "Giriş"}</span>
        </Link>
      </div>

    </main>
  );
}