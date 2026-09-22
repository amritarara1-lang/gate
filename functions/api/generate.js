export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { links } = body; // Array berisi daftar link tujuan

    if (!links || !Array.isArray(links)) {
      return new Response(JSON.stringify({ error: "Format data tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const generatedResults = [];
    const domainUtama = new URL(request.url).origin;

    for (const target of links) {
      // Buat slug acak unik sepanjang 6 karakter
      const slug = Math.random().toString(36.substring(2, 8));
      
      // Simpan ke Cloudflare D1
      await env.DB.prepare(
        "INSERT INTO links (slug, link_tujuan) VALUES (?, ?)"
      ).bind(slug, target).run();

      generatedResults.push({
        tujuan: target,
        gateway: `${domainUtama}/go/${slug}`
      });
    }

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
