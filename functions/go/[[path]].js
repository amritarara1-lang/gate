export async function onRequest(context) {
  const { request, env, params } = context;
  const userAgent = request.headers.get("user-agent") || "";
  
  // Deteksi bot Meta / sosmed
  const botPatterns = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i;

  // Jika yang akses bot Meta, biarkan melihat halaman artikel bersih (index.html utama)
  if (botPatterns.test(userAgent)) {
    return env.ASSETS.fetch(request);
  }

  // Ambil slug unik dari URL
  const pathArray = params.path;
  const slug = pathArray ? pathArray[0] : "";

  if (!slug) {
    return env.ASSETS.fetch(request);
  }

  try {
    // Ambil data dari Cloudflare D1 database
    const { results } = await env.DB.prepare(
      "SELECT link_tujuan FROM links WHERE slug = ? LIMIT 1"
    ).bind(slug).all();

    if (results && results.length > 0 && results[0].link_tujuan) {
      let rawTujuan = results[0].link_tujuan;
      
      // Pecah link berdasarkan koma
      let listTujuan = rawTujuan.split(",").map(l => l.trim()).filter(l => l.length > 0);

      if (listTujuan.length > 0) {
        // Buat HTML daftar tombol interaktif dinamis seperti yang kamu inginkan
        let buttonsHtml = "";
        listTujuan.forEach((url, index) => {
          let partNum = index + 1;
          buttonsHtml += `
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="
              display: block;
              background: #22c55e;
              color: #ffffff;
              text-align: center;
              padding: 14px 20px;
              margin-bottom: 12px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              font-size: 15px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              transition: background 0.2s;
            ">TONTON MEDIA PART ${partNum}</a>
          `;
        });

        const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembaruan Konten Media Digital - Portal Informasi</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f6f8; color: #333; margin: 0; padding: 20px; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 4px solid #0066cc; }
        h2 { font-size: 20px; color: #111; margin-top: 0; margin-bottom: 8px; text-align: center; }
        .subtitle { font-size: 13px; color: #666; text-align: center; margin-bottom: 25px; }
        .desc { font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 25px; text-align: center; background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef; }
        .btn-container { background: #111; padding: 20px; border-radius: 8px; margin-top: 15px; }
        .footer { text-align: center; font-size: 11px; color: #999; margin-top: 25px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <h2>Pembaruan Konten Media Digital</h2>
        <div class="subtitle">Kategori: Informasi & Teknologi Terkini</div>
        
        <div class="desc">
            Halaman ini memuat tautan arsip digital dan pemutar media daring. Silakan pilih tombol bagian (*part*) di bawah ini untuk mengakses materi video yang diinginkan.
        </div>
        
        <div class="btn-container">
            <div style="color: #bbb; text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Pemutar Media Siap Diputar</div>
            ${buttonsHtml}
        </div>

        <div class="footer">© Sistem Jembatan Akses Digital. All rights reserved.</div>
    </div>
</body>
</html>`;

        return new Response(htmlTemplate, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }
    }
  } catch (err) {
    console.error(err);
  }

  // Jika slug tidak ditemukan, kembalikan ke halaman utama
  return env.ASSETS.fetch(request);
}
