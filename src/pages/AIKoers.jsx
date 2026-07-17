import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [paginas, setPaginas] = useState(null)
  const [stijl, setStijl] = useState('')
  const [laadFout, setLaadFout] = useState(false)
  const [modus, setModus] = useState('overzicht') // 'overzicht' | 'presenteren'
  const [index, setIndex] = useState(0)
  const [rol, setRol] = useState(() => localStorage.getItem(ROL_KEY) || '')
  const [rolVragen, setRolVragen] = useState(false)
  const [stemPerPagina, setStemPerPagina] = useState({})
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTekst, setFeedbackTekst] = useState('')
  const [feedbackOpgeslagen, setFeedbackOpgeslagen] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    fetch(DOC_URL)
      .then(r => { if (!r.ok) throw new Error('niet gevonden'); return r.json() })
      .then(data => {
        setStijl(data.stijl || '')
        setPaginas(data.paginas || [])
      })
      .catch(() => setLaadFout(true))
  }, [])

  const visitorId = useRef(null)
  useEffect(() => { visitorId.current = haalVisitorId() }, [])

  const startPresenteren = () => {
    if (!rol) { setRolVragen(true); return }
    setModus('presenteren')
    setIndex(0)
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
    setFeedbackOpgeslagen(true)
    setTimeout(() => setFeedbackOpen(false), 1200)
  }

  const volgende = () => setIndex(i => Math.min(i + 1, (paginas?.length || 1) - 1))
  const vorige = () => setIndex(i => Math.max(i - 1, 0))

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
          <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
            {paginas.length} pagina's. Klik op Presenteren om te beginnen, gebruik daarna de pijltoetsen of de knoppen om te bladeren.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 text-left">
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
</style></head><body>
<div id="ai-koers-wrap">${paginas[index]}</div>
<script>
(function () {
  function pasIn() {
    var wrap = document.getElementById('ai-koers-wrap');
    if (!wrap) return;
    wrap.style.transform = 'none';
    var inhoudHoogte = wrap.scrollHeight;
    var beschikbaar = window.innerHeight;
    var schaal = beschikbaar > 0 && inhoudHoogte > beschikbaar ? beschikbaar / inhoudHoogte : 1;
    wrap.style.transform = schaal < 1 ? 'scale(' + schaal + ')' : 'none';
  }
  window.addEventListener('load', pasIn);
  window.addEventListener('resize', pasIn);
  setTimeout(pasIn, 50);
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
          <button onClick={volgende} disabled={index === paginas.length - 1}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium">
            Volgende →
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
