export async function onRequest(context) {
  const { request, env, params } = context;
  const userAgent = request.headers.get("user-agent") || "";
  
  // Deteksi bot Meta / sosmed
  const botPatterns = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i;

  // Jika yang akses bot Meta, biarkan melihat halaman artikel bersih (index.html)
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
    // Ambil data dari Cloudflare D1 database (pastikan binding database dinamai 'DB' di Cloudflare Pages)
    const { results } = await env.DB.prepare(
      "SELECT link_tujuan FROM links WHERE slug = ? LIMIT 1"
    ).bind(slug).all();

    if (results && results.length > 0 && results[0].link_tujuan) {
      // Redirect mulus manusia ke tujuan akhir
      return Response.redirect(results[0].link_tujuan, 302);
    }
  } catch (err) {
    console.error(err);
  }

  // Jika slug tidak ditemukan, kembalikan ke halaman utama
  return env.ASSETS.fetch(request);
}
