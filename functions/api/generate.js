export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { links } = body; // Array berisi daftar link tujuan

    if (!links || !Array.isArray(links) || links.length === 0) {
      return new Response(JSON.stringify({ error: "Format data tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const domainUtama = new URL(request.url).origin;

    // Gabungkan semua link tujuan dengan tanda koma (sesuai logika dashboard lama)
    const gabunganLinkTujuan = links.join(",");

    // Buat satu slug acak unik 6 karakter untuk seluruh kumpulan link tersebut
    const slug = Math.random().toString(36).substring(2, 8);
    
    // Simpan ke Cloudflare D1 sebagai 1 kesatuan data
    await env.DB.prepare(
      "INSERT INTO links (slug, link_tujuan) VALUES (?, ?)"
    ).bind(slug, gabunganLinkTujuan).run();

    const generatedResults = [{
      tujuan: gabunganLinkTujuan,
      gateway: `${domainUtama}/go/${slug}`
    }];

    return new Response(JSON.stringify({ success: true, data: generatedResults }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
