import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase istemcisi (Fiyat doğrulaması için)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, kartBilgileri, musteriBilgileri } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Sepetiniz boş." },
        { status: 400 }
      );
    }

    // 1. GÜVENLİK KONTROLÜ: Gerçek ürün fiyatlarını veritabanından çekip doğrula
    const urunIdleri = items.map((i: any) => i.product_id);
    const { data: dbUrunler, error: dbHata } = await supabase
      .from("products")
      .select("id, price, stock, title")
      .in("id", urunIdleri);

    if (dbHata || !dbUrunler) {
      return NextResponse.json(
        { success: false, message: "Ürün bilgileri doğrulanamadı." },
        { status: 500 }
      );
    }

    // Toplam tutarı sunucu tarafında hesapla (Manipülasyonu engelle)
    let dogrulanmisToplam = 0;
    for (const item of items) {
      const dbUrun = dbUrunler.find((u) => u.id === item.product_id);
      if (!dbUrun) {
        return NextResponse.json(
          { success: false, message: `Geçersiz ürün: ${item.product_id}` },
          { status: 400 }
        );
      }
      if (dbUrun.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `"${dbUrun.title}" için yetersiz stok!` },
          { status: 400 }
        );
      }
      dogrulanmisToplam += Number(dbUrun.price) * item.quantity;
    }

    // 2. KART BİLGİLERİ FORMAT KONTROLÜ
    if (kartBilgileri) {
      const temizKartNo = (kartBilgileri.kartNo || "").replace(/\s+/g, "");
      if (temizKartNo.length < 15 || temizKartNo.length > 16) {
        return NextResponse.json(
          { success: false, message: "Geçersiz kart numarası." },
          { status: 400 }
        );
      }
      if (!kartBilgileri.skt || kartBilgileri.skt.length !== 5) {
        return NextResponse.json(
          { success: false, message: "Son kullanma tarihini kontrol edin (AA/YY)." },
          { status: 400 }
        );
      }
      if (!kartBilgileri.cvc || kartBilgileri.cvc.length < 3) {
        return NextResponse.json(
          { success: false, message: "Geçersiz güvenlik kodu (CVC)." },
          { status: 400 }
        );
      }
    }

    /* 
      NOT: PayTR / iyzico canlı API anahtarlarını aldığında:
      Burada ilgili POS gateway'e (örneğin PayTR iframe veya iyzico CreatePaymentRequest) 
      istek atıp dönen 3D HTML formunu dönebilirsin.
    */

    return NextResponse.json({
      success: true,
      message: "Ödeme ve sipariş başarıyla onaylandı.",
      verifiedTotal: dogrulanmisToplam,
    });
  } catch (error: any) {
    console.error("Ödeme hatası:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Sunucu hatası." },
      { status: 500 }
    );
  }
}