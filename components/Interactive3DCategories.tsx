"use client";

import { useState } from "react";

interface InteractiveProps {
  onSelectCategory?: (kategori: string) => void;
  activeCategory?: string;
}

export default function Interactive3DCategories({ onSelectCategory, activeCategory }: InteractiveProps) {
  const [farAcik, setFarAcik] = useState(false);
  const [selektor, setSelektor] = useState(false);
  const [motorCalisiyor, setMotorCalisiyor] = useState(false);
  const [frenBasili, setFrenBasili] = useState(false);
  const [kaputAcik, setKaputAcik] = useState(false);
  const [turboBasiyor, setTurboBasiyor] = useState(false);
  const [ecuAktif, setEcuAktif] = useState(false);

  const handleKategoriSecim = (kategori: string) => {
    if (onSelectCategory) {
      onSelectCategory(kategori);
      // Sayfayı ürün listesine pürüzsüz kaydır
      const listeAlani = document.getElementById("parca-katalog-alani");
      if (listeAlani) {
        listeAlani.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const tetikleFar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFarAcik(!farAcik);
    setSelektor(true);
    setTimeout(() => setSelektor(false), 250);
    handleKategoriSecim("Aydınlatma");
  };

  const tetikleMotor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMotorCalisiyor(!motorCalisiyor);
    handleKategoriSecim("Mekanik & Motor");
  };

  const tetikleFren = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrenBasili(!frenBasili);
    handleKategoriSecim("Yürüyen & Fren");
  };

  const tetikleKaput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKaputAcik(!kaputAcik);
    handleKategoriSecim("Kaporta & Karoser");
  };

  const tetikleTurbo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTurboBasiyor(true);
    setTimeout(() => setTurboBasiyor(false), 800);
    handleKategoriSecim("Mekanik & Motor");
  };

  const tetikleEcu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEcuAktif(!ecuAktif);
    handleKategoriSecim("Elektrik & Elektronik");
  };

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* VİTRİN VE İSTATİSTİK BAR */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>CYBER-GARAGE // 3D ETKİLEŞİMLİ PARÇA LABORATUVARI</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mt-4 tracking-tight">
          Sanal Atölyede Keşfet & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Tek Tıkla Filtrele</span>
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl mx-auto">
          Mekanik parçaya dokun, 3D simülasyonunu izle ve ilgili kategorideki tüm OEM parçaları otomatik listele.
        </p>
      </div>

      {/* 6'LI 3D KART IZGARASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. AYDINLATMA & FAR */}
        <div
          onClick={tetikleFar}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-2xl ${
            activeCategory === "Aydınlatma"
              ? "bg-slate-900/90 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/50"
              : "bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/50 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-cyan-400 font-bold tracking-wider">01 // OPTİK & AYDINLATMA</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${farAcik ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-slate-800 text-slate-500"}`}>
              {farAcik ? "⚡ SELEKTÖR HAZIR" : "○ PASİF"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center my-3">
            <div
              className={`relative w-44 h-28 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-center ${
                farAcik
                  ? "border-cyan-400 bg-slate-950 shadow-[0_0_45px_rgba(6,182,212,0.65)] scale-105"
                  : "border-slate-800 bg-slate-900/80 group-hover:border-slate-600"
              }`}
              style={{
                transform: farAcik ? "perspective(600px) rotateX(15deg) rotateY(-12deg) translateZ(30px)" : "perspective(600px) rotateX(5deg) rotateY(-5deg)",
              }}
            >
              <div className={`absolute top-3 left-4 right-4 h-1.5 rounded-full transition-all duration-300 ${
                farAcik ? "bg-cyan-300 shadow-[0_0_15px_#22d3ee]" : "bg-slate-800"
              }`} />
              <div className={`relative w-16 h-16 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                selektor
                  ? "bg-white border-white shadow-[0_0_100px_#ffffff] scale-110"
                  : farAcik
                  ? "bg-cyan-400 border-cyan-200 shadow-[0_0_55px_#06b6d4] scale-105"
                  : "bg-slate-950 border-slate-700"
              }`}>
                <div className={`w-6 h-6 rounded-full ${farAcik ? "bg-white blur-[1px]" : "bg-slate-800"}`} />
              </div>
              {farAcik && (
                <div
                  className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-cyan-400/50 to-transparent blur-md pointer-events-none"
                  style={{ clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 65%)" }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">Aydınlatma Grubu</h3>
              <p className="text-[11px] text-slate-400">Far, Stop, Mercek, LED Sinyal</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/60 group-hover:bg-cyan-500 group-hover:text-black transition">
              Listele →
            </span>
          </div>
        </div>

        {/* 2. MOTOR & MEKANİK */}
        <div
          onClick={tetikleMotor}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-2xl ${
            activeCategory === "Mekanik & Motor"
              ? "bg-slate-900/90 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)] ring-2 ring-amber-500/50"
              : "bg-slate-950/60 border-slate-800/80 hover:border-amber-500/50 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-amber-400 font-bold tracking-wider">02 // MOTOR & İÇTEN YANMA</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${motorCalisiyor ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-500"}`}>
              {motorCalisiyor ? "🔥 6800 RPM" : "○ STOP"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center my-3">
            <div className="relative w-28 h-36 border-2 border-slate-800 bg-slate-950 rounded-2xl flex flex-col items-center justify-between p-2 shadow-inner">
              <div className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                motorCalisiyor ? "bg-amber-300 shadow-[0_0_25px_#f59e0b] scale-125 animate-ping" : "bg-slate-800"
              }`} />
              <div
                className={`w-20 h-12 rounded-xl border-2 transition-transform ${
                  motorCalisiyor
                    ? "border-amber-400 bg-gradient-to-b from-amber-500/50 to-slate-900 animate-bounce"
                    : "border-slate-700 bg-slate-800"
                }`}
                style={{ animationDuration: motorCalisiyor ? "0.3s" : "0s" }}
              >
                <div className="h-1 bg-amber-400/50 mt-1.5 mx-2 rounded-full" />
              </div>
              <div className={`w-2 h-14 bg-slate-700 rounded-full transition-all ${motorCalisiyor ? "bg-amber-500/80" : ""}`} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">Motor & Mekanik</h3>
              <p className="text-[11px] text-slate-400">Piston, Triger, Devirdaim, Enjektör</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-950 text-amber-400 font-bold border border-amber-800/60 group-hover:bg-amber-500 group-hover:text-black transition">
              Listele →
            </span>
          </div>
        </div>

        {/* 3. FREN & SÜSPANSİYON */}
        <div
          onClick={tetikleFren}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-2xl ${
            activeCategory === "Yürüyen & Fren"
              ? "bg-slate-900/90 border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.4)] ring-2 ring-rose-500/50"
              : "bg-slate-950/60 border-slate-800/80 hover:border-rose-500/50 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-rose-400 font-bold tracking-wider">03 // DİNAMİK & FREN</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${frenBasili ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-800 text-slate-500"}`}>
              {frenBasili ? "🛑 BASILI" : "○ SERBEST"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center my-3">
            <div className="relative w-36 h-36 flex items-center justify-center" style={{ transform: "perspective(600px) rotateY(-20deg)" }}>
              <div
                className={`w-32 h-32 rounded-full border-4 border-dashed transition-all flex items-center justify-center ${
                  frenBasili
                    ? "border-rose-500 bg-rose-950/30 shadow-[0_0_40px_rgba(244,63,94,0.7)]"
                    : "border-slate-600 bg-slate-900/90 animate-spin"
                }`}
                style={{ animationDuration: "1s" }}
              >
                <div className="w-14 h-14 rounded-full border-2 border-slate-600 bg-slate-950 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
                </div>
              </div>
              <div
                className={`absolute top-1 right-1 w-11 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                  frenBasili
                    ? "bg-rose-600 border-white shadow-[0_0_30px_#f43f5e] scale-110"
                    : "bg-rose-700/80 border-rose-500"
                }`}
              >
                <span className="text-[9px] font-black text-white -rotate-90">BREMBO</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition">Yürüyen & Fren</h3>
              <p className="text-[11px] text-slate-400">Disk, Balata, Amortisör, Aks</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-950 text-rose-400 font-bold border border-rose-800/60 group-hover:bg-rose-500 group-hover:text-black transition">
              Listele →
            </span>
          </div>
        </div>

        {/* 4. KAPORTA & KAROSER */}
        <div
          onClick={tetikleKaput}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-2xl ${
            activeCategory === "Kaporta & Karoser"
              ? "bg-slate-900/90 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.4)] ring-2 ring-blue-500/50"
              : "bg-slate-950/60 border-slate-800/80 hover:border-blue-500/50 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-blue-400 font-bold tracking-wider">04 // GÖVDE & KAROSER</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kaputAcik ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "bg-slate-800 text-slate-500"}`}>
              {kaputAcik ? "🚗 KAPUT AÇIK" : "○ KAPALI"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center my-3">
            <div className="relative w-44 h-28 flex items-center justify-center" style={{ perspective: "800px" }}>
              <div className="w-40 h-24 bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-col justify-center items-center">
                <span className="text-2xl">🔧</span>
                <span className="text-[10px] font-mono text-slate-500 mt-1">GÖVDE ŞASİSİ</span>
              </div>
              <div
                className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-800 border-2 border-blue-500/60 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-700 origin-top"
                style={{
                  transform: kaputAcik ? "rotateX(-65deg) translateY(-12px)" : "rotateX(0deg)",
                }}
              >
                <span className="text-[11px] font-mono text-blue-300 font-bold">ÖN KAPUT & PANEL</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">Kaporta & Karoser</h3>
              <p className="text-[11px] text-slate-400">Kaput, Çamurluk, Tampon, Kapı</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 font-bold border border-blue-800/60 group-hover:bg-blue-500 group-hover:text-black transition">
              Listele →
            </span>
          </div>
        </div>

        {/* 5. TURBO & MANİFOLD (Mekanik Alt Grubu) */}
        <div
          onClick={tetikleTurbo}
          className="relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-2xl bg-slate-950/60 border-slate-800/80 hover:border-purple-500/50 hover:-translate-y-2 shadow-xl"
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-purple-400 font-bold tracking-wider">05 // AŞIRI BESLEME (TURBO)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${turboBasiyor ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-slate-800 text-slate-500"}`}>
              {turboBasiyor ? "💨 2.4 BAR BOOST" : "○ VAKUM"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center my-3">
            <div className={`w-28 h-28 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
              turboBasiyor ? "border-purple-400 bg-purple-950/50 shadow-[0_0_45px_#a855f7]" : "border-slate-800 bg-slate-950"
            }`}>
              <div className={`w-18 h-18 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center ${
                turboBasiyor ? "animate-spin" : ""
              }`} style={{ animationDuration: "0.2s" }}>
                <span className="text-3xl">🌀</span>
              </div>
            </div>
            {turboBasiyor && (
              <div className="absolute -right-6 w-16 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm animate-pulse transform rotate-12" />
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">Turbo & Egzoz</h3>
              <p className="text-[11px] text-slate-400">Intercooler, Manifold, Turbocharger</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-950 text-purple-400 font-bold border border-purple-800/60 group-hover:bg-purple-500 group-hover:text-black transition">
              Listele →
            </span>
          </div>
        </div>

        {/* 6. ELEKTRİK & ECU BEYİN */}
        <div
          onClick={tetikleEcu}
          className={`relative group cursor-pointer rounded-3xl p-6 transition-all duration-500 border backdrop-blur-2xl ${
            activeCategory === "Elektrik & Elektronik"
              ? "bg-slate-900/90 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/50"
              : "bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/50 hover:-translate-y-2 shadow-xl"
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-emerald-400 font-bold tracking-wider">06 // BEYİN & CAN-BUS</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ecuAktif ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-500"}`}>
              {ecuAktif ? "⚡ TELEMETRİ AKTİF" : "○ UYKU"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center my-3">
            <div className="relative w-32 h-32 bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner overflow-hidden">
              <div className={`w-14 h-14 border-2 transition-all duration-300 rounded-xl flex items-center justify-center ${
                ecuAktif ? "border-emerald-300 bg-emerald-950 shadow-[0_0_30px_#10b981]" : "border-slate-800 bg-slate-900"
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

          <div className="flex items-center justify-between mt-3">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">Elektrik & Beyin</h3>
              <p className="text-[11px] text-slate-400">Sensör, Sigorta, Bobin, Gösterge</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60 group-hover:bg-emerald-500 group-hover:text-black transition">
              Listele →
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}