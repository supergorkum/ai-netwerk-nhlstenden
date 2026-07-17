import { useState } from 'react'

// Alle betrokkenen voor alle initiatieven staan onder één sleutel, als een object
// { [initiatiefId]: [{ naam, afdeling, datum }, ...] }. Dat scheelt veel losse
// netwerkverzoeken (1 ophaal-call in plaats van 24) en past bij hoe storage.js
// werkt: één key, één waarde.
const STORAGE_KEY = 'betrokkenen-initiatieven'
const STORAGE_URL = '/.netlify/functions/storage'

export async function haalBetrokkenenOp() {
  try {
    const res = await fetch(`${STORAGE_URL}?key=${STORAGE_KEY}`)
    if (!res.ok) return {}
    const data = await res.json()
    return data.value || {}
  } catch {
    return {}
  }
}

async function bewaarBetrokkenen(map) {
  try {
    await fetch(STORAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: STORAGE_KEY, value: map }),
    })
    return true
  } catch {
    return false
  }
}

export default function BetrokkenenWidget({ initId, betrokkenenMap, setBetrokkenenMap, compact = false }) {
  const [open, setOpen] = useState(false)
  const [naam, setNaam] = useState('')
  const [afdeling, setAfdeling] = useState('')
  const [bezig, setBezig] = useState(false)

  const betrokkenen = Array.isArray(betrokkenenMap[initId]) ? betrokkenenMap[initId] : []

  const versturen = async () => {
    if (!naam.trim()) return
    setBezig(true)
    const nieuw = { naam: naam.trim(), afdeling: afdeling.trim(), datum: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) }
    const nieuweMap = { ...betrokkenenMap, [initId]: [...betrokkenen, nieuw] }
    setBetrokkenenMap(nieuweMap) // optimistisch bijwerken, voelt direct
    await bewaarBetrokkenen(nieuweMap)
    setBezig(false)
    setOpen(false)
    setNaam('')
    setAfdeling('')
  }

  return (
    <div className={compact ? 'mt-2' : 'mt-3 pt-3 border-t border-gray-100'}>
      {betrokkenen.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {betrokkenen.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-nhl-blauw/5 text-nhl-blauw px-2 py-0.5 rounded-full" title={b.datum}>
              👤 {b.naam}{b.afdeling ? ` · ${b.afdeling}` : ''}
            </span>
          ))}
        </div>
      )}

      {!open ? (
        <button onClick={() => setOpen(true)}
          className="text-xs font-medium text-gray-400 hover:text-nhl-blauw transition-colors inline-flex items-center gap-1">
          + Ik ben betrokken
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2" onClick={e => e.stopPropagation()}>
          <input type="text" value={naam} onChange={e => setNaam(e.target.value)}
            placeholder="Jouw naam"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
          <input type="text" value={afdeling} onChange={e => setAfdeling(e.target.value)}
            placeholder="Team of afdeling (optioneel)"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
          <div className="flex gap-2">
            <button onClick={versturen} disabled={!naam.trim() || bezig}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${naam.trim() && !bezig ? 'bg-nhl-blauw text-white hover:bg-nhl-blauw-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {bezig ? 'Bezig...' : 'Toevoegen'}
            </button>
            <button onClick={() => { setOpen(false); setNaam(''); setAfdeling('') }}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600">
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
