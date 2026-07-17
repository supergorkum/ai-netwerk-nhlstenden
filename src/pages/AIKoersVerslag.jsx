import { useState, useEffect } from 'react'
import { BEHEER_CODE } from '../data'

const ROL_LABEL = { docent: 'Docent', student: 'Student', management: 'Management', overig: 'Overig', onbekend: 'Onbekend' }

const DATUM = () => new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

export default function AIKoersVerslag() {
  const [code, setCode] = useState('')
  const [toegang, setToegang] = useState(false)
  const [fout, setFout] = useState('')
  const login = () => {
    if (code === BEHEER_CODE) { setToegang(true); setFout('') }
    else setFout('Onjuiste code.')
  }

  const [paginas, setPaginas] = useState(null)
  const [laadFout, setLaadFout] = useState(null)

  useEffect(() => {
    if (!toegang) return
    fetch('/.netlify/functions/ai-koers-feedback')
      .then(async r => {
        const body = await r.text()
        let data
        try { data = JSON.parse(body) } catch {
          throw new Error(`de feedback-function gaf geen geldige JSON terug (status ${r.status})`)
        }
        if (data.error) throw new Error(data.error)
        setPaginas(data.paginas || [])
      })
      .catch(err => setLaadFout(err?.message || 'onbekende fout'))
  }, [toegang])

  useEffect(() => {
    document.title = 'AI-Koers Feedback Verslag ' + DATUM()
  }, [])

  if (!toegang) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-xl font-bold text-nhl-blauw">AI-Koers Verslag</h2>
            <p className="text-gray-500 text-sm mt-1">Voer de beheercode in om het verslag te openen.</p>
          </div>
          <input type="password" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Beheercode..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
          {fout && <div className="text-red-500 text-xs mb-3">{fout}</div>}
          <button onClick={login} className="btn-primary w-full">Openen</button>
        </div>
      </div>
    )
  }

  const totaalOmhoog = (paginas || []).reduce((t, p) => t + p.omhoog, 0)
  const totaalOmlaag = (paginas || []).reduce((t, p) => t + p.omlaag, 0)
  const totaalFeedback = (paginas || []).reduce((t, p) => t + p.feedback.length, 0)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito Sans', sans-serif; background: #f8fafc; color: #1a2340; }
        .verslag { max-width: 860px; margin: 0 auto; background: white; padding: 50px 60px; }
        .no-print { position: fixed; top: 20px; right: 20px; z-index: 999; }
        .btn-print { background: #003DA5; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; font-family: 'Nunito Sans', sans-serif; box-shadow: 0 4px 12px rgba(0,61,165,0.3); }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          @page { margin: 15mm; }
        }
        .kop { border-bottom: 3px solid #003DA5; padding-bottom: 20px; margin-bottom: 30px; }
        .kop-label { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #003DA5; margin-bottom: 8px; }
        .kop-titel { font-size: 22pt; font-weight: 800; color: #06215C; }
        .kop-datum { font-size: 9pt; color: #6B7280; margin-top: 6px; }
        .stat-rij { display: flex; gap: 14px; margin-bottom: 30px; }
        .stat-box { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; }
        .stat-num { font-size: 20pt; font-weight: 800; color: #06215C; }
        .stat-lbl { font-size: 8pt; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }
        .pag-blok { border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 14px; page-break-inside: avoid; }
        .pag-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .pag-nr { font-size: 12pt; font-weight: 800; color: #06215C; }
        .duim-rij { display: flex; gap: 16px; align-items: center; }
        .duim { font-size: 9pt; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .duim-bar-track { background: #F1F5F9; border-radius: 6px; height: 8px; width: 120px; overflow: hidden; margin-top: 6px; }
        .duim-bar { height: 100%; border-radius: 6px; }
        .feedback-item { background: #F8FAFC; border-left: 3px solid #8C1D82; border-radius: 6px; padding: 10px 14px; margin-top: 8px; font-size: 9pt; color: #374151; line-height: 1.6; }
        .feedback-rol { font-size: 7.5pt; font-weight: 700; color: #8C1D82; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
        .leeg { color: #9CA3AF; font-size: 9pt; font-style: italic; padding: 10px 0; }
      `}</style>

      <div className="no-print">
        <button className="btn-print" onClick={() => window.print()}>🖨️ Afdrukken / Opslaan als PDF</button>
      </div>

      <div className="verslag">
        <div className="kop">
          <div className="kop-label">AI-Netwerk NHL Stenden</div>
          <div className="kop-titel">AI-Koers Feedback Verslag</div>
          <div className="kop-datum">Gegenereerd op {DATUM()}</div>
        </div>

        {laadFout && <div className="leeg">Kon de feedback niet laden: {laadFout}</div>}

        {!laadFout && paginas === null && <div className="leeg">Laden...</div>}

        {!laadFout && paginas && (
          <>
            <div className="stat-rij">
              <div className="stat-box"><div className="stat-num">{totaalOmhoog}</div><div className="stat-lbl">👍 Duimpjes omhoog</div></div>
              <div className="stat-box"><div className="stat-num">{totaalOmlaag}</div><div className="stat-lbl">👎 Duimpjes omlaag</div></div>
              <div className="stat-box"><div className="stat-num">{totaalFeedback}</div><div className="stat-lbl">💬 Feedbackreacties</div></div>
              <div className="stat-box"><div className="stat-num">{paginas.length}</div><div className="stat-lbl">Pagina's met reacties</div></div>
            </div>

            {paginas.length === 0 && <div className="leeg">Nog geen reacties ontvangen.</div>}

            {paginas.map(p => {
              const totaal = p.omhoog + p.omlaag
              const pctOmhoog = totaal > 0 ? Math.round((p.omhoog / totaal) * 100) : 0
              return (
                <div key={p.paginaIndex} className="pag-blok">
                  <div className="pag-header">
                    <div className="pag-nr">Pagina {p.paginaIndex + 1}</div>
                    <div className="duim-rij">
                      <div className="duim" style={{ color: '#16A34A' }}>👍 {p.omhoog}</div>
                      <div className="duim" style={{ color: '#DC2626' }}>👎 {p.omlaag}</div>
                    </div>
                  </div>
                  {totaal > 0 && (
                    <div className="duim-bar-track">
                      <div className="duim-bar" style={{ width: `${pctOmhoog}%`, background: '#16A34A' }} />
                    </div>
                  )}
                  {p.feedback.length === 0
                    ? <div className="leeg">Geen tekstuele feedback op deze pagina.</div>
                    : p.feedback.map((f, i) => (
                      <div key={i} className="feedback-item">
                        <div className="feedback-rol">{ROL_LABEL[f.rol] || f.rol}</div>
                        {f.tekst}
                      </div>
                    ))}
                </div>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}
