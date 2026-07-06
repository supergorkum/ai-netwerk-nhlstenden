import { getStore } from '@netlify/blobs'

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('POST only', { status: 405 })
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  try {
    const bezoek = await req.json()
    const store = getStore('aihub-data')

    // Haal bestaande array op (opgeslagen als JSON-string via storage.js)
    let bestaand = []
    try {
      const raw = await store.get('analytics-bezoeken')
      if (raw) {
        bestaand = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : [])
      }
    } catch {}

    const nieuw = [...bestaand, bezoek].slice(-500)

    // Sla op als JSON-string, consistent met hoe storage.js het opslaat
    await store.set('analytics-bezoeken', JSON.stringify(nieuw))

    return new Response(JSON.stringify({ ok: true, totaal: nieuw.length }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export const config = { path: '/.netlify/functions/log-bezoek' }
