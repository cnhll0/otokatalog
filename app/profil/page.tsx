"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProfilPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function profilYukle() {
      setYukleniyor(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        router.push("/login");
        return;
      }

      setEmail(session.user.email);

      // Kullanıcının siparişlerini getir
      const { data: siparisler } = await supabase
        .from("orders")
        .select("*, order_items(*, products(title, image_url))")
        .eq("customer_email", session.user.email)
        .order("created_at", { ascending: false });

      if (siparisler) setOrders(siparisler);
      setYukleniyor(false);
    }

    profilYukle();
  }, [router]);

  const cikisYap = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (yukleniyor) {
    return <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-xs">Yükleniyor...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* PROFİL KARTI */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg text-white">
              {email?.[0].toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Kullanıcı Hesabı</span>
              <h1 className="text-base font-bold text-white">{email}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-xs rounded-xl hover:text-white">
              ← Vitrine Dön
            </Link>
            <button onClick={cikisYap} className="px-3.5 py-2 bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl hover:bg-rose-600/20">
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* GEÇMİŞ SİPARİŞLER */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            📦 Sipariş Geçmişim ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">
              Henüz bu hesapla verilmiş bir siparişiniz bulunmuyor.
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400">Takip Kodu: #{o.id.slice(0, 8)}</span>
                    <span className="text-[11px] text-slate-500 block">{new Date(o.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-400">₺{o.total_price}</span>
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg">
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Kargo Bilgisi Varsa */}
                {o.tracking_number && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs flex items-center justify-between text-blue-300">
                    <span>🚚 {o.cargo_company || "Kargo"}: <strong className="font-mono text-white">{o.tracking_number}</strong></span>
                    <span className="text-[11px] text-blue-400">Yolda</span>
                  </div>
                )}

                {/* Kalemler */}
                <div className="space-y-2">
                  {o.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xs">🚗</div>
                      )}
                      <div className="flex-1 min-w-0 text-xs">
                        <span className="text-slate-200 block truncate font-medium">{item.products?.title}</span>
                        <span className="text-[11px] text-slate-500">{item.quantity} Adet × ₺{item.unit_price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}