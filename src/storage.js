// Storage via Netlify Blobs function
const API = '/.netlify/functions/storage'

export async function loadData(key) {
  try {
    const r = await fetch(`${API}?key=${key}`)
    if (!r.ok) return null
    const d = await r.json()
    return d.value ? JSON.parse(d.value) : null
  } catch { return null }
}

export async function saveData(key, value) {
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: JSON.stringify(value) })
    })
    return r.ok
  } catch { return false }
}

// Wijzigingen-log: houdt bij wat er is toegevoegd, bijgewerkt of verwijderd,
// zodat moderatoren in Beheer kunnen zien wat er op de site is gebeurd.
const WIJZIGINGEN_KEY = 'wijzigingen-log'

export async function logWijziging(onderdeel, actie, titel = '', icon = '✏️') {
  try {
    const bestaand = (await loadData(WIJZIGINGEN_KEY)) || []
    const nu = new Date()
    const nieuw = [{
      onderdeel, actie, titel, icon,
      tijd: nu.toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      ts: nu.getTime(),
    }, ...(Array.isArray(bestaand) ? bestaand : [])].slice(0, 100)
    await saveData(WIJZIGINGEN_KEY, nieuw)
  } catch { /* loggen mag nooit de actie zelf blokkeren */ }
}

export async function haalWijzigingenOp() {
  const data = await loadData(WIJZIGINGEN_KEY)
  return Array.isArray(data) ? data : []
}

export async function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => { try { resolve(JSON.parse(e.target.result)) } catch { reject(new Error('Ongeldig JSON bestand')) } }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
