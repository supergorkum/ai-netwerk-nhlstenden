import { useEffect, useState } from 'react'
import { initiatieven as alleInitiatieven, sporen, AI_ACT_ITEMS, verplichtingSignaal, APP_VERSIE, OVERLEG_STRUCTUUR } from '../data'
import { haalWijzigingenOp } from '../storage'
import { INIT_PILOTS, INIT_INSPIRATIES } from '../initialData'

const DATUM = () => new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

// Koerslijn-kleuren uit de NHL Stenden AI-Koers v0.1
const KOERS_KLEUREN = {
  1: '#1A3A6B', // AI & Leren
  2: '#1E6B5A', // AI & Werken
  3: '#C0186A', // AI & Verantwoordelijkheid
  4: '#6B2490', // AI & Geletterdheid
  5: '#A84520', // AI & Werkveld
  6: '#1B5E72', // AI & Onderzoek
}

const SIGNAAL_HEX = { rood: '#DC2626', oranje: '#EA580C', groen: '#0F766E' }
const SIGNAAL_LABEL = { rood: 'Actie nodig', oranje: 'Aandacht', groen: 'Op koers' }

const STATUS_TEKST = {
  lopend: 'Lopend',
  'in-ontwikkeling': 'In voorbereiding',
  'te-starten': 'Nog te starten',
  'te-controleren': 'Te controleren',
  afgerond: 'Afgerond',
}

function statusKleur(s) {
  const m = { actief: '#0F766E', 'in-ontwikkeling': '#B45309', verkenning: '#B45309', groeiend: '#003DA5', gepland: '#003DA5', afgerond: '#374151', lopend: '#0F766E', 'te-starten': '#B45309', 'te-controleren': '#DC2626' }
  return m[s] || '#374151'
}

function typeLabel(t) {
  return t === 'surf' ? 'SURF / Nationaal' : t === 'extern' ? 'Extern' : 'Intern'
}

