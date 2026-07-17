// Netlify Function — AI-Koers rapport: status en starter.
//
// Dit is de SNELLE, gewone function die de pagina aanroept. Hij doet
// zelf geen zware analyse (dat deed de vorige versie wel, en dat liep
// vast op de tijdslimiet van een synchrone function: status 502). In
// plaats daarvan:
//   - Kijkt of er al een rapport-status bekend is in Blobs.
//   - Start zo nodig de achtergrondtaak (ai-koers-rapport-background.js,
//     die tot 15 minuten mag lopen) en zet de status meteen op 'bezig'.
//   - Geeft altijd direct antwoord: { status: 'bezig' | 'klaar' | 'fout', ... }
//
// De pagina peilt dit endpoint elke paar seconden opnieuw totdat de
// status 'klaar' (of 'fout') is.
//
// Met ?vernieuw=1 wordt altijd een nieuwe achtergrondtaak gestart, ook
// als er al een rapport klaarstaat (voor de Vernieuwen-knop).
//
// Een status 'bezig' die langer dan 3 minuten oud is, wordt als
// vastgelopen beschouwd en mag opnieuw gestart worden: zo blijft de
// pagina nooit voor altijd hangen als de achtergrondtaak onverhoopt
// zonder nette foutmelding stopt.

import { getStore } from '@netlify/blobs'

const STORE_NAAM = 'ai-koers-feedback'
const STATUS_KEY = 'ai-koers-rapport-status'
const STALE_MS = 3 * 60 * 1000

function veiligJSON(tekst, fallback) {
  try { return JSON.parse(tekst) } catch { return fallback }
}

export default async (req) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Alleen GET' }), { status: 405, headers })
  }

  const store = getStore(STORE_NAAM)
  const url = new URL(req.url)
  const vernieuw = url.searchParams.get('vernieuw') === '1'

  const huidige = veiligJSON(await store.get(STATUS_KEY), null)

  const isVastgelopen = huidige?.status === 'bezig'
    && huidige.gestartOp
    && (Date.now() - new Date(huidige.gestartOp).getTime()) > STALE_MS

  const moetStarten = vernieuw || !huidige || huidige.status === 'fout' || isVastgelopen

  if (!moetStarten) {
    return new Response(JSON.stringify(huidige), { headers })
  }

  const nieuweStatus = { status: 'bezig', gestartOp: new Date().toISOString() }
  await store.set(STATUS_KEY, JSON.stringify(nieuweStatus))

  // Achtergrondtaak triggeren. Niet awaiten op het resultaat, alleen dat
  // de aanroep zelf is verstuurd; Netlify geeft de achtergrondtaak meteen
  // een 202 terug en laat hem daarna los doorlopen.
  fetch(`${url.origin}/.netlify/functions/ai-koers-rapport-background`, { method: 'POST' }).catch(() => {})

  return new Response(JSON.stringify(nieuweStatus), { headers })
}

export const config = { path: '/.netlify/functions/ai-koers-rapport' }
