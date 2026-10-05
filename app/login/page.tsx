"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mod, setMod] = useState<"giris" | "kayit">("giris");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);
    setMesaj(null);

    try {
      if (mod === "giris") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/profil");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMesaj("Kayıt başarılı! Şimdi bu bilgilerle giriş yapabilirsiniz.");
        setMod("giris");
      }
    } catch (h: any) {
      setMesaj("Hata: " + (h.message || "İşlem başarısız"));
    }
    setYukleniyor(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← Mağazaya Dön</Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mod === "giris" ? "Kullanıcı Girişi" : "Yeni Hesap Oluştur"}
          </h1>
          <p className="text-xs text-slate-400">
            Siparişlerinizi ve envanteri yönetmek için oturum açın.
          </p>
        </div>

        {mesaj && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl text-xs text-center">
            {mesaj}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">E-Posta Adresi</label>
            <input
              type="email"
              required
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Şifre</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            {yukleniyor ? "İşleniyor..." : mod === "giris" ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            onClick={() => { setMod(mod === "giris" ? "kayit" : "giris"); setMesaj(null); }}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {mod === "giris" ? "Hesabınız yok mu? Yeni Hesap Açın" : "Zaten hesabınız var mı? Giriş Yapın"}
          </button>
        </div>
      </div>
    </main>
  );
}