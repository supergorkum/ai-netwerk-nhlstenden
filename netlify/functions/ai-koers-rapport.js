// Netlify Function — AI-Koers: het rijke feedbackrapport.
//
// Combineert de ruwe duimpjes/feedback-data (zelfde opslag als
// ai-koers-feedback.js) met de inhoud van elke pagina uit paginas.json,
// en laat Claude daar een samenhangend verhaal van maken: een
// managementsamenvatting, per pagina de kern van de inhoud en de kern
// van de feedback (met sentiment), opvallende thema's en
// vervolgstappen.
//
// Belangrijk ontwerpprincipe: alle GETALLEN (duimpjes, aantal bezoekers,
// aantal feedbackgevers) worden in gewone code berekend, niet door het
// taalmodel. Alleen de KWALITATIEVE duiding (waar gaat een pagina over,
// wat is de kern van de feedback, wat valt op) komt van Claude. Zo
// blijven de cijfers in het rapport altijd exact kloppend, en wordt de
// AI alleen ingezet waar die waarde toevoegt: het lezen en samenvatten
// van tekst.
//
// De lijst met aandachtspunten wordt ook in code bepaald (pagina's met
// meer omlaag dan omhoog, of minstens 2 keer omlaag), met als
// toelichting de al door Claude geschreven kernFeedback van die pagina.
//
// Dit rapport wordt live opgebouwd bij elke aanvraag: geen caching, dus
// elke keer dat de beheerder het PDF-verslag opent is het gebaseerd op
// de meest actuele data.

import { getStore } from '@netlify/blobs'

const STORE_NAAM = 'ai-koers-feedback'
const KEY_PREFIX = 'ai-koers:'
const BEZOEK_PREFIX = 'ai-koers-bezoek:'

function veiligJSON(tekst, fallback) {
  try { return JSON.parse(tekst) } catch { return fallback }
}

function strippTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async (req) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Alleen GET' }), { status: 405, headers })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'Geen Anthropic API key. Voeg ANTHROPIC_API_KEY toe als Netlify environment variable.'
    }), { status: 500, headers })
  }

  const store = getStore(STORE_NAAM)

  // ============================================================
  // 1. Ruwe duimpjes, feedback en bezoek ophalen en per pagina samenvatten
  // ============================================================
  const [feedbackResult, bezoekResult] = await Promise.all([
    store.list({ prefix: KEY_PREFIX }),
    store.list({ prefix: BEZOEK_PREFIX }),
  ])

  const perPagina = {}
  const feedbackgevers = new Set()

  await Promise.all(feedbackResult.blobs.map(async (b) => {
    const record = veiligJSON(await store.get(b.key), null)
    if (!record) return
    const rest = b.key.slice(KEY_PREFIX.length)
    const [paginaIndex, visitorId] = rest.split(':')
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
      })
    }
  }))

  // ============================================================
  // 2. paginas.json ophalen voor titels en inhoud
  // ============================================================
  const url = new URL(req.url)
  let doc
  try {
    const docResp = await fetch(`${url.origin}/ai-koers/paginas.json`)
    if (!docResp.ok) throw new Error(`status ${docResp.status}`)
    doc = await docResp.json()
  } catch (err) {
    return new Response(JSON.stringify({ error: `Kon paginas.json niet laden: ${err.message}` }), { status: 502, headers })
  }
  const titels = doc.titels || []
  const paginasHtml = doc.paginas || []
  const aantalPaginas = paginasHtml.length

  const perPaginaVolledig = []
  for (let i = 0; i < aantalPaginas; i++) {
    const stats = perPagina[i] || { omhoog: 0, omlaag: 0, feedback: [] }
    perPaginaVolledig.push({
      index: i,
      titel: titels[i] || `Pagina ${i + 1}`,
      inhoudKort: strippTags(paginasHtml[i]).slice(0, 350),
      omhoog: stats.omhoog,
      omlaag: stats.omlaag,
      feedback: stats.feedback,
    })
  }

  const totaalOmhoog = perPaginaVolledig.reduce((t, p) => t + p.omhoog, 0)
  const totaalOmlaag = perPaginaVolledig.reduce((t, p) => t + p.omlaag, 0)
  const totaalFeedback = perPaginaVolledig.reduce((t, p) => t + p.feedback.length, 0)

  // ============================================================
  // 3. Prompt bouwen en Claude aanroepen voor de kwalitatieve duiding
  // ============================================================
  const paginaBlok = perPaginaVolledig.map(p => {
    const fbTekst = p.feedback.length > 0
      ? p.feedback.map(f => `  - [${f.rol}] ${f.tekst}`).join('\n')
      : '  (geen tekstuele feedback)'
    return `Pagina ${p.index + 1} - "${p.titel}"\nInhoud (samenvatting): ${p.inhoudKort}\nDuimpjes: ${p.omhoog} omhoog, ${p.omlaag} omlaag\nFeedback:\n${fbTekst}`
  }).join('\n\n')

  const prompt = `Je analyseert de feedback op een presentatie van de AI-Koers 2026 tot 2030 van NHL Stenden, gegeven tijdens een live sessie waarin bezoekers per pagina een duimpje omhoog of omlaag konden geven en losse tekstuele feedback konden achterlaten.

Hieronder staan alle ${aantalPaginas} pagina's met hun inhoud, de duimpjes en de tekstuele feedback.

${paginaBlok}

Totalen: ${totaalOmhoog} duimpjes omhoog, ${totaalOmlaag} duimpjes omlaag, ${totaalFeedback} tekstuele feedbackreacties, over ${aantalPaginas} pagina's.

Schrijf in het Nederlands, zakelijk en concreet, geen opsomming van voor de hand liggende dingen. Baseer je uitsluitend op de gegeven data, verzin niets. Als een pagina geen feedback heeft, zeg dat expliciet in kernFeedback ("Nog geen reacties op deze pagina.") en geef sentiment "geen_feedback".

Geef ALLEEN geldig JSON terug, in dit exacte format, niets ervoor of erna:
{
  "managementSamenvatting": "3 tot 5 zinnen, het geheel overziend: wat is de algehele ontvangst, wat springt eruit, waar moet de organisatie op letten",
  "opvallendeThemas": ["kort thema 1", "kort thema 2"],
  "vervolgstappen": ["concrete suggestie 1", "concrete suggestie 2"],
  "paginas": [
    { "index": 0, "kernInhoud": "1 zin, waar deze pagina over gaat", "kernFeedback": "1 tot 3 zinnen, de kern van de reacties op deze pagina, concreet gebaseerd op de gegeven feedback", "sentiment": "positief" }
  ]
}
sentiment moet een van deze zijn: "positief", "negatief", "gemengd", "neutraal", "geen_feedback".
De paginas-array moet precies ${aantalPaginas} items hebben, index 0 tot en met ${aantalPaginas - 1}, in volgorde.`

  let analyse
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(55000),
    })
    if (!r.ok) throw new Error(`Anthropic API gaf status ${r.status}`)
    const data = await r.json()
    const tekst = data.content?.[0]?.text || ''
    analyse = JSON.parse(tekst.replace(/```json|```/g, '').trim())
  } catch (err) {
    return new Response(JSON.stringify({ error: `Analyse mislukt: ${err.message}` }), { status: 502, headers })
  }

  // ============================================================
  // 4. Aandachtspunten: objectief bepaald in code, met de al door
  //    Claude geschreven kernFeedback als toelichting.
  // ============================================================
  const aandachtspunten = perPaginaVolledig
    .filter(p => p.omlaag > p.omhoog || p.omlaag >= 2)
    .sort((a, b) => (b.omlaag - b.omhoog) - (a.omlaag - a.omhoog))
    .slice(0, 6)
    .map(p => {
      const analysePagina = (analyse.paginas || []).find(x => x.index === p.index)
      const reden = p.feedback.length > 0
        ? (analysePagina?.kernFeedback || 'Meer duimpjes omlaag dan omhoog op deze pagina.')
        : `${p.omlaag} duimpje${p.omlaag !== 1 ? 's' : ''} omlaag tegenover ${p.omhoog} omhoog, zonder toegelichte feedback.`
      return {
        index: p.index,
        titel: p.titel,
        omhoog: p.omhoog,
        omlaag: p.omlaag,
        reden,
      }
    })

  return new Response(JSON.stringify({
    ok: true,
    gegenereerdOp: new Date().toISOString(),
    totalen: {
      omhoog: totaalOmhoog,
      omlaag: totaalOmlaag,
      feedbackreacties: totaalFeedback,
      bezoekers: bezoekResult.blobs.length,
      feedbackgevers: feedbackgevers.size,
      aantalPaginas,
    },
    managementSamenvatting: analyse.managementSamenvatting || '',
    opvallendeThemas: analyse.opvallendeThemas || [],
    vervolgstappen: analyse.vervolgstappen || [],
    paginas: perPaginaVolledig.map(p => {
      const a = (analyse.paginas || []).find(x => x.index === p.index) || {}
      return {
        index: p.index,
        titel: p.titel,
        omhoog: p.omhoog,
        omlaag: p.omlaag,
        feedback: p.feedback,
        kernInhoud: a.kernInhoud || '',
        kernFeedback: a.kernFeedback || '',
        sentiment: a.sentiment || 'geen_feedback',
      }
    }),
    aandachtspunten,
  }), { headers })
}

export const config = { path: '/.netlify/functions/ai-koers-rapport' }
