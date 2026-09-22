export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { links } = body; 

    // Jika input dikirim sebagai string panjang dengan baris baru (textarea)
    let linkArray = [];
    if (typeof links === 'string') {
      linkArray = links.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } else if (Array.isArray(links)) {
      linkArray = links.map(l => l.trim()).filter(l => l.length > 0);
    }

    if (linkArray.length === 0) {
      return new Response(JSON.stringify({ error: "Masukkan minimal satu link!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const domainUtama = new URL(request.url).origin;

    // Otomatis gabungkan link berjejer ke bawah menjadi format tersimpan dengan koma
    const gabunganLinkTujuan = linkArray.join(",");

    // Buat slug acak unik 6 karakter
    const slug = Math.random().toString(36).substring(2, 8);
    
    // Simpan ke Cloudflare D1
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