export default function Rapport({ pilots: pilotsProp, inspiraties: inspiratiesProp, roadmap = [] }) {
  const pilots = pilotsProp && pilotsProp.length > 0 ? pilotsProp : INIT_PILOTS
  const inspiraties = inspiratiesProp && inspiratiesProp.length > 0 ? inspiratiesProp : INIT_INSPIRATIES

  const intern = alleInitiatieven.filter(i => i.type === 'intern')
  const extern = alleInitiatieven.filter(i => i.type === 'extern' || i.type === 'surf')
  const actief = alleInitiatieven.filter(i => i.status === 'actief')

  // AI Act signalering, berekend met dezelfde logica als de Roadmap en het Dashboard
  const signalen = AI_ACT_ITEMS.map(vp => ({ vp, signaal: verplichtingSignaal(vp, roadmap) }))
  const volgorde = { rood: 0, oranje: 1, groen: 2 }
  const gesorteerdeSignalen = [...signalen].sort((a, b) => {
    const v = volgorde[a.signaal.kleur] - volgorde[b.signaal.kleur]
    if (v !== 0) return v
    return (a.vp.deadlineISO || '').localeCompare(b.vp.deadlineISO || '')
  })
  const telling = signalen.reduce((acc, s) => { acc[s.signaal.kleur] = (acc[s.signaal.kleur] || 0) + 1; return acc }, {})

  // Roadmap-cijfers
  const rmActief = roadmap.filter(r => r.status !== 'afgerond')
  const rmLopend = rmActief.filter(r => r.status === 'lopend')
  const rmVoorbereiding = rmActief.filter(r => r.status === 'in-ontwikkeling')
  const rmTeStarten = rmActief.filter(r => r.status === 'te-starten' || r.status === 'te-controleren')
  const rmAfgerond = roadmap.filter(r => r.status === 'afgerond')
  const eigenKoers = rmActief.filter(r => !r.aiActKoppeling)

  // Prognose, puur berekend uit de statusdata
  const urgent = gesorteerdeSignalen.filter(s => s.signaal.kleur === 'rood')
  const dekkingsgraad = AI_ACT_ITEMS.length > 0 ? Math.round(((telling.groen || 0) / AI_ACT_ITEMS.length) * 100) : 0
  const uitvoeringsgraad = rmActief.length > 0 ? Math.round((rmLopend.length / rmActief.length) * 100) : 0

  // Agendavoorstel per overleg, maximaal drie punten, berekend uit
  // AI Act signalen, open acties uit de actielijst en recente inzichten.
  const agendaVoorstel = (overleg) => {
    const punten = []
    if (overleg.spoor) {
      gesorteerdeSignalen
        .filter(x => (x.vp.spoor || 3) === overleg.spoor && x.signaal.kleur !== 'groen')
        .slice(0, 2)
        .forEach(x => punten.push({ tekst: `AI Act ${x.vp.artikel} ${x.vp.titel}: ${x.signaal.kleur === 'rood' ? 'actie nodig' : 'aandacht'}`, bron: 'AI Act' }))
      rmActief
        .filter(r => { const vp = AI_ACT_ITEMS.find(a => a.id === r.aiActKoppeling); return vp && (vp.spoor || 3) === overleg.spoor })
        .slice(0, 2)
        .forEach(r => punten.push({ tekst: `Actie uit de actielijst: ${r.titel}${r.datum ? ` (${r.datum})` : ''}`, bron: 'Actielijst' }))
      alleInitiatieven
        .filter(i => i.spoor === overleg.spoor && (i.status === 'in-ontwikkeling' || i.status === 'verkenning'))
        .slice(0, 2)
        .forEach(i => punten.push({ tekst: `Voortgang en besluitvorming: ${i.naam}`, bron: 'Initiatief' }))
      alleInitiatieven
        .filter(i => i.spoor === overleg.spoor && i.status === 'actief' && i.impactInschatting === 'hoog')
        .slice(0, 1)
        .forEach(i => punten.push({ tekst: `Borging en opschaling: ${i.naam}`, bron: 'Initiatief' }))
      inspiraties
        .filter(b => b.spoor === overleg.spoor)
        .sort((a, b) => (b.aiActSignaal ? 1 : 0) - (a.aiActSignaal ? 1 : 0))
        .slice(0, 1)
        .forEach(b => punten.push({
          tekst: b.aiActSignaal ? `Mogelijke AI Act update, opvolging bepalen: ${b.titel}` : `Inzicht om te bespreken: ${b.titel}`,
          bron: 'Inzichten',
        }))
    } else if (overleg.id === 'stuurgroep') {
      if (urgent.length > 0) punten.push({ tekst: `${urgent.length} verplichting${urgent.length !== 1 ? 'en' : ''} op actie nodig (${urgent.map(u => u.vp.artikel).join(', ')})`, bron: 'AI Act' })
      punten.push({ tekst: `Dekkingsgraad AI Act: ${dekkingsgraad}% van de verplichtingen op koers`, bron: 'AI Act' })
      alleInitiatieven
        .filter(i => i.status === 'in-ontwikkeling' && i.impactInschatting === 'hoog')
        .slice(0, 1)
        .forEach(i => punten.push({ tekst: `Besluitvorming: ${i.naam}`, bron: 'Initiatief' }))
    } else {
      if (rmTeStarten.length > 0) punten.push({ tekst: `${rmTeStarten.length} roadmap-item${rmTeStarten.length !== 1 ? 's' : ''} nog te starten: prioriteren en beleggen`, bron: 'Actielijst' })
      if (eigenKoers.length > 0) punten.push({ tekst: `Voortgang eigen koers: ${eigenKoers.length} open item${eigenKoers.length !== 1 ? 's' : ''} zonder AI Act koppeling`, bron: 'Actielijst' })
      const nieuweInzichten = inspiraties.filter(b => b.nieuw).length
      if (nieuweInzichten > 0) punten.push({ tekst: `${nieuweInzichten} nieuwe inzicht${nieuweInzichten !== 1 ? 'en' : ''} beoordelen en doorzetten naar de thema-overleggen`, bron: 'Inzichten' })
    }
    return punten.slice(0, 3)
  }

  useEffect(() => {
    document.title = 'AI-Netwerk NHL Stenden Rapport ' + DATUM()
  }, [])

  // Recente aanpassingen uit de wijzigingen-log, voor het blok
  // "Gewijzigd sinds het vorige rapport" in de managementsamenvatting
  const [wijzigingen, setWijzigingen] = useState([])
  useEffect(() => {
    haalWijzigingenOp().then(w => setWijzigingen((w || []).slice(0, 10))).catch(() => {})
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito Sans', sans-serif; background: #f8fafc; color: #1a1a2e; }
        .rapport { max-width: 860px; margin: 0 auto; background: white; }
        .no-print { position: fixed; top: 20px; right: 20px; z-index: 999; display: flex; gap: 10px; }
        .btn-print { background: #003DA5; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; font-family: 'Nunito Sans', sans-serif; box-shadow: 0 4px 12px rgba(0,61,165,0.3); }
        .btn-back { background: white; color: #374151; border: 1px solid #E2E8F0; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; font-family: 'Nunito Sans', sans-serif; }
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          @page { margin: 15mm; }
        }

        .cover { background: linear-gradient(135deg, #06215C 0%, #003DA5 60%, #0A2A6E 100%); min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 70px 70px 50px; color: white; position: relative; overflow: hidden; page-break-after: always; }
        .cover::before { content: ''; position: absolute; top: -80px; right: -80px; width: 450px; height: 450px; border: 1px solid rgba(255,255,255,0.07); border-radius: 50%; }
        .cover::after { content: ''; position: absolute; bottom: -120px; left: -120px; width: 550px; height: 550px; border: 1px solid rgba(255,255,255,0.05); border-radius: 50%; }
        .cover-label { font-size: 8.5pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 40px; }
        .cover-title { font-size: 44pt; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 6px; }
        .cover-accent { width: 56px; height: 4px; background: #8C1D82; border-radius: 2px; margin: 28px 0; }
        .cover-sub { font-size: 13pt; color: rgba(255,255,255,0.72); max-width: 540px; line-height: 1.6; font-weight: 400; }
        .cover-meta { display: flex; gap: 48px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.12); margin-top: 60px; flex-wrap: wrap; }
        .cover-meta-item label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.35); display: block; margin-bottom: 5px; }
        .cover-meta-item span { font-size: 10pt; font-weight: 600; }

        .section { padding: 54px 70px; border-bottom: 1px solid #F1F5F9; }
        .section:last-child { border-bottom: none; }
        .chapter-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #8C1D82; margin-bottom: 10px; }
        .chapter-title { font-size: 24pt; font-weight: 800; color: #06215C; line-height: 1.15; letter-spacing: -0.01em; }
        .chapter-line { width: 40px; height: 3px; background: linear-gradient(90deg, #003DA5, #8C1D82); border-radius: 2px; margin: 18px 0 28px; }
        .lead { font-size: 12.5pt; color: #374151; line-height: 1.75; margin-bottom: 22px; font-weight: 400; }
        p { font-size: 10pt; color: #4B5563; line-height: 1.8; margin-bottom: 14px; }
        p strong { color: #1F2937; }
        h3 { font-size: 11pt; font-weight: 700; color: #06215C; margin: 24px 0 10px; }

        .stat-row { display: flex; gap: 14px; margin: 28px 0; flex-wrap: wrap; }
        .stat-box { flex: 1; min-width: 130px; background: linear-gradient(135deg, #06215C, #003DA5); border-radius: 14px; padding: 22px 18px; text-align: center; color: white; }
        .stat-num { font-size: 30pt; font-weight: 900; color: #7EB3FF; line-height: 1; margin-bottom: 6px; }
        .stat-lbl { font-size: 8pt; font-weight: 600; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: 0.08em; }

        .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 20px 0; }
        .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 3px solid #003DA5; border-radius: 12px; padding: 18px 20px; }
        .card-dark { background: #06215C; border: none; color: white; }
        .card-title { font-size: 10pt; font-weight: 700; color: #06215C; margin-bottom: 7px; }
        .card-dark .card-title { color: white; }
        .card-body { font-size: 9pt; color: #6B7280; line-height: 1.65; }
        .card-dark .card-body { color: rgba(255,255,255,0.7); }

        .koers-block { border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; display: flex; gap: 18px; align-items: flex-start; }
        .koers-titel { font-size: 11pt; font-weight: 800; margin-bottom: 5px; }
        .koers-kort { font-size: 9.5pt; font-weight: 600; color: #374151; margin-bottom: 5px; }
        .koers-tekst { font-size: 9pt; color: #6B7280; line-height: 1.6; }

        .vp-blok { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
        .vp-header { padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .vp-body { padding: 12px 18px; background: white; font-size: 9pt; color: #4B5563; line-height: 1.65; border-top: 1px solid #F1F5F9; }
        .vp-item { display: flex; gap: 8px; align-items: baseline; margin-bottom: 5px; }
        .vp-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; position: relative; top: -1px; }

        .pilot-blok { border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 14px; overflow: hidden; }
        .pilot-header { padding: 14px 20px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #F1F5F9; }
        .pilot-naam { font-size: 11pt; font-weight: 700; color: #06215C; }
        .pilot-body { padding: 14px 20px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 8pt; font-weight: 600; white-space: nowrap; }

        .gov-row { display: flex; gap: 12px; margin-bottom: 10px; }
        .gov-thema { border-radius: 8px; padding: 12px 14px; color: white; font-size: 9pt; font-weight: 600; flex: 0 0 180px; display: flex; align-items: center; }
        .gov-body { flex: 1; background: #F8FAFC; border-radius: 8px; padding: 12px 14px; font-size: 9pt; color: #374151; border-left: 3px solid #8C1D82; line-height: 1.6; }

        table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9pt; }
        th { background: #06215C; color: white; padding: 10px 14px; text-align: left; font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 10px 14px; border-bottom: 1px solid #F1F5F9; color: #374151; vertical-align: top; }
        tr:nth-child(even) td { background: #F8FAFC; }

        .rapport-footer { background: #06215C; color: white; padding: 32px 70px; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-weight: 800; font-size: 12pt; }
        .footer-sub { color: rgba(255,255,255,0.45); font-size: 8pt; margin-top: 3px; }

        .info-blok { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
        .info-titel { font-size: 10pt; font-weight: 700; color: #003DA5; margin-bottom: 6px; }
        .info-body { font-size: 9pt; color: #374151; line-height: 1.65; }
        .prognose-blok { background: #FDF2F8; border: 1px solid #FBCFE8; border-left: 3px solid #8C1D82; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }

        .afsluiting-box { background: linear-gradient(135deg, #06215C, #003DA5); color: white; border-radius: 16px; padding: 40px; text-align: center; margin: 28px 0; }
      `}</style>

      <div className="no-print">
        <button className="btn-print" onClick={() => window.print()}>🖨️ Afdrukken / Opslaan als PDF</button>
        <button className="btn-back" onClick={() => window.history.back()}>← Terug naar Beheer</button>
      </div>

      <div className="rapport">

        {/* COVER */}
        <div className="cover">
          <div>
            <div className="cover-label">NHL Stenden Hogeschool · Transitieprogramma Digitalisering</div>
            <div style={{fontSize:'40pt', marginBottom:'8px'}}>🤖</div>
            <div className="cover-title">AI-Netwerk<br/>NHL Stenden</div>
            <div className="cover-accent"></div>
            <div className="cover-sub">
              Voortgangsrapport van het AI-Netwerk, opgebouwd langs de zes koerslijnen van de NHL Stenden AI-Koers, met de actuele stand van initiatieven, verplichtingen en roadmap.
            </div>
          </div>
          <div className="cover-meta">
            <div className="cover-meta-item"><label>Rapportdatum</label><span>{DATUM()}</span></div>
            <div className="cover-meta-item"><label>Rapportversie</label><span>{APP_VERSIE}</span></div>
            <div className="cover-meta-item"><label>Kader</label><span>AI-Koers v0.1</span></div>
            <div className="cover-meta-item"><label>Opgesteld door</label><span>Kwartiermaker Digitale Samenhang</span></div>
            <div className="cover-meta-item"><label>Status</label><span>Actief programma</span></div>
          </div>
        </div>

        {/* H1 Managementsamenvatting */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 1</div>
          <div className="chapter-title">Managementsamenvatting</div>
          <div className="chapter-line"></div>
          <div className="lead">NHL Stenden werkt langs zes koerslijnen aan een verantwoorde en betekenisvolle inzet van AI. Dit hoofdstuk vat de stand van zaken samen in cijfers en signalen.</div>

          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">{alleInitiatieven.length}</div><div className="stat-lbl">Initiatieven</div></div>
            <div className="stat-box"><div className="stat-num">{actief.length}</div><div className="stat-lbl">Actief lopend</div></div>
            <div className="stat-box"><div className="stat-num">{rmActief.length}</div><div className="stat-lbl">Roadmap-items open</div></div>
            <div className="stat-box"><div className="stat-num">{telling.groen || 0}/{AI_ACT_ITEMS.length}</div><div className="stat-lbl">Verplichtingen op koers</div></div>
          </div>

          <p>
            Het AI-Netwerk verbindt op dit moment <strong>{intern.length} interne initiatieven</strong> en <strong>{extern.length} externe of nationale samenwerkingen</strong>, verdeeld over de zes koerslijnen van de AI-Koers.
            Van de <strong>{AI_ACT_ITEMS.length} verplichtingen uit de EU AI Act</strong> staan er {telling.groen || 0} op koers, vragen er {telling.oranje || 0} aandacht en vereisen er {telling.rood || 0} directe actie.
            Op de roadmap staan {rmActief.length} openstaande items: {rmLopend.length} lopend, {rmVoorbereiding.length} in voorbereiding en {rmTeStarten.length} nog te starten. Daarnaast zijn {rmAfgerond.length} items afgerond en bevestigd.
          </p>

          {urgent.length > 0 && (
            <div className="prognose-blok">
              <div style={{fontWeight:700, color:'#8C1D82', marginBottom:'8px'}}>Signaal voor de stuurgroep</div>
              <div style={{fontSize:'9.5pt', color:'#374151', lineHeight:'1.7'}}>
                {urgent.length} verplichting{urgent.length !== 1 ? 'en' : ''} ({urgent.map(u => u.vp.artikel).join(', ')}) staat of staan op actie nodig: de deadline is verstreken of nadert, zonder dat er lopend werk aan gekoppeld is. Hoofdstuk 6 en 7 werken dit uit, inclusief de berekende prognose.
              </div>
            </div>
          )}

          <h3>Leeswijzer</h3>
          <p>Hoofdstuk 2 en 3 beschrijven wat het AI-Netwerk is en waar het op steunt. Hoofdstuk 4 en 5 tonen de zes koerslijnen en de initiatieven die eronder vallen, intern en extern. Hoofdstuk 6 en 7 vormen de kern voor sturing: de verplichtingen uit de AI Act met hun signaal, en de roadmap met de berekende prognose. Hoofdstuk 8 tot en met 10 geven verdieping: pilots, governance met de overlegstructuur en per overleg een berekend agendavoorstel, en inzichten uit het netwerk. De bijlage sluit af met de actielijst: open en afgehandelde acties per kwartaal. Lezers met weinig tijd volstaan met deze samenvatting, hoofdstuk 6 en 7 en de actielijst.</p>

          {wijzigingen.length > 0 && (
            <>
              <h3>Gewijzigd sinds het vorige rapport</h3>
              <p>De meest recente aanpassingen op het platform, zoals vastgelegd in de wijzigingen-log:</p>
              <table>
                <thead><tr><th>Onderdeel</th><th>Aanpassing</th><th>Moment</th></tr></thead>
                <tbody>
                  {wijzigingen.map((w, i) => (
                    <tr key={i}>
                      <td style={{whiteSpace:'nowrap'}}>{w.icon || ''} {w.onderdeel}</td>
                      <td>{w.actie}{w.titel ? `: ${w.titel}` : ''}</td>
                      <td style={{whiteSpace:'nowrap'}}>{w.tijd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* H2 Wat is het AI-Netwerk */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 2</div>
          <div className="chapter-title">Wat is het AI-Netwerk?</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is de plek waar NHL Stenden overzicht en samenhang brengt in alles rondom kunstmatige intelligentie: wat er loopt, wie erbij betrokken is en hoe het zich verhoudt tot de koers en de wetgeving.</div>

          <p>Kunstmatige intelligentie verandert hoe studenten leren, hoe docenten begeleiden en hoe medewerkers werken. Echte digitale verandering begint daarbij niet bij technologie maar bij mensen: bij de mate waarin zij begrijpen wat AI voor hen betekent en zich daar zeker en vaardig in voelen. Het AI-Netwerk ondersteunt die beweging door zichtbaar te maken wat er speelt, mensen met elkaar te verbinden en richting te geven.</p>

          <p><strong>Het AI-Netwerk is een verbinder, geen inhoudelijke eigenaar.</strong> De inhoudelijke kaders liggen bij de vakeigenaren: het Centre for Teaching and Learning voor toetsing en didactiek, OO&I voor onderwijs, onderzoek en data. Het AI-Netwerk vat hun werk kort samen en verwijst expliciet door naar de oorspronkelijke bron. Zo ontstaat overzicht zonder een tweede, mogelijk conflicterende regelbron.</p>

          <div className="card-grid">
            <div className="card"><div className="card-title">🎯 Overzicht en richting</div><div className="card-body">Alle AI-initiatieven, kennis, pilots en mensen bij NHL Stenden samengebracht op een plek, geordend langs de zes koerslijnen van de AI-Koers.</div></div>
            <div className="card"><div className="card-title">🔗 Verbinding en samenwerking</div><div className="card-body">Silo's doorbreken door initiatieven van academies, diensten en externe partners aan elkaar te verbinden. Kennis delen en van elkaar leren.</div></div>
            <div className="card"><div className="card-title">⚖️ Verantwoord en zorgvuldig</div><div className="card-body">De verplichtingen uit de EU AI Act vormen het vertrekpunt van de roadmap. Per verplichting is zichtbaar wat er loopt en wie ermee bezig is.</div></div>
            <div className="card"><div className="card-title">📋 Transparantie en verantwoording</div><div className="card-body">Het platform dient als levende bewijslast voor bestuurlijke verantwoording en externe communicatie over de AI-aanpak van NHL Stenden.</div></div>
          </div>
        </div>

        {/* H3 Fundament */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 3</div>
          <div className="chapter-title">Het fundament</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk staat niet op zichzelf. Het is geworteld in de AI-Koers, verbonden aan nationale en regionale netwerken en ingekaderd door wet- en regelgeving.</div>

          <h3>Bestuurlijk kader</h3>
          <p>Het AI-Netwerk is een initiatief van het Transitieprogramma Digitalisering van NHL Stenden. De Stuurgroep Digitalisering vormt het bestuurlijke dak. De Kwartiermaker Digitale Samenhang brengt samenhang in de digitale vraagstukken die de instelling raken, waaronder AI. De NHL Stenden AI-Koers v0.1 vormt het inhoudelijke kader: drie kernovertuigingen en zes koerslijnen die richting geven aan alle AI-activiteiten.</p>

          <h3>Wettelijk en normatief kader</h3>
          <p>NHL Stenden werkt binnen de kaders van de Algemene Verordening Gegevensbescherming en de EU AI Act. De AI Act verplicht organisaties om AI-toepassingen te classificeren naar risiconiveau en passende maatregelen te treffen. NHL Stenden hanteert een risicogestuurde aanpak: nieuwe AI-toepassingen worden gevalideerd via een interne AI-risicoscan, en de verplichtingen uit de AI Act zijn het vertrekpunt van de roadmap in dit rapport.</p>

          <h3>Nationaal en regionaal netwerk</h3>
          <p>Via <strong>SURF</strong> participeert NHL Stenden in de AI-Hub en Denktank en heeft de hogeschool toegang tot veilige, AVG-conforme infrastructuur inclusief GPT-NL. Via <strong>Npuls</strong> wordt gewerkt aan AI-geletterdheid en docentprofessionalisering. Regionaal werkt NHL Stenden samen met Frisius MC, Firda en de RUG aan een Friese AI-propositie, en sluit de instelling aan bij Programma Bach voor digitale autonomie en soevereiniteit.</p>

          <div className="card-grid">
            <div className="card"><div className="card-title">🏛️ Bestuurlijk kader</div><div className="card-body">Transitieprogramma Digitalisering · Stuurgroep Digitalisering · AI-Koers v0.1 · Kwartiermaker Digitale Samenhang</div></div>
            <div className="card"><div className="card-title">⚖️ Wettelijk kader</div><div className="card-body">AVG · EU AI Act · AI-risicoscan voor nieuwe toepassingen · risicogestuurde aanpak</div></div>
            <div className="card"><div className="card-title">🤝 Nationaal netwerk</div><div className="card-body">SURF AI-Hub · GPT-NL · Npuls · Vereniging Hogescholen</div></div>
            <div className="card"><div className="card-title">🌍 Regionaal netwerk</div><div className="card-body">Frisius MC · Firda · RUG · Friese AI-propositie · Programma Bach · AI-Fabriek Groningen</div></div>
          </div>
        </div>

        {/* H4 De zes koerslijnen */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 4</div>
          <div className="chapter-title">De zes koerslijnen</div>
          <div className="chapter-line"></div>
          <div className="lead">De AI-Koers ordent alle AI-activiteiten langs zes koerslijnen. Samen bestrijken ze de volle breedte: van het leerproces van studenten tot governance, van geletterdheid tot praktijkgericht onderzoek.</div>

          {sporen.map(s => (
            <div key={s.id} className="koers-block" style={{background: (KOERS_KLEUREN[s.id] || '#003DA5') + '0D', borderLeft: '3px solid ' + (KOERS_KLEUREN[s.id] || '#003DA5')}}>
              <div style={{width:'40px',height:'40px',background:(KOERS_KLEUREN[s.id] || '#003DA5'),borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16pt',flexShrink:0}}>
                {s.icon}
              </div>
              <div>
                <div className="koers-titel" style={{color: KOERS_KLEUREN[s.id] || '#003DA5'}}>{s.titel}</div>
                <div className="koers-kort">{s.kort}</div>
                <div className="koers-tekst">{s.waarom}</div>
              </div>
            </div>
          ))}

          <div className="info-blok" style={{marginTop:'24px'}}>
            <div className="info-titel">Bron en verdieping</div>
            <div className="info-body">De volledige uitwerking van de koerslijnen, inclusief kernambities en bronverwijzingen naar CTL en OO&I, staat op het AI-Netwerk platform onder <strong>ai-netwerk-nhlstenden.netlify.app/themas</strong>.</div>
          </div>
        </div>

        {/* H5 Initiatieven per koerslijn */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 5</div>
          <div className="chapter-title">Initiatieven per koerslijn</div>
          <div className="chapter-line"></div>
          <div className="lead">Wat doet NHL Stenden concreet? Dit hoofdstuk ordent alle initiatieven, intern en extern, onder de koerslijn waar ze aan bijdragen. Zo wordt zichtbaar waar de energie zit en waar ruimte is.</div>

          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">{intern.length}</div><div className="stat-lbl">Intern NHL Stenden</div></div>
            <div className="stat-box"><div className="stat-num">{extern.length}</div><div className="stat-lbl">Extern en samenwerking</div></div>
            <div className="stat-box"><div className="stat-num">{actief.length}</div><div className="stat-lbl">Actief lopend</div></div>
            <div className="stat-box"><div className="stat-num">{alleInitiatieven.filter(i => i.status === 'in-ontwikkeling' || i.status === 'verkenning').length}</div><div className="stat-lbl">In ontwikkeling</div></div>
          </div>

          {sporen.map(s => {
            const items = alleInitiatieven.filter(i => i.spoor === s.id)
            if (items.length === 0) return null
            return (
              <div key={s.id} style={{marginBottom:'28px'}}>
                <h3 style={{color: KOERS_KLEUREN[s.id] || '#003DA5', display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{display:'inline-block', width:'12px', height:'12px', borderRadius:'3px', background: KOERS_KLEUREN[s.id] || '#003DA5'}}></span>
                  {s.icon} {s.titel} ({items.length})
                </h3>
                <table>
                  <thead><tr><th style={{width:'55%'}}>Initiatief</th><th>Type</th><th>Status</th></tr></thead>
                  <tbody>
                    {items.map(i => (
                      <tr key={i.id}>
                        <td><strong>{i.naam}</strong><br/><span style={{color:'#9CA3AF',fontSize:'8pt'}}>{(i.omschrijving||'').slice(0,90)}{i.omschrijving && i.omschrijving.length > 90 ? '...' : ''}</span></td>
                        <td><span className="badge" style={{background: i.type==='surf'?'#EDE9FE':i.type==='extern'?'#F0FDF4':'#EFF6FF', color: i.type==='surf'?'#6B2490':i.type==='extern'?'#065F46':'#003DA5'}}>{typeLabel(i.type)}</span></td>
                        <td><span className="badge" style={{background: statusKleur(i.status)+'22', color: statusKleur(i.status)}}>{i.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}

          {alleInitiatieven.filter(i => !i.spoor).length > 0 && (
            <div style={{marginBottom:'28px'}}>
              <h3>Instellingsbreed, zonder specifieke koerslijn</h3>
              <table>
                <thead><tr><th style={{width:'55%'}}>Initiatief</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {alleInitiatieven.filter(i => !i.spoor).map(i => (
                    <tr key={i.id}>
                      <td><strong>{i.naam}</strong><br/><span style={{color:'#9CA3AF',fontSize:'8pt'}}>{(i.omschrijving||'').slice(0,90)}{i.omschrijving && i.omschrijving.length > 90 ? '...' : ''}</span></td>
                      <td><span className="badge" style={{background: i.type==='surf'?'#EDE9FE':i.type==='extern'?'#F0FDF4':'#EFF6FF', color: i.type==='surf'?'#6B2490':i.type==='extern'?'#065F46':'#003DA5'}}>{typeLabel(i.type)}</span></td>
                      <td><span className="badge" style={{background: statusKleur(i.status)+'22', color: statusKleur(i.status)}}>{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* H6 AI Act verplichtingen */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 6</div>
          <div className="chapter-title">Verplichtingen uit de AI Act</div>
          <div className="chapter-line"></div>
          <div className="lead">De EU AI Act is het vertrekpunt van de roadmap. Per verplichting is berekend of NHL Stenden op koers ligt, op basis van de deadline en het gekoppelde werk.</div>

          <p>
            Het signaal per verplichting volgt dezelfde rekenregels als op het platform: <strong style={{color:SIGNAAL_HEX.groen}}>op koers</strong> betekent dat er werk loopt of is afgerond,
            <strong style={{color:SIGNAAL_HEX.oranje}}> aandacht</strong> betekent dat er wel werk gekoppeld is maar de uitvoering nog niet is gestart,
            en <strong style={{color:SIGNAAL_HEX.rood}}> actie nodig</strong> betekent dat de deadline is verstreken of binnen drie maanden valt zonder lopend werk.
          </p>

          {gesorteerdeSignalen.map(({ vp, signaal }) => {
            const hex = SIGNAAL_HEX[signaal.kleur]
            const items = roadmap.filter(r => r.aiActKoppeling === vp.id)
            return (
              <div key={vp.id} className="vp-blok" style={{borderLeft: '3px solid ' + hex}}>
                <div className="vp-header" style={{background: hex + '0D'}}>
                  <div>
                    <div style={{fontSize:'8pt', fontWeight:700, color:'#6B7280'}}>{vp.artikel} · deadline {vp.deadline}</div>
                    <div style={{fontSize:'10.5pt', fontWeight:700, color:'#06215C'}}>{vp.titel}</div>
                    <div style={{fontSize:'8.5pt', color:hex, fontWeight:600, marginTop:'2px'}}>{signaal.tekst}</div>
                  </div>
                  <span className="badge" style={{background: hex + '22', color: hex}}>{SIGNAAL_LABEL[signaal.kleur]}</span>
                </div>
                {items.length > 0 && (
                  <div className="vp-body">
                    {items.map(r => (
                      <div key={r.id} className="vp-item">
                        <span className="vp-dot" style={{background: statusKleur(r.status)}}></span>
                        <span><strong>{r.titel}</strong> · {STATUS_TEKST[r.status] || r.status}{r.verantwoordelijke ? ` · ${r.verantwoordelijke}` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* H7 Roadmap en prognose */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 7</div>
          <div className="chapter-title">Roadmap en prognose</div>
          <div className="chapter-line"></div>
          <div className="lead">De roadmap vertaalt de verplichtingen en de eigen ambities naar concreet werk. De prognose hieronder is volledig berekend uit de actuele statusdata, zonder aannames.</div>

          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">{rmLopend.length}</div><div className="stat-lbl">Lopend</div></div>
            <div className="stat-box"><div className="stat-num">{rmVoorbereiding.length}</div><div className="stat-lbl">In voorbereiding</div></div>
            <div className="stat-box"><div className="stat-num">{rmTeStarten.length}</div><div className="stat-lbl">Nog te starten</div></div>
            <div className="stat-box"><div className="stat-num">{rmAfgerond.length}</div><div className="stat-lbl">Afgerond</div></div>
          </div>

          <h3>Berekende prognose</h3>
          <div className="prognose-blok">
            <div style={{fontSize:'9.5pt', color:'#374151', lineHeight:'1.8'}}>
              <strong>Dekkingsgraad AI Act:</strong> {dekkingsgraad}% van de verplichtingen heeft lopend of afgerond werk ({telling.groen || 0} van {AI_ACT_ITEMS.length}).<br/>
              <strong>Uitvoeringsgraad roadmap:</strong> {uitvoeringsgraad}% van de openstaande items is daadwerkelijk in uitvoering ({rmLopend.length} van {rmActief.length}).<br/>
              <strong>Vooruitzicht:</strong> {telling.rood > 0
                ? `bij ongewijzigd tempo worden ${telling.rood} verplichting${telling.rood !== 1 ? 'en' : ''} (${urgent.map(u => u.vp.artikel).join(', ')}) niet aantoonbaar ingevuld voor de deadline. Het starten van de gekoppelde items, of het koppelen en starten van nieuw werk, is daarvoor de bepalende stap.`
                : telling.oranje > 0
                ? `de verplichtingen met signaal aandacht hebben werk gekoppeld dat nog moet starten. Zodra dat werk start, kleuren deze verplichtingen groen.`
                : `alle verplichtingen hebben lopend of afgerond werk. De inzet verschuift naar het aantoonbaar afronden en documenteren.`}
            </div>
          </div>

          <p style={{fontSize:'8.5pt', color:'#9CA3AF'}}>Deze prognose is een rekenkundige weergave van de statusdata op {DATUM()} en bevat geen inhoudelijke beoordeling. De duiding en prioritering zijn aan het kernteam en de stuurgroep.</p>

          {eigenKoers.length > 0 && (
            <>
              <h3>Eigen koers</h3>
              <p>Naast de verplichtingen kiest NHL Stenden ook eigen speerpunten. De volgende roadmap-items komen niet voort uit een AI Act verplichting maar uit de eigen ambities van de instelling.</p>
              <table>
                <thead><tr><th style={{width:'55%'}}>Item</th><th>Status</th><th>Verantwoordelijk</th></tr></thead>
                <tbody>
                  {eigenKoers.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.titel}</strong></td>
                      <td><span className="badge" style={{background: statusKleur(r.status)+'22', color: statusKleur(r.status)}}>{STATUS_TEKST[r.status] || r.status}</span></td>
                      <td style={{fontSize:'8.5pt'}}>{r.verantwoordelijke || 'n.t.b.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* H8 Pilots */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 8</div>
          <div className="chapter-title">Pilots</div>
          <div className="chapter-line"></div>
          <div className="lead">Pilots zijn concrete experimenten waarbij AI wordt ingezet in een afgebakende context. Ze leveren directe leerervaring op en vormen de basis voor bredere implementatie.</div>

          <p>NHL Stenden kiest bewust voor een experimenterende aanpak: liever klein beginnen en leren, dan grote systemen uitrollen zonder bewijs. Elke pilot heeft een duidelijk doel, een verantwoordelijk team en een verwacht resultaat. Na afronding worden de leerpunten gedeeld met het bredere netwerk.</p>

          {pilots.length > 0 ? pilots.map(p => (
            <div key={p.id} className="pilot-blok">
              <div className="pilot-header">
                <div>
                  <div className="pilot-naam">{p.naam}</div>
                  {p.academie && <div style={{fontSize:'8.5pt',color:'#9CA3AF',marginTop:'3px'}}>📍 {p.academie} · Platform: {p.platform}</div>}
                </div>
                <span className="badge" style={{background: statusKleur(p.status)+'22', color: statusKleur(p.status), flexShrink:0, marginLeft:'12px'}}>{p.status}</span>
              </div>
              <div className="pilot-body">
                <p style={{marginBottom:'8px'}}><strong>Doel:</strong> {p.doel}</p>
                {p.bereiken && <p style={{marginBottom:'8px'}}><strong>Beoogd resultaat:</strong> {p.bereiken}</p>}
                {p.bronLabel && <div style={{fontSize:'8pt',color:'#003DA5',marginTop:'6px'}}>🔗 Meer informatie: {p.bronLabel}</div>}
              </div>
            </div>
          )) : <p style={{color:'#9CA3AF',fontStyle:'italic'}}>Op dit moment zijn nog geen pilots geregistreerd in het systeem.</p>}
        </div>

        {/* H9 Governance */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 9</div>
          <div className="chapter-title">Governance en organisatie</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is geen project dat ooit klaar is. Het is een continue organisatievorm die meegroeit met de instelling, de technologie en de samenleving.</div>

          <h3>Besturingsstructuur</h3>
          <p>De <strong>Stuurgroep Digitalisering</strong> vormt het bestuurlijke kader: zij stelt de kaders, bewaakt de voortgang en neemt besluiten over richting en middelen. De <strong>Kwartiermaker Digitale Samenhang</strong> verzorgt de dagelijkse aansturing en rapporteert aan de stuurgroep. Het <strong>kernteam AI-Netwerk</strong> heeft de operationele verantwoordelijkheid voor het platform en de netwerkorganisatie, ondersteund door solution partners voor AVG, koppelingen en het AI-applicatielandschap.</p>

          <div className="card-grid" style={{marginBottom:'24px'}}>
            <div className="card card-dark"><div className="card-title">Stuurgroep Digitalisering</div><div className="card-body">Bestuurlijke opdrachtgever. Stelt kaders, bewaakt voortgang, neemt besluiten over richting en middelen. Rapportage elk kwartaal.</div></div>
            <div className="card"><div className="card-title">Kwartiermaker Digitale Samenhang</div><div className="card-body">Dagelijkse aansturing van het AI-Netwerk. Verbindt strategie en uitvoering. Rapporteert aan de stuurgroep en is extern aanspreekpunt.</div></div>
            <div className="card"><div className="card-title">Kernteam AI-Netwerk</div><div className="card-body">Kwartiermaker, Informatiemanager en ICT Analist. Operationele verantwoordelijkheid voor het platform en de netwerkorganisatie.</div></div>
            <div className="card"><div className="card-title">Techniek en Infrastructuur</div><div className="card-body">Solution partners voor veilige AI-integratie. Expertise op AVG, API-koppelingen, security en het AI-applicatielandschap.</div></div>
          </div>

          <h3>Verantwoordelijkheid per koerslijn</h3>
          <p>Per koerslijn wordt een trekker aangesteld die verantwoordelijk is voor de agenda, de initiatieven en de verbinding met de rest van het netwerk. De trekkers rapporteren via het maandelijkse kernteam-overleg.</p>

          {sporen.map(s => (
            <div key={s.id} className="gov-row">
              <div className="gov-thema" style={{background: KOERS_KLEUREN[s.id] || '#003DA5'}}>
                {s.icon} {s.titel}
              </div>
              <div className="gov-body">
                <strong>Trekker:</strong> Wordt ingevuld &nbsp;·&nbsp; <strong>Overleg:</strong> {OVERLEG_STRUCTUUR.find(o => o.spoor === s.id)?.naam || 'AI-Netwerk overleg'} &nbsp;·&nbsp; <strong>Verantwoording:</strong> Stuurgroep Digitalisering
              </div>
            </div>
          ))}

          <h3>Overlegstructuur en agendavoorstellen</h3>
          <p>Het AI-Netwerk kent een vaste overlegstructuur: de stuurgroep voor richting en middelen, het kernteam voor de dagelijkse gang van zaken en per koerslijn een thema-overleg. Elk agendavoorstel opent met de kernambitie van het eigen onderdeel, als herinnering waarvoor het overleg het doet. Daaronder staat een berekend voorstel van maximaal drie punten, samengesteld uit de verplichtingen met een signaal, de open acties uit de actielijst (zie bijlage) en recente inzichten uit het netwerk.</p>
          {OVERLEG_STRUCTUUR.map(o => {
            const punten = agendaVoorstel(o)
            const spoorDef = o.spoor ? sporen.find(s => s.id === o.spoor) : null
            return (
              <div key={o.id} className="gov-row">
                <div className="gov-thema" style={{background: o.spoor ? (KOERS_KLEUREN[o.spoor] || '#003DA5') : '#06215C'}}>
                  {spoorDef ? `${spoorDef.icon} ` : ''}{o.naam}
                </div>
                <div className="gov-body">
                  <div style={{fontSize:'8.5pt', fontWeight:700, color: o.spoor ? (KOERS_KLEUREN[o.spoor] || '#003DA5') : '#06215C', marginBottom:'3px'}}>
                    🎯 Kernambitie: {spoorDef ? spoorDef.kort : o.ambitie}
                  </div>
                  <div style={{fontSize:'8pt', color:'#9CA3AF', marginBottom:'4px'}}>{o.frequentie} · {o.focus}</div>
                  {punten.length === 0 && <div>Geen agendapunten uit de actuele status. Het overleg bepaalt de eigen agenda.</div>}
                  {punten.map((pt, i) => (
                    <div key={i}>{i + 1}. {pt.tekst} <span style={{fontSize:'7.5pt', color:'#8C1D82', fontWeight:600}}>[{pt.bron}]</span></div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="info-blok">
            <div className="info-titel">🔄 Overlegstructuur</div>
            <div className="info-body">
              <strong>Maandelijks:</strong> AI-Netwerk kernteam overleg: voortgang, nieuwe initiatieven, knelpunten en besluiten op operationeel niveau.<br/>
              <strong>Kwartaal:</strong> Update stuurgroep: rapportage over voortgang, besluiten over richting en middelen, bijsturing waar nodig.<br/>
              <strong>Jaarlijks:</strong> Evaluatie en herijking: doelstellingen, koerslijnen, governance en aansluiting op externe ontwikkelingen.<br/>
              <strong>Continu:</strong> Het AI-Netwerk platform wordt dagelijks bijgehouden en geeft altijd de meest actuele stand van zaken.
            </div>
          </div>
        </div>

        {/* H10 Inzichten */}
        {inspiraties.length > 0 && (
          <div className="section page-break">
            <div className="chapter-label">Hoofdstuk 10</div>
            <div className="chapter-title">Inzichten en beweging</div>
            <div className="chapter-line"></div>
            <div className="lead">Het AI-Netwerk haalt ook buiten de muren van NHL Stenden inzichten op. Onderstaande items geven een beeld van wat medewerkers, docenten en studenten delen en relevant vinden.</div>

            <table>
              <thead><tr><th>Titel</th><th>Type</th><th>Datum</th></tr></thead>
              <tbody>
                {inspiraties.map(b => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.titel}</strong>
                      <br/><span style={{fontSize:'8pt',color:'#9CA3AF'}}>{(b.tekst||'').slice(0,100)}{b.tekst && b.tekst.length > 100 ? '...' : ''}</span>
                    </td>
                    <td>{b.typelabel||b.type||'n.v.t.'}</td>
                    <td style={{whiteSpace:'nowrap'}}>{b.datum||'n.v.t.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actielijst */}
        <div className="section page-break">
          <div className="chapter-label">Bijlage</div>
          <div className="chapter-title">Actielijst</div>
          <div className="chapter-line"></div>
          <div className="lead">Alle acties van de roadmap op een rij: wat staat open, wie is verantwoordelijk, in welk kwartaal het is voorzien, en wat inmiddels is afgehandeld.</div>

          <h3>Open acties ({rmActief.length})</h3>
          <table>
            <thead><tr><th style={{width:'38%'}}>Actie</th><th>AI Act</th><th>Verantwoordelijk</th><th>Kwartaal</th><th>Status</th></tr></thead>
            <tbody>
              {[...rmActief].sort((a, b) => (a.datum || 'zzz').localeCompare(b.datum || 'zzz')).map(r => {
                const vp = AI_ACT_ITEMS.find(a => a.id === r.aiActKoppeling)
                return (
                  <tr key={r.id}>
                    <td><strong>{r.titel}</strong></td>
                    <td style={{whiteSpace:'nowrap'}}>{vp ? vp.artikel : 'Eigen koers'}</td>
                    <td style={{fontSize:'8.5pt'}}>{r.verantwoordelijke || 'n.t.b.'}</td>
                    <td style={{whiteSpace:'nowrap'}}>{r.datum || 'n.t.b.'}</td>
                    <td><span className="badge" style={{background: statusKleur(r.status)+'22', color: statusKleur(r.status)}}>{STATUS_TEKST[r.status] || r.status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {rmAfgerond.length > 0 ? (
            <>
              <h3>Afgehandeld ({rmAfgerond.length})</h3>
              <table>
                <thead><tr><th style={{width:'55%'}}>Actie</th><th>Verantwoordelijk</th><th>Status</th></tr></thead>
                <tbody>
                  {rmAfgerond.map(r => (
                    <tr key={r.id}>
                      <td>{r.titel}</td>
                      <td style={{fontSize:'8.5pt'}}>{r.verantwoordelijke || ''}</td>
                      <td><span className="badge" style={{background:'#37415122', color:'#374151'}}>Afgerond ✓</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p style={{color:'#9CA3AF', fontStyle:'italic'}}>Nog geen acties afgehandeld en bevestigd door een beheerder.</p>
          )}
        </div>

        {/* Afsluiting */}
        <div className="section page-break">
          <div className="chapter-label">Afsluiting</div>
          <div className="chapter-title">Vooruitkijken</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is geen eindpunt maar een vertrekpunt. De echte waarde ontstaat wanneer mensen ermee werken, erop voortbouwen en er eigenaarschap bij ervaren.</div>

          <p>NHL Stenden staat voor de opgave om AI betekenisvol te integreren in het onderwijs, het onderzoek en de organisatie. Dat vraagt om meer dan technologie: het vraagt om cultuur, vaardigheden, governance en vertrouwen. De AI-Koers geeft de richting, het AI-Netwerk maakt de beweging zichtbaar en verbindt de mensen die haar dragen.</p>

          <p>De komende periode richt zich op het invullen van de verplichtingen met signaal actie nodig, het aanstellen van trekkers per koerslijn, het uitvoeren van de AMCE-proeftuin en het verder ontsluiten van initiatieven.</p>

          <div className="afsluiting-box">
            <div style={{fontSize:'28pt',marginBottom:'14px'}}>🤖</div>
            <div style={{fontSize:'16pt',fontWeight:800,marginBottom:'6px'}}>AI-Netwerk NHL Stenden</div>
            <div style={{color:'rgba(255,255,255,0.65)',fontSize:'10pt',marginBottom:'16px'}}>ai-netwerk-nhlstenden.netlify.app</div>
            <div style={{color:'rgba(255,255,255,0.45)',fontSize:'8.5pt'}}>Stand van zaken op {DATUM()} · rapportversie {APP_VERSIE} · in lijn met de AI-Koers v0.1.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="rapport-footer">
          <div>
            <div className="footer-logo">AI-Netwerk NHL Stenden</div>
            <div className="footer-sub">Transitieprogramma Digitalisering · {DATUM()}</div>
          </div>
          <div style={{textAlign:'right',color:'rgba(255,255,255,0.35)',fontSize:'7.5pt'}}>
            {APP_VERSIE} · {DATUM()}<br/>
            ai-netwerk-nhlstenden.netlify.app
          </div>
        </div>

      </div>
    </>
  )
}
