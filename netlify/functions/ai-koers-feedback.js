// Netlify Function — AI-Koers presentatie: duimpjes, feedback en bezoek.
//
// Opslagmodel: één losse Blob-key per bezoeker per pagina, in plaats van
// één groot gedeeld JSON-blok. Dat voorkomt read-modify-write races
// wanneer tientallen mensen tegelijk tijdens een live presentatie stemmen
// (elke bezoeker schrijft alleen zijn eigen key, geen onderlinge botsing).
//
// Twee soorten records:
//   ai-koers:{paginaIndex}:{visitorId}  ->  { stem, feedbackTekst, rol, tijdstip }
//   ai-koers-bezoek:{visitorId}         ->  { rol, eersteBezoek, laatsteBezoek }
//
// Het bezoek-record wordt geschreven zodra iemand de presentatiepagina
// opent, ongeacht of diegene ook een duimpje of feedback geeft. Zo kan het
// rapport het aantal bezoekers en het aantal feedbackgevers los van elkaar
// tonen.
//
// Een nieuwe stem of nieuwe feedbacktekst van dezelfde bezoeker op dezelfde
// pagina overschrijft het bestaande record (laatste keuze telt), maar laat
// het andere veld intact als dat niet wordt meegestuurd (iemand kan eerst
// alleen een duimpje geven en later alsnog feedback toevoegen).

import { getStore } from '@netlify/blobs'

const STORE_NAAM = 'ai-koers-feedback'
const KEY_PREFIX = 'ai-koers:'
const BEZOEK_PREFIX = 'ai-koers-bezoek:'

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
    const { visitorId, rol } = body || {}
    if (!visitorId) {
      return new Response(JSON.stringify({ error: 'visitorId is verplicht' }), { status: 400, headers })
    }

    // Bezoek-ping: los van pagina-specifieke stemmen/feedback.
    if (body.bezoek) {
      const key = `${BEZOEK_PREFIX}${visitorId}`
      const bestaand = veiligJSON(await store.get(key), null)
      const nu = new Date().toISOString()
      await store.set(key, JSON.stringify({
        rol: rol || bestaand?.rol || 'onbekend',
        eersteBezoek: bestaand?.eersteBezoek || nu,
        laatsteBezoek: nu,
      }))
      return new Response(JSON.stringify({ ok: true }), { headers })
    }

    const { paginaIndex, stem, feedbackTekst } = body
    if (paginaIndex === undefined || paginaIndex === null) {
      return new Response(JSON.stringify({ error: 'paginaIndex is verplicht' }), { status: 400, headers })
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
    // Alleen bedoeld voor het Beheer-overzicht en het rapport: alle
    // records ophalen en per pagina samenvatten. Bij een grote zaal
    // (honderden bezoekers) is dit prima, want dit wordt alleen op
    // aanvraag door de beheerder gedraaid, niet bij elke paginaweergave.
    const [feedbackResult, bezoekResult] = await Promise.all([
      store.list({ prefix: KEY_PREFIX }),
      store.list({ prefix: BEZOEK_PREFIX }),
    ])

    const perPagina = {}
    const feedbackgevers = new Set()

    await Promise.all(feedbackResult.blobs.map(async (b) => {
      const record = veiligJSON(await store.get(b.key), null)
      if (!record) return
      const restNaSleutel = b.key.slice(KEY_PREFIX.length)
      const [paginaIndex, visitorId] = restNaSleutel.split(':')
      if (record.stem || (record.feedbackTekst && record.feedbackTekst.trim())) {
        feedbackgevers.add(visitorId)
      }
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
    return new Response(JSON.stringify({
      ok: true,
      paginas: resultaat,
      aantalBezoekers: bezoekResult.blobs.length,
      aantalFeedbackgevers: feedbackgevers.size,
    }), { headers })
  }

  if (req.method === 'DELETE') {
    // Reset: alle opgeslagen duimpjes, feedback en bezoeken verwijderen.
    // Bedoeld om vrij te kunnen testen en daarna schoon te beginnen voor
    // de echte presentatie. Onomkeerbaar, de UI vraagt hiervoor expliciet
    // bevestiging.
    const [feedbackResult, bezoekResult] = await Promise.all([
      store.list({ prefix: KEY_PREFIX }),
      store.list({ prefix: BEZOEK_PREFIX }),
    ])
    await Promise.all([
      ...feedbackResult.blobs.map(b => store.delete(b.key)),
      ...bezoekResult.blobs.map(b => store.delete(b.key)),
    ])
    return new Response(JSON.stringify({
      ok: true,
      verwijderd: feedbackResult.blobs.length + bezoekResult.blobs.length,
    }), { headers })
  }

  return new Response(JSON.stringify({ error: 'Alleen GET, POST en DELETE' }), { status: 405, headers })
}

export const config = { path: '/.netlify/functions/ai-koers-feedback' }
