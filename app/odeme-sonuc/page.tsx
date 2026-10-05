"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function OdemeIcerik() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status") || "success";

  const basarili = status === "success";

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
      <div className="flex justify-center">
        {basarili ? (
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl">
            ✅
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-3xl">
            ❌
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white">
          {basarili ? "Ödemeniz Başarıyla Alındı!" : "Ödeme Başarısız Oldu"}
        </h1>
        <p className="text-xs text-slate-400">
          {basarili
            ? "Siparişiniz işleme alındı, parçanız en kısa sürede kargoya hazırlanacaktır."
            : "Kartınızdan çekim yapılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz."}
        </p>
      </div>

      {orderId && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Sipariş Takip Kodu</span>
          <span className="font-mono font-bold text-blue-400 text-lg">#{orderId.slice(0, 8)}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {orderId && (
          <Link
            href="/siparislerim"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            📦 Sipariş & Fatura Görüntüle
          </Link>
        )}
        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

export default function OdemeSonucPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-xs text-slate-500">Yükleniyor...</div>}>
        <OdemeIcerik />
      </Suspense>
    </main>
  );
}