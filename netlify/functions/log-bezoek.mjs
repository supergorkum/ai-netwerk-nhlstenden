// Netlify Function: log één paginabezoek via dezelfde storage.js aanpak
// Gebruikt fetch naar storage.js zodat het formaat consistent blijft

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('POST only', { status: 405 })
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  try {
    const bezoek = await req.json()

    // Haal bestaande data op via storage.js (zelfde aanroep als de browser doet)
    const siteUrl = process.env.URL || 'https://ai-netwerk-nhlstenden.netlify.app'
    const getRes = await fetch(`${siteUrl}/.netlify/functions/storage?key=analytics-bezoeken`)
    const getData = await getRes.json()

    let bestaand = []
    try {
      const raw = getData.value
      bestaand = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : [])
    } catch {}

    const nieuw = [...bestaand, bezoek].slice(-500)

    // Sla op via storage.js
    await fetch(`${siteUrl}/.netlify/functions/storage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'analytics-bezoeken', value: JSON.stringify(nieuw) }),
    })

    return new Response(JSON.stringify({ ok: true, totaal: nieuw.length }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export const config = { path: '/.netlify/functions/log-bezoek' }
