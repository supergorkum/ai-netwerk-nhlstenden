export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('POST only', { status: 405 })
  }
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  try {
    const bezoek = await req.json()
    const base = new URL(req.url).origin
    // De site staat achter het sitewachtwoord van Netlify; zonder het cookie
    // van de bezoeker krijgt deze aanroep naar de eigen site een 401.
    const cookie = req.headers.get('cookie') || ''
    const getRes = await fetch(`${base}/.netlify/functions/storage?key=analytics-bezoeken`, { headers: { cookie } })
    const getData = await getRes.json()
    let bestaand = []
    try { bestaand = JSON.parse(getData.value || '[]') } catch {}
    const nieuw = [...bestaand, bezoek].slice(-500)
    await fetch(`${base}/.netlify/functions/storage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ key: 'analytics-bezoeken', value: JSON.stringify(nieuw) }),
    })
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}
export const config = { path: '/.netlify/functions/log-bezoek' }
