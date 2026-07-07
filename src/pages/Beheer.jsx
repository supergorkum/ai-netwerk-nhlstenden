import { useState, useEffect, useCallback } from 'react'
import { initiatieven as initData, sporen, lagen, BEHEER_CODE, APP_VERSIE, APP_VERSIE_DATUM } from '../data'
import { exportJSON, importJSON, logWijziging, haalWijzigingenOp } from '../storage'

const NIEUWS_URL = '/.netlify/functions/nieuws-ophalen'
const REFRESH_KEY = 'aihub-laatste-refresh'
const BACKUP_KEY = 'aihub-backup-v1'

// Indeling van paden naar onderdelen van de site, voor het bezoekersoverzicht
const ONDERDELEN = [
  { naam: 'Start', paden: ['/'] },
  { naam: 'Verkennen', paden: ['/netwerk', '/themas', '/initiatieven', '/dashboard'] },
  { naam: 'Kennis', paden: ['/geletterdheid', '/linkjes', '/agentic-ai', '/documentatie', '/video'] },
  { naam: 'Beleid en kader', paden: ['/beleid', '/governance', '/kader', '/fundament', '/nvao'] },
  { naam: 'Meedoen', paden: ['/meld', '/evenementen', '/pilots'] },
  { naam: 'Over', paden: ['/over', '/wat-levert-het-op'] },
]

async function slaOpInCloud(data) {
  const payload = { ...data, backupDatum: new Date().toISOString() }
  const json = JSON.stringify(payload)
  // Lokale kopie als vangnet
  try { localStorage.setItem(BACKUP_KEY, json) } catch {}
  // De echte cloud backup: naar Netlify Blobs via de storage-function
  const res = await fetch('/.netlify/functions/storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: BACKUP_KEY, value: json }),
  })
  if (!res.ok) throw new Error('Opslaan in Netlify Blobs mislukt')
  return payload.backupDatum
}

