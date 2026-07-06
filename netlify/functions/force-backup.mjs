// Netlify Function — ESM module
// Handmatige backup-trigger via de Beheer-pagina

import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 })
  }

  let store
  try {
    store = getStore('aihub-data')
  } catch (err) {
    return new Response(JSON.stringify({
      error: `Netlify Blobs niet beschikbaar: ${err.message}`
    }), { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const sleutels = [
      'betrokkenen-initiatieven',
      'analytics-bezoeken',
      'nieuws-bekende-titels',
    ]

    const data = {}
    for (const sleutel of sleutels) {
      try {
        const waarde = await store.get(sleutel)
        if (waarde !== null) data[sleutel] = waarde
      } catch {}
    }

    const nu = new Date()
    const tijdstempel = nu.toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupSleutel = `backup-${tijdstempel}`

    await store.set(backupSleutel, JSON.stringify({
      tijdstempel: nu.toISOString(),
      handmatig: true,
      data,
    }))

    return new Response(JSON.stringify({
      ok: true,
      backup: backupSleutel,
      tijdstip: nu.toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}

export const config = { path: '/.netlify/functions/force-backup' }
