// Netlify Function — AI-Koers presentatie: duimpjes en feedback per pagina.
//
// Opslagmodel: één losse Blob-key per bezoeker per pagina, in plaats van
// één groot gedeeld JSON-blok. Dat voorkomt read-modify-write races
// wanneer tientallen mensen tegelijk tijdens een live presentatie stemmen
// (elke bezoeker schrijft alleen zijn eigen key, geen onderlinge botsing).
//
// Key-formaat: ai-koers:{paginaIndex}:{visitorId}
// Waarde: { stem: 'up' | 'down' | null, feedbackTekst: string | null, rol, tijdstip }
//
// Een nieuwe stem of nieuwe feedbacktekst van dezelfde bezoeker op dezelfde
// pagina overschrijft het bestaande record (laatste keuze telt), maar laat
// het andere veld intact als dat niet wordt meegestuurd (iemand kan eerst
// alleen een duimpje geven en later alsnog feedback toevoegen).

import { getStore } from '@netlify/blobs'

const STORE_NAAM = 'ai-koers-feedback'
const KEY_PREFIX = 'ai-koers:'

function veiligJSON(tekst, fallback) {
  try { return JSON.parse(tekst) } catch { return fallback }
}

export default async (req) => {
  const store = getStore(STORE_NAAM)
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  if (req.method === 'POST') {
    let body
    try { body = await req.json() } catch {
      return new Response(JSON.stringify({ error: 'Ongeldige request body' }), { status: 400, headers })
    }
    const { paginaIndex, visitorId, stem, feedbackTekst, rol } = body || {}
    if (paginaIndex === undefined || paginaIndex === null || !visitorId) {
      return new Response(JSON.stringify({ error: 'paginaIndex en visitorId zijn verplicht' }), { status: 400, headers })
    }

    const key = `${KEY_PREFIX}${paginaIndex}:${visitorId}`
    const bestaand = veiligJSON(await store.get(key), null) || {}

    const nieuw = {
      stem: stem !== undefined ? stem : (bestaand.stem ?? null),
      feedbackTekst: feedbackTekst !== undefined ? feedbackTekst : (bestaand.feedbackTekst ?? null),
      rol: rol || bestaand.rol || 'onbekend',
      tijdstip: new Date().toISOString(),
    }

    await store.set(key, JSON.stringify(nieuw))
    return new Response(JSON.stringify({ ok: true }), { headers })
  }

  if (req.method === 'GET') {
    // Alleen bedoeld voor het Beheer-overzicht: alle records ophalen en
    // per pagina samenvatten. Bij een grote zaal (honderden bezoekers) is
    // dit prima, want dit wordt alleen op aanvraag door de beheerder
    // gedraaid, niet bij elke paginaweergave.
    const { blobs } = await store.list({ prefix: KEY_PREFIX })
    const perPagina = {}

    await Promise.all(blobs.map(async (b) => {
      const record = veiligJSON(await store.get(b.key), null)
      if (!record) return
      const restNaSleutel = b.key.slice(KEY_PREFIX.length)
      const paginaIndex = restNaSleutel.split(':')[0]
      if (!perPagina[paginaIndex]) {
        perPagina[paginaIndex] = { paginaIndex: Number(paginaIndex), omhoog: 0, omlaag: 0, feedback: [] }
      }
      if (record.stem === 'up') perPagina[paginaIndex].omhoog++
      if (record.stem === 'down') perPagina[paginaIndex].omlaag++
      if (record.feedbackTekst && record.feedbackTekst.trim()) {
        perPagina[paginaIndex].feedback.push({
          tekst: record.feedbackTekst,
          rol: record.rol || 'onbekend',
          tijdstip: record.tijdstip,
        })
      }
    }))

    const resultaat = Object.values(perPagina).sort((a, b) => a.paginaIndex - b.paginaIndex)
    return new Response(JSON.stringify({ ok: true, paginas: resultaat }), { headers })
  }

  return new Response(JSON.stringify({ error: 'Alleen GET en POST' }), { status: 405, headers })
}

export const config = { path: '/.netlify/functions/ai-koers-feedback' }
