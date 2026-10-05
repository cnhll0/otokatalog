const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://jieihperzicrlfhnbuwn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZWlocGVyemljcmxmaG5idXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTUwOTcsImV4cCI6MjEwNTQ5MTA5N30.mD9bdv-IT-667_yZtxcfSBzbJIoIz4OLmxBKJNuxjDw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BASE_URL = "https://anteplioto.otocikma.com";

const bekle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Başlıktan Kategori Tespiti
function kategoriBelirle(baslik) {
  const b = baslik.toLowerCase();
  if (b.includes("far") || b.includes("stop") || b.includes("sinyal") || b.includes("sis") || b.includes("lamba")) return "Aydınlatma";
  if (b.includes("kapı") || b.includes("kapi") || b.includes("tampon") || b.includes("çamurluk") || b.includes("camurluk") || b.includes("kaput") || b.includes("bagaj") || b.includes("ayna")) return "Kaporta & Karoser";
  if (b.includes("motor") || b.includes("şanzıman") || b.includes("sanziman") || b.includes("turbo") || b.includes("enjektör") || b.includes("pompa") || b.includes("radyatör") || b.includes("silindir")) return "Mekanik & Motor";
  if (b.includes("beyin") || b.includes("gösterge") || b.includes("gosterge") || b.includes("sensör") || b.includes("sensor") || b.includes("dinamo") || b.includes("sigorta") || b.includes("ecu")) return "Elektrik & Elektronik";
  if (b.includes("amortisör") || b.includes("amortisor") || b.includes("fren") || b.includes("kaliper") || b.includes("aks") || b.includes("salıncak") || b.includes("direksiyon kutusu") || b.includes("taşıyıcı")) return "Yürüyen & Fren";
  if (b.includes("koltuk") || b.includes("direksiyon") || b.includes("torpido") || b.includes("konsol") || b.includes("döşeme") || b.includes("tavan")) return "İç Trim & Aksam";
  return "Çıkma Parça";
}

// Başlıktan OEM Kodu Ayıklama
function oemKoduBul(baslik) {
  const match = baslik.match(/\b([A-Z0-9]{7,13})\b/i);
  return match ? match[1].toUpperCase() : null;
}

async function hepsiniTopluCek() {
  console.log("==================================================");
  console.log("🚀 ANTEPLİ OTO ÇIKMA - EKSİKSİZ TOPLU ENVENTER ÇEKİMİ");
  console.log("==================================================\n");

  console.log("🚗 Araç listesi Supabase'den alınıyor...");
  const { data: araclar } = await supabase.from('vehicles').select('*');
  console.log(`   ↳ ${araclar ? araclar.length : 0} adet araç referansı eşleştirme için hazır.\n`);

  let sayfa = 1;
  let toplamEklenen = 0;
  let devamEt = true;
  let bosSayfaSayaci = 0;

  while (devamEt) {
    const url = sayfa === 1 ? BASE_URL : `${BASE_URL}?sayfa=${sayfa}`;
    console.log(`📄 [Sayfa ${sayfa}] Taranıyor: ${url}`);

    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 25000
      });

      const $ = cheerio.load(html);
      const sayfadakiUrunler = [];

      $('tbody tr, .classified-item, tr[data-id], .listing-item').each((_, element) => {
        const baslik = $(element).find('td:nth-child(2) a, a.title, .classified-title').first().text().trim();
        const fiyatMetni = $(element).find('td:nth-child(3), .price, .classified-price').text().trim();
        
        const imgEl = $(element).find('img');
        let resim = imgEl.attr('data-original') || 
                    imgEl.attr('data-src') || 
                    imgEl.attr('data-lazy-src') || 
                    imgEl.attr('src') || 
                    null;

        if (resim && (resim.includes('blank.gif') || resim.includes('loading') || resim.includes('spacer') || resim.includes('placeholder'))) {
          resim = imgEl.attr('data-original') || imgEl.attr('data-src') || null;
        }

        const link = $(element).find('a').attr('href');

        if (baslik && baslik.length > 2) {
          const temizFiyat = parseFloat(fiyatMetni.replace(/[^0-9]/g, '')) || 250;

          if (resim && !resim.startsWith('http')) {
            resim = resim.startsWith('//') ? 'https:' + resim : 'https://anteplioto.otocikma.com' + (resim.startsWith('/') ? '' : '/') + resim;
          }

          const kategori = kategoriBelirle(baslik);
          const oem = oemKoduBul(baslik);

          sayfadakiUrunler.push({
            title: baslik,
            price: temizFiyat,
            stock: 1,
            category: kategori,
            oem_code: oem,
            description: `Antepli Oto Çıkma Orijinal Yedek Parça. Durum: Çıkma / Temiz. İlan Kaynağı: ${link ? (link.startsWith('http') ? link : BASE_URL + link) : BASE_URL}`,
            image_url: resim
          });
        }
      });

      // İlan bulunamazsa
      if (sayfadakiUrunler.length === 0) {
        bosSayfaSayaci++;
        console.log(`   ⚠️ Sayfa ${sayfa} üzerinde ilan bulunamadı (${bosSayfaSayaci}/3).`);
        if (bosSayfaSayaci >= 3) {
          console.log("\n🏁 Mağazadaki tüm ilan sayfaları başarıyla tamamlandı!");
          devamEt = false;
          break;
        }
        sayfa++;
        await bekle(2000);
        continue;
      } else {
        bosSayfaSayaci = 0;
      }

      // Supabase'e ekle
      const { data: eklenenler, error } = await supabase
        .from('products')
        .insert(sayfadakiUrunler)
        .select();

      if (error) {
        console.error(`   ❌ Supabase Hata (Sayfa ${sayfa}):`, error.message);
      } else if (eklenenler) {
        toplamEklenen += eklenenler.length;
        console.log(`   ✅ ${eklenenler.length} parça eklendi (Kategori & OEM ayıklandı).`);

        // Araç Uyumluluklarını Otomatik Bağla
        if (araclar && araclar.length > 0) {
          const uyumluluklar = [];
          eklenenler.forEach((urun) => {
            const titleKucuk = urun.title.toLowerCase();

            araclar.forEach((arac) => {
              const markaKucuk = arac.brand.toLowerCase();
              const modelKucuk = arac.model.toLowerCase().split(' ')[0];

              if (titleKucuk.includes(modelKucuk) || (titleKucuk.includes(markaKucuk) && titleKucuk.includes(modelKucuk))) {
                uyumluluklar.push({
                  product_id: urun.id,
                  vehicle_id: arac.id
                });
              }
            });
          });

          if (uyumluluklar.length > 0) {
            await supabase.from('product_vehicle_compatibility').insert(uyumluluklar);
            console.log(`   🔗 ${uyumluluklar.length} araç uyumluluk bağı kuruldu.`);
          }
        }
      }

      console.log(`   📊 Güncel Toplam Parça: ${toplamEklenen}\n`);

      // Karşı sunucunun IP bloklamaması için güvenli bekleme süresi
      await bekle(1200);
      sayfa++;

    } catch (hata) {
      console.error(`   ❌ Sayfa ${sayfa} taranırken ağ hatası:`, hata.message);
      await bekle(4000);
      sayfa++;
    }
  }

  console.log("==================================================");
  console.log(`🎉 TOPLU AKTARIM BİTTİ! Toplam ${toplamEklenen} adet parça eklendi.`);
  console.log("==================================================");
}

hepsiniTopluCek();