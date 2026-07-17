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

function bezigTekst(sec) {
  if (sec < 8) return 'Duimpjes en feedback verzamelen...'
  if (sec < 20) return 'Alle pagina\'s doorlezen...'
  if (sec < 40) return 'Claude schrijft de samenvatting en de duiding per pagina...'
  return 'Nog even geduld, de analyse rondt bijna af...'
}

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
  const [verstrekenSec, setVerstrekenSec] = useState(0)
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
    if (status !== 'bezig' || !gestartOp) return
    const interval = setInterval(() => {
      setVerstrekenSec(Math.round((Date.now() - new Date(gestartOp).getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [status, gestartOp])

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
        .hartslag-wrap { text-align: center; padding: 30px 0; }
        .hartslag-track { stroke: #E2E8F0; stroke-width: 3; fill: none; }
        .hartslag-lijn {
          stroke: #003DA5; stroke-width: 3; fill: none;
          stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 1400; stroke-dashoffset: 1400;
          animation: hartslag-teken 2.2s linear infinite;
        }
        @keyframes hartslag-teken {
          0% { stroke-dashoffset: 1400; }
          100% { stroke-dashoffset: 0; }
        }
        .hartslag-tekst { font-size: 10pt; font-weight: 600; color: #374151; margin-bottom: 4px; }
        .hartslag-timer { font-size: 8.5pt; color: #9CA3AF; }
        .verslag-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 7.5pt; color: #9CA3AF; }
        .sentiment-strip { display: flex; gap: 4px; margin-bottom: 4px; }
        .sentiment-cel { flex: 1; height: 34px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 7pt; font-weight: 800; color: white; }
        .sentiment-legenda { display: flex; gap: 14px; font-size: 7.5pt; color: #6B7280; margin-bottom: 4px; flex-wrap: wrap; }
        .sentiment-legenda-item { display: flex; align-items: center; gap: 4px; }
        .sentiment-legenda-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .betrokken-blok { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 18px; margin-top: 12px; }
        .betrokken-tekst { font-size: 9pt; color: #374151; margin-bottom: 8px; }
        .betrokken-bar-track { background: #E2E8F0; border-radius: 6px; height: 10px; overflow: hidden; }
        .betrokken-bar { height: 100%; background: #003DA5; border-radius: 6px; }
        .citaat-blok { background: #FAF5FF; border-left: 4px solid #7C3AED; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; }
        .citaat-tekst { font-size: 11pt; font-style: italic; color: #4C1D95; line-height: 1.6; margin-bottom: 8px; }
        .citaat-bron { font-size: 8pt; color: #7C3AED; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .rol-blok { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; }
        .rol-naam { font-size: 9pt; font-weight: 800; color: #06215C; margin-bottom: 4px; }
        .rol-inzicht { font-size: 9pt; color: #4B5563; line-height: 1.6; }
        .kop-rij { display: flex; align-items: flex-start; gap: 16px; }
        .kop-logo { height: 42px; width: auto; flex-shrink: 0; margin-top: 2px; }
      `}</style>

      <div className="no-print">
        <button className="btn-ververs" onClick={() => laadRapport(true)} disabled={status === 'bezig'}>{status === 'bezig' ? 'Bezig...' : '🔄 Vernieuwen'}</button>
        <button className="btn-print" onClick={() => window.print()} disabled={!rapport}>🖨️ Afdrukken / Opslaan als PDF</button>
      </div>

      <div className="verslag">
        <div className="kop">
          <div className="kop-rij">
            <img className="kop-logo" src="data:image/png;base64,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" alt="NHL Stenden" />
            <div>
              <div className="kop-label">AI-Netwerk NHL Stenden</div>
              <div className="kop-titel">AI-Koers Feedback Rapport</div>
              <div className="kop-datum">Gegenereerd op {DATUM()} om {TIJD()}, gebaseerd op de meest actuele reacties</div>
            </div>
          </div>
        </div>

        {laadFout && (
          <div className="leeg">
            Kon het rapport niet laden: {laadFout}
            <br /><button className="btn-ververs" style={{ marginTop: 10 }} onClick={() => laadRapport(true)}>Opnieuw proberen</button>
          </div>
        )}

        {!laadFout && status === 'bezig' && (
          <div className="hartslag-wrap">
            <svg viewBox="0 0 600 60" width="100%" height="60" style={{ display: 'block', marginBottom: 18 }}>
              <path className="hartslag-track" d="M0,30 L60,30 L75,10 L90,50 L105,22 L120,30 L220,30 L235,10 L250,50 L265,22 L280,30 L380,30 L395,10 L410,50 L425,22 L440,30 L600,30" />
              <path className="hartslag-lijn" d="M0,30 L60,30 L75,10 L90,50 L105,22 L120,30 L220,30 L235,10 L250,50 L265,22 L280,30 L380,30 L395,10 L410,50 L425,22 L440,30 L600,30" />
            </svg>
            <div className="hartslag-tekst">{bezigTekst(verstrekenSec)}</div>
            <div className="hartslag-timer">{verstrekenSec}s bezig · ververst zichzelf automatisch</div>
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

            {/* Sentiment-overzicht: alle paginas in een oogopslag */}
            <div className="sectie-titel">Sentiment per pagina, in een oogopslag</div>
            <div className="sentiment-strip">
              {rapport.paginas.map(p => {
                const s = SENTIMENT_STIJL[p.sentiment] || SENTIMENT_STIJL.neutraal
                return (
                  <div key={p.index} className="sentiment-cel" style={{ background: s.kleur }} title={`${p.titel}: ${s.label}`}>
                    {p.index + 1}
                  </div>
                )
              })}
            </div>
            <div className="sentiment-legenda">
              {Object.entries(SENTIMENT_STIJL).filter(([k]) => k !== 'geen_feedback').map(([k, s]) => (
                <div key={k} className="sentiment-legenda-item">
                  <span className="sentiment-legenda-dot" style={{ background: s.kleur }} />{s.label}
                </div>
              ))}
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
            {rapport.totalen.betrokkenheid !== null && (
              <div className="betrokken-blok">
                <div className="betrokken-tekst">
                  <strong>{rapport.totalen.betrokkenheid}%</strong> van de bezoekers gaf een duimpje of feedback ({rapport.totalen.feedbackgevers} van de {rapport.totalen.bezoekers})
                </div>
                <div className="betrokken-bar-track">
                  <div className="betrokken-bar" style={{ width: `${rapport.totalen.betrokkenheid}%` }} />
                </div>
              </div>
            )}

            {/* Opvallende thema's */}
            {rapport.opvallendeThemas?.length > 0 && (
              <>
                <div className="sectie-titel">Wat valt op in de feedback</div>
                <div>
                  {rapport.opvallendeThemas.map((t, i) => <span key={i} className="thema-chip">{t}</span>)}
                </div>
              </>
            )}

            {/* Uitgelichte citaten */}
            {rapport.uitgelichteCitaten?.length > 0 && (
              <>
                <div className="sectie-titel">Uitgelicht: wat mensen echt zeiden</div>
                {rapport.uitgelichteCitaten.map((c, i) => (
                  <div key={i} className="citaat-blok">
                    <div className="citaat-tekst">"{c.tekst}"</div>
                    <div className="citaat-bron">{ROL_LABEL[c.rol] || c.rol} · pagina {c.paginaIndex + 1}</div>
                  </div>
                ))}
              </>
            )}

            {/* Inzicht per rol */}
            {rapport.perRol?.length > 0 && (
              <>
                <div className="sectie-titel">Wat valt op per rol</div>
                {rapport.perRol.map((r, i) => (
                  <div key={i} className="rol-blok">
                    <div className="rol-naam">{ROL_LABEL[r.rol] || r.rol}</div>
                    <div className="rol-inzicht">{r.inzicht}</div>
                  </div>
                ))}
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
