import { useState, useEffect, useRef } from 'react'
import GradientHeader from '../components/GradientHeader'

export default function AIKoersDocument() {
  const [stijl, setStijl] = useState('')
  const [paginas, setPaginas] = useState(null)
  const [laadFout, setLaadFout] = useState(false)
  const [hoogte, setHoogte] = useState(1000)
  const iframeRef = useRef(null)

  useEffect(() => {
    fetch('/ai-koers/paginas.json')
      .then(r => { if (!r.ok) throw new Error('niet gevonden'); return r.json() })
      .then(data => {
        setStijl(data.stijl || '')
        setPaginas(data.paginas || [])
      })
      .catch(() => setLaadFout(true))
  }, [])

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data && e.data.type === 'ai-koers-hoogte' && typeof e.data.hoogte === 'number') {
        setHoogte(e.data.hoogte)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const srcDoc = paginas ? `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${stijl}
html, body { margin: 0; padding: 0; }
.cover { min-height: auto !important; }
</style></head><body>
${paginas.join('<div class="page-break"></div>')}
<script>
(function () {
  function stuurHoogte() {
    window.parent.postMessage({ type: 'ai-koers-hoogte', hoogte: document.body.scrollHeight }, '*')
  }
  window.addEventListener('load', stuurHoogte)
  setTimeout(stuurHoogte, 150)
  setTimeout(stuurHoogte, 600)
  setTimeout(stuurHoogte, 1500)
})();
</script>
</body></html>` : ''

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <GradientHeader
        label="AI-Koers 2026 tot 2030"
        title="Slimmer leren, sterker werken en verantwoord innoveren"
        subtitle="Blader rustig door het volledige koersdocument, of download het in het formaat dat je nodig hebt."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Drie downloadkaarten */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <a href="/ai-koers/NHL-Stenden-AI-Koers.pdf" download
            className="group bg-white border border-gray-200 hover:border-nhl-blauw rounded-2xl p-5 text-center transition-colors flex flex-col items-center">
            <div className="text-4xl mb-3">📄</div>
            <div className="font-bold text-nhl-blauw text-sm group-hover:underline">Download PDF</div>
            <div className="text-xs text-gray-500 mt-1">Het volledige document</div>
          </a>
          <a href="/ai-koers/NHL-Stenden-AI-Koers-Poster-A2-preview.png" download
            className="group bg-white border border-gray-200 hover:border-nhl-blauw rounded-2xl p-5 text-center transition-colors flex flex-col items-center">
            <img src="/ai-koers/NHL-Stenden-AI-Koers-Poster-A2-preview.png" alt="AI-Koers poster"
              className="w-16 h-20 object-cover rounded border border-gray-100 mb-3" />
            <div className="font-bold text-nhl-blauw text-sm group-hover:underline">Download de poster</div>
            <div className="text-xs text-gray-500 mt-1">A2-formaat, PNG</div>
          </a>
          <a href="/ai-koers/NHL-Stenden-AI-Koers-presentatie.pptx" download
            className="group bg-white border border-gray-200 hover:border-nhl-blauw rounded-2xl p-5 text-center transition-colors flex flex-col items-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="font-bold text-nhl-blauw text-sm group-hover:underline">Download de presentatie</div>
            <div className="text-xs text-gray-500 mt-1">PowerPoint, .pptx</div>
          </a>
        </div>

        {laadFout && (
          <div className="text-center text-gray-400 text-sm py-20">
            Het document kon niet geladen worden. Controleer of paginas.json in public/ai-koers/ staat.
          </div>
        )}
        {!laadFout && !paginas && (
          <div className="text-center text-gray-400 text-sm py-20">Document wordt geladen...</div>
        )}
        {!laadFout && paginas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <iframe
              ref={iframeRef}
              title="AI-Koers document"
              srcDoc={srcDoc}
              style={{ width: '100%', height: hoogte, border: 0, display: 'block' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
