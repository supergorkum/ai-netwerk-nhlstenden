import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GradientHeader from '../components/GradientHeader'

const DOC_URL = '/ai-koers/paginas.json'
const VISITOR_KEY = 'ai-koers-visitor-id'
const ROL_KEY = 'ai-koers-rol'

function haalVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

const ROLLEN = [
  { id: 'docent', label: 'Docent' },
  { id: 'student', label: 'Student' },
  { id: 'management', label: 'Management' },
  { id: 'overig', label: 'Overig' },
]

export default function AIKoers() {
  const navigate = useNavigate()
  const [paginas, setPaginas] = useState(null)
  const [titels, setTitels] = useState([])
  const [stijl, setStijl] = useState('')
  const [laadFout, setLaadFout] = useState(false)
  const [modus, setModus] = useState('overzicht') // 'overzicht' | 'presenteren' | 'afronden'
  const [index, setIndex] = useState(0)
  const [rol, setRol] = useState(() => localStorage.getItem(ROL_KEY) || '')
  const [rolVragen, setRolVragen] = useState(false)
  const [stemPerPagina, setStemPerPagina] = useState({})
  const [feedbackPerPagina, setFeedbackPerPagina] = useState({})
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTekst, setFeedbackTekst] = useState('')
  const [feedbackOpgeslagen, setFeedbackOpgeslagen] = useState(false)
  const [verzonden, setVerzonden] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    fetch(DOC_URL)
      .then(r => { if (!r.ok) throw new Error('niet gevonden'); return r.json() })
      .then(data => {
        setStijl(data.stijl || '')
        setPaginas(data.paginas || [])
        setTitels(data.titels || [])
      })
      .catch(() => setLaadFout(true))
  }, [])

  const visitorId = useRef(null)
  useEffect(() => {
    visitorId.current = haalVisitorId()
    fetch('/.netlify/functions/ai-koers-feedback', {
      method: 'POST',
      body: JSON.stringify({ bezoek: true, visitorId: visitorId.current, rol: rol || undefined }),
    }).catch(() => {})
  }, [])

  const startPresenteren = () => {
    setRolVragen(true)
  }

  const kiesRol = (r) => {
    setRol(r)
    localStorage.setItem(ROL_KEY, r)
    setRolVragen(false)
    setModus('presenteren')
    setIndex(0)
  }

  const verstuur = useCallback((payload) => {
    fetch('/.netlify/functions/ai-koers-feedback', {
      method: 'POST',
      body: JSON.stringify({
        paginaIndex: index,
        visitorId: visitorId.current,
        rol,
        ...payload,
      }),
    }).catch(() => {})
  }, [index, rol])

  const geefStem = (type) => {
    setStemPerPagina(prev => ({ ...prev, [index]: prev[index] === type ? null : type }))
    verstuur({ stem: stemPerPagina[index] === type ? null : type })
  }

  const openFeedback = () => {
    setFeedbackTekst('')
    setFeedbackOpgeslagen(false)
    setFeedbackOpen(true)
  }

  const slaFeedbackOp = () => {
    if (!feedbackTekst.trim()) return
    verstuur({ feedbackTekst: feedbackTekst.trim() })
    setFeedbackPerPagina(prev => ({ ...prev, [index]: feedbackTekst.trim() }))
    setFeedbackOpgeslagen(true)
    setTimeout(() => setFeedbackOpen(false), 1200)
  }

  const volgende = () => {
    if (index === (paginas?.length || 1) - 1) {
      setModus('afronden')
      return
    }
    setIndex(i => Math.min(i + 1, (paginas?.length || 1) - 1))
  }
  const vorige = () => setIndex(i => Math.max(i - 1, 0))

  const rondAf = () => {
    setVerzonden(true)
    setTimeout(() => navigate('/'), 2000)
  }

  useEffect(() => {
    if (modus !== 'presenteren') return
    const onKey = (e) => {
      // Niet navigeren terwijl iemand in het feedback-tekstvak typt: een
      // spatie of pijltoets hoort dan gewoon tekst te worden, niet de
      // pagina te verspringen.
      if (feedbackOpen) return
      if (e.key === 'ArrowRight' || e.key === ' ') volgende()
      if (e.key === 'ArrowLeft') vorige()
      if (e.key === 'Escape') setModus('overzicht')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modus, paginas, feedbackOpen])

  if (laadFout) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm">
          Het AI-Koers document kon niet geladen worden. Controleer of het bestand in public/ai-koers/ staat.
        </div>
      </div>
    )
  }

  if (!paginas) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Document wordt geladen...</div>
      </div>
    )
  }

  if (modus === 'overzicht') {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <GradientHeader
          label="AI-Koers 2026 tot 2030"
          title="Slimmer leren, sterker werken en verantwoord innoveren"
          subtitle="Blader mee door de koers en geef per pagina je reactie."
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-gray-600 text-sm leading-relaxed mb-1 text-center">
            {paginas.length} pagina's. Klik op Presenteren om te beginnen, gebruik daarna de pijltoetsen of de knoppen om te bladeren.
          </p>
          {rol && (
            <p className="text-gray-400 text-xs text-center mb-6">
              Ingesteld als: <span className="font-medium text-gray-500">{ROLLEN.find(r => r.id === rol)?.label || rol}</span>
              {' · '}
              <button onClick={() => setRolVragen(true)} className="text-nhl-roze hover:underline">niet jij? wijzig</button>
            </p>
          )}
          {!rol && <div className="mb-6" />}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="sm:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 text-left">
              <div className="font-bold text-nhl-blauw text-sm mb-3">Zo werkt het reageren per pagina</div>
              <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none">👍👎</span>
                  <span>Geef bij elke pagina een duimpje omhoog of omlaag. Je mag van gedachten veranderen, de laatste keuze telt.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none">💬</span>
                  <span>Klik op Feedback om een tekstveld te openen, typ je reactie en druk op Opslaan.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none">→</span>
                  <span>Klaar met een pagina? Druk op Volgende om door te gaan. Je duimpje en feedback blijven staan, ook als je later teruggaat.</span>
                </div>
              </div>
            </div>
            <a href="/ai-koers/NHL-Stenden-AI-Koers-Poster-A2-preview.png" download
              className="group bg-white border border-gray-200 hover:border-nhl-blauw rounded-2xl p-4 text-left transition-colors flex flex-col">
              <img src="/ai-koers/NHL-Stenden-AI-Koers-Poster-A2-preview.png" alt="AI-Koers poster"
                className="w-full rounded-lg border border-gray-100 mb-3 object-cover" style={{ aspectRatio: '1587/2245', maxHeight: 160 }} />
              <div className="text-xs font-semibold text-nhl-blauw group-hover:underline">📌 Liever op papier?</div>
              <div className="text-xs text-gray-500 mt-1">Download de poster met de koers in één oogopslag.</div>
            </a>
          </div>
          <div className="text-center">
            <button onClick={startPresenteren}
              className="bg-nhl-blauw hover:bg-nhl-blauw/90 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors">
              ▶ Presenteren
            </button>
          </div>
        </div>

        {rolVragen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <div className="font-bold text-nhl-blauw text-lg mb-1">Wie ben je?</div>
              <p className="text-gray-500 text-sm mb-4">Dit wordt eenmalig gevraagd en gebruikt om de feedback te kunnen duiden.</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLLEN.map(r => (
                  <button key={r.id} onClick={() => kiesRol(r.id)}
                    className="border border-gray-200 hover:border-nhl-blauw hover:bg-blue-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors">
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (modus === 'afronden') {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <GradientHeader
          label="AI-Koers 2026 tot 2030"
          title="Jouw overzicht"
          subtitle="Controleer je reacties voordat je afrondt."
        />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="space-y-2 mb-8">
            {paginas.map((_, i) => {
              const stem = stemPerPagina[i]
              const tekst = feedbackPerPagina[i]
              if (!stem && !tekst) return null
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                  <img src={`/ai-koers/thumbs/pagina-${i}.png`} alt={`Pagina ${i + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 font-medium">Pagina {i + 1}</div>
                    <div className="font-bold text-nhl-blauw text-sm mb-1">{titels[i] || `Pagina ${i + 1}`}</div>
                    {stem && <span className="text-lg mr-2">{stem === 'up' ? '👍' : '👎'}</span>}
                    {tekst && <div className="text-sm text-gray-600 mt-1">{tekst}</div>}
                  </div>
                </div>
              )
            })}
            {Object.keys(stemPerPagina).length === 0 && Object.keys(feedbackPerPagina).length === 0 && (
              <div className="text-center text-gray-400 text-sm italic py-6">
                Je hebt nog geen duimpje of feedback gegeven. Dat mag, je kunt gewoon afronden.
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setModus('presenteren')}
              className="text-gray-500 hover:text-gray-700 text-sm px-4 py-3">
              ← Nog een keer bekijken
            </button>
            <button onClick={rondAf}
              className="bg-nhl-blauw hover:bg-nhl-blauw/90 text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors">
              Verzenden en afronden
            </button>
          </div>

          {verzonden && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-bold text-nhl-blauw text-lg mb-1">Dank voor je feedback!</div>
                <p className="text-gray-500 text-sm">Je gaat zo terug naar de hoofdpagina...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Presentatiemodus
  const huidigeStem = stemPerPagina[index]
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-40">
      <div className="flex-1 overflow-hidden relative p-3 sm:p-6">
        <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden">
          <iframe
            ref={iframeRef}
            title={`AI-Koers pagina ${index + 1}`}
            srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${stijl}
html, body { margin: 0; padding: 0; overflow: hidden; }
#ai-koers-wrap { transform-origin: top center; }
#ai-koers-lensbox {
  position: fixed; width: 260px; height: 260px; border-radius: 50%;
  overflow: hidden; border: 3px solid white; box-shadow: 0 6px 24px rgba(0,0,0,0.35);
  pointer-events: none; display: none; z-index: 9999; background: white;
}
#ai-koers-lens-inner { position: absolute; top: 0; left: 0; transform-origin: 0 0; }
</style></head><body>
<div id="ai-koers-wrap">${paginas[index]}</div>
<div id="ai-koers-lensbox"><div id="ai-koers-lens-inner"></div></div>
<script>
(function () {
  var wrap = document.getElementById('ai-koers-wrap');
  var lensbox = document.getElementById('ai-koers-lensbox');
  var lensInner = document.getElementById('ai-koers-lens-inner');
  var huidigeSchaal = 1;
  var ZOOM = 2.3;
  var LENSGROOTTE = 260;

  function pasIn() {
    if (!wrap) return;
    wrap.style.transform = 'none';
    var inhoudHoogte = wrap.scrollHeight;
    var beschikbaar = window.innerHeight;
    huidigeSchaal = beschikbaar > 0 && inhoudHoogte > beschikbaar ? beschikbaar / inhoudHoogte : 1;
    wrap.style.transform = huidigeSchaal < 1 ? 'scale(' + huidigeSchaal + ')' : 'none';
    lensInner.style.width = wrap.offsetWidth + 'px';
    lensInner.innerHTML = wrap.innerHTML;
  }
  window.addEventListener('load', pasIn);
  window.addEventListener('resize', pasIn);
  setTimeout(pasIn, 50);

  function toonLens(e) {
    var breedte = window.innerWidth;
    var muisX = e.clientX, muisY = e.clientY;
    var lokaalX = breedte / 2 + (muisX - breedte / 2) / huidigeSchaal;
    var lokaalY = muisY / huidigeSchaal;
    var lensSchaal = huidigeSchaal * ZOOM;
    var verschuifX = LENSGROOTTE / 2 - lokaalX * lensSchaal;
    var verschuifY = LENSGROOTTE / 2 - lokaalY * lensSchaal;

    lensbox.style.left = (muisX - LENSGROOTTE / 2) + 'px';
    lensbox.style.top = (muisY - LENSGROOTTE / 2) + 'px';
    lensbox.style.display = 'block';
    lensInner.style.transform = 'translate(' + verschuifX + 'px,' + verschuifY + 'px) scale(' + lensSchaal + ')';
  }
  document.addEventListener('mousemove', toonLens);
  document.addEventListener('mouseleave', function () { lensbox.style.display = 'none'; });
})();
</script>
</body></html>`}
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>

      {/* Navigatiebalk onderaan */}
      <div className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setModus('overzicht')} className="text-white/60 hover:text-white text-sm px-2">✕ Sluiten</button>
          <button onClick={vorige} disabled={index === 0}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium">
            ← Vorige
          </button>
          <span className="text-white/50 text-xs px-2">{index + 1} / {paginas.length}</span>
          <button onClick={volgende}
            className="bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
            {index === paginas.length - 1 ? 'Afronden →' : 'Volgende →'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => geefStem('up')}
            className={`rounded-lg px-3 py-2 text-lg transition-colors ${huidigeStem === 'up' ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}>
            👍
          </button>
          <button onClick={() => geefStem('down')}
            className={`rounded-lg px-3 py-2 text-lg transition-colors ${huidigeStem === 'down' ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}>
            👎
          </button>
          <button onClick={openFeedback}
            className="bg-nhl-roze hover:bg-nhl-roze/90 rounded-lg px-4 py-2 text-sm font-semibold">
            💬 Feedback
          </button>
        </div>
      </div>

      {feedbackOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="font-bold text-nhl-blauw text-lg mb-1">Feedback op pagina {index + 1}</div>
            {feedbackOpgeslagen ? (
              <p className="text-green-600 text-sm mt-4">Opgeslagen, bedankt!</p>
            ) : (
              <>
                <textarea value={feedbackTekst} onChange={e => setFeedbackTekst(e.target.value)}
                  placeholder="Wat valt je op bij deze pagina?" rows={4} autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mt-3 mb-4 focus:outline-none focus:ring-2 focus:ring-nhl-blauw resize-none" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setFeedbackOpen(false)} className="text-gray-500 text-sm px-4 py-2">Annuleren</button>
                  <button onClick={slaFeedbackOp} className="btn-primary px-5 py-2 text-sm">Opslaan</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