async function laadUitCloud() {
  // Eerst uit Netlify Blobs, daarna localStorage als vangnet
  try {
    const r = await fetch(`/.netlify/functions/storage?key=${BACKUP_KEY}`)
    const d = await r.json()
    if (d.value) return typeof d.value === 'string' ? JSON.parse(d.value) : d.value
  } catch {}
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

async function haalCloudTijdstempel() {
  const data = await laadUitCloud()
  return data && data.backupDatum ? data.backupDatum : null
}

function formatDatumKort(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

function laatsteDatum(arr) {
  if (!arr?.length) return null
  const items = [...arr].sort((a, b) => {
    const da = a.id || a.datum || 0
    const db = b.id || b.datum || 0
    return db > da ? 1 : -1
  })
  const item = items[0]
  if (item.id && String(item.id).length === 13) {
    return formatDatumKort(new Date(item.id).toISOString())
  }
  return item.datum || null
}

function HerstellModal({ data, bron, onHerstel, onSluiten }) {
  const categorieën = [
    { key: 'alleInitiatieven', label: 'Initiatieven', icon: '🚀' },
    { key: 'berichten', label: 'Vragen en ideeën', icon: '💬' },
    { key: 'inspiraties', label: 'Inzichten', icon: '💡' },
    { key: 'videos', label: "Video's", icon: '🎬' },
    { key: 'pilots', label: 'Pilots', icon: '🧪' },
    { key: 'docs', label: 'Documenten', icon: '📁' },
    { key: 'roadmap', label: 'Roadmap', icon: '🗺️' },
  ]

  const beschikbaar = categorieën.filter(c => Array.isArray(data[c.key]) && data[c.key].length > 0)
  const [geselecteerd, setGeselecteerd] = useState(
    Object.fromEntries(beschikbaar.map(c => [c.key, true]))
  )

  const toggleAlles = (aan) => {
    setGeselecteerd(Object.fromEntries(beschikbaar.map(c => [c.key, aan])))
  }

  const aantalGeselecteerd = Object.values(geselecteerd).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-nhl-blauw text-lg">
              {bron === 'cloud' ? '☁️ Herstel uit cloud' : '📥 Importeren vanuit bestand'}
            </h2>
            {data.backupDatum && (
              <p className="text-xs text-gray-400 mt-0.5">Backup van {formatDatumKort(data.backupDatum)}</p>
            )}
            {data.exportDatum && !data.backupDatum && (
              <p className="text-xs text-gray-400 mt-0.5">Export van {formatDatumKort(data.exportDatum)}</p>
            )}
          </div>
          <button onClick={onSluiten} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Kies welke onderdelen je wilt terugzetten. De geselecteerde onderdelen <strong>overschrijven</strong> de huidige data.
          </p>

          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <button onClick={() => toggleAlles(true)} className="text-xs text-nhl-blauw hover:underline font-medium">Alles selecteren</button>
            <span className="text-gray-300">·</span>
            <button onClick={() => toggleAlles(false)} className="text-xs text-gray-400 hover:underline">Geen</button>
            <span className="ml-auto text-xs text-gray-400">{aantalGeselecteerd} van {beschikbaar.length} geselecteerd</span>
          </div>

          <div className="space-y-2 mb-6">
            {beschikbaar.map(c => {
              const items = data[c.key]
              const laatste = laatsteDatum(items)
              return (
                <label key={c.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${geselecteerd[c.key] ? 'border-nhl-blauw bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={geselecteerd[c.key] || false}
                    onChange={e => setGeselecteerd(prev => ({ ...prev, [c.key]: e.target.checked }))}
                    className="w-4 h-4 accent-nhl-blauw flex-shrink-0"
                  />
                  <span className="text-lg flex-shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{c.label}</div>
                    <div className="text-xs text-gray-400">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                      {laatste && <> · laatste: {laatste}</>}
                    </div>
                  </div>
                  {geselecteerd[c.key] && (
                    <span className="text-xs bg-nhl-blauw text-white px-1.5 py-0.5 rounded-full flex-shrink-0">✓</span>
                  )}
                </label>
              )
            })}

            {beschikbaar.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">Geen herstelbare data gevonden in dit bestand.</div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onSluiten}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition-colors">
              Annuleren
            </button>
            <button
              onClick={() => onHerstel(geselecteerd)}
              disabled={aantalGeselecteerd === 0}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${aantalGeselecteerd > 0 ? 'bg-nhl-blauw text-white hover:bg-nhl-blauw-dark' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            >
              {aantalGeselecteerd > 0 ? `↺ Zet ${aantalGeselecteerd} onderdeel${aantalGeselecteerd !== 1 ? 'en' : ''} terug` : 'Niets geselecteerd'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NieuwsOphalen({ onNieuwItems, inspiraties = [] }) {
  // Laad al eerder geziene titels uit Blobs zodat deduplicatie ook na herlaad werkt
  // Laad al eerder geziene titels uit Blobs zodat deduplicatie ook na herlaad werkt
  const [status, setStatus] = useState('idle')
  const [resultaat, setResultaat] = useState(null)
  const [tijdstip, setTijdstip] = useState(() => localStorage.getItem(REFRESH_KEY))

  const haalOp = async () => {
    setStatus('bezig')
    setResultaat(null)
    try {
      // Stuur bestaande titels mee zodat de server duplicates kan overslaan
      // Combineer titels uit huidige inspiraties met eerder opgeslagen titels uit Blobs
      let opgeslagenTitels = []
      try {
        const r = await fetch('/.netlify/functions/storage?key=nieuws-bekende-titels')
        const d = await r.json()
        const raw = d.value
        if (Array.isArray(raw)) opgeslagenTitels = raw
        else if (typeof raw === 'string') { try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) opgeslagenTitels = parsed } catch {} }
      } catch {}
      const huidigeTitels = inspiraties.map(i => i.titel).filter(Boolean)
      const bekendeTitels = [...new Set([...huidigeTitels, ...opgeslagenTitels])]
      const res = await fetch(NIEUWS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bekendeTitels }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen')
      const ts = new Date().toISOString()
      setResultaat(data)
      setTijdstip(ts)
      localStorage.setItem(REFRESH_KEY, ts)
      if (data.items?.length > 0) {
        onNieuwItems(data.items)
        logWijziging('Inzicht', `${data.items.length} nieuws-item${data.items.length !== 1 ? 's' : ''} automatisch toegevoegd`, '', '🤖')
      }
      // Alle beoordeelde titels onthouden, ook de niet-relevante, zodat dezelfde
      // berichten niet elke run opnieuw langs de Anthropic-beoordeling gaan
      const nieuweTitels = [
        ...(data.items || []).map(i => i.titel),
        ...(data.beoordeeldeTitels || []),
      ].filter(Boolean)
      if (nieuweTitels.length > 0) {
        const alleTitels = [...new Set([...bekendeTitels, ...nieuweTitels])].slice(-300)
        fetch('/.netlify/functions/storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'nieuws-bekende-titels', value: JSON.stringify(alleTitels) }),
        }).catch(() => {})
      }
      setStatus('klaar')
    } catch (err) {
      setResultaat({ fout: err.message })
      setStatus('fout')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="nhl-gradient-deep px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
            status === 'bezig' ? 'bg-yellow-300 animate-pulse' :
            status === 'klaar' ? 'bg-green-400' :
            status === 'fout' ? 'bg-red-400' : 'bg-gray-400'
          }`} />
          <div>
            <div className="text-white font-bold text-sm">🤖 Slim nieuws ophalen</div>
            <div className="text-blue-200 text-xs">
              {tijdstip
                ? `Laatste refresh: ${new Date(tijdstip).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                : 'Nog niet uitgevoerd in deze sessie'}
            </div>
          </div>
        </div>
        <button onClick={haalOp} disabled={status === 'bezig'}
          className="flex items-center gap-2 bg-white text-nhl-blauw hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0">
          {status === 'bezig' ? <><span className="animate-spin inline-block">⟳</span> Bezig...</> : <>🔄 Nieuws ophalen</>}
        </button>
      </div>
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-600">
          Haalt nieuws op van <strong>Rijksoverheid</strong>, <strong>SURF</strong>, <strong>Npuls</strong> en <strong>EU en AI Act</strong> (compliance), aangevuld met internationale bronnen: <strong>The Gradient</strong>, <strong>80,000 Hours</strong> en <strong>Import AI</strong>.
          De Anthropic AI beoordeelt elk artikel op relevantie voor NHL Stenden en schrijft een Nederlandse samenvatting.
          Relevante items worden direct toegevoegd aan <strong>Inzichten</strong>.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Vereist: <code className="bg-gray-100 px-1 rounded">ANTHROPIC_API_KEY</code> als Netlify environment variable.
        </p>
      </div>
      {resultaat && (
        <div className="px-6 py-4">
          {status === 'klaar' && (
            <div className="space-y-2">
              {(() => {
                const bronnen = resultaat.bronnen || []
                return (
                  <div className="space-y-3">
                    <div className={`text-xs font-semibold mb-1 ${resultaat.aantalNieuw > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                      {resultaat.aantalNieuw > 0
                        ? `✓ ${resultaat.aantalNieuw} nieuw item${resultaat.aantalNieuw !== 1 ? 's' : ''} toegevoegd aan Inzichten`
                        : '✓ Alle bereikbare bronnen bekeken, geen nieuwe items toegevoegd'}
                    </div>
                    {bronnen.map(bron => {
                      const bekeken = bron.status === 'bekeken'
                      const heeftNieuw = bron.nieuw > 0
                      const beoordeeld = bron.opgehaald - bron.alBekend
                      return (
                        <div key={bron.naam} className={`px-3 py-2.5 rounded-lg text-xs border ${
                          !bekeken ? 'bg-red-50 border-red-200' :
                          heeftNieuw ? 'bg-green-50 border-green-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex-shrink-0">{!bekeken ? '❌' : heeftNieuw ? '✅' : '✔️'}</span>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold ${!bekeken ? 'text-red-600' : heeftNieuw ? 'text-green-700' : 'text-gray-600'}`}>
                                {bron.icon} {bron.naam}
                                {bekeken && (
                                  <span className="font-normal text-gray-400"> · bekeken, {bron.opgehaald} item{bron.opgehaald !== 1 ? 's' : ''} gezien</span>
                                )}
                              </div>
                              {!bekeken && (
                                <div className="text-red-500 mt-0.5">Niet bereikbaar: {bron.foutmelding || 'onbekende fout'}</div>
                              )}
                              {bekeken && !heeftNieuw && (
                                <div className="text-gray-400 mt-0.5">
                                  Geen verandering{bron.opgehaald > 0 ? `: ${bron.alBekend > 0 ? `${bron.alBekend} al bekend` : ''}${bron.alBekend > 0 && beoordeeld > 0 ? ', ' : ''}${beoordeeld > 0 ? `${beoordeeld} beoordeeld als niet relevant` : ''}` : ''}
                                </div>
                              )}
                              {heeftNieuw && (
                                <div className="mt-1 space-y-0.5">
                                  {bron.nieuweItems.map((it, idx) => (
                                    <div key={idx} className="text-gray-600">
                                      🆕 {it.titel} → toegevoegd aan Inzichten{it.thema ? `, thema ${it.thema}` : ''}
                                    </div>
                                  ))}
                                  {bron.alBekend > 0 && (
                                    <div className="text-gray-400">{bron.alBekend} item{bron.alBekend !== 1 ? 's' : ''} al bekend, overgeslagen</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {bronnen.length === 0 && (
                      <div className="text-xs text-gray-400">Geen bronrapport ontvangen. Controleer of de nieuwste versie van de nieuws-function is gedeployed.</div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
          {status === 'fout' && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
              <div className="font-semibold mb-1">❌ Ophalen mislukt</div>
              <div className="text-xs mb-2">{resultaat.fout}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const statusOpties = ['actief', 'groeiend', 'in-ontwikkeling']
const typeOpties = [
  { id: 'intern', label: 'Intern' },
  { id: 'extern', label: 'Extern' },
  { id: 'surf', label: 'SURF / Nationaal' },
]

function InitiatiefRij({ init, onSave, onDelete }) {
  const [bewerk, setBewerk] = useState(false)
  const [form, setForm] = useState({ ...init })
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!bewerk) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-nhl-blauw text-sm">{init.naam}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${init.status === 'actief' ? 'bg-green-100 text-green-700' : init.status === 'groeiend' ? 'bg-blue-100 text-nhl-blauw' : 'bg-orange-100 text-orange-700'}`}>{init.status}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${init.type === 'surf' ? 'bg-purple-100 text-purple-700' : init.type === 'extern' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-nhl-blauw'}`}>{init.type === 'surf' ? 'SURF' : init.type === 'extern' ? 'Extern' : 'Intern'}</span>
              {init.laag && <span className="text-xs text-gray-400">Laag {init.laag}</span>}
            </div>
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{init.omschrijving}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setBewerk(true)} className="text-nhl-blauw hover:underline text-xs font-medium">Bewerk</button>
            <button onClick={() => onDelete(init.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Verwijder</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 rounded-xl border-2 border-nhl-blauw p-4">
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Naam</label>
          <input value={form.naam} onChange={e => upd('naam', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={form.status} onChange={e => upd('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
            {statusOpties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={form.type} onChange={e => upd('type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
            {typeOpties.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Thema</label>
          <select value={form.spoor} onChange={e => upd('spoor', parseInt(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
            {sporen.map(s => <option key={s.id} value={s.id}>{s.icon} {s.titel}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Laag</label>
          <select value={form.laag || ''} onChange={e => upd('laag', e.target.value ? parseInt(e.target.value) : null)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
            <option value="">Geen</option>
            {lagen.map(l => <option key={l.nr} value={l.nr}>Laag {l.nr}: {l.naam}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
          <input value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={e => upd('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white" />
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Omschrijving</label>
        <textarea value={form.omschrijving} onChange={e => upd('omschrijving', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white resize-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => { onSave(form); setBewerk(false) }} className="btn-primary text-xs px-4 py-2">Opslaan ✓</button>
        <button onClick={() => { setForm({ ...init }); setBewerk(false) }} className="btn-ghost text-xs border border-gray-200">Annuleren</button>
      </div>
    </div>
  )
}

function AntwoordVeld({ berichtId, onAntwoord }) {
  const [open, setOpen] = useState(false)
  const [tekst, setTekst] = useState('')

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="ml-6 text-xs text-nhl-blauw hover:underline font-medium">
        + Reageren als AI-HUB team
      </button>
    )
  }

  return (
    <div className="ml-6 mt-2">
      <div className="bg-nhl-blauw/5 border border-nhl-blauw/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-lg ml-auto">
        <div className="text-xs font-semibold text-nhl-blauw mb-2">🧭 AI-HUB team: jouw reactie</div>
        <textarea value={tekst} onChange={e => setTekst(e.target.value)} rows={3}
          placeholder="Typ hier je reactie..."
          className="w-full bg-white border border-nhl-blauw/20 rounded-xl px-3 py-2 text-sm text-nhl-blauw focus:outline-none focus:ring-2 focus:ring-nhl-blauw resize-none mb-2" />
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setOpen(false); setTekst('') }} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg">Annuleren</button>
          <button onClick={() => { if (tekst.trim()) { onAntwoord(berichtId, tekst.trim()); setOpen(false) } }}
            disabled={!tekst.trim()}
            className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${tekst.trim() ? 'bg-nhl-blauw text-white hover:bg-nhl-blauw-dark' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            Reactie plaatsen ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Beheer({ berichten, setBerichten, videos, setVideos, actiefVideoId, setActiefVideoId, pilots, setPilots, docs, setDocs, inspiraties, setInspiraties, roadmap, setRoadmap }) {
  const [code, setCode] = useState('')
  const [toegang, setToegang] = useState(false)
  const [fout, setFout] = useState('')
  const [cloudStatus, setCloudStatus] = useState('idle')
  const [cloudTijdstempel, setCloudTijdstempel] = useState(null)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [actieveTab, setActieveTab] = useState('initiatieven')
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLaden, setAnalyticsLaden] = useState(false)
  const [analyticsFout, setAnalyticsFout] = useState(null)
  const [wijzigingen, setWijzigingen] = useState(null)

  // Haal bij het openen de tijdstempel van de laatste gelukte cloud backup op
  useEffect(() => {
    haalCloudTijdstempel().then(ts => { if (ts) setCloudTijdstempel(ts) }).catch(() => {})
  }, [])

  const laadAnalytics = () => {
    setAnalyticsLaden(true)
    setAnalyticsFout(null)
    fetch('/.netlify/functions/storage?key=analytics-bezoeken')
      .then(async r => {
        const body = await r.text()
        let data
        try { data = JSON.parse(body) } catch {
          throw new Error(`de storage-function gaf geen geldige JSON terug (status ${r.status}): "${body.slice(0, 120)}"`)
        }
        if (data.error) throw new Error(data.error)
        let parsed = []
        try {
          const raw = data.value ?? data
          parsed = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : [])
        } catch {}
        setAnalytics(parsed)
        setAnalyticsLaden(false)
      })
      .catch(err => {
        setAnalyticsFout(err?.message || 'onbekende fout')
        setAnalytics([])
        setAnalyticsLaden(false)
      })
    haalWijzigingenOp().then(setWijzigingen).catch(() => setWijzigingen([]))
  }

  // Bezoekersdata automatisch laden zodra de tab opent, geen aparte knop meer nodig
  useEffect(() => {
    if (actieveTab === 'bezoekers' && analytics === null && !analyticsLaden) laadAnalytics()
  }, [actieveTab])

  const resetAnalytics = () => {
    if (!window.confirm('Alle bezoekersdata wissen? Dit kan niet ongedaan worden gemaakt.')) return
    fetch('/.netlify/functions/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'analytics-bezoeken', value: JSON.stringify([]) }),
    }).then(() => setAnalytics([]))
  }

  const [alleInitiatieven, setAlleInitiatieven] = useState(initData)

  const [previewData, setPreviewData] = useState(null)
  const [previewBron, setPreviewBron] = useState(null)

  const voerBackupUit = useCallback(async (data) => {
    try {
      setCloudStatus('saving')
      const ts = await slaOpInCloud(data)
      setCloudTijdstempel(ts)
      setCloudStatus('saved')
      setTimeout(() => setCloudStatus('idle'), 3000)
    } catch {
      setCloudStatus('error')
      setTimeout(() => setCloudStatus('idle'), 5000)
    }
  }, [])

  const voerHerstellUit = (geselecteerd) => {
    if (!previewData) return
    if (geselecteerd.alleInitiatieven && previewData.alleInitiatieven) setAlleInitiatieven(previewData.alleInitiatieven)
    if (geselecteerd.berichten && previewData.berichten) setBerichten(previewData.berichten)
    if (geselecteerd.videos && previewData.videos) setVideos(previewData.videos)
    if (geselecteerd.pilots && previewData.pilots) setPilots(previewData.pilots)
    if (geselecteerd.docs && previewData.docs) setDocs(previewData.docs)
    if (geselecteerd.inspiraties && previewData.inspiraties) setInspiraties(previewData.inspiraties)
    if (geselecteerd.roadmap && previewData.roadmap && setRoadmap) setRoadmap(previewData.roadmap)
    logWijziging('Backup', previewBron === 'cloud' ? 'hersteld uit cloud' : 'hersteld uit bestand', '', '☁️')
    if (previewBron === 'cloud' && previewData.backupDatum) setCloudTijdstempel(previewData.backupDatum)
    setPreviewData(null)
    setPreviewBron(null)
    setCloudStatus('saved')
    setTimeout(() => setCloudStatus('idle'), 3000)
  }

  const login = () => {
    if (code === BEHEER_CODE) { setToegang(true); setFout('') }
    else setFout('Onjuiste code.')
  }

  const slaInitiatiefOp = (gewijzigd) => {
    logWijziging('Initiatief', 'bijgewerkt', gewijzigd.naam, '🚀')
    setAlleInitiatieven(prev => prev.map(i => i.id === gewijzigd.id ? gewijzigd : i))
  }

  const handleExport = () => {
    exportJSON({ alleInitiatieven, berichten, videos, pilots, docs, inspiraties, roadmap, exportDatum: new Date().toISOString() }, `aihub-export-${Date.now()}.json`)
  }

  const handleImport = async (file) => {
    try {
      const data = await importJSON(file)
      setPreviewData(data)
      setPreviewBron('import')
    } catch { alert('Import mislukt: controleer het bestand.') }
  }

  const handleCloudHerstel = async () => {
    setCloudStatus('saving')
    try {
      const data = await laadUitCloud()
      if (!data) { alert('Geen cloud backup gevonden.'); setCloudStatus('idle'); return }
      setPreviewData(data)
      setPreviewBron('cloud')
      setCloudStatus('idle')
    } catch {
      setCloudStatus('error')
      setTimeout(() => setCloudStatus('idle'), 5000)
    }
  }

  if (!toegang) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-xl font-bold text-nhl-blauw">Beheeromgeving</h2>
            <p className="text-gray-500 text-sm mt-1">Voer de beheercode in.</p>
          </div>
          <input type="password" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Beheercode..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
          {fout && <div className="text-red-500 text-xs mb-3">{fout}</div>}
          <button onClick={login} className="btn-primary w-full">Inloggen</button>
        </div>
      </div>
    )
  }

  // Tabs in twee rijen om overflow te voorkomen
  const tabsRij1 = [
    { id: 'initiatieven', label: 'Initiatieven', n: alleInitiatieven.length },
    { id: 'berichten', label: 'Vragen en ideeën', n: berichten.length },
    { id: 'inspiraties', label: 'Inzichten', n: (inspiraties || []).length },
    { id: 'video', label: "Video's", n: (videos || []).filter(v => v.status === 'wachtrij').length > 0 ? `${(videos || []).filter(v => v.status === 'wachtrij').length} wachtrij` : (videos || []).length },
  ]
  const tabsRij2 = [
    { id: 'bezoekers', label: '📈 Activiteit', n: null },
    { id: 'pilots', label: 'Pilots', n: (pilots || []).length },
    { id: 'docs', label: 'Documenten', n: (docs || []).length },
    { id: 'nieuws', label: '📰 Nieuws ophalen', n: null },
    { id: 'backup', label: '☁️ Backup en Restore', n: null },
    { id: 'rapport', label: '📄 Rapport', n: null },
  ]

  function TabBalk({ tabs }) {
    return (
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActieveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5 ${actieveTab === tab.id ? 'border-nhl-blauw text-nhl-blauw' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
            {tab.n !== null && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-xs">{tab.n}</span>}
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-nhl-roze font-semibold text-xs uppercase tracking-widest mb-1">Beheer</div>
            <h1 className="text-2xl font-bold text-nhl-blauw">AI-Netwerk Beheer</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Cloud status badge */}
            <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs border transition-colors ${
              cloudStatus === 'saving' ? 'bg-yellow-50 border-yellow-300' :
              cloudStatus === 'saved' ? 'bg-green-50 border-green-400' :
              cloudStatus === 'error' ? 'bg-red-50 border-red-300' :
              cloudTijdstempel ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                cloudStatus === 'saving' ? 'bg-yellow-400 animate-pulse' :
                cloudStatus === 'saved' ? 'bg-green-500' :
                cloudStatus === 'error' ? 'bg-red-500' :
                cloudTijdstempel ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div>
                <div className={`font-semibold leading-tight ${
                  cloudStatus === 'error' ? 'text-red-600' :
                  cloudTijdstempel || cloudStatus === 'saved' ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {cloudStatus === 'saving' ? '⏳ Backup bezig...' :
                   cloudStatus === 'saved' ? '✓ Cloud backup opgeslagen' :
                   cloudStatus === 'error' ? '✗ Cloud backup mislukt' :
                   cloudTijdstempel ? '✓ Cloud backup gelukt' : '☁️ Nog geen cloud backup'}
                </div>
                <div className="text-gray-400 leading-tight mt-0.5">
                  {cloudTijdstempel
                    ? new Date(cloudTijdstempel).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Nog geen cloud backup gevonden'}
                </div>
              </div>
            </div>

            {/* Nieuws refresh status */}
            {(() => {
              const ts = localStorage.getItem('aihub-laatste-refresh')
              if (!ts) return (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400">
                  <span>🤖</span><span>Nog niet ge-refresht</span>
                </div>
              )
              return (
                <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-nhl-blauw leading-tight">✓ Nieuws ge-refresht</div>
                    <div className="text-gray-400 leading-tight mt-0.5">
                      {new Date(ts).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Knop verwijst nu correct naar 'nieuws' tab */}
            <button onClick={() => setActieveTab('nieuws')}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border bg-white border-gray-200 text-gray-500 hover:border-nhl-roze hover:text-nhl-roze transition-colors font-medium">
              📰 Nieuws ophalen
            </button>
            <button onClick={() => setChangelogOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border bg-white border-gray-200 text-gray-500 hover:border-nhl-blauw hover:text-nhl-blauw transition-colors font-medium">
              📋 Changelog
            </button>
            <button onClick={() => setActieveTab('beta')}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border bg-pink-50 border-pink-200 text-nhl-roze hover:bg-pink-100 transition-colors font-semibold">
              🧪 Beta-features
            </button>
            <button onClick={() => setToegang(false)} className="btn-ghost text-xs border border-gray-200">Uitloggen</button>
          </div>
        </div>

        {/* Tabs in twee rijen zodat ze altijd passen */}
        <div className="mb-6 space-y-0">
          <TabBalk tabs={tabsRij1} />
          <TabBalk tabs={tabsRij2} />
        </div>

        {actieveTab === 'initiatieven' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Bewerk of verwijder initiatieven. Wijzigingen zijn direct zichtbaar.</p>
            <div className="space-y-3">
              {alleInitiatieven.map(init => (
                <InitiatiefRij key={init.id} init={init} onSave={slaInitiatiefOp}
                  onDelete={(id) => { if (window.confirm('Verwijderen?')) { const init = alleInitiatieven.find(i => i.id === id); logWijziging('Initiatief', 'verwijderd', init ? init.naam : '', '🚀'); setAlleInitiatieven(prev => prev.filter(i => i.id !== id)) } }} />
              ))}
            </div>
          </div>
        )}

        {actieveTab === 'berichten' && (
          <div>
            {berichten.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-3">📭</div><div>Nog geen berichten.</div></div>
            ) : (
              <div className="space-y-4">
                {berichten.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {b.categorieLabel && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{b.categorieIcon} {b.categorieLabel}</span>}
                          {b.themaLabel && <span className="text-xs bg-blue-50 text-nhl-blauw px-2.5 py-1 rounded-full font-medium">{b.themaLabel}</span>}
                          <span className="text-xs text-gray-400">{b.rol}{b.naam ? ` · ${b.naam}` : ''} · {b.datum}</span>
                        </div>
                        <button onClick={() => setBerichten(prev => prev.filter(x => x.id !== b.id))} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Verwijder</button>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl rounded-tl-sm px-4 py-3 mb-3 max-w-lg">
                        <p className="text-gray-600 text-sm leading-relaxed">{b.vraag}</p>
                        {b.email && <div className="text-xs text-gray-400 mt-2">✉️ {b.email}</div>}
                      </div>
                      {b.antwoord ? (
                        <div className="ml-6">
                          <div className="bg-nhl-blauw/5 border border-nhl-blauw/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-lg ml-auto">
                            <div className="text-xs font-semibold text-nhl-blauw mb-1">🧭 AI-HUB team</div>
                            <p className="text-nhl-blauw text-sm leading-relaxed">{b.antwoord}</p>
                          </div>
                        </div>
                      ) : (
                        <AntwoordVeld berichtId={b.id} onAntwoord={(id, tekst) => {
                          setBerichten(prev => prev.map(x => x.id === id ? { ...x, antwoord: tekst } : x))
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {actieveTab === 'inspiraties' && (
          <div>
            {(inspiraties || []).length === 0 ? (
              <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-3">💡</div><div>Nog geen inzichten.</div></div>
            ) : (
              <div className="space-y-3">
                {(inspiraties || []).map(b => (
                  <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base">{b.icon}</span>
                        <span className="font-semibold text-nhl-blauw text-sm">{b.titel}</span>
                        <span className="text-xs text-gray-400">· {b.datum}</span>
                      </div>
                      <p className="text-gray-500 text-xs line-clamp-2">{b.tekst}</p>
                    </div>
                    <button onClick={() => setInspiraties(prev => prev.filter(x => x.id !== b.id))} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Verwijder</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {actieveTab === 'video' && (
          <div>
            {(videos || []).filter(v => v.status === 'wachtrij').length > 0 && (
              <div className="mb-6">
                <div className="font-semibold text-nhl-blauw mb-3 flex items-center gap-2">
                  <span className="bg-nhl-roze text-white text-xs px-2 py-0.5 rounded-full">{videos.filter(v => v.status === 'wachtrij').length}</span>
                  Wacht op goedkeuring
                </div>
                <div className="space-y-3">
                  {videos.filter(v => v.status === 'wachtrij').map(v => (
                    <div key={v.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                      <div className="font-medium text-nhl-blauw text-sm mb-1">{v.titel}</div>
                      <p className="text-gray-500 text-xs mb-3">{v.omschrijving}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { logWijziging('Video', 'goedgekeurd', v.titel || '', '🎬'); setVideos(prev => prev.map(x => x.id === v.id ? { ...x, status: 'goedgekeurd' } : x)); if (setActiefVideoId) setActiefVideoId(v.id) }}
                          className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg font-medium">✓ Goedkeuren</button>
                        <button onClick={() => setVideos(prev => prev.filter(x => x.id !== v.id))}
                          className="flex-1 bg-red-100 text-red-600 text-xs py-2 rounded-lg font-medium">✕ Afwijzen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="font-semibold text-gray-500 text-sm mb-3">Goedgekeurd ({(videos || []).filter(v => v.status === 'goedgekeurd').length})</div>
            <div className="space-y-2">
              {(videos || []).filter(v => v.status === 'goedgekeurd').map(v => (
                <div key={v.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-nhl-blauw truncate">{v.titel}</div>
                    <div className="text-xs text-gray-400">👍 {v.omhoog} · {v.datum}</div>
                  </div>
                  <button onClick={() => setVideos(prev => prev.filter(x => x.id !== v.id))} className="text-red-400 hover:text-red-600 text-xs">Verwijder</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {actieveTab === 'pilots' && (
          <div>
            {(pilots || []).length === 0 ? (
              <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-3">🧪</div><div>Nog geen pilots.</div></div>
            ) : (
              <div className="space-y-3">
                {(pilots || []).map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-nhl-blauw text-sm">{p.naam}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Lopend' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                      </div>
                      <div className="text-xs text-gray-400">{p.academie} · {p.platform} · {p.updates?.length || 0} updates</div>
                    </div>
                    <button onClick={() => { if (window.confirm('Verwijderen?')) { logWijziging('Pilot', 'verwijderd', p.naam || '', '🧪'); setPilots(prev => prev.filter(x => x.id !== p.id)) } }} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Verwijder</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {actieveTab === 'docs' && (
          <div>
            {(docs || []).length === 0 ? (
              <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-3">📁</div><div>Nog geen documenten.</div></div>
            ) : (
              <div className="space-y-2">
                {(docs || []).map(d => (
                  <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <span className="text-2xl">{d.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-nhl-blauw text-sm">{d.titel}</div>
                      <div className="text-xs text-gray-400">{d.type?.toUpperCase()} · {d.datum}</div>
                    </div>
                    <button onClick={() => { if (window.confirm('Verwijderen?')) { logWijziging('Document', 'verwijderd', d.titel || d.naam || '', '📁'); setDocs(prev => prev.filter(x => x.id !== d.id)) } }} className="text-red-400 hover:text-red-600 text-xs">Verwijder</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {actieveTab === 'nieuws' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100" style={{background: 'linear-gradient(135deg, #0E7490 0%, #0F766E 100%)'}}>
                <div className="text-white font-bold text-base flex items-center gap-2 mb-1">📰 Nieuws ophalen</div>
                <div className="text-white/80 text-sm">Actuele AI-berichten worden opgehaald, beoordeeld op relevantie voor NHL Stenden en toegevoegd aan Inzichten. Elk item wordt ook getoetst aan de AI Act verplichtingen: wijst het op een wijziging, aanscherping, uitstel of nieuwe uitleg, dan krijgt het een signaal voor opvolging in de roadmap.</div>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                    <div className="font-semibold text-nhl-blauw text-sm mb-2 flex items-center gap-2">🔍 Hoe werkt het?</div>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-nhl-blauw text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span><span>Het systeem haalt berichten op uit RSS-feeds van relevante bronnen.</span></li>
                      <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-nhl-blauw text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span><span>Claude AI beoordeelt elk bericht op relevantie voor NHL Stenden en AI in onderwijs.</span></li>
                      <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-nhl-blauw text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span><span>Relevante items worden automatisch vertaald naar het Nederlands en toegevoegd aan Inzichten.</span></li>
                    </ol>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                    <div className="font-semibold text-nhl-blauw text-sm mb-2 flex items-center gap-2">📡 Bronnen die worden gevolgd</div>
                    <div className="space-y-2">
                      {[
                        { naam: 'Rijksoverheid', omschrijving: 'AI-beleid, AI-Fabriek, nationale strategie', icon: '🏛️', kleur: '#1E3A8A' },
                        { naam: 'SURF', omschrijving: 'AI-Hub, GPT-NL, onderwijs en ICT', icon: '🤝', kleur: '#0F766E' },
                        { naam: 'Npuls', omschrijving: 'Digitalisering hoger onderwijs', icon: '📚', kleur: '#7C3AED' },
                        { naam: 'EU en AI Act', omschrijving: 'Compliance, regelgeving en Europees AI-beleid', icon: '⚖️', kleur: '#E91E8C' },
                        { naam: 'The Gradient, 80,000 Hours, Import AI', omschrijving: 'Internationale AI-ontwikkelingen', icon: '🌐', kleur: '#B45309' },
                      ].map(b => (
                        <div key={b.naam} className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0">{b.icon}</span>
                          <div>
                            <span className="text-xs font-semibold" style={{color: b.kleur}}>{b.naam}</span>
                            <span className="text-xs text-gray-400">: {b.omschrijving}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <NieuwsOphalen inspiraties={inspiraties || []} onNieuwItems={(items) => {
                  setInspiraties(prev => {
                    const nieuweIds = new Set(prev.map(i => i.titel))
                    return [...items.filter(i => !nieuweIds.has(i.titel)), ...prev]
                  })
                }} />
              </div>
            </div>
          </div>
        )}

        {actieveTab === 'rapport' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">PDF Rapport genereren</div>
                  <p className="text-gray-500 text-sm mb-3">Genereer een professioneel voortgangsrapport van het AI-Netwerk als PDF, opgebouwd langs de AI-Koers. Live gegenereerd met de meest actuele data: koerslijnen, initiatieven, AI Act verplichtingen, roadmap, prognose en governance.</p>
                  <button onClick={() => (() => {
                    try {
                      /* geen data via URL */
                    } catch(e) {}
                    window.open('/rapport', '_blank')
                  })()}
                    className="w-full flex items-center justify-center gap-2 bg-nhl-blauw hover:bg-nhl-blauw/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors mb-2">
                    📄 Genereer en open PDF-rapport
                  </button>
                  <p className="text-xs text-gray-400">Opent in nieuw tabblad. Gebruik Bestand → Afdrukken → Opslaan als PDF.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs font-semibold text-nhl-blauw mb-3">Inhoud van het rapport</div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div>✓ Managementsamenvatting met kerncijfers en signalen</div>
                    <div>✓ Fundament: bestuurlijk kader, wetgeving en netwerken</div>
                    <div>✓ De zes koerslijnen uit de AI-Koers</div>
                    <div>✓ Initiatieven per koerslijn, intern en extern</div>
                    <div>✓ AI Act verplichtingen met signalering per verplichting</div>
                    <div>✓ Roadmap en berekende prognose</div>
                    <div>✓ Pilots: lopende experimenten</div>
                    <div>✓ Governance en overlegstructuur</div>
                    <div>✓ Inzichten uit het netwerk</div>
                  </div>
                </div>
              </div>
            )}
            {actieveTab === 'beta' && (
              <div>
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🧪</span>
                    <h2 className="text-lg font-bold text-nhl-blauw">Beta-features</h2>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Dit zijn functies en pagina's die (nog) niet vrijgegeven zijn op de hoofdsite, om de kern van het AI-Netwerk (initiatieven verbinden) overzichtelijk te houden. Ze zijn niet verwijderd, alleen hier opzij gezet totdat er anders over wordt besloten.
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { id: 'nvao', icon: '🧪', titel: 'NVAO & GenAI', omschrijving: 'Invulling per accreditatiestandaard.' },
                    { id: 'documentatie-beta', icon: '📁', titel: 'Documentatie', omschrijving: 'Presentaties, rapporten en materiaal.' },
                    { id: 'video-beta', icon: '🎬', titel: "Video's", omschrijving: 'De videobibliotheek van het netwerk.' },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActieveTab(item.id)}
                      className="text-left bg-white rounded-2xl border border-gray-200 p-5 hover:border-nhl-roze transition-colors">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-bold text-nhl-blauw mb-1">{item.titel}</div>
                      <div className="text-xs text-gray-400">{item.omschrijving}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {actieveTab === 'nvao' && (
              <div className="space-y-4">
                <button onClick={() => setActieveTab('beta')} className="text-xs text-gray-400 hover:text-nhl-blauw transition-colors">← Terug naar Beta-overzicht</button>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <h2 className="text-lg font-bold text-nhl-blauw">NVAO & GenAI</h2>
                    <span className="inline-flex items-center gap-1 bg-pink-50 text-nhl-roze px-2.5 py-0.5 rounded-full text-xs font-medium">Beta: alleen zichtbaar voor beheerders</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <iframe
                    src="/nvao"
                    title="NVAO & GenAI"
                    className="w-full"
                    style={{ height:"70vh", border:"none" }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Deze pagina is verborgen voor gewone gebruikers en alleen toegankelijk via de beheeromgeving.
                </p>
              </div>
            )}
            {actieveTab === 'documentatie-beta' && (
              <div className="space-y-4">
                <button onClick={() => setActieveTab('beta')} className="text-xs text-gray-400 hover:text-nhl-blauw transition-colors">← Terug naar Beta-overzicht</button>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📁</span>
                  <div>
                    <h2 className="text-lg font-bold text-nhl-blauw">Documentatie</h2>
                    <span className="inline-flex items-center gap-1 bg-pink-50 text-nhl-roze px-2.5 py-0.5 rounded-full text-xs font-medium">Beta: alleen zichtbaar voor beheerders</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <iframe
                    src="/documentatie"
                    title="Documentatie"
                    className="w-full"
                    style={{ height:"70vh", border:"none" }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Deze pagina staat niet meer in het hoofdmenu, om de kern van de site (initiatieven verbinden) scherp te houden. De pagina en haar inhoud blijven bestaan en zijn hier te beheren.
                </p>
              </div>
            )}
            {actieveTab === 'video-beta' && (
              <div className="space-y-4">
                <button onClick={() => setActieveTab('beta')} className="text-xs text-gray-400 hover:text-nhl-blauw transition-colors">← Terug naar Beta-overzicht</button>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <h2 className="text-lg font-bold text-nhl-blauw">Video's</h2>
                    <span className="inline-flex items-center gap-1 bg-pink-50 text-nhl-roze px-2.5 py-0.5 rounded-full text-xs font-medium">Beta: alleen zichtbaar voor beheerders</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <iframe
                    src="/video"
                    title="Video's"
                    className="w-full"
                    style={{ height:"70vh", border:"none" }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Deze pagina staat niet meer in het hoofdmenu, om de kern van de site (initiatieven verbinden) scherp te houden. De pagina en haar inhoud blijven bestaan en zijn hier te beheren.
                </p>
              </div>
            )}
            {actieveTab === 'bezoekers' && (
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-nhl-blauw">Activiteit op het platform</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Bezoeken en de laatste aanpassingen op het AI-Netwerk, bijgehouden in Netlify Blobs.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={laadAnalytics} disabled={analyticsLaden}
                      title="Haalt de bezoeken en aanpassingen opnieuw op uit Netlify Blobs"
                      className="text-xs px-3 py-2 rounded-xl border bg-white border-gray-200 text-nhl-blauw hover:border-nhl-blauw transition-colors font-medium">
                      {analyticsLaden ? 'Laden...' : '🔄 Vernieuwen'}
                    </button>
                    <button onClick={resetAnalytics}
                      title="Wist alle geregistreerde bezoeken definitief. Gebruik dit alleen om opnieuw te beginnen met tellen."
                      className="text-xs px-3 py-2 rounded-xl border bg-red-50 border-red-200 text-red-500 hover:bg-red-100 transition-colors font-medium">
                      🗑 Reset teller
                    </button>
                  </div>
                </div>

                {analyticsFout && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                    ⚠️ Activiteitsdata kon niet worden opgehaald: {analyticsFout}. Kijk in de Netlify function logs onder Logs & metrics → Functions → storage. Blijft dit terugkomen na de nieuwste deploy, herstel dan de opslag met de knop Reset teller en probeer opnieuw.
                  </div>
                )}

                {analytics === null && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <span className="animate-spin inline-block mr-2">⟳</span> Bezoekersdata wordt geladen...
                  </div>
                )}

                {analytics !== null && analytics.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-3xl mb-2">📭</div>
                    <div>Nog geen bezoeken geregistreerd.</div>
                    <div className="text-xs mt-1">Bezoekers worden bijgehouden zodra een pagina geladen wordt.</div>
                  </div>
                )}

                {analytics !== null && analytics.length > 0 && (() => {
                  const totaal = analytics.length
                  const vandaag = analytics.filter(b => {
                    const d = new Date(b.ts)
                    const nu = new Date()
                    return d.toDateString() === nu.toDateString()
                  }).length
                  const dezeWeek = analytics.filter(b => b.ts && (Date.now() - b.ts) < 7 * 24 * 60 * 60 * 1000).length

                  // Meest bezochte pagina's
                  const paginaTelling = {}
                  analytics.forEach(b => {
                    paginaTelling[b.label] = (paginaTelling[b.label] || 0) + 1
                  })
                  const topPaginas = Object.entries(paginaTelling)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)

                  // Bezoeken per uur van de dag
                  const perUur = Array(24).fill(0)
                  analytics.forEach(b => { if (b.uur !== undefined) perUur[b.uur]++ })
                  const maxUur = Math.max(...perUur, 1)
                  const piekUur = perUur.indexOf(Math.max(...perUur))

                  // Recentste bezoeken
                  const recente = [...analytics].reverse().slice(0, 15)

                  return (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-4 gap-4">
                        <div className="bg-nhl-blauw/5 rounded-2xl p-5">
                          <div className="text-3xl font-extrabold text-nhl-blauw">{totaal}</div>
                          <div className="text-xs text-gray-500 mt-1">Totaal paginabezoeken</div>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-5">
                          <div className="text-3xl font-extrabold text-green-700">{vandaag}</div>
                          <div className="text-xs text-gray-500 mt-1">Vandaag</div>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-5">
                          <div className="text-3xl font-extrabold text-nhl-blauw">{dezeWeek}</div>
                          <div className="text-xs text-gray-500 mt-1">Deze week</div>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-5">
                          <div className="text-3xl font-extrabold text-amber-700">{piekUur}:00</div>
                          <div className="text-xs text-gray-500 mt-1">Piekuur</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="font-bold text-nhl-blauw mb-4 text-sm">Meest bezochte pagina's</div>
                          <div className="space-y-2">
                            {topPaginas.map(([label, n]) => (
                              <div key={label} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-700 truncate">{label}</div>
                                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                                    <div className="h-1.5 bg-nhl-blauw rounded-full transition-all"
                                      style={{ width: `${(n / topPaginas[0][1]) * 100}%` }} />
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-nhl-blauw flex-shrink-0">{n}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="font-bold text-nhl-blauw mb-4 text-sm">Bezoeken per uur</div>
                          <div className="flex items-end gap-0.5 h-24">
                            {perUur.map((n, uur) => (
                              <div key={uur} className="flex-1 flex flex-col items-center gap-0.5" title={`${uur}:00 · ${n} bezoek(en)`}>
                                <div className="w-full bg-nhl-blauw/20 rounded-sm transition-all"
                                  style={{ height: `${(n / maxUur) * 80}px`, minHeight: n > 0 ? '3px' : '0' }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-gray-300 mt-1">
                            <span>0u</span><span>12u</span><span>24u</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="font-bold text-nhl-blauw mb-4 text-sm">Bezoeken per onderdeel</div>
                          {(() => {
                            const telling = ONDERDELEN.map(o => ({
                              naam: o.naam,
                              n: analytics.filter(b => o.paden.includes(b.pad)).length,
                            }))
                            const rest = analytics.length - telling.reduce((t, o) => t + o.n, 0)
                            if (rest > 0) telling.push({ naam: 'Overig', n: rest })
                            const max = Math.max(...telling.map(t => t.n), 1)
                            return (
                              <div className="space-y-2">
                                {telling.filter(t => t.n > 0).sort((a, b) => b.n - a.n).map(t => (
                                  <div key={t.naam} className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-gray-700">{t.naam}</div>
                                      <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                                        <div className="h-1.5 bg-nhl-roze rounded-full transition-all" style={{ width: `${(t.n / max) * 100}%` }} />
                                      </div>
                                    </div>
                                    <span className="text-xs font-bold text-nhl-blauw flex-shrink-0">{t.n}</span>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="font-bold text-nhl-blauw mb-4 text-sm">Laatste aanpassingen</div>
                          {wijzigingen === null && <div className="text-xs text-gray-400">Laden...</div>}
                          {Array.isArray(wijzigingen) && wijzigingen.length === 0 && (
                            <div className="text-xs text-gray-400">Nog geen aanpassingen geregistreerd. Vanaf deze versie wordt elke toevoeging, wijziging of verwijdering hier bijgehouden.</div>
                          )}
                          {Array.isArray(wijzigingen) && wijzigingen.length > 0 && (
                            <div className="space-y-1.5 max-h-56 overflow-y-auto">
                              {wijzigingen.slice(0, 25).map((w, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                                  <span className="flex-shrink-0">{w.icon || '✏️'}</span>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-nhl-blauw">{w.onderdeel}</span>
                                    <span className="text-gray-500"> · {w.actie}</span>
                                    {w.titel && <span className="text-gray-500">: {w.titel}</span>}
                                  </div>
                                  <span className="text-gray-300 flex-shrink-0">{w.tijd}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="font-bold text-nhl-blauw mb-4 text-sm">Recente bezoeken</div>
                        <div className="space-y-1.5">
                          {recente.map((b, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs">
                              <span className="text-gray-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                              <span className="font-medium text-nhl-blauw w-36 truncate flex-shrink-0">{b.label}</span>
                              <span className="text-gray-400">{b.datum}</span>
                              <span className="text-gray-300">{b.tijdstip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {actieveTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="nhl-gradient-deep px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${
                    cloudStatus === 'saving' ? 'bg-yellow-300 animate-pulse' :
                    cloudStatus === 'saved' ? 'bg-green-400' :
                    cloudStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
                  }`} />
                  <div>
                    <div className="text-white font-bold text-sm">☁️ Cloud backup (Netlify)</div>
                    <div className="text-blue-200 text-xs">
                      {cloudTijdstempel
                        ? `Laatste backup: ${new Date(cloudTijdstempel).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
                        : 'Nog geen cloud backup gevonden. Maak er hieronder een.'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">☁️</span>
                    <h3 className="font-bold text-nhl-blauw">Sla op in de cloud</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Sla de huidige staat op in Netlify Blobs, inclusief de roadmap. De vorige cloudversie wordt overschreven; download daarnaast regelmatig een JSON-kopie.</p>
                  <button onClick={() => voerBackupUit({ alleInitiatieven, berichten, videos, pilots, docs, inspiraties, roadmap })}
                    disabled={cloudStatus === 'saving'}
                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
                    {cloudStatus === 'saving' ? <><span className="animate-spin">⟳</span> Bezig...</> :
                     cloudStatus === 'saved' ? <>✓ Opgeslagen in de cloud</> :
                     <>☁️ Sla op in de cloud</>}
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔄</span>
                    <h3 className="font-bold text-nhl-blauw">Herstel uit cloud</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Bekijk de backup en kies welke onderdelen je wilt terugzetten.</p>
                  <button onClick={handleCloudHerstel} disabled={cloudStatus === 'saving'}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-nhl-blauw text-nhl-blauw hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {cloudStatus === 'saving' ? <><span className="animate-spin">⟳</span> Laden...</> : <>🔄 Bekijk cloud backup</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💻</span>
                  <h3 className="font-bold text-nhl-blauw">Download naar laptop</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Sla alle data op als JSON-bestand op jouw eigen laptop.</p>
                <button onClick={handleExport} className="btn-primary w-full">⬇ Download als JSON</button>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rapport</div>
                  <p className="text-gray-500 text-sm mb-3">Genereer een professioneel voortgangsrapport van het AI-Netwerk als PDF, opgebouwd langs de AI-Koers. Het rapport bevat de actuele koerslijnen, initiatieven, AI Act verplichtingen, roadmap, prognose en governance.</p>
                  <button onClick={() => (() => {
                    try {
                      /* geen data via URL */
                    } catch(e) {}
                    window.open('/rapport', '_blank')
                  })()}
                    className="w-full flex items-center justify-center gap-2 bg-nhl-blauw hover:bg-nhl-blauw/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                    📄 Genereer PDF-rapport
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Opent in nieuw tabblad. Gebruik Afdrukken → Opslaan als PDF.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📥</span>
                  <h3 className="font-bold text-nhl-blauw">Importeren vanuit bestand</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Laad een JSON-bestand in. Je ziet eerst een overzicht en kiest wat je terugzet.</p>
                <label className="btn-primary w-full text-center cursor-pointer block">
                  Selecteer JSON bestand
                  <input type="file" accept=".json" className="hidden" onChange={e => { if (e.target.files[0]) handleImport(e.target.files[0]) }} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {previewData && (
      <HerstellModal
        data={previewData}
        bron={previewBron}
        onHerstel={voerHerstellUit}
        onSluiten={() => { setPreviewData(null); setPreviewBron(null) }}
      />
    )}

    {changelogOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
            <div>
              <h2 className="font-bold text-nhl-blauw text-lg">📋 Changelog</h2>
              <p className="text-xs text-gray-400 mt-0.5">Versiehistorie van het AI-Netwerk · huidige versie {APP_VERSIE} ({APP_VERSIE_DATUM})</p>
            </div>
            <button onClick={() => setChangelogOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
          </div>
          <div className="p-6 space-y-6">
            {[
              {
                versie: APP_VERSIE, datum: APP_VERSIE_DATUM,
                label: 'Huidige versie', labelKleur: 'bg-green-100 text-green-700',
                items: [
                  'Uitlegtekst boven Nieuws ophalen geactualiseerd: benoemt nu ook de AI Act signaal-detectie, zodat de tekst dekt wat de functie sinds v2.10 daadwerkelijk doet.',
                ],
              },

              {
                versie: 'v2.10', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Nieuws ophalen: elk item wordt ook beoordeeld tegen de actuele AI Act verplichtingen. Artikelen die wijzen op een wijziging, aanscherping, uitstel of nieuwe uitleg krijgen een signaal en waar mogelijk een koppeling aan de specifieke verplichting.',
                  'Rapport: het agendavoorstel van het thema-overleg Verantwoordelijkheid geeft AI Act signalen uit Inzichten voorrang boven een willekeurig ander inzicht.',
                ],
              },

              {
                versie: 'v2.9', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Rapport: elk agendavoorstel opent met de kernambitie van het eigen onderdeel. Thema-overleggen tonen de kernambitie van hun koerslijn (letterlijk uit de centrale bron, gelijk aan de site), stuurgroep en kernteam bewaken de globale kernambitie en de werking van het AI-Netwerk.',
                ],
              },

              {
                versie: 'v2.8', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Rapport: hoofdstuk Governance toont de volledige overlegstructuur met per overleg een berekend agendavoorstel van maximaal drie punten, samengesteld uit AI Act signalen, open acties uit de actielijst en recente inzichten.',
                  'Overlegstructuur is een centrale bron in data.js geworden (OVERLEG_STRUCTUUR); elke AI Act verplichting is gekoppeld aan een koerslijn.',
                  'Nieuws: The Gradient heeft een vangnet via Google News RSS en elke bron heeft een eigen tijdslimiet, zodat een trage bron de andere niet ophoudt.',
                ],
              },

              {
                versie: 'v2.7', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Dashboard: het kern-ambitie dashboard staat bovenaan, Verplichtingen en roadmap eronder.',
                  'Rapport: per koerslijn een berekende top 3 van actuele agendapunten bij de overlegstructuur, en een bijlage Actielijst met open en afgehandelde acties per kwartaal.',
                  'Versienummer in de Footer leest nu echt uit het centrale APP_VERSIE (de tekst bleek "Versie 2.1" zonder v, daarom werd hij eerder gemist).',
                  'Nieuws: Rijksoverheid en Npuls hebben een gegarandeerd vangnet via Google News RSS, en foutmeldingen tonen alle geprobeerde URLs.',
                  'Activiteit: extra telling Deze week.',
                ],
              },

              {
                versie: 'v2.6', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Wortel van de opslagproblemen opgelost: de Blobs-bibliotheek ontbrak op de server. Activiteit, duplicaat-detectie, wijzigingen-log en backup werken hierdoor weer.',
                  'Nieuwsbronnen proberen per bron meerdere kandidaat-URLs, zodat een verhuisd adres niet direct het einde betekent.',
                  'Rapport verfijnd: leeswijzer, rapportversie en moment op het voorblad, en een blok met wijzigingen sinds het vorige rapport. Vermelding van automatische generatie verwijderd.',
                  'Versienummer in de Footer leest voortaan uit het centrale APP_VERSIE.',
                ],
              },

              {
                versie: 'v2.5', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Storage-function gehard: geeft altijd geldige JSON terug en slaat elke waarde als tekst op. Daarmee is de terugkerende klasse formaat-fouten definitief afgesloten.',
                  'Duidelijke diagnose in Beheer als de opslag toch een onverwacht antwoord geeft, met statuscode en hersteltip.',
                  'Tab Bezoekers hernoemd naar Activiteit: het overzicht toont bezoeken en de laatste aanpassingen op het platform.',
                ],
              },

              {
                versie: 'v2.4', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Nieuws ophalen haalt nu ook Rijksoverheid, SURF, Npuls en EU/AI Act op, zoals de site al beloofde. Belangrijk voor inhoud en compliance.',
                  'Duplicaat-detectie gerepareerd: bekende titels werden in een verkeerd formaat opgeslagen en kwamen nooit terug, waardoor items dubbel binnenkwamen.',
                  'Alle beoordeelde berichten worden onthouden, ook niet-relevante, zodat ze niet elke run opnieuw beoordeeld worden.',
                  'Nieuwsbeoordeling kent nu alle zes koerslijnen, inclusief Werkveld en Onderzoek.',
                ],
              },

              {
                versie: 'v2.3', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Bezoekersoverzicht laadt automatisch bij openen, met verdeling van bezoeken per onderdeel van de site.',
                  'Reset van de bezoekersteller gerepareerd: verkeerd opslagformaat kon het laden stil laten mislukken. Fouten zijn nu zichtbaar.',
                  'Wijzigingen-log: elke toevoeging, wijziging of verwijdering (initiatieven, roadmap, inzichten, pilots, video, documenten, backup-herstel) is zichtbaar in Beheer onder Bezoekers.',
                ],
              },

              {
                versie: 'v2.2', datum: 'Juli 2026',
                label: null, labelKleur: '',
                items: [
                  'Roadmap omgekeerd: de verplichtingen uit de EU AI Act zijn het vertrekpunt, met stoplicht-signalering per verplichting.',
                  'Sectie Eigen koers voor roadmap-items zonder AI Act verplichting.',
                  'Dashboard toont per verplichting het signaal, het gekoppelde werk en de verantwoordelijken.',
                  'Cloud backup schrijft nu echt naar Netlify Blobs. De tijdstempel van de laatste gelukte backup blijft zichtbaar na herlaad.',
                  'Roadmap opgenomen in backup, download en herstel.',
                  'Rapport herschreven langs de AI-Koers: koerslijnen, initiatieven per koerslijn, AI Act signalering en berekende prognose. NVAO verwijderd.',
                  'Nieuws ophalen: per bron is zichtbaar of die echt bekeken is, wat er nieuw is en waar het is geland. Bronnenlijst gecorrigeerd.',
                  'Nieuwe inzichten vallen op de site op met een amber rand.',
                  'Centraal versienummer ingevoerd: APP_VERSIE in data.js is voortaan de enige plek waar de versie wordt bijgehouden.',
                ],
              },

              {
                versie: 'v2.1', datum: 'Juni 2026',
                label: null, labelKleur: '',
                items: [
                  "Startpagina herzien: drie kern-knoppen (AI-Netwerk, Thema's, Kader), losse Dashboard- en Kader-pagina.",
                  'Inzichten samengevoegd als tab binnen Initiatieven, met eigen kleuraccent.',
                  'Dashboard compacter gemaakt, geen scroll-sprong meer bij wisselen van thema.',
                  "Bronvermelding toegevoegd bij thema's, met expliciete doorverwijzing naar CTL en OO&I.",
                  'Em-dashes site-breed vervangen door normale zinsconstructie.',
                  'Weblinks toegevoegd aan initiatieven met een geverifieerde publieke bron.',
                  'Betrokkenen-functie: naam en afdeling toevoegen per initiatief, blijvend opgeslagen.',
                  'Nieuwe pagina Agentic AI toegevoegd onder Kennis, met eigen visualisatie.',
                  "Documentatie en Video's verplaatst naar Beheer, achter de Beta-features knop.",
                  'Bug in de weergave van vragen en ideeën in Beheer verholpen.',
                  'Bezoekersanalytics toegevoegd: paginatracking met overzicht en resetknop in Beheer.',
                  'Cloud backup functions aangemaakt, drie keer per dag automatisch.',
                  'Nieuws-deduplicatie persistent gemaakt via Netlify Blobs.',
                  'Auto-markering toegevoegd bij automatisch opgehaalde nieuws-items.',
                ],
              },

              {
                versie: 'v2.0', datum: 'Juni 2026',
                label: null, labelKleur: '',
                items: [
                  'Netwerk.jsx: extern klikgedrag hersteld. Groene knop blijft zichtbaar na klik op externe bollen.',
                  'NetwerkVisualisatie.jsx gesynchroniseerd met alle 6 sporen en dezelfde knoplogica.',
                  'Meld.jsx: stap-reset werkt nu correct. Terug naar keuzescherm via "Wijzig keuze".',
                  'Meld.jsx: call-to-action voor initiatieven aanmelden toegevoegd op keuzescherm.',
                  'Beheer.jsx: tabs in twee rijen zodat alles past zonder horizontale scroll.',
                  'Beheer.jsx: "Nieuws ophalen" knop in header verwees naar verkeerde tab. Nu gecorrigeerd.',
                  'Em-dashes en koppeltekens als stijlverbinder verwijderd uit alle paginateksten.',
                  'Hernoemd van AI-HUB naar AI-Netwerk: GitHub repo, Netlify site, alle paginateksten.',
                  'NVAO pagina toegevoegd: vier standaarden, bronverwijzingen, vervolgstappen.',
                  'Over pagina hersteld: kernteam drie rollen, techniek infrastructuur laag, thema trekkers.',
                  'Documentatie: toegangscode vereist voor downloaden van documenten.',
                  'Beheer: PDF rapport generator toegevoegd met live data.',
                  'Footer: AI-Netwerk logo, NHL Stenden wit logo met link naar nhlstenden.com.',
                  'Bronnen en inzichten: bronLabel systeem, NHL Stenden badges, intern veld.',
                  'NVAO rapport PDF link gecorrigeerd naar nvao.net.',
                ],
              },

              {
                versie: 'v1.5', datum: 'Juni 2026',
                label: null, labelKleur: '',
                items: [
                  'Hoofdvideo toont altijd de nieuwste goedgekeurde video',
                  'Terug-naar-nieuwste knop verschijnt als je een andere video selecteert',
                  'Drie recente frames onder hoofdvideo',
                  'Import en cloud herstel tonen preview-modal met selectievakjes per categorie',
                ],
              },
              {
                versie: 'v1.4', datum: 'Juni 2026', label: null, labelKleur: '',
                items: [
                  'Cloud backup terminologie verduidelijkt',
                  'Video aanmelden alleen in header',
                  'Videobibliotheek altijd zichtbaar',
                  'Vier frames op datum',
                ],
              },
              {
                versie: 'v1.3', datum: 'Juni 2026', label: null, items: ['Impact dashboard herontworpen', 'Thema-navigatie gefixed'] },
              {
                versie: 'v1.2', datum: 'Juni 2026', label: null, items: ['Impact dashboard', 'Cloud backup', 'Changelog', 'Logo en gradient headers', 'Dropdown nav'] },
              {
                versie: 'v1.1', datum: 'Juni 2026', label: null, items: ["Video, Evenementen, Bronnen, Pilots, Inzichten, Fundament, Over", 'Bestandsupload', 'Beheer tabs'] },
              {
                versie: 'v1.0', datum: 'Mei 2026', label: null, items: ["Eerste versie AI-HUB", "Startpagina, Netwerk, Thema's, Initiatieven", 'Netlify deployment'] },
            ].map(v => (
              <div key={v.versie}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-bold text-nhl-blauw text-base">{v.versie}</span>
                  {v.label && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.labelKleur}`}>{v.label}</span>}
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 flex-shrink-0">{v.datum}</span>
                </div>
                <ul className="space-y-1.5">
                  {v.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-nhl-roze mt-0.5 flex-shrink-0">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
  )
}
