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
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="media-card-item">
              <div class="item-left">
                <div class="play-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div>
                  <div class="item-title">Pemutar Rekaman Sesi ${partNum}</div>
                  <div class="item-subtitle">Resolusi HD • Server Utama Terverifikasi</div>
                </div>
              </div>
              <div class="item-action">
                <span>Tonton</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </a>
          `;
        });

        const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pusat Arsip & Streaming Konten Digital Terpadu</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; line-height: 1.5; }
        .page-wrapper { max-width: 620px; margin: 40px auto; background: #1e293b; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2); border: 1px solid #334155; overflow: hidden; }
        .hero-header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 24px; text-align: center; color: #ffffff; }
        .hero-badge { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(4px); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
        .hero-header h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px 0; }
        .hero-header p { font-size: 13px; opacity: 0.9; margin: 0; }
        
        .content-body { padding: 24px; }
        .section-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
        .section-label span { background: #334155; color: #cbd5e1; padding: 2px 8px; border-radius: 4px; font-size: 11px; }

        .media-card-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #f8fafc; padding: 14px 16px; margin-bottom: 10px; border-radius: 10px; text-decoration: none; border: 1px solid #334155; transition: all 0.2s ease; }
        .media-card-item:hover { border-color: #3b82f6; background: #131c31; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
        
        .item-left { display: flex; align-items: center; gap: 14px; }
        .play-icon { width: 36px; height: 36px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .item-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        .item-subtitle { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        
        .item-action { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #60a5fa; background: rgba(59, 130, 246, 0.1); padding: 6px 12px; border-radius: 6px; }
        
        .footer-info { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; }
    </style>
</head>
<body>
    <div class="page-wrapper">
        <div class="hero-header">
            <div class="hero-badge">Portal Streaming Terverifikasi</div>
            <h1>Arsip Pemutar Media Digital</h1>
            <p>Silakan pilih sesi tayangan yang ingin kamu saksikan melalui daftar di bawah ini.</p>
        </div>
        
        <div class="content-body">
            <div class="section-label">
                Daftar Sesi Tersedia
                <span>${listTujuan.length} Bagian</span>
            </div>
            
            <div class="media-list">
                ${buttonsHtml}
            </div>

            <div class="footer-info">
                &copy; 2026 Direktori Konten Media. Aman, Cepat, dan Terenkripsi.
            </div>
        </div>
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
