import { useEffect } from 'react'
import { initiatieven as alleInitiatieven } from '../data'
import { INIT_PILOTS, INIT_INSPIRATIES } from '../initialData'

const DATUM = () => new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

const THEMAS = [
  { titel: 'AI & Leren', icon: 'U+1F393', kleur: '#1E3A8A', omschrijving: 'Hoe AI het leerproces van studenten verrijkt en ondersteunt, van feedback op opdrachten tot persoonlijke leerroutes.' },
  { titel: 'AI & Werken', icon: 'U+2699', kleur: '#0F766E', omschrijving: 'AI als hulpmiddel voor medewerkers in hun dagelijkse werk: van administratie tot data-analyse en procesautomatisering.' },
  { titel: 'AI & Verantwoordelijkheid', icon: 'U+2696', kleur: '#7C3AED', omschrijving: 'Ethiek, governance en de EU AI Act als kader voor verantwoord gebruik. NHL Stenden werkt met een risicogestuurde aanpak.' },
  { titel: 'AI & Geletterdheid', icon: 'U+1F4D6', kleur: '#B45309', omschrijving: 'Vaardigheden en kennis voor studenten en medewerkers om AI te begrijpen, kritisch te beoordelen en verantwoord toe te passen.' },
  { titel: 'AI & Werkveld', icon: 'U+1F3E2', kleur: '#0E7490', omschrijving: 'Samenwerking met het werkveld en regionale AI-initiatieven. NHL Stenden als motor voor AI-innovatie in Noord-Nederland.' },
  { titel: 'AI & Onderzoek', icon: 'U+1F52C', kleur: '#BE185D', omschrijving: 'Praktijkgericht onderzoek naar AI-toepassingen in onderwijs en zorg, uitgevoerd door lectoraten en in samenwerking met externe partners.' },
]

const NVAO = [
  { nr: 1, titel: 'Beoogde leerresultaten', vraag: 'Passen de leerdoelen nog bij een beroepspraktijk waarin AI een vanzelfsprekende rol speelt?', nhl: 'NHL Stenden integreert AI-geletterdheid actief in leerdoelen via de Minor AI in Practice en de Minor Decision Making & Generative AI. Opleidingen worden gestimuleerd om beroepsprofielen te herzien in samenspraak met werkveldpartners en sectorale adviescolleges. Het AI-GO! raamwerk van Npuls vormt hierbij de inhoudelijke basis.' },
  { nr: 2, titel: 'Onderwijsleeromgeving', vraag: 'Is er beleid, zijn er richtlijnen en is de leeromgeving ingericht op verantwoord AI-gebruik?', nhl: 'Het Centre for Teaching and Learning (CTL) biedt docenten actieve ondersteuning via richtlijnen, professionalisering en Npuls-webinars. ARDA AI-modules zijn beschikbaar voor medewerkers en studenten. Het I-AM-AI initiatief verbindt studenten, docenten en het werkveld rondom AI. De bibliotheek heeft LibGuides ontwikkeld als praktische wegwijzer voor verantwoord AI-gebruik.' },
  { nr: 3, titel: 'Toetsing en examinering', vraag: 'Hoe borgt NHL Stenden de kwaliteit van toetsing in een tijdperk van generatieve AI?', nhl: 'NHL Stenden heeft een expliciet en gedocumenteerd toetsbeleid voor generatieve AI, ontwikkeld door het CTL. De instelling kiest bewust voor geen AI-detector, omdat betrouwbaarheid onvoldoende is aangetoond. In plaats daarvan wordt ingezet op sterk toetsontwerp, heldere toetsinstructies en het Design Based Education (DBE) concept waarbij studenten beoordeeld worden op proces en authentieke prestatie.' },
  { nr: 4, titel: 'Gerealiseerde leerresultaten', vraag: 'Zijn studenten aantoonbaar voorbereid op een beroepspraktijk waarin AI een rol speelt?', nhl: 'Via het FrisiusLab werken studenten aan concrete AI-vraagstukken in de zorgsector. Portfolio-beoordelingen en criteriumgerichte interviews maken leerresultaten zichtbaar op een manier die minder gevoelig is voor AI-gegenereerde eindproducten. Praktijkgericht onderzoek via lectoraten verbindt studenten aan actuele AI-ontwikkelingen in het werkveld.' },
]

function statusKleur(s) {
  const m = { actief: '#0F766E', 'in-ontwikkeling': '#B45309', gepland: '#1E3A8A', afgerond: '#374151', Lopend: '#0F766E', Verkenning: '#B45309', verkenning: '#B45309' }
  return m[s] || '#374151'
}

