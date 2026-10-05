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
  const [sadeceStokta, setSadeceStokta] = useState<boolean>(false);
  const [gorunumModu, setGorunumModu] = useState<"grid" | "liste">("grid");

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
    setSadeceStokta(false);
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

      if (sadeceStokta && p.stock <= 0) return false;

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
  }, [products, vehicles, secilenMarka, secilenVehicleId, secilenKategori, minFiyat, maxFiyat, aramaMetni, siralama, sadeceStokta]);

  const toplamSayfaSayisi = Math.ceil(filtrelenmisUrunler.length / SAYFA_BASINA) || 1;

  const gosterilenParcalar = useMemo(() => {
    const baslangic = (aktifSayfa - 1) * SAYFA_BASINA;
    return filtrelenmisUrunler.slice(baslangic, baslangic + SAYFA_BASINA);
  }, [filtrelenmisUrunler, aktifSayfa]);

  const sayfayaGit = (yeniSayfa: number) => {
    setAktifSayfa(yeniSayfa);
    const parcaAlani = document.getElementById("parca-katalog-alani");
    if (parcaAlani) {
      parcaAlani.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-10 relative overflow-x-hidden pb-24 selection:bg-cyan-500 selection:text-black">
      
      {/* ARKA PLAN NEON AMBİYANS IŞIKLARI */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="fixed top-1/2 right-10 w-96 h-96 bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* ÜST BAR / KURUMSAL LOGO & HIZLI ERİŞİM */}
        <div className="border-b border-slate-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-black shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              OK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Oto<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Katalog</span>
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-cyan-950 text-cyan-400 rounded-md border border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  v2.5 NEON
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Türkiye'nin Yeni Nesil OEM & Çıkma Dijital Parça Ağı
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            {kullaniciMail ? (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md">
                <span className="text-slate-300">👤 {kullaniciMail}</span>
                <button onClick={cikisYap} className="text-rose-400 hover:text-rose-300 font-semibold ml-1 cursor-pointer">
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition"
              >
                Giriş Yap
              </Link>
            )}

            <button
              onClick={() => setSepetAcik(true)}
              className="relative px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <span>🛒 Sepetim</span>
              {toplamAdet > 0 && (
                <span className="bg-black text-cyan-300 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                  {toplamAdet}
                </span>
              )}
            </button>

            <Link
              href="/siparislerim"
              className="px-3.5 py-2 bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition"
            >
              📦 Takip
            </Link>
          </div>
        </div>

        {/* 3D İNTERAKTİF PARÇA ANİMASYONLARI (TIKLANINCA DOĞRUDAN KATEGORİYİ FİLTRELER) */}
        <Interactive3DCategories
          activeCategory={secilenKategori}
          onSelectCategory={(kat) => {
            setSecilenKategori(kat);
            setAktifSayfa(1);
          }}
        />

        {/* HAVALE İÇİN SİPARİŞ BİLDİRİMİ */}
        {siparisBasariliId && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div>
              <p className="font-bold">🎉 Siparişiniz başarıyla alındı ve stok rezerve edildi!</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Sipariş Takip Kodu: <span className="font-mono font-bold text-white">#{siparisBasariliId}</span>
              </p>
            </div>
            <button onClick={() => setSiparisBasariliId(null)} className="text-xs text-slate-400 hover:text-white cursor-pointer">
              Kapat ✕
            </button>
          </div>
        )}

        {/* AKILLI FİLTRELEME & ARAMA PANELİ */}
        <div id="parca-katalog-alani" className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Gelişmiş Parça & Araç Filtreleri
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stokta Olanlar Toggle Switch */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sadeceStokta}
                  onChange={(e) => { setSadeceStokta(e.target.checked); setAktifSayfa(1); }}
                  className="rounded accent-cyan-500 cursor-pointer"
                />
                <span>Sadece Stoktakiler</span>
              </label>

              {(secilenMarka || secilenVehicleId || secilenKategori !== "Tümü" || minFiyat || maxFiyat || aramaMetni || siralama !== "varsayilan" || sadeceStokta) && (
                <button
                  onClick={filtreleriTemizle}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer"
                >
                  Filtreleri Sıfırla ✕
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">MARKA</label>
              <select
                value={secilenMarka}
                onChange={(e) => {
                  setSecilenMarka(e.target.value);
                  setSecilenVehicleId("");
                  setAktifSayfa(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Tüm Markalar ({markalar.length})</option>
                {markalar.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                MODEL {secilenMarka && `(${secilenMarkaModelleri.length})`}
              </label>
              <select
                disabled={!secilenMarka || secilenMarkaModelleri.length === 0}
                value={secilenVehicleId}
                onChange={(e) => { setSecilenVehicleId(e.target.value); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-40"
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
              <label className="block text-[11px] font-mono text-slate-400 mb-1">KATEGORİ</label>
              <select
                value={secilenKategori}
                onChange={(e) => { setSecilenKategori(e.target.value); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {KATEGORILER.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">SIRALAMA</label>
              <select
                value={siralama}
                onChange={(e) => { setSiralama(e.target.value as any); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="varsayilan">Varsayılan Sıralama</option>
                <option value="artan">Fiyat: Düşükten Yükseğe</option>
                <option value="azalan">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                HIZLI ARAMA (PARÇA ADI, OEM KODU VEYA AÇIKLAMA)
              </label>
              <input
                type="text"
                placeholder="Örn: Sol Far, Stop Lambası, 7701047123, Fren Kaliperi..."
                value={aramaMetni}
                onChange={(e) => { setAramaMetni(e.target.value); setAktifSayfa(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">FİYAT ARALIĞI (₺)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₺"
                  value={minFiyat}
                  onChange={(e) => { setMinFiyat(e.target.value); setAktifSayfa(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  placeholder="Max ₺"
                  value={maxFiyat}
                  onChange={(e) => { setMaxFiyat(e.target.value); setAktifSayfa(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PARÇA KATALOĞU (GRID / LISTE SEÇİMLİ) */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Aktif Liste:</span>
                <span className="text-cyan-400 font-mono">[{secilenKategori}]</span>
                <span className="text-xs text-slate-400 font-normal">({filtrelenmisUrunler.length} Parça Bulundu)</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Grid / Liste Görünüm Butonları */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setGorunumModu("grid")}
                  className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${gorunumModu === "grid" ? "bg-cyan-500 text-black font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  ⊞ Kart
                </button>
                <button
                  onClick={() => setGorunumModu("liste")}
                  className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${gorunumModu === "liste" ? "bg-cyan-500 text-black font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  ☰ Liste
                </button>
              </div>

              <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                Sayfa {aktifSayfa} / {toplamSayfaSayisi}
              </span>
            </div>
          </div>

          {yukleniyor ? (
            <div className="p-20 text-center text-slate-500 text-sm animate-pulse flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs text-cyan-400">Veritabanından parçalar taranıyor...</span>
            </div>
          ) : gosterilenParcalar.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-slate-300 text-sm font-semibold">Bu kriterlere uygun yedek parça bulunamadı.</p>
              <p className="text-slate-500 text-xs mt-1">Farklı bir arama terimi deneyebilir veya kategoriyi "Tümü" yapabilirsiniz.</p>
              <button
                onClick={filtreleriTemizle}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl transition cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : gorunumModu === "grid" ? (
            /* KART GÖRÜNÜMÜ */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {gosterilenParcalar.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] group backdrop-blur-md"
                >
                  <Link
                    href={`/urun/${product.id}`}
                    className="w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden relative border-b border-slate-800/80 cursor-pointer"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center">
                        <span className="text-4xl">⚙️</span>
                        <span className="text-[11px] font-mono mt-1">Görsel Yok</span>
                      </div>
                    )}
                    
                    <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 bg-slate-950/90 text-cyan-400 rounded-md border border-cyan-500/30 backdrop-blur">
                      {product.category || "Genel"}
                    </span>

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          Tükendi
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      {product.oem_code && (
                        <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                          OEM: {product.oem_code}
                        </span>
                      )}
                      <Link href={`/urun/${product.id}`} className="hover:text-cyan-400 transition">
                        <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">
                          {product.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">FİYAT</span>
                        <span className="text-lg font-black text-white">
                          ₺{product.price.toLocaleString("tr-TR")}
                        </span>
                      </div>

                      <button
                        onClick={(e) => sepeteEkle(product, e)}
                        disabled={product.stock <= 0}
                        className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-extrabold text-xs rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
                      >
                        {product.stock > 0 ? "+ Sepete Ekle" : "Tükendi"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* KOMPAKT LİSTE GÖRÜNÜMÜ */
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl overflow-hidden backdrop-blur-xl divide-y divide-slate-800/60">
              {gosterilenParcalar.map((product) => (
                <div key={product.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">⚙️</span>
                      )}
                    </div>
                    <div>
                      <Link href={`/urun/${product.id}`} className="font-bold text-sm text-white hover:text-cyan-400 transition">
                        {product.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="font-mono text-cyan-400 text-[11px]">OEM: {product.oem_code || "-"}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <span className="text-lg font-black text-white">₺{product.price.toLocaleString("tr-TR")}</span>
                    <button
                      onClick={(e) => sepeteEkle(product, e)}
                      disabled={product.stock <= 0}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      {product.stock > 0 ? "Ekle" : "Tükendi"}
                    </button>
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