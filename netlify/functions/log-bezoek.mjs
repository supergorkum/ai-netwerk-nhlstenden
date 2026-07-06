import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('POST only', { status: 405 })
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  try {
    const bezoek = await req.json()
    const store = getStore('aihub-data')

    let bestaand = []
    try {
      const waarde = await store.get('analytics-bezoeken')
      if (waarde) bestaand = JSON.parse(waarde)
    } catch {}

    const nieuw = [...bestaand, bezoek].slice(-500)
    await store.set('analytics-bezoeken', JSON.stringify(nieuw))

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export const config = { path: '/.netlify/functions/log-bezoek' }
