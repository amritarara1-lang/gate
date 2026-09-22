export async function onRequest(context) {
  const { request, env, params } = context;
  const userAgent = request.headers.get("user-agent") || "";
  
  // Deteksi bot Meta / sosmed
  const botPatterns = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i;

  if (botPatterns.test(userAgent)) {
    return env.ASSETS.fetch(request);
  }

  const pathArray = params.path;
  const slug = pathArray ? pathArray[0] : "";

  if (!slug) {
    return env.ASSETS.fetch(request);
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT link_tujuan FROM links WHERE slug = ? LIMIT 1"
    ).bind(slug).all();

    if (results && results.length > 0 && results[0].link_tujuan) {
      let rawTujuan = results[0].link_tujuan;
      let listTujuan = rawTujuan.split(",").map(l => l.trim()).filter(l => l.length > 0);

      if (listTujuan.length > 0) {
        let buttonsHtml = "";
        listTujuan.forEach((url, index) => {
          let partNum = index + 1;
          buttonsHtml += `
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #ffffff;
              color: #1f2937;
              text-align: left;
              padding: 14px 18px;
              margin-bottom: 10px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 1px 2px rgba(0,0,0,0.03);
              transition: all 0.2s ease;
            ">
              <span>Bagian / Sesi ${partNum}</span>
              <span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 4px; font-size: 12px;">Buka &rarr;</span>
            </a>
          `;
        });

        const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arsip Berita & Publikasi Media Terpadu</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f3f4f6; color: #1f2937; margin: 0; padding: 24px; line-height: 1.5; }
        .main-card { max-width: 540px; margin: 50px auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.5px; }
        h1 { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 10px 0; }
        .desc { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
        .list-box { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #f3f4f6; }
        .list-title { font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .footer-note { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="main-card">
        <div class="badge">Pusat Informasi Publik</div>
        <h1>Dokumentasi & Akses Tayangan Media</h1>
        <div class="desc">Silakan pilih salah satu tautan sesi pemutaran di bawah ini untuk melanjutkan ke halaman arsip media terkait.</div>
        
        <div class="list-box">
            <div class="list-title">Daftar Tautan Tersedia (${listTujuan.length} Sesi)</div>
            ${buttonsHtml}
        </div>

        <div class="footer-note">&copy; 2026 Portal Layanan Informasi Digital. All rights reserved.</div>
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

  return env.ASSETS.fetch(request);
}
