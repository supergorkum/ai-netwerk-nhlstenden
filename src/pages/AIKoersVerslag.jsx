import { useState, useEffect, useRef } from 'react'
import { BEHEER_CODE } from '../data'

const ROL_LABEL = { docent: 'Docent', student: 'Student', management: 'Management', overig: 'Overig', onbekend: 'Onbekend' }
const SENTIMENT_STIJL = {
  positief: { kleur: '#16A34A', label: 'Positief ontvangen', achtergrond: '#F0FDF4' },
  negatief: { kleur: '#DC2626', label: 'Kritisch ontvangen', achtergrond: '#FEF2F2' },
  gemengd: { kleur: '#D97706', label: 'Gemengde reacties', achtergrond: '#FFFBEB' },
  neutraal: { kleur: '#6B7280', label: 'Neutraal', achtergrond: '#F9FAFB' },
  geen_feedback: { kleur: '#9CA3AF', label: 'Nog geen reacties', achtergrond: '#F9FAFB' },
}

const DATUM = () => new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
const TIJD = () => new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

export default function AIKoersVerslag() {
  const [code, setCode] = useState('')
  const [toegang, setToegang] = useState(false)
  const [fout, setFout] = useState('')
  const login = () => {
    if (code === BEHEER_CODE) { setToegang(true); setFout('') }
    else setFout('Onjuiste code.')
  }

  const [rapport, setRapport] = useState(null)
  const [status, setStatus] = useState(null) // 'bezig' | 'klaar' | 'fout'
  const [laadFout, setLaadFout] = useState(null)
  const [gestartOp, setGestartOp] = useState(null)
  const peilTimer = useRef(null)

  const opruimenPeiling = () => {
    if (peilTimer.current) { clearTimeout(peilTimer.current); peilTimer.current = null }
  }

  const laadRapport = (vernieuw = false) => {
    opruimenPeiling()
    setLaadFout(null)
    fetch(`/.netlify/functions/ai-koers-rapport${vernieuw ? '?vernieuw=1' : ''}`)
      .then(async r => {
        const body = await r.text()
        let data
        try { data = JSON.parse(body) } catch {
          throw new Error(`de rapport-function gaf geen geldige JSON terug (status ${r.status})`)
        }
        if (data.error) throw new Error(data.error)

        setStatus(data.status)
        if (data.status === 'bezig') {
          setGestartOp(data.gestartOp || null)
          peilTimer.current = setTimeout(() => laadRapport(false), 3000)
        } else if (data.status === 'klaar') {
          setRapport(data.rapport)
        } else if (data.status === 'fout') {
          setLaadFout(data.foutmelding || 'onbekende fout')
        }
      })
      .catch(err => {
        setLaadFout(err?.message || 'onbekende fout')
      })
  }

  useEffect(() => {
    if (toegang) laadRapport(false)
    return opruimenPeiling
  }, [toegang])

  useEffect(() => {
    document.title = 'AI-Koers Feedback Rapport ' + DATUM()
  }, [])

  if (!toegang) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-xl font-bold text-nhl-blauw">AI-Koers Rapport</h2>
            <p className="text-gray-500 text-sm mt-1">Voer de beheercode in om het rapport te openen.</p>
          </div>
          <input type="password" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Beheercode..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
          {fout && <div className="text-red-500 text-xs mb-3">{fout}</div>}
          <button onClick={login} className="btn-primary w-full">Openen</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito Sans', sans-serif; background: #f8fafc; color: #1a2340; }
        .verslag { max-width: 900px; margin: 0 auto; background: white; padding: 50px 60px; }
        .no-print { position: fixed; top: 20px; right: 20px; z-index: 999; display: flex; gap: 10px; }
        .btn-print { background: #003DA5; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; font-family: 'Nunito Sans', sans-serif; box-shadow: 0 4px 12px rgba(0,61,165,0.3); }
        .btn-ververs { background: white; color: #374151; border: 1px solid #E2E8F0; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; font-family: 'Nunito Sans', sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .pag-blok { page-break-inside: avoid; }
          @page { margin: 15mm; }
        }
        .kop { border-bottom: 3px solid #003DA5; padding-bottom: 20px; margin-bottom: 30px; }
        .kop-label { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #003DA5; margin-bottom: 8px; }
        .kop-titel { font-size: 22pt; font-weight: 800; color: #06215C; }
        .kop-datum { font-size: 9pt; color: #6B7280; margin-top: 6px; }
        .sectie-titel { font-size: 13pt; font-weight: 800; color: #06215C; margin: 34px 0 14px; padding-top: 4px; }
        .samenvatting-blok { background: #EFF6FF; border: 1px solid #BFDBFE; border-left: 4px solid #003DA5; border-radius: 12px; padding: 20px 24px; font-size: 10pt; line-height: 1.75; color: #1E3A8A; }
        .stat-rij { display: flex; gap: 12px; margin-bottom: 6px; }
        .stat-box { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; }
        .stat-num { font-size: 19pt; font-weight: 800; color: #06215C; }
        .stat-lbl { font-size: 7.5pt; color: #6B7280; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 3px; }
        .thema-chip { display: inline-block; background: #F3E8FF; color: #7C3AED; border-radius: 20px; padding: 5px 14px; font-size: 8.5pt; font-weight: 600; margin: 3px 4px 3px 0; }
        .pag-blok { border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; display: flex; gap: 16px; }
        .pag-thumb { width: 72px; height: 72px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0; flex-shrink: 0; }
        .pag-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
        .pag-nr { font-size: 7.5pt; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; }
        .pag-titel { font-size: 11pt; font-weight: 800; color: #06215C; }
        .sentiment-badge { font-size: 7.5pt; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
        .pag-inhoud { font-size: 8.5pt; color: #6B7280; font-style: italic; margin-bottom: 8px; }
        .pag-feedback-blok { border-radius: 8px; padding: 10px 14px; font-size: 9pt; line-height: 1.6; }
        .duim-rij { display: flex; gap: 12px; font-size: 8.5pt; font-weight: 700; margin-bottom: 6px; }
        .feedback-quote { background: #F8FAFC; border-left: 2px solid #D1D5DB; border-radius: 4px; padding: 6px 10px; margin-top: 5px; font-size: 8pt; color: #4B5563; }
        .feedback-rol { font-size: 7pt; font-weight: 700; color: #8C1D82; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 6px; }
        .aandacht-blok { border: 1px solid #FCA5A5; background: #FEF2F2; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
        .aandacht-titel { font-size: 10pt; font-weight: 800; color: #B91C1C; margin-bottom: 4px; }
        .aandacht-cijfer { font-size: 8pt; color: #991B1B; font-weight: 600; margin-bottom: 4px; }
        .aandacht-reden { font-size: 9pt; color: #7F1D1D; line-height: 1.6; }
        .vervolg-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px; font-size: 9.5pt; color: #374151; line-height: 1.6; }
        .vervolg-nr { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #003DA5; color: white; font-size: 8.5pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .leeg { color: #9CA3AF; font-size: 9pt; font-style: italic; padding: 10px 0; }
        .verslag-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 7.5pt; color: #9CA3AF; }
      `}</style>

      <div className="no-print">
        <button className="btn-ververs" onClick={() => laadRapport(true)} disabled={status === 'bezig'}>{status === 'bezig' ? 'Bezig...' : '🔄 Vernieuwen'}</button>
        <button className="btn-print" onClick={() => window.print()} disabled={!rapport}>🖨️ Afdrukken / Opslaan als PDF</button>
      </div>

      <div className="verslag">
        <div className="kop">
          <div className="kop-label">AI-Netwerk NHL Stenden</div>
          <div className="kop-titel">AI-Koers Feedback Rapport</div>
          <div className="kop-datum">Gegenereerd op {DATUM()} om {TIJD()}, gebaseerd op de meest actuele reacties</div>
        </div>

        {laadFout && (
          <div className="leeg">
            Kon het rapport niet laden: {laadFout}
            <br /><button className="btn-ververs" style={{ marginTop: 10 }} onClick={() => laadRapport(true)}>Opnieuw proberen</button>
          </div>
        )}

        {!laadFout && status === 'bezig' && (
          <div className="leeg">
            Bezig met analyseren van alle reacties met AI, dit kan een paar minuten duren...
            <br />Deze pagina ververst zichzelf automatisch zodra het rapport klaar is.
          </div>
        )}

        {!laadFout && status !== 'bezig' && status !== 'klaar' && <div className="leeg">Laden...</div>}

        {!laadFout && status === 'klaar' && rapport && (
          <>
            {/* Managementsamenvatting */}
            <div className="sectie-titel">Managementsamenvatting</div>
            <div className="samenvatting-blok">
              {rapport.managementSamenvatting || 'Nog geen samenvatting beschikbaar.'}
            </div>

            {/* Dashboard */}
            <div className="sectie-titel">In cijfers</div>
            <div className="stat-rij">
              <div className="stat-box"><div className="stat-num">{rapport.totalen.bezoekers}</div><div className="stat-lbl">Bezoekers</div></div>
              <div className="stat-box"><div className="stat-num">{rapport.totalen.feedbackgevers}</div><div className="stat-lbl">Gaven feedback</div></div>
              <div className="stat-box"><div className="stat-num">👍 {rapport.totalen.omhoog}</div><div className="stat-lbl">Duimpjes omhoog</div></div>
              <div className="stat-box"><div className="stat-num">👎 {rapport.totalen.omlaag}</div><div className="stat-lbl">Duimpjes omlaag</div></div>
              <div className="stat-box"><div className="stat-num">{rapport.totalen.feedbackreacties}</div><div className="stat-lbl">Tekstreacties</div></div>
            </div>

            {/* Opvallende thema's */}
            {rapport.opvallendeThemas?.length > 0 && (
              <>
                <div className="sectie-titel">Wat valt op in de feedback</div>
                <div>
                  {rapport.opvallendeThemas.map((t, i) => <span key={i} className="thema-chip">{t}</span>)}
                </div>
              </>
            )}

            {/* Per pagina */}
            <div className="sectie-titel">Per pagina</div>
            {rapport.paginas.map(p => {
              const s = SENTIMENT_STIJL[p.sentiment] || SENTIMENT_STIJL.neutraal
              return (
                <div key={p.index} className="pag-blok">
                  <img className="pag-thumb" src={`/ai-koers/thumbs/pagina-${p.index}.png`} alt={`Pagina ${p.index + 1}`} />
                  <div style={{ flex: 1 }}>
                    <div className="pag-header">
                      <div>
                        <div className="pag-nr">Pagina {p.index + 1}</div>
                        <div className="pag-titel">{p.titel}</div>
                      </div>
                      <span className="sentiment-badge" style={{ background: s.achtergrond, color: s.kleur, border: `1px solid ${s.kleur}` }}>{s.label}</span>
                    </div>
                    {p.kernInhoud && <div className="pag-inhoud">{p.kernInhoud}</div>}
                    <div className="duim-rij">
                      <span style={{ color: '#16A34A' }}>👍 {p.omhoog}</span>
                      <span style={{ color: '#DC2626' }}>👎 {p.omlaag}</span>
                    </div>
                    <div className="pag-feedback-blok" style={{ background: s.achtergrond, color: '#374151', borderLeft: `3px solid ${s.kleur}` }}>
                      {p.kernFeedback}
                    </div>
                    {p.feedback.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {p.feedback.map((f, i) => (
                          <div key={i} className="feedback-quote">
                            <span className="feedback-rol">{ROL_LABEL[f.rol] || f.rol}</span>{f.tekst}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Aandachtspunten */}
            <div className="sectie-titel">Aandachtspunten</div>
            {rapport.aandachtspunten.length === 0 ? (
              <div className="leeg">Geen pagina's met noemenswaardig meer duimpjes omlaag dan omhoog. Goed teken.</div>
            ) : (
              rapport.aandachtspunten.map(a => (
                <div key={a.index} className="aandacht-blok">
                  <div className="aandacht-titel">Pagina {a.index + 1} · {a.titel}</div>
                  <div className="aandacht-cijfer">👍 {a.omhoog} · 👎 {a.omlaag}</div>
                  <div className="aandacht-reden">{a.reden}</div>
                </div>
              ))
            )}

            {/* Vervolgstappen */}
            <div className="sectie-titel">Vervolgstappen</div>
            {rapport.vervolgstappen?.length > 0 ? (
              rapport.vervolgstappen.map((v, i) => (
                <div key={i} className="vervolg-item">
                  <div className="vervolg-nr">{i + 1}</div>
                  <div>{v}</div>
                </div>
              ))
            ) : (
              <div className="leeg">Geen vervolgstappen beschikbaar.</div>
            )}

            <div className="verslag-footer">
              AI-Netwerk NHL Stenden · dit rapport is automatisch samengesteld uit de duimpjes en feedback verzameld tijdens de AI-Koers presentatie, en wordt bij elke generatie opnieuw berekend.
            </div>
          </>
        )}
      </div>
    </>
  )
}