export default function Rapport({ pilots: pilotsProp, inspiraties: inspiratiesProp }) {
  const pilots = pilotsProp && pilotsProp.length > 0 ? pilotsProp : INIT_PILOTS
  const inspiraties = inspiratiesProp && inspiratiesProp.length > 0 ? inspiratiesProp : INIT_INSPIRATIES
  const intern = alleInitiatieven.filter(i => i.type === 'intern')
  const extern = alleInitiatieven.filter(i => i.type === 'extern' || i.type === 'surf')
  const actief = alleInitiatieven.filter(i => i.status === 'actief')

  useEffect(() => {
    document.title = 'AI-Netwerk NHL Stenden Rapport ' + DATUM()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1a1a2e; }
        .rapport { max-width: 860px; margin: 0 auto; background: white; }
        .no-print { position: fixed; top: 20px; right: 20px; z-index: 999; display: flex; gap: 10px; }
        .btn-print { background: #1E3A8A; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(30,58,138,0.3); }
        .btn-back { background: white; color: #374151; border: 1px solid #E2E8F0; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; }
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          @page { margin: 15mm; }
        }

        /* Cover */
        .cover { background: linear-gradient(135deg, #0F1E52 0%, #1E3A8A 60%, #162D6E 100%); min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 70px 70px 50px; color: white; position: relative; overflow: hidden; page-break-after: always; }
        .cover::before { content: ''; position: absolute; top: -80px; right: -80px; width: 450px; height: 450px; border: 1px solid rgba(255,255,255,0.07); border-radius: 50%; }
        .cover::after { content: ''; position: absolute; bottom: -120px; left: -120px; width: 550px; height: 550px; border: 1px solid rgba(255,255,255,0.05); border-radius: 50%; }
        .cover-label { font-size: 8.5pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 40px; }
        .cover-title { font-size: 48pt; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 6px; }
        .cover-accent { width: 56px; height: 4px; background: #4DAAFF; border-radius: 2px; margin: 28px 0; }
        .cover-sub { font-size: 13pt; color: rgba(255,255,255,0.72); max-width: 520px; line-height: 1.6; font-weight: 400; }
        .cover-meta { display: flex; gap: 48px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.12); margin-top: 60px; }
        .cover-meta-item label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.35); display: block; margin-bottom: 5px; }
        .cover-meta-item span { font-size: 10pt; font-weight: 600; }

        /* Pagina layout */
        .section { padding: 54px 70px; border-bottom: 1px solid #F1F5F9; }
        .section:last-child { border-bottom: none; }
        .chapter-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #4DAAFF; margin-bottom: 10px; }
        .chapter-title { font-size: 24pt; font-weight: 800; color: #0F1E52; line-height: 1.15; letter-spacing: -0.01em; }
        .chapter-line { width: 40px; height: 3px; background: linear-gradient(90deg, #1E3A8A, #4DAAFF); border-radius: 2px; margin: 18px 0 28px; }
        .lead { font-size: 12.5pt; color: #374151; line-height: 1.75; margin-bottom: 22px; font-weight: 400; }
        p { font-size: 10pt; color: #4B5563; line-height: 1.8; margin-bottom: 14px; }
        p strong { color: #1F2937; }
        h3 { font-size: 11pt; font-weight: 700; color: #0F1E52; margin: 24px 0 10px; }

        /* Statistieken */
        .stat-row { display: flex; gap: 14px; margin: 28px 0; }
        .stat-box { flex: 1; background: linear-gradient(135deg, #0F1E52, #1E3A8A); border-radius: 14px; padding: 22px 18px; text-align: center; color: white; }
        .stat-num { font-size: 30pt; font-weight: 900; color: #4DAAFF; line-height: 1; margin-bottom: 6px; }
        .stat-lbl { font-size: 8pt; font-weight: 600; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: 0.08em; }

        /* Kaarten */
        .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 20px 0; }
        .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 3px solid #1E3A8A; border-radius: 12px; padding: 18px 20px; }
        .card-dark { background: #0F1E52; border: none; color: white; }
        .card-title { font-size: 10pt; font-weight: 700; color: #0F1E52; margin-bottom: 7px; }
        .card-dark .card-title { color: white; }
        .card-body { font-size: 9pt; color: #6B7280; line-height: 1.65; }
        .card-dark .card-body { color: rgba(255,255,255,0.7); }

        /* Thema */
        .thema-block { border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; display: flex; gap: 18px; align-items: flex-start; }
        .thema-titel { font-size: 11pt; font-weight: 700; margin-bottom: 5px; }
        .thema-tekst { font-size: 9pt; color: #6B7280; line-height: 1.6; }

        /* NVAO */
        .nvao-blok { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 14px; }
        .nvao-header { background: #0F1E52; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
        .nvao-nr { font-size: 18pt; font-weight: 900; color: #4DAAFF; flex-shrink: 0; width: 32px; }
        .nvao-titel { font-size: 11pt; font-weight: 700; }
        .nvao-vraag { font-size: 8.5pt; color: rgba(255,255,255,0.6); margin-top: 2px; font-style: italic; }
        .nvao-body { padding: 16px 20px; background: white; font-size: 9.5pt; color: #374151; line-height: 1.7; }

        /* Pilots */
        .pilot-blok { border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 14px; overflow: hidden; }
        .pilot-header { padding: 14px 20px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #F1F5F9; }
        .pilot-naam { font-size: 11pt; font-weight: 700; color: #0F1E52; }
        .pilot-body { padding: 14px 20px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 8pt; font-weight: 600; }

        /* Netwerk */
        .netwerk-box { background: linear-gradient(135deg, #0F1E52 0%, #1a2f6b 100%); border-radius: 16px; padding: 44px; margin: 24px 0; text-align: center; color: white; }
        .netwerk-nodes { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin: 14px 0; }
        .netwerk-node { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; padding: 7px 14px; font-size: 8.5pt; font-weight: 600; }
        .netwerk-center { width: 76px; height: 76px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26pt; margin: 16px auto; box-shadow: 0 0 0 10px rgba(255,255,255,0.08), 0 0 0 22px rgba(255,255,255,0.04); }

        /* Governance */
        .gov-row { display: flex; gap: 12px; margin-bottom: 10px; }
        .gov-thema { border-radius: 8px; padding: 12px 14px; color: white; font-size: 9pt; font-weight: 600; flex: 0 0 170px; display: flex; align-items: center; }
        .gov-body { flex: 1; background: #F8FAFC; border-radius: 8px; padding: 12px 14px; font-size: 9pt; color: #374151; border-left: 3px solid #4DAAFF; line-height: 1.6; }

        /* Tabel */
        table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9pt; }
        th { background: #0F1E52; color: white; padding: 10px 14px; text-align: left; font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 10px 14px; border-bottom: 1px solid #F1F5F9; color: #374151; vertical-align: top; }
        tr:nth-child(even) td { background: #F8FAFC; }

        /* Footer */
        .rapport-footer { background: #0F1E52; color: white; padding: 32px 70px; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-weight: 800; font-size: 12pt; }
        .footer-sub { color: rgba(255,255,255,0.45); font-size: 8pt; margin-top: 3px; }

        /* Info blok */
        .info-blok { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
        .info-titel { font-size: 10pt; font-weight: 700; color: #1E3A8A; margin-bottom: 6px; }
        .info-body { font-size: 9pt; color: #374151; line-height: 1.65; }
        .success-blok { background: #F0FDF4; border: 1px solid #BBF7D0; border-left: 3px solid #0F766E; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }

        /* Afsluiting */
        .afsluiting-box { background: linear-gradient(135deg, #0F1E52, #1E3A8A); color: white; border-radius: 16px; padding: 40px; text-align: center; margin: 28px 0; }
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
              Een levend overzicht van de AI-strategie, initiatieven en governance van NHL Stenden Hogeschool. Dit rapport wordt automatisch gegenereerd vanuit de live data van het AI-Netwerk platform en geeft altijd de meest actuele stand van zaken.
            </div>
          </div>
          <div className="cover-meta">
            <div className="cover-meta-item"><label>Rapportdatum</label><span>{DATUM()}</span></div>
            <div className="cover-meta-item"><label>Versie</label><span>Live rapport</span></div>
            <div className="cover-meta-item"><label>Opgesteld door</label><span>Kwartiermaker Digitale Samenhang</span></div>
            <div className="cover-meta-item"><label>Status</label><span>Actief programma</span></div>
          </div>
        </div>

        {/* H1 */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 1</div>
          <div className="chapter-title">Wat is het AI-Netwerk?</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is de centrale plek waar NHL Stenden alles rondom kunstmatige intelligentie samenvoegt: wat we doen, wie we zijn, en hoe we AI verantwoord inzetten.</div>

          <p>Kunstmatige intelligentie verandert ingrijpend hoe we leren, werken, toetsen en samenwerken. Voor een hogeschool als NHL Stenden roept dat fundamentele vragen op: hoe bereiden we studenten voor op een beroepspraktijk die steeds meer door AI wordt bepaald? Hoe helpen we docenten en medewerkers om AI zinvol en veilig in te zetten? En hoe doen we dat op een manier die aansluit bij onze waarden en wettelijke verplichtingen?</p>

          <p>Het AI-Netwerk is het antwoord van NHL Stenden op die vragen. Het is geen project met een einddatum, maar een levende organisatievorm die initiatieven, mensen en kennis rondom AI bij elkaar brengt. <strong>Het platform waarop u nu leest is de digitale weerslag van dat netwerk.</strong> Het wordt dagelijks bijgehouden en geeft altijd een actueel beeld van wat er speelt.</p>

          <p>Dit rapport is bedoeld voor iedereen die meer wil weten over de AI-aanpak van NHL Stenden: vans en accreditatiepanels tot docenten, medewerkers en externe partners. We nemen u mee in de strategie, de themas, de concrete initiatieven en de governance rondom AI bij NHL Stenden.</p>

          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">{pilots.length}</div><div className="stat-lbl">Actieve pilots</div></div>
            <div className="stat-box"><div className="stat-num">{alleInitiatieven.length}</div><div className="stat-lbl">Initiatieven</div></div>
            <div className="stat-box"><div className="stat-num">{actief.length}</div><div className="stat-lbl">Actief lopend</div></div>
            <div className="stat-box"><div className="stat-num">6</div><div className="stat-lbl">Themas</div></div>
          </div>

          <h3>Waarom een AI-Netwerk?</h3>
          <p>Zonder structuur ontstaat versnippering. Elke academie, elke dienst, elk lectoraat werkt aan AI-vraagstukken, maar die initiatieven zijn niet altijd zichtbaar voor elkaar. Het AI-Netwerk doorbreekt die silos: het maakt zichtbaar wat er al loopt, verbindt mensen die aan vergelijkbare vraagstukken werken en helpt de instelling om richting te geven aan AI-ontwikkeling als geheel.</p>

          <div className="card-grid">
            <div className="card"><div className="card-title">🎯 Overzicht en richting</div><div className="card-body">Alle AI-initiatieven, kennis, pilots en mensen bij NHL Stenden samenbrengen op een plek, toegankelijk voor iedereen die betrokken is bij of geinteresseerd is in AI.</div></div>
            <div className="card"><div className="card-title">🔗 Verbinding en samenwerking</div><div className="card-body">Silos doorbreken door initiatieven van verschillende academies, diensten en externe partners aan elkaar te verbinden. Kennis delen, leren van elkaar.</div></div>
            <div className="card"><div className="card-title">⚖️ Verantwoord en zorgvuldig</div><div className="card-body">AI wordt ingezet met aandacht voor ethiek, privacy, de EU AI Act en de menselijke maat. NHL Stenden kiest voor een risicogestuurde aanpak.</div></div>
            <div className="card"><div className="card-title">📋 Transparantie en verantwoording</div><div className="card-body">Het platform dient als levende bewijslast voor accreditatie, bestuurlijke verantwoording en externe communicatie over de AI-aanpak van NHL Stenden.</div></div>
          </div>
        </div>

        {/* H2 */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 2</div>
          <div className="chapter-title">Het fundament</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk staat niet op zichzelf. Het is geworteld in een helder bestuurlijk kader, verbonden aan nationale en regionale netwerken en ingekaderd door wet- en regelgeving.</div>

          <h3>Bestuurlijk kader</h3>
          <p>Het AI-Netwerk is een initiatief van het Transitieprogramma Digitalisering van NHL Stenden. De Stuurgroep Digitalisering vormt het bestuurlijke dak. De Kwartiermaker Digitale Samenhang is aangesteld om samenhang te brengen in de digitale vraagstukken die de instelling raken, waaronder AI. Het CvB heeft in 2026 de opdracht bevestigd om een samenhangende AI-netwerkorganisatie te vormen met duidelijke speerpunten.</p>

          <h3>Wettelijk en normatief kader</h3>
          <p>NHL Stenden werkt binnen de kaders van de Algemene Verordening Gegevensbescherming (AVG) en de Europese AI Act. De AI Act verplicht organisaties om AI-toepassingen te classificeren naar risiconiveau en passende maatregelen te treffen. NHL Stenden heeft een risicogestuurde aanpak ingericht: alle nieuwe AI-toepassingen worden gevalideerd via een interne AI-risicoscan. Hoog-risico toepassingen, zoals AI-systemen die leerresultaten of toegang tot onderwijs beinvloeden, vallen onder strenge voorwaarden.</p>

          <h3>Nationaal netwerk</h3>
          <p>NHL Stenden is actief betrokken bij nationale platforms en programmas. Via <strong>SURF</strong> participeert de hogeschool in de AI-Hub en Denktank, en wordt toegang geboden tot veilige en AVG-conforme AI-infrastructuur inclusief GPT-NL. Via <strong>NPULS</strong> wordt gewerkt aan AI-geletterdheid, toetsing en docentprofessionalisering. De Vereniging Hogescholen fungeert als platform voor landelijke afstemming over beroepsprofielen en curricula.</p>

          <h3>Regionaal netwerk</h3>
          <p>In Noord-Nederland werkt NHL Stenden samen met Frisius MC, Firda en andere partners aan een gezamenlijke Friese AI-propositie. Het FrisiusLab is een concreet samenwerkingsverband waarin onderwijs, zorg en onderzoek samenkomen rondom AI-toepassingen in de zorgpraktijk. De AI Fryslaan-coalitie en verbindingen met de RUG geven verdere regionale verankering.</p>

          <div className="card-grid">
            <div className="card"><div className="card-title">🏛️ Bestuurlijk kader</div><div className="card-body">Transitieprogramma Digitalisering · Stuurgroep Digitalisering · CvB-opdracht · Kwartiermaker Digitale Samenhang</div></div>
            <div className="card"><div className="card-title">⚖️ Wettelijk kader</div><div className="card-body">AVG · EU AI Act · BKO-standaarden · AI-risicoscan voor alle nieuwe toepassingen · NVAO-kaders</div></div>
            <div className="card"><div className="card-title">🤝 Nationaal netwerk</div><div className="card-body">SURF AI-Hub · GPT-NL · NPULS · Vereniging Hogescholen · Nationaal richtlijnen en kaders</div></div>
            <div className="card"><div className="card-title">🌍 Regionaal netwerk</div><div className="card-body">FrisiusLab · Frisius MC · Firda · AI Fryslaan-coalitie · RUG · Regionale AI-propositie</div></div>
          </div>
        </div>

        {/* H3 */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 3</div>
          <div className="chapter-title">De zes themas</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is georganiseerd rondom zes themas die samen het volledige spectrum van AI bij NHL Stenden omvatten. Elk thema heeft een eigen trekker, eigen initiatieven en een eigen plek in de netwerkorganisatie.</div>

          <p>De keuze voor zes themas is niet willekeurig. Samen bestrijken ze de volle breedte van de uitdaging: van het leerproces van studenten tot de bedrijfsvoering van de instelling, van ethische vragen tot praktijkgericht onderzoek. De themas zijn niet los van elkaar: ze raken elkaar voortdurend en versterken elkaar. Een docent die werkt aan AI-geletterdheid (thema 4) draagt ook bij aan betere toetsing (thema 3 in de NVAO-context) en bereidt studenten voor op het werkveld (thema 5).</p>

          {THEMAS.map(t => (
            <div key={t.titel} className="thema-block" style={{background: t.kleur + '10', borderLeft: '3px solid ' + t.kleur}}>
              <div style={{width:'40px',height:'40px',background:t.kleur,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16pt',flexShrink:0}}>
                {t.titel === 'AI & Leren' ? '🎓' : t.titel === 'AI & Werken' ? '⚙️' : t.titel === 'AI & Verantwoordelijkheid' ? '⚖️' : t.titel === 'AI & Geletterdheid' ? '📖' : t.titel === 'AI & Werkveld' ? '🏢' : '🔬'}
              </div>
              <div>
                <div className="thema-titel" style={{color: t.kleur}}>{t.titel}</div>
                <div className="thema-tekst">{t.omschrijving}</div>
              </div>
            </div>
          ))}

          <div className="info-blok" style={{marginTop:'24px'}}>
            <div className="info-titel">Groeiend netwerk</div>
            <div className="info-body">Per thema worden trekkers aangesteld die het thema actief voeden, vertegenwoordigen en in verbinding brengen met de rest van de organisatie. De themas zijn nu in opbouw. Naarmate het netwerk groeit, worden de trekkers en hun contactgegevens toegevoegd aan het AI-Netwerk platform.</div>
          </div>
        </div>

        {/* H4 Initiatieven */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 4</div>
          <div className="chapter-title">Initiatieven</div>
          <div className="chapter-line"></div>
          <div className="lead">NHL Stenden heeft een rijk palet aan AI-initiatieven, zowel intern als in samenwerking met externe partners. Onderstaand overzicht geeft een beeld van de breedte en variatie van wat er bij NHL Stenden rondom AI loopt.</div>

          <p>De initiatieven variëren van strategische programmas op instellingsniveau tot concrete projecten binnen academies en diensten. Sommige zijn al actief en leveren resultaten op; andere zijn in ontwikkeling of verkenning. Het onderscheid tussen intern (NHL Stenden-eigen) en extern (in samenwerking met of via externe partners) is van belang voor de governance: externe initiatieven vragen om goede afspraken over eigenaarschap, AVG-compliance en verwerkersverantwoordelijkheid.</p>

          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">{intern.length}</div><div className="stat-lbl">Intern NHL Stenden</div></div>
            <div className="stat-box"><div className="stat-num">{extern.length}</div><div className="stat-lbl">Extern en samenwerking</div></div>
            <div className="stat-box"><div className="stat-num">{actief.length}</div><div className="stat-lbl">Actief lopend</div></div>
            <div className="stat-box"><div className="stat-num">{alleInitiatieven.filter(i => i.status === 'in-ontwikkeling' || i.status === 'verkenning').length}</div><div className="stat-lbl">In ontwikkeling</div></div>
          </div>

          <h3>Interne initiatieven</h3>
          <p>De interne initiatieven laten zien dat AI bij NHL Stenden breed gedragen wordt: van de AI Compliance Groep die governance borgt, tot academies die AI integreren in hun curriculum, tot diensten als FCP die AI inzetten voor datagedreven bedrijfsvoering.</p>

          <table>
            <thead><tr><th>Initiatief</th><th>Status</th><th>Impact</th></tr></thead>
            <tbody>
              {intern.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.naam}</strong><br/><span style={{color:'#9CA3AF',fontSize:'8pt'}}>{(i.omschrijving||'').slice(0,90)}{i.omschrijving && i.omschrijving.length > 90 ? '...' : ''}</span></td>
                  <td><span className="badge" style={{background: statusKleur(i.status)+'22', color: statusKleur(i.status)}}>{i.status}</span></td>
                  <td style={{color:'#6B7280',fontSize:'9pt'}}>{i.impactInschatting||'n.v.t.'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Externe initiatieven en samenwerkingen</h3>
          <p>Naast interne ontwikkelingen werkt NHL Stenden actief samen met externe partners. Via SURF wordt toegang geboden tot veilige AI-infrastructuur. Via de Friese AI-propositie wordt samengewerkt aan regionale AI-toepassingen in zorg, onderwijs en industrie. Programma Bach positioneert het noorden van Nederland als motor voor digitale soevereiniteit.</p>

          <table>
            <thead><tr><th>Initiatief</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {extern.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.naam}</strong><br/><span style={{color:'#9CA3AF',fontSize:'8pt'}}>{(i.omschrijving||'').slice(0,90)}{i.omschrijving && i.omschrijving.length > 90 ? '...' : ''}</span></td>
                  <td><span className="badge" style={{background: i.type==='surf'?'#EDE9FE':'#F0FDF4', color: i.type==='surf'?'#7C3AED':'#065F46'}}>{i.type}</span></td>
                  <td><span className="badge" style={{background: statusKleur(i.status)+'22', color: statusKleur(i.status)}}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* H5 Pilots */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 5</div>
          <div className="chapter-title">Pilots</div>
          <div className="chapter-line"></div>
          <div className="lead">Pilots zijn concrete experimenten waarbij AI wordt ingezet in een afgebakende context. Ze leveren directe leerervaring op, maken duidelijk wat werkt en wat niet, en vormen de basis voor bredere implementatie.</div>

          <p>NHL Stenden kiest bewust voor een experimenterende aanpak: liever klein beginnen en leren, dan grote systemen uitrollen zonder bewijs. Elke pilot heeft een duidelijk doel, een verantwoordelijk team en een verwacht resultaat. Na afronding worden de leerpunten gedeeld met het bredere netwerk zodat andere academies en diensten ervan kunnen profiteren.</p>

          <p>Alle pilots voldoen aan de geldende privacy- en AVG-kaders. Waar nodig is een DPIA uitgevoerd en zijn verwerkersovereenkomsten afgesloten. NHL Stenden kiest voor de rol van gebruiker (niet aanbieder) van AI-systemen, waardoor een Regulatory Sandbox-aanvraag in de meeste gevallen niet noodzakelijk is.</p>

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
                {p.bronLabel && <div style={{fontSize:'8pt',color:'#1E3A8A',marginTop:'6px'}}>🔗 Meer informatie: {p.bronLabel}</div>}
              </div>
            </div>
          )) : <p style={{color:'#9CA3AF',fontStyle:'italic'}}>Op dit moment zijn nog geen pilots geregistreerd in het systeem.</p>}
        </div>

        {/* H6 NVAO */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 6</div>
          <div className="chapter-title">NHL Stenden en de NVAO</div>
          <div className="chapter-line"></div>
          <div className="lead">De NVAO vraagt van instellingen een integrale, aantoonbare aanpak van generatieve AI langs alle vier accreditatiestandaarden. NHL Stenden neemt die vraag serieus en loopt daarin voorop.</div>

          <p>In januari 2026 publiceerde de NVAO de Startverkenning Generatieve AI, een analyse van 509 opleidingsbeoordelingen. De conclusie is helder: de meeste instellingen richten zich te sterk op toetsing en fraudepreventie, en te weinig op een integrale benadering. Panels adviseren een breder perspectief: AI moet langs alle vier accreditatiestandaarden worden bezien.</p>

          <p>NHL Stenden onderschrijft dit standpunt en heeft de vier standaarden als uitgangspunt genomen voor de inrichting van het AI-beleid en de AI-netwerkorganisatie. Hieronder leest u per standaard wat de NVAO vraagt en hoe NHL Stenden daar concreet invulling aan geeft.</p>

          {NVAO.map(s => (
            <div key={s.nr} className="nvao-blok">
              <div className="nvao-header">
                <div className="nvao-nr">{s.nr}</div>
                <div>
                  <div className="nvao-titel">{s.titel}</div>
                  <div className="nvao-vraag">{s.vraag}</div>
                </div>
              </div>
              <div className="nvao-body">{s.nhl}</div>
            </div>
          ))}

          <div className="info-blok">
            <div className="info-titel">📄 Verdieping beschikbaar</div>
            <div className="info-body">De volledige NVAO-pagina met bronverwijzingen, links naar CTL-richtlijnen en concrete voorbeelden is beschikbaar op het AI-Netwerk platform: <strong>ai-netwerk-nhlstenden.netlify.app/nvao</strong>. De NVAO Startverkenning is te downloaden via nvao.net.</div>
          </div>
        </div>

        {/* H7 Netwerk */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 7</div>
          <div className="chapter-title">Het netwerk in beeld</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is geen hierarchie maar een levend ecosysteem van mensen, initiatieven en kennis. De visualisatie hieronder laat zien hoe NHL Stenden zich verhoudt tot het externe landschap en hoe de interne themas zijn georganiseerd.</div>

          <p>In het centrum staat de AI-netwerkorganisatie van NHL Stenden, aangestuurd door de Kwartiermaker Digitale Samenhang. Naar buiten toe zijn verbindingen met nationale en regionale partners: SURF voor infrastructuur en kennisdeling, NPULS voor geletterdheid en professionalisering, regionale samenwerkingspartners voor praktijkgericht onderzoek en innovatie. Naar binnen toe zijn zes themas georganiseerd die elk een eigen deel van het AI-domein bestrijken.</p>

          <div className="netwerk-box">
            <div style={{fontSize:'9pt',fontWeight:700,color:'rgba(255,255,255,0.45)',marginBottom:'14px',textTransform:'uppercase',letterSpacing:'0.12em'}}>Extern</div>
            <div className="netwerk-nodes">
              {['🤝 SURF','📚 NPULS','🌍 AI Fryslân','🏥 Frisius MC','🎓 Firda','🔬 RUG'].map(n => <div key={n} className="netwerk-node">{n}</div>)}
            </div>
            <div style={{width:'1px',height:'24px',background:'rgba(255,255,255,0.15)',margin:'0 auto'}}></div>
            <div className="netwerk-center">🤖</div>
            <div style={{fontSize:'13pt',fontWeight:800,marginBottom:'4px'}}>AI-Netwerk NHL Stenden</div>
            <div style={{fontSize:'9pt',color:'rgba(255,255,255,0.55)',marginBottom:'22px'}}>Kwartiermaker Digitale Samenhang · Transitieprogramma Digitalisering</div>
            <div style={{width:'1px',height:'24px',background:'rgba(255,255,255,0.15)',margin:'0 auto'}}></div>
            <div className="netwerk-nodes" style={{marginTop:'16px'}}>
              {THEMAS.map(t => <div key={t.titel} className="netwerk-node">{t.titel === 'AI & Leren' ? '🎓' : t.titel === 'AI & Werken' ? '⚙️' : t.titel === 'AI & Verantwoordelijkheid' ? '⚖️' : t.titel === 'AI & Geletterdheid' ? '📖' : t.titel === 'AI & Werkveld' ? '🏢' : '🔬'} {t.titel}</div>)}
            </div>
            <div style={{fontSize:'9pt',fontWeight:700,color:'rgba(255,255,255,0.45)',marginTop:'14px',textTransform:'uppercase',letterSpacing:'0.12em'}}>Intern</div>
          </div>
        </div>

        {/* H8 Governance */}
        <div className="section page-break">
          <div className="chapter-label">Hoofdstuk 8</div>
          <div className="chapter-title">Governance en organisatie</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is geen project dat ooit klaar is. Het is een continue organisatievorm die meegroeit met de instelling, de technologie en de samenleving.</div>

          <h3>Besturingsstructuur</h3>
          <p>De <strong>Stuurgroep Digitalisering</strong> vormt het bestuurlijke kader. De stuurgroep stelt de kaders, bewaakt de voortgang en neemt besluiten over richting en middelen. De <strong>Kwartiermaker Digitale Samenhang</strong> is de dagelijkse aansturing van het AI-Netwerk en rapporteert aan de stuurgroep. Het <strong>kernteam AI-Netwerk</strong> bestaat uit de Kwartiermaker, een Informatiemanager en een ICT Analist, en heeft de operationele verantwoordelijkheid voor het platform en de netwerkorganisatie. Daaronder functioneert een laag van <strong>techniek en infrastructuur</strong>: solution partners die expertise inbrengen op AVG, API-koppelingen en het AI-applicatielandschap.</p>

          <div className="card-grid" style={{marginBottom:'24px'}}>
            <div className="card card-dark"><div className="card-title">Stuurgroep Digitalisering</div><div className="card-body">Bestuurlijke opdrachtgever. Stelt kaders, bewaakt voortgang, neemt besluiten over richting en middelen. Rapportage elk kwartaal.</div></div>
            <div className="card"><div className="card-title">Kwartiermaker Digitale Samenhang</div><div className="card-body">Dagelijkse aansturing van het AI-Netwerk. Verbindt strategie en uitvoering. Rapporteert aan de stuurgroep en is extern aanspreekpunt.</div></div>
            <div className="card"><div className="card-title">Kernteam AI-Netwerk</div><div className="card-body">Kwartiermaker, Informatiemanager en ICT Analist. Operationele verantwoordelijkheid voor het platform en de netwerkorganisatie.</div></div>
            <div className="card"><div className="card-title">Techniek en Infrastructuur</div><div className="card-body">Solution partners voor veilige AI-integratie. Expertise op AVG, API-koppelingen, security en het AI-applicatielandschap.</div></div>
          </div>

          <h3>Thema-verantwoordelijkheden</h3>
          <p>Per thema wordt een trekker aangesteld die verantwoordelijk is voor de agenda, de initiatieven en de verbinding met de rest van het netwerk. De trekkers rapporteren via het maandelijkse kernteam-overleg en zijn aanspreekpunt voor mensen die zich willen aansluiten bij een thema.</p>

          {THEMAS.map(t => (
            <div key={t.titel} className="gov-row">
              <div className="gov-thema" style={{background: t.kleur}}>
                {t.titel === 'AI & Leren' ? '🎓' : t.titel === 'AI & Werken' ? '⚙️' : t.titel === 'AI & Verantwoordelijkheid' ? '⚖️' : t.titel === 'AI & Geletterdheid' ? '📖' : t.titel === 'AI & Werkveld' ? '🏢' : '🔬'} {t.titel}
              </div>
              <div className="gov-body">
                <strong>Trekker:</strong> Wordt ingevuld &nbsp;·&nbsp; <strong>Overleg:</strong> Maandelijks AI-Netwerk overleg &nbsp;·&nbsp; <strong>Verantwoording:</strong> Stuurgroep Digitalisering
              </div>
            </div>
          ))}

          <div className="success-blok">
            <div style={{fontWeight:700,color:'#065F46',marginBottom:'8px'}}>🔄 Overlegstructuur</div>
            <div style={{fontSize:'9.5pt',color:'#374151',lineHeight:'1.7'}}>
              <strong>Maandelijks:</strong> AI-Netwerk kernteam overleg: voortgang, nieuwe initiatieven, knelpunten en besluiten op operationeel niveau.<br/>
              <strong>Kwartaal:</strong> Update stuurgroep: rapportage over voortgang, besluiten over richting en middelen, bijsturing waar nodig.<br/>
              <strong>Jaarlijks:</strong> Evaluatie en herijking: doelstellingen, themas, governance en aansluiting op externe ontwikkelingen.<br/>
              <strong>Continu:</strong> Platform-updates: het AI-Netwerk platform wordt dagelijks bijgehouden en geeft altijd de meest actuele stand van zaken.
            </div>
          </div>
        </div>

        {/* Inzichten */}
        {inspiraties.length > 0 && (
          <div className="section page-break">
            <div className="chapter-label">Hoofdstuk 9</div>
            <div className="chapter-title">Inzichten en beweging</div>
            <div className="chapter-line"></div>
            <div className="lead">Het AI-Netwerk haalt ook buiten de muren van NHL Stenden inzichten op. Onderstaande items geven een beeld van wat medewerkers, docenten en studenten delen en relevant vinden voor de NHL Stenden context.</div>

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

        {/* Afsluiting */}
        <div className="section page-break">
          <div className="chapter-label">Afsluiting</div>
          <div className="chapter-title">Vooruitkijken</div>
          <div className="chapter-line"></div>
          <div className="lead">Het AI-Netwerk is geen eindpunt maar een vertrekpunt. De echte waarde ontstaat wanneer mensen ermee werken, er op voortbouwen en er eigenaarschap bij ervaren.</div>

          <p>NHL Stenden staat voor de opgave om AI betekenisvol te integreren in het onderwijs, het onderzoek en de organisatie. Dat vraagt om meer dan technologie: het vraagt om cultuur, vaardigheden, governance en vertrouwen. Het AI-Netwerk is het instrument om die opgave te ondersteunen.</p>

          <p>De komende periode richt zich op het verder uitbouwen van de zes themas, het aanstellen van trekkers per thema, het ontsluiten van meer initiatieven en het verdiepen van de verbinding met accreditatie en bestuurlijke verantwoording. Nieuwe pilots worden opgezet, bestaande pilots worden geëvalueerd en de leerpunten worden gedeeld.</p>

          <p>Dit rapport is automatisch gegenereerd op {DATUM()} en geeft de meest actuele stand van zaken weer. Voor de meest recente versie en aanvullende informatie verwijzen wij naar het AI-Netwerk platform.</p>

          <div className="afsluiting-box">
            <div style={{fontSize:'28pt',marginBottom:'14px'}}>🤖</div>
            <div style={{fontSize:'16pt',fontWeight:800,marginBottom:'6px'}}>AI-Netwerk NHL Stenden</div>
            <div style={{color:'rgba(255,255,255,0.65)',fontSize:'10pt',marginBottom:'16px'}}>ai-netwerk-nhlstenden.netlify.app</div>
            <div style={{color:'rgba(255,255,255,0.45)',fontSize:'8.5pt'}}>Dit rapport is automatisch gegenereerd op {DATUM()} vanuit de live data van het AI-Netwerk platform van NHL Stenden Hogeschool.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="rapport-footer">
          <div>
            <div className="footer-logo">AI-Netwerk NHL Stenden</div>
            <div className="footer-sub">Transitieprogramma Digitalisering · {DATUM()}</div>
          </div>
          <div style={{textAlign:'right',color:'rgba(255,255,255,0.35)',fontSize:'7.5pt'}}>
            Live gegenereerd vanuit platform data<br/>
            ai-netwerk-nhlstenden.netlify.app
          </div>
        </div>

      </div>
    </>
  )
}
