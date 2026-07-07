// Netlify Function: centrale opslag in Netlify Blobs (store 'aihub-data')
// Geeft ALTIJD geldige JSON terug, ook bij onverwachte fouten, zodat de app
// nooit op een kale foutpagina van Netlify stuit.
// Bij opslaan wordt elke waarde als tekst (JSON-string) weggeschreven,
// zodat formaat-fouten aan de schrijfkant niet meer mogelijk zijn.

import { getStore } from '@netlify/blobs'

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
}

const antwoord = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: HEADERS })

export default async (req, context) => {
  try {
    let store
    try {
      store = getStore('aihub-data')
    } catch (err) {
      return antwoord({
        error: `Netlify Blobs niet beschikbaar: ${err.message}. Controleer of NETLIFY_SITE_ID is ingesteld als environment variable in het Netlify dashboard.`,
      }, 503)
    }

    if (req.method === 'OPTIONS') {
      return antwoord({ ok: true })
    }

    if (req.method === 'GET') {
      const key = new URL(req.url).searchParams.get('key')
      if (!key) return antwoord({ error: 'No key' }, 400)
      try {
        const value = await store.get(key, { type: 'text' })
        return antwoord({ value })
      } catch (err) {
        return antwoord({ value: null, opmerking: err?.message || 'lezen mislukt' })
      }
    }

    if (req.method === 'POST') {
      try {
        const { key, value } = await req.json()
        if (!key) return antwoord({ error: 'No key' }, 400)
        // Altijd als tekst opslaan: strings gaan door zoals ze zijn,
        // al het andere wordt eerst netjes naar een JSON-string omgezet.
        const opslagWaarde = typeof value === 'string' ? value : JSON.stringify(value ?? null)
        await store.set(key, opslagWaarde)
        return antwoord({ ok: true })
      } catch (err) {
        return antwoord({ error: `Opslaan mislukt: ${err?.message || 'onbekend'}` }, 500)
      }
    }

    return antwoord({ error: 'Method not allowed' }, 405)
  } catch (err) {
    return antwoord({ error: `Onverwachte fout in storage-function: ${err?.message || 'onbekend'}` }, 500)
  }
}

export const config = { path: '/.netlify/functions/storage' }
