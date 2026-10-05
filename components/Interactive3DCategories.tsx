"use client";

import { useState } from "react";

export default function Interactive3DCategories() {
  // Animasyon Durumları (State)
  const [farAcik, setFarAcik] = useState(false);
  const [selektor, setSelektor] = useState(false);

  const [motorCalisiyor, setMotorCalisiyor] = useState(false);
  const [frenBasili, setFrenBasili] = useState(false);
  const [kaputAcik, setKaputAcik] = useState(false);
  const [turboBasiyor, setTurboBasiyor] = useState(false);
  const [ecuAktif, setEcuAktif] = useState(false);

  // Far Selektör Fonksiyonu
  const tetikleFar = () => {
    setFarAcik(!farAcik);
    setSelektor(true);
    setTimeout(() => setSelektor(false), 250);
  };

  // Turbo Patlatma Fonksiyonu
  const tetikleTurbo = () => {
    setTurboBasiyor(true);
    setTimeout(() => setTurboBasiyor(false), 800);
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      {/* BAŞLIK & VİTRİN */}
      <div className="text-center mb-14">
        <span className="px-3.5 py-1 text-[11px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 rounded-full uppercase">
          ✦ YENİ NESİL 3D OTO MEKANİK ATÖLYESİ
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight">
          Kategoriyi Seç & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">Mekanizmayı Çalıştır</span>
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl mx-auto">
          Gerçek zamanlı mekanik simülasyonu başlatmak ve parçanın içine bakmak için kartlara tıkla.
        </p>
      </div>

      {/* 3D KART IZGARASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. KART: AYDINLATMA & FAR */}
        <div
          onClick={tetikleFar}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-xl ${
            farAcik
              ? "bg-slate-900/90 border-cyan-500/70 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-cyan-400 font-bold">01 // AYDINLATMA</span>
            <span className={`px-2 py-0.5 rounded-full ${farAcik ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>
              {farAcik ? "● MERCEK AKTİF" : "○ KAPALI"}
            </span>
          </div>

          {/* 3D Far Sahnesi */}
          <div className="relative h-48 flex items-center justify-center my-2">
            <div
              className={`relative w-44 h-28 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-center ${
                farAcik
                  ? "border-cyan-400 bg-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.6)] scale-105"
                  : "border-slate-700 bg-slate-900 group-hover:border-slate-500"
              }`}
              style={{
                transform: farAcik ? "perspective(600px) rotateX(15deg) rotateY(-12deg) translateZ(30px)" : "perspective(600px) rotateX(5deg) rotateY(-5deg)",
              }}
            >
              {/* DRL Gündüz LED Şeridi */}
              <div className={`absolute top-3 left-3 right-3 h-1.5 rounded-full transition-all duration-300 ${
                farAcik ? "bg-cyan-300 shadow-[0_0_12px_#22d3ee]" : "bg-slate-800"
              }`} />

              {/* Bi-Xenon Mercek */}
              <div className={`relative w-16 h-16 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                selektor
                  ? "bg-white border-white shadow-[0_0_90px_#ffffff] scale-110"
                  : farAcik
                  ? "bg-cyan-400 border-cyan-200 shadow-[0_0_50px_#06b6d4] scale-105"
                  : "bg-slate-950 border-slate-700"
              }`}>
                <div className={`w-6 h-6 rounded-full ${farAcik ? "bg-white blur-[1px]" : "bg-slate-800"}`} />
              </div>

              {/* Işık Projeksiyonu */}
              {farAcik && (
                <div
                  className="absolute -right-20 top-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-r from-cyan-400/50 to-transparent blur-md pointer-events-none"
                  style={{ clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 65%)" }}
                />
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">Far & Stop Grubu</h3>
          <p className="text-xs text-slate-400 mt-1">Bi-Xenon mercekler, LED stoplar ve dinamik sinyal lambaları.</p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-cyan-400">Tıkla & Selektör Yap ⚡</span>
        </div>

        {/* 2. KART: MOTOR & MEKANİK (3D PİSTON ÇALIŞMASI) */}
        <div
          onClick={() => setMotorCalisiyor(!motorCalisiyor)}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-xl ${
            motorCalisiyor
              ? "bg-slate-900/90 border-amber-500/70 shadow-[0_0_50px_rgba(245,158,11,0.3)]"
              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-amber-400 font-bold">02 // MOTOR & MEKANİK</span>
            <span className={`px-2 py-0.5 rounded-full ${motorCalisiyor ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-500"}`}>
              {motorCalisiyor ? "● 6500 RPM" : "○ RÖLANTİ"}
            </span>
          </div>

          {/* 3D Piston & Silindir Sahnesi */}
          <div className="relative h-48 flex items-center justify-center my-2">
            <div className="relative w-28 h-40 border-2 border-slate-700 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-between p-2 overflow-hidden shadow-inner">
              {/* Buji Ateşleme Noktası */}
              <div className={`w-3 h-3 rounded-full transition-all duration-150 ${
                motorCalisiyor ? "bg-yellow-300 shadow-[0_0_20px_#fde047] scale-125 animate-ping" : "bg-slate-700"
              }`} />

              {/* Piston Başı (Vuruntu Hareketi) */}
              <div
                className={`w-20 h-14 rounded-xl border-2 transition-transform ${
                  motorCalisiyor
                    ? "border-amber-400 bg-gradient-to-b from-amber-500/40 to-slate-800 animate-bounce"
                    : "border-slate-600 bg-slate-800"
                }`}
                style={{ animationDuration: motorCalisiyor ? "0.35s" : "0s" }}
              >
                <div className="h-1 bg-amber-400/50 mt-2 mx-2 rounded-full" />
                <div className="h-1 bg-amber-400/30 mt-1 mx-2 rounded-full" />
              </div>

              {/* Biyel Kolu */}
              <div className={`w-2.5 h-16 bg-slate-600 rounded-full transition-all ${motorCalisiyor ? "bg-amber-500/60" : ""}`} />
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">Motor & Mekanik</h3>
          <p className="text-xs text-slate-400 mt-1">Piston takımları, triger setleri, devirdaim ve silindir kapakları.</p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-amber-400">Tıkla & Ateşlemeyi Başlat 🔥</span>
        </div>

        {/* 3. KART: FREN & YÜRÜYEN (3D DİSK & KALİPER) */}
        <div
          onClick={() => setFrenBasili(!frenBasili)}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-xl ${
            frenBasili
              ? "bg-slate-900/90 border-rose-500/70 shadow-[0_0_50px_rgba(244,63,94,0.3)]"
              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-rose-400 font-bold">03 // FREN & SÜSPANSİYON</span>
            <span className={`px-2 py-0.5 rounded-full ${frenBasili ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-slate-500"}`}>
              {frenBasili ? "● FREN KİLİTLİ" : "○ SERBEST DÖNÜŞ"}
            </span>
          </div>

          {/* 3D Dönen Fren Diski */}
          <div className="relative h-48 flex items-center justify-center my-2">
            <div
              className="relative w-36 h-36 flex items-center justify-center"
              style={{ transform: "perspective(600px) rotateY(-20deg)" }}
            >
              {/* Dönen Disk */}
              <div
                className={`w-36 h-36 rounded-full border-4 border-dashed transition-all flex items-center justify-center ${
                  frenBasili
                    ? "border-rose-500 bg-rose-950/20 shadow-[0_0_35px_rgba(244,63,94,0.6)]"
                    : "border-slate-500 bg-slate-900/90 animate-spin"
                }`}
                style={{ animationDuration: "1.2s" }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-950 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-slate-700" />
                </div>
              </div>

              {/* Fren Kaliperi */}
              <div
                className={`absolute top-0 right-0 w-12 h-20 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                  frenBasili
                    ? "bg-rose-600 border-white shadow-[0_0_25px_#f43f5e] scale-110"
                    : "bg-rose-700/80 border-rose-500"
                }`}
              >
                <span className="text-[9px] font-black text-white -rotate-90 tracking-tighter">STOP</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition">Fren & Yürüyen</h3>
          <p className="text-xs text-slate-400 mt-1">Hava kanallı diskler, seramik balatalar ve gazlı amortisörler.</p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-rose-400">Tıkla & Frene Asıl 🛑</span>
        </div>

        {/* 4. KART: KAPORTA & GÖVDE (3D AÇILIR KAPUT) */}
        <div
          onClick={() => setKaputAcik(!kaputAcik)}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-xl ${
            kaputAcik
              ? "bg-slate-900/90 border-blue-500/70 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-blue-400 font-bold">04 // KAPORTA & GÖVDE</span>
            <span className={`px-2 py-0.5 rounded-full ${kaputAcik ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-500"}`}>
              {kaputAcik ? "● KAPUT AÇIK" : "○ KAPALI"}
            </span>
          </div>

          {/* 3D Kaput & Gövde Sahnesi */}
          <div className="relative h-48 flex items-center justify-center my-2">
            <div className="relative w-44 h-32 flex items-center justify-center" style={{ perspective: "800px" }}>
              <div className="w-40 h-28 bg-slate-950 border-2 border-slate-700 rounded-2xl p-2 flex flex-col justify-center items-center shadow-inner">
                <span className="text-2xl">⚡</span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">MOTOR BÖLGESİ</span>
              </div>

              {/* Yukarı Doğru 3D Açılan Kaput */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-slate-800 via-blue-950 to-slate-900 border-2 border-blue-500/50 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-700 origin-top"
                style={{
                  transform: kaputAcik ? "rotateX(-65deg) translateY(-10px)" : "rotateX(0deg)",
                }}
              >
                <div className="text-center">
                  <div className="w-12 h-1 bg-blue-400/40 rounded-full mx-auto mb-1" />
                  <span className="text-[11px] font-mono text-slate-300 font-bold">AERODİNAMİK KAPUT</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">Kaporta & Karoser</h3>
          <p className="text-xs text-slate-400 mt-1">Ön kaputlar, çamurluklar, tampon demirleri ve kilit mekanizmaları.</p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-blue-400">Tıkla & Kaputu Kaldır 🚗</span>
        </div>

        {/* 5. KART: TURBO & EGZOZ (BLOW-OFF & BOOST) */}
        <div
          onClick={tetikleTurbo}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-xl ${
            turboBasiyor
              ? "bg-slate-900/90 border-purple-500/70 shadow-[0_0_50px_rgba(168,85,247,0.35)]"
              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-purple-400 font-bold">05 // TURBO & EGZOZ</span>
            <span className={`px-2 py-0.5 rounded-full ${turboBasiyor ? "bg-purple-500/20 text-purple-300" : "bg-slate-800 text-slate-500"}`}>
              {turboBasiyor ? "● 2.2 BAR BOOST" : "○ VAKUM"}
            </span>
          </div>

          {/* 3D Turbo Pervanesi */}
          <div className="relative h-48 flex items-center justify-center my-2">
            <div className="relative flex items-center justify-center">
              <div className={`w-28 h-28 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                turboBasiyor ? "border-purple-400 bg-purple-950/40 shadow-[0_0_40px_#a855f7]" : "border-slate-700 bg-slate-950"
              }`}>
                <div className={`w-20 h-20 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center ${
                  turboBasiyor ? "animate-spin" : ""
                }`} style={{ animationDuration: "0.2s" }}>
                  <span className="text-2xl">🌀</span>
                </div>
              </div>

              {turboBasiyor && (
                <div className="absolute -right-12 w-20 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-300 rounded-full blur-sm animate-pulse transform rotate-12" />
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">Turbo & Egzoz</h3>
          <p className="text-xs text-slate-400 mt-1">Intercooler, turbo şarj üniteleri, manifold ve egzoz susturucuları.</p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-purple-400">Tıkla & Basıncı Yükle (Boost) 💨</span>
        </div>

        {/* 6. KART: ELEKTRİK & ECU BEYİN */}
        <div
          onClick={() => setEcuAktif(!ecuAktif)}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-xl ${
            ecuAktif
              ? "bg-slate-900/90 border-emerald-500/70 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">06 // BEYİN & ELEKTRİK</span>
            <span className={`px-2 py-0.5 rounded-full ${ecuAktif ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"}`}>
              {ecuAktif ? "● CAN-BUS BAĞLI" : "○ UYKU MODU"}
            </span>
          </div>

          {/* 3D Anakart ve Mikroçip */}
          <div className="relative h-48 flex items-center justify-center my-2">
            <div className="relative w-36 h-36 bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner overflow-hidden">
              <div className={`w-16 h-16 border-2 transition-all duration-300 rounded-xl flex items-center justify-center ${
                ecuAktif
                  ? "border-emerald-300 bg-emerald-950 shadow-[0_0_30px_#10b981]"
                  : "border-slate-700 bg-slate-900"
              }`}>
                <span className="font-mono text-xs font-black text-emerald-400">ECU</span>
              </div>

              {ecuAktif && (
                <>
                  <div className="absolute top-2 left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
                  <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
                </>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">Elektrik & Beyin (ECU)</h3>
          <p className="text-xs text-slate-400 mt-1">Motor beyinleri, sensörler, ateşleme bobinleri ve sigorta kutuları.</p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-emerald-400">Tıkla & Teşhis (OBD2) Yap 💻</span>
        </div>

      </div>
    </section>
  );
}