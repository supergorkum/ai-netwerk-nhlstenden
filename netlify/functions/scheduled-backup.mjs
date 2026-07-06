// Netlify Scheduled Function — ESM module
// Draait automatisch op 10:00, 13:00 en 18:00 NL tijd (UTC+2 = 08:00, 11:00, 16:00 UTC)
// Slaat een backup op van alle data in de aihub-data store
// Backups ouder dan 5 dagen worden automatisch verwijderd

import { getStore } from '@netlify/blobs'

export default async (req) => {
  let store
  try {
    store = getStore('aihub-data')
  } catch (err) {
    console.error('Netlify Blobs niet beschikbaar:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 503 })
  }

  try {
    // Haal alle actuele data op
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

    // Tijdstempel als backup-sleutel
    const nu = new Date()
    const tijdstempel = nu.toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupSleutel = `backup-${tijdstempel}`

    await store.set(backupSleutel, JSON.stringify({
      tijdstempel: nu.toISOString(),
      data,
    }))

    // Verwijder backups ouder dan 5 dagen
    const vijfDagenGeleden = new Date(nu.getTime() - 5 * 24 * 60 * 60 * 1000)
    const { blobs } = await store.list({ prefix: 'backup-' })

    let verwijderd = 0
    for (const blob of blobs) {
      const datumStr = blob.key.replace('backup-', '').slice(0, 10).replace(/-/g, '-')
      const blobDatum = new Date(datumStr)
      if (!isNaN(blobDatum) && blobDatum < vijfDagenGeleden) {
        await store.delete(blob.key)
        verwijderd++
      }
    }

    console.log(`Backup opgeslagen: ${backupSleutel}, ${verwijderd} oude verwijderd.`)
    return new Response(JSON.stringify({
      ok: true,
      backup: backupSleutel,
      verwijderd,
      tijdstip: nu.toISOString(),
    }), { status: 200 })

  } catch (err) {
    console.error('Backup mislukt:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

export const config = {
  schedule: '0 8,11,16 * * *',  // 10:00, 13:00, 18:00 NL tijd (UTC+2)
  path: '/.netlify/functions/scheduled-backup',
}
