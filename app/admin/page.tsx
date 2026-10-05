"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "cnhll@otoparca.com";

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

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
};

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
  total_price: number;
  status: string;
  tracking_number?: string;
  cargo_company?: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [yetkiliMi, setYetkiliMi] = useState(false);
  const [sekme, setSekme] = useState<"urunler" | "yeni_urun" | "siparisler">("urunler");
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  // YENİ ÜRÜN FORMU
  const [baslik, setBaslik] = useState("");
  const [oem, setOem] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [stok, setStok] = useState("1");
  const [kategori, setKategori] = useState("Aydınlatma");
  const [resimUrl, setResimUrl] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [seciliAracIds, setSeciliAracIds] = useState<string[]>([]);
  const [kayitMesaj, setKayitMesaj] = useState<string | null>(null);

  // KARGO FORM BİLGİLERİ
  const [kargoTakipNo, setKargoTakipNo] = useState<{ [orderId: string]: string }>({});
  const [kargoFirma, setKargoFirma] = useState<{ [orderId: string]: string }>({});

  useEffect(() => {
    async function yetkiVeVeriKontrol() {
      // 1. Oturum Kontrolü
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (session.user.email !== ADMIN_EMAIL) {
        alert("Bu panele erişim yetkiniz yok!");
        router.replace("/");
        return;
      }

      setYetkiliMi(true);
      await verileriYukle();
    }

    yetkiVeVeriKontrol();
  }, [router]);

  async function verileriYukle() {
    setYukleniyor(true);
    setHataMesaji(null);

    try {
      // 1. Ürünleri Çek
      const { data: pData, error: pErr } = await supabase
        .from("products")
        .select("*")
        .order("title", { ascending: true })
        .limit(200);

      if (pErr) console.error("Ürün yükleme hatası:", pErr);

      // 2. Araçları Çek
      const { data: vData, error: vErr } = await supabase
        .from("vehicles")
        .select("*")
        .order("brand", { ascending: true });

      if (vErr) console.error("Araç yükleme hatası:", vErr);

      // 3. Siparişleri Güvenli Çek
      const { data: oData, error: oErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (oErr) console.error("Sipariş yükleme hatası:", oErr);

      if (pData) setProducts(pData);
      if (vData) setVehicles(vData);
      if (oData) setOrders(oData);
    } catch (err: any) {
      setHataMesaji(err.message || "Veriler alınırken bir sorun oluştu.");
    }

    setYukleniyor(false);
  }

  // YENİ ÜRÜN EKLEME
  const urunKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setKayitMesaj("Kaydediliyor...");

    try {
      const { data: yeniUrun, error: urunHata } = await supabase
        .from("products")
        .insert([
          {
            title: baslik,
            oem_code: oem.trim() || null,
            price: parseFloat(fiyat) || 0,
            stock: parseInt(stok) || 1,
            category: kategori,
            image_url: resimUrl.trim() || null,
            description: aciklama,
          },
        ])
        .select()
        .single();

      if (urunHata) throw urunHata;

      // Araç uyumluluklarını bağla
      if (seciliAracIds.length > 0 && yeniUrun) {
        const uyumlar = seciliAracIds.map((vId) => ({
          product_id: yeniUrun.id,
          vehicle_id: vId,
        }));
        await supabase.from("product_vehicle_compatibility").insert(uyumlar);
      }

      setKayitMesaj("✅ Ürün başarıyla sisteme eklendi!");
      setBaslik("");
      setOem("");
      setFiyat("");
      setResimUrl("");
      setAciklama("");
      setSeciliAracIds([]);
      verileriYukle();
    } catch (h: any) {
      setKayitMesaj("❌ Hata: " + h.message);
    }
  };

  // ANLIK ALAN GÜNCELLEME
  const alanGuncelle = async (id: string, alan: "price" | "stock", deger: number) => {
    await supabase.from("products").update({ [alan]: deger }).eq("id", id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [alan]: deger } : p))
    );
  };

  // ÜRÜN SİLME
  const urunSil = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await supabase.from("product_vehicle_compatibility").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // SİPARİŞ DURUMU & KARGO GÜNCELLEME
  const siparisGuncelle = async (orderId: string, yeniDurum: string) => {
    const takip = kargoTakipNo[orderId];
    const firma = kargoFirma[orderId] || "Yurtiçi Kargo";

    const updateObj: any = { status: yeniDurum };
    if (takip) updateObj.tracking_number = takip;
    if (firma) updateObj.cargo_company = firma;

    await supabase.from("orders").update(updateObj).eq("id", orderId);
    alert("Sipariş başarıyla güncellendi!");
    verileriYukle();
  };

  // GÜVENLİ ÇIKIŞ YAPMA
  const cikisYap = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Yetki doğrulanana kadar gösterilecek yüklenme ekranı
  if (!yetkiliMi) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p>Yönetici yetkisi doğrulanıyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ÜST PANEL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              Yönetici Paneli ({ADMIN_EMAIL})
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">
              Envanter & Sipariş Kontrol Merkezi
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              ← Mağazaya Dön
            </Link>
            <button
              onClick={cikisYap}
              className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {hataMesaji && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
            {hataMesaji}
          </div>
        )}

        {/* SEKME BUTONLARI */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setSekme("urunler")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              sekme === "urunler" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            📦 Ürün Listesi ({products.length})
          </button>
          <button
            onClick={() => setSekme("yeni_urun")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              sekme === "yeni_urun" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            ➕ Yeni Parça Ekle
          </button>
          <button
            onClick={() => setSekme("siparisler")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              sekme === "siparisler" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            🚚 Siparişler ({orders.length})
          </button>
        </div>

        {yukleniyor ? (
          <div className="p-16 text-center text-slate-500 animate-pulse text-sm">
            Yönetim paneli yükleniyor...
          </div>
        ) : (
          <>
            {/* 1. SEKME: ÜRÜN LİSTESİ */}
            {sekme === "urunler" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Görsel</th>
                        <th className="p-3">Başlık & OEM</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Fiyat (₺)</th>
                        <th className="p-3">Stok</th>
                        <th className="p-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3">
                            {p.image_url ? (
                              <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center text-xs">🚗</div>
                            )}
                          </td>
                          <td className="p-3 max-w-xs">
                            <span className="font-semibold text-white block truncate">{p.title}</span>
                            <span className="text-[10px] text-blue-400 font-mono">OEM: {p.oem_code || "Yok"}</span>
                          </td>
                          <td className="p-3 text-slate-400">{p.category}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              defaultValue={p.price}
                              onBlur={(e) => alanGuncelle(p.id, "price", parseFloat(e.target.value) || 0)}
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              defaultValue={p.stock}
                              onBlur={(e) => alanGuncelle(p.id, "stock", parseInt(e.target.value) || 0)}
                              className={`w-16 bg-slate-950 border rounded px-2 py-1 font-bold text-xs ${
                                p.stock > 0 ? "border-slate-700 text-emerald-400" : "border-rose-700 text-rose-400"
                              }`}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => urunSil(p.id)}
                              className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-xs"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. SEKME: YENİ ÜRÜN EKLE */}
            {sekme === "yeni_urun" && (
              <form onSubmit={urunKaydet} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                  Yeni Parça ve Araç Uyumluluğu Ekle
                </h2>

                {kayitMesaj && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                    {kayitMesaj}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Parça Başlığı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Renault Laguna 1 Sol Ön Far Orijinal"
                      value={baslik}
                      onChange={(e) => setBaslik(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">OEM Kodu</label>
                    <input
                      type="text"
                      placeholder="Örn: 7701047123"
                      value={oem}
                      onChange={(e) => setOem(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Fiyat (₺) *</label>
                    <input
                      type="number"
                      required
                      placeholder="1250"
                      value={fiyat}
                      onChange={(e) => setFiyat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Stok Adedi</label>
                    <input
                      type="number"
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Kategori</label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Aydınlatma">Aydınlatma (Far, Stop)</option>
                      <option value="Kaporta & Karoser">Kaporta & Karoser</option>
                      <option value="Mekanik & Motor">Mekanik & Motor</option>
                      <option value="Elektrik & Elektronik">Elektrik & Elektronik</option>
                      <option value="İç Trim & Aksam">İç Trim & Aksam</option>
                      <option value="Yürüyen & Fren">Yürüyen & Fren</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Görsel URL</label>
                    <input
                      type="url"
                      placeholder="https://.../resim.jpg"
                      value={resimUrl}
                      onChange={(e) => setResimUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Açıklama</label>
                    <textarea
                      rows={2}
                      placeholder="Parçanın durumu, çizik veya tamir durumu..."
                      value={aciklama}
                      onChange={(e) => setAciklama(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* ARAÇ EŞLEŞTİRME */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Uyumlu Araç Modelleri ({seciliAracIds.length} Seçili)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    {vehicles.map((v) => {
                      const secili = seciliAracIds.includes(v.id);
                      return (
                        <label
                          key={v.id}
                          className={`flex items-center gap-1.5 p-2 rounded-lg border text-[11px] cursor-pointer transition ${
                            secili ? "bg-blue-600/20 border-blue-500 text-white" : "border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={secili}
                            onChange={() => {
                              setSeciliAracIds((prev) =>
                                secili ? prev.filter((id) => id !== v.id) : [...prev, v.id]
                              );
                            }}
                            className="rounded accent-blue-600"
                          />
                          <span className="truncate">{v.brand} {v.model}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20"
                >
                  💾 Parçayı Sisteme Kaydet
                </button>
              </form>
            )}

            {/* 3. SEKME: SİPARİŞLER */}
            {sekme === "siparisler" && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="p-8 text-center text-slate-500 text-xs">Henüz kayıtlı bir sipariş yok.</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-xs font-mono font-bold text-blue-400">Sipariş #{o.id.slice(0, 8)}</span>
                          <h3 className="text-sm font-bold text-white mt-0.5">{o.customer_name} ({o.phone})</h3>
                          <span className="text-[11px] text-slate-400">{o.customer_email} - {o.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-emerald-400">₺{o.total_price}</span>
                          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold">
                            {o.status}
                          </span>
                        </div>
                      </div>

                      {/* Kargo Güncelleme Formu */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <select
                          defaultValue={o.cargo_company || "Yurtiçi Kargo"}
                          onChange={(e) => setKargoFirma({ ...kargoFirma, [o.id]: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                          <option value="Aras Kargo">Aras Kargo</option>
                          <option value="MNG Kargo">MNG Kargo</option>
                          <option value="Sürat Kargo">Sürat Kargo</option>
                          <option value="PTT Kargo">PTT Kargo</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Kargo Takip No..."
                          defaultValue={o.tracking_number || ""}
                          onChange={(e) => setKargoTakipNo({ ...kargoTakipNo, [o.id]: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        />

                        <button
                          onClick={() => siparisGuncelle(o.id, "Kargoya Verildi")}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
                        >
                          Kargoya Verildi
                        </button>

                        <button
                          onClick={() => siparisGuncelle(o.id, "Tamamlandı")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                        >
                          Tamamlandı
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}