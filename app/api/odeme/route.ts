import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, totalPrice, paymentMethod } = body;

    // Gerçek PayTR veya İyzico entegrasyonunda API anahtarlarıyla oturum açılır.
    // Şimdilik ödeme başarılı simülasyonu:
    return NextResponse.json({
      success: true,
      orderId,
      redirectUrl: `/odeme-sonuc?orderId=${orderId}&status=success`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}