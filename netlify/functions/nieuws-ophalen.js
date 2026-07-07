// Netlify Function — max 3 feeds, parallel Anthropic calls, duplicate-detectie via bekendeTitels

const RSS_FEEDS = [
  // Nederlandse en Europese bronnen: inhoudelijk (SURF, Npuls) en compliance (Rijksoverheid, EU/AI Act).
  // De Claude-beoordeling filtert per bericht op relevantie voor NHL Stenden,
  // dus brede feeds leveren alleen AI/onderwijs-relevante items op.
  { naam: 'Rijksoverheid',           url: 'https://feeds.rijksoverheid.nl/nieuws.rss',                    label: 'Rijksoverheid',           icon: '🏛️', maxItems: 3 },
  { naam: 'SURF',                    url: 'https://www.surf.nl/rss.xml',                                  label: 'SURF',                    icon: '🤝', maxItems: 3 },
  { naam: 'Npuls',                   url: 'https://npuls.nl/feed/',                                       label: 'Npuls',                   icon: '📚', maxItems: 3 },
  { naam: 'EU digitale strategie',   url: 'https://digital-strategy.ec.europa.eu/en/news/rss.xml',        label: 'EU digitale strategie',   icon: '⚖️', maxItems: 3 },
  // Internationale AI-ontwikkelingen
  { naam: 'The Gradient',   url: 'https://thegradient.pub/rss/',              label: 'The Gradient',   icon: '📊', maxItems: 3 },
  { naam: '80,000 Hours',   url: 'https://80000hours.org/feed/',               label: '80,000 Hours',   icon: '💡', maxItems: 3 },
  { naam: 'Import AI',      url: 'https://importai.substack.com/feed',         label: 'Import AI',      icon: '🤖', maxItems: 3 },
]

function parseRSS(xml) {
  const items = []
  const patterns = [/<item>([\s\S]*?)<\/item>/g, /<entry>([\s\S]*?)<\/entry>/g]
  for (const pat of patterns) {
    for (const m of xml.matchAll(pat)) {
      const c = m[1]
      const titel = (
        c.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] ||
        c.match(/<title[^>]*>(.*?)<\/title>/s)?.[1] || ''
      ).trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '')
      const beschrijving = (
        c.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
        c.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ||
        c.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] || ''
      ).replace(/<[^>]+>/g, '').trim().slice(0, 300)
      const link = (
        c.match(/<link>(.*?)<\/link>/)?.[1] ||
        c.match(/<link[^>]*href="([^"]+)"/)?.[1] || ''
      ).trim()
      if (titel) items.push({ titel, beschrijving, link })
    }
    if (items.length > 0) break
  }
  return items.slice(0, 3)
}

async function beoordeelItem(item, feed, apiKey) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Relevant voor het AI-Netwerk van NHL Stenden Hogeschool (AI in hoger onderwijs, AI Act en compliance, digitale soevereiniteit, digitalisering onderwijs)?\n\nTitel: ${item.titel}\nBeschrijving: ${item.beschrijving.slice(0, 150)}\n\nThema's: 1=AI & Leren (onderwijs, didactiek, studenten), 2=AI & Werken (bedrijfsvoering, medewerkers, organisatie), 3=AI & Verantwoordelijkheid (AI Act, compliance, governance, ethiek, soevereiniteit, privacy), 4=AI-Geletterdheid (vaardigheden, bewustzijn, training), 5=AI & Werkveld (regionale samenwerking, praktijkgericht), 6=AI & Onderzoek (wetenschap, lectoraten)\n\nJSON alleen:\n{"relevant":true/false,"samenvatting":"max 1 zin Nederlands","doelgroep":"docenten/studenten/management/algemeen","spoor":1/2/3/4/5/6}`
        }]
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return null
    const data = await r.json()
    const tekst = data.content?.[0]?.text || ''
    let b
    try { b = JSON.parse(tekst.replace(/```[\w]*|```/g, '').trim()) } catch { return null }
    if (!b.relevant || !b.samenvatting) return null
    return {
      id: Date.now() + Math.random(),
      type: 'ontwikkeling', icon: feed.icon,
      typelabel: 'Interessante ontwikkeling',
      rol: 'Auto-update', naam: feed.label,
      spoor: b.spoor || null,
      sporeDef: b.spoor ? [
        null,
        { titel: 'AI & Leren', icon: '🎓' },
        { titel: 'AI & Werken', icon: '⚙️' },
        { titel: 'AI & Verantwoordelijkheid', icon: '⚖️' },
        { titel: 'AI-Geletterdheid', icon: '📖' },
        { titel: 'AI & Werkveld', icon: '🏭' },
        { titel: 'AI & Onderzoek', icon: '🔬' },
      ][b.spoor] || null : null,
      laag: null,
      titel: item.titel, tekst: b.samenvatting,
      url: item.link,
      trefwoorden: ['AI', 'Nieuws', feed.label],
      datum: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
      nieuw: true, autoUpdate: true,
      doelgroep: b.doelgroep || 'algemeen',
    }
  } catch { return null }
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'Geen Anthropic API key. Voeg ANTHROPIC_API_KEY toe als Netlify environment variable.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  // Lees bekende titels uit request body om duplicates te filteren
  let bekendeTitels = new Set()
  try {
    const body = await req.json()
    if (Array.isArray(body?.bekendeTitels)) {
      bekendeTitels = new Set(body.bekendeTitels.map(t => t.toLowerCase().trim()))
    }
  } catch { /* geen body of geen bekendeTitels, dat is prima */ }

  const fouten = []
  const alleItems = []

  // Rapport per bron: is de bron echt bekeken, wat is er gezien en wat is er nieuw
  const bronRapport = RSS_FEEDS.map(feed => ({
    naam: feed.naam,
    icon: feed.icon,
    status: 'fout',
    foutmelding: null,
    opgehaald: 0,
    alBekend: 0,
    nieuw: 0,
    nieuweItems: [],
  }))

  const feedResults = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const feedUrlMet = feed.url + (feed.url.includes('?') ? '&' : '?') + '_t=' + Date.now()
      const res = await fetch(feedUrlMet, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NHLStendenAIHUB/1.3)', Accept: 'application/rss+xml, */*' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const xml = await res.text()
      const items = parseRSS(xml).slice(0, feed.maxItems || 3)
      if (items.length === 0) throw new Error('geen items')
      return { feed, items }
    })
  )

  for (let i = 0; i < feedResults.length; i++) {
    const result = feedResults[i]
    if (result.status === 'rejected') {
      const melding = result.reason?.message?.slice(0, 50) || 'onbekende fout'
      bronRapport[i].foutmelding = melding
      fouten.push(`${RSS_FEEDS[i].naam}: ${melding}`)
    } else {
      bronRapport[i].status = 'bekeken'
      bronRapport[i].opgehaald = result.value.items.length
      alleItems.push(result.value)
    }
  }

  // Filter items waarvan de titel al bekend is, geen Anthropic call voor duplicates
  const nieuweItems = alleItems.map(({ feed, items }) => {
    const vers = items.filter(item => !bekendeTitels.has(item.titel.toLowerCase().trim()))
    const rap = bronRapport.find(b => b.naam === feed.naam)
    if (rap) rap.alBekend = items.length - vers.length
    return { feed, items: vers }
  }).filter(({ items }) => items.length > 0)

  const aantalGefilterd = alleItems.reduce((t, { items }) => t + items.length, 0) - nieuweItems.reduce((t, { items }) => t + items.length, 0)

  // Alleen nieuwe items beoordelen door Anthropic, met een plafond per run tegen timeouts
  const teBeoordelen = nieuweItems
    .flatMap(({ feed, items }) => items.map(item => ({ feed, item })))
    .slice(0, 12)
  const beoordeeldeTitels = teBeoordelen.map(({ item }) => item.titel)
  const beoordelingen = await Promise.allSettled(
    teBeoordelen.map(({ feed, item }) => beoordeelItem(item, feed, apiKey))
  )

  const resultaten = beoordelingen
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  // Per bron vastleggen wat er daadwerkelijk is toegevoegd en onder welk thema
  for (const item of resultaten) {
    const rap = bronRapport.find(b => b.naam === item.naam)
    if (rap) {
      rap.nieuw++
      rap.nieuweItems.push({ titel: item.titel, thema: item.sporeDef ? item.sporeDef.titel : null })
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    aantalNieuw: resultaten.length,
    aantalGefilterd,
    geenNieuwNieuws: resultaten.length === 0 && aantalGefilterd > 0,
    items: resultaten,
    beoordeeldeTitels,
    bronnen: bronRapport,
    fouten: fouten.length > 0 ? fouten : undefined,
    tijdstip: new Date().toISOString(),
  }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}

export const config = { path: '/.netlify/functions/nieuws-ophalen' }
