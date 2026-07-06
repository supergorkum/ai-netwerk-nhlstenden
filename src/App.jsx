import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Start from './pages/Start'
import Themas from './pages/Themas'
import Fundament from './pages/Fundament'
import Netwerk from './pages/Netwerk'
import Initiatieven from './pages/Initiatieven'
import Pilots from './pages/Pilots'
import Documentatie from './pages/Documentatie'
import Video from './pages/Video'
import Evenementen from './pages/Evenementen'
import Linkjes from './pages/Linkjes'
import Meld from './pages/Meld'
import Over from './pages/Over'
import Beheer from './pages/Beheer'
import Geletterdheid from './pages/Geletterdheid'
import Beleid from './pages/Beleid'
import NVAO from './pages/NVAO'
import Rapport from './pages/Rapport'
import Governance from './pages/Governance'
import Kader from './pages/Kader'
import AgenticAI from './pages/AgenticAI'
import Dashboard from './pages/Dashboard'
import WatLeverHetOp from './pages/WatLeverHetOp'
import {
  INIT_VIDEOS, INIT_PILOTS, INIT_DOCS,
  INIT_EVENEMENTEN, INIT_LINKJES, INIT_INSPIRATIES
} from './initialData'

const PAGINA_LABELS = {
  '/': 'Start', '/themas': "Thema's", '/netwerk': 'Netwerk',
  '/fundament': 'Fundament', '/initiatieven': 'Initiatieven',
  '/pilots': 'Pilots', '/evenementen': 'Evenementen',
  '/documentatie': 'Documentatie', '/video': "Video's",
  '/linkjes': 'Bronnen', '/meld': 'Vraag of idee',
  '/over': 'Over', '/beheer': 'Beheer',
  '/geletterdheid': 'AI & Geletterdheid', '/beleid': 'Beleid',
  '/governance': 'AI-Governance', '/kader': 'Kader',
  '/agentic-ai': 'Agentic AI', '/dashboard': 'Dashboard',
}

function PageTracker() {
  const location = useLocation()
  useEffect(() => {
    if (location.pathname === '/beheer') return
    const nu = new Date()
    const bezoek = {
      pad: location.pathname,
      label: PAGINA_LABELS[location.pathname] || location.pathname,
      datum: nu.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
      uur: nu.getHours(),
      tijdstip: nu.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      ts: Date.now(),
    }
    fetch('/.netlify/functions/log-bezoek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bezoek),
    }).catch(() => {})
  }, [location.pathname])
  return null
}

const INIT_ROADMAP = [
  {
    id: 1, titel: 'AI & Geletterdheid basistraining voor alle medewerkers',
    omschrijving: 'Verplichte introductiecursus AI voor alle NHL Stenden medewerkers en docenten. Wat is AI, hoe werkt het, wat mag wel en niet?',
    status: 'lopend', prioriteit: 'hoog', verantwoordelijke: 'HR & OO&I',
    aiActKoppeling: 'aa1', datum: 'Q3 2026', toegevoegdDoor: 'Kernteam AI-Netwerk',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 2, titel: 'Inventarisatie hoog-risico AI-systemen',
    omschrijving: 'Welke AI-systemen die we gebruiken vallen onder de "hoog-risico" categorie van de AI Act? ProctorExam en mogelijke profileringssystemen als eerste te onderzoeken.',
    status: 'te-starten', prioriteit: 'hoog', verantwoordelijke: 'AI Compliance Groep',
    aiActKoppeling: 'aa2', datum: 'Q4 2026', toegevoegdDoor: 'Kernteam AI-Netwerk',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 3, titel: 'Beleidskader generatieve AI voor studenten',
    omschrijving: 'Helder beleid over wat studenten wel en niet mogen met AI bij opdrachten en toetsing. Inclusief transparantieverplichting conform AI Act art. 50.',
    status: 'te-starten', prioriteit: 'hoog', verantwoordelijke: 'OO&I',
    aiActKoppeling: 'aa4', datum: 'Q3 2026', toegevoegdDoor: 'Kernteam AI-Netwerk',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 4, titel: 'AI-desk operationeel',
    omschrijving: 'Centraal loket voor medewerkers die AI willen inzetten. Toetst of het systeem veilig, AVG-compliant en AI Act-conform is voordat breed gebruik wordt toegestaan.',
    status: 'in-ontwikkeling', prioriteit: 'hoog', verantwoordelijke: 'Prog. Digitale Transitie',
    aiActKoppeling: 'aa5', datum: 'Q4 2026', toegevoegdDoor: 'Kernteam AI-Netwerk',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 5, titel: 'Toetsen menselijk toezicht ProctorExam',
    omschrijving: 'Nagaan of onze inzet van ProctorExam voldoet aan de AI Act-eisen voor menselijk toezicht, transparantie naar studenten en dataminimalisatie.',
    status: 'te-starten', prioriteit: 'hoog', verantwoordelijke: 'DLWO & Academies',
    aiActKoppeling: 'aa3', datum: 'Q1 2027', toegevoegdDoor: 'AI Compliance Groep',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 6, titel: 'AMCE AI-Proeftuin: academiebreed pilotprogramma',
    omschrijving: 'De Academie Media, Commerce & Entrepreneurship start een pilotprogramma als proeftuin voor NHL Stenden. Vier werkpakketten worden parallel uitgevoerd: data- en workflow-AI, RAG-agents voor kennisdeling, visuele prototyping en evaluatie van agentic workflows. De pilot loopt van september 2026 tot 1 januari 2027 en levert een advies op over opschaling, governance en kostenmodel voor de hele hogeschool.',
    status: 'in-ontwikkeling', prioriteit: 'hoog', verantwoordelijke: 'AMCE: Patrick Bemelmans, Alette Hospers, Frits van Essen',
    aiActKoppeling: 'aa1', datum: 'Q3 2026: Q1 2027', toegevoegdDoor: 'AMCE NHL Stenden',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 7, titel: 'WP1: Data- en workflow-AI in marketingonderwijs',
    omschrijving: 'Studenten en docenten verkennen hoe AI databronnen zoals GA4, SEO-data, CRM en API’s op een gecontroleerde manier kan verbinden via Gemini CLI en MCP-servers. Focus op data-informed werken, kritisch beoordelen van datakwaliteit en bias, en het ontwerpen van veilige AI-workflows voor analyse, rapportage en advies.',
    status: 'te-starten', prioriteit: 'gemiddeld', verantwoordelijke: 'AMCE: Patrick Bemelmans',
    aiActKoppeling: 'aa1', datum: 'Q3 2026', toegevoegdDoor: 'AMCE NHL Stenden',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 8, titel: 'WP2: RAG-agents voor onderwijs en kennisdeling',
    omschrijving: 'Ontwikkelen van RAG-gestuurde AI-agents gevoed met gevalideerde academiedocumenten: OER, rubrics, beroepsprofielen, projectdocumentatie. De agent ondersteunt docenten bij curriculumontwikkeling, studenten bij oriëntatie en uitleg, en nieuwe docenten bij het vinden van academie-informatie. Menselijk toezicht is altijd verplicht: de agent ondersteunt maar neemt geen formele beslissingen over.',
    status: 'te-starten', prioriteit: 'hoog', verantwoordelijke: 'AMCE: Alette Hospers',
    aiActKoppeling: 'aa2', datum: 'Q3 2026', toegevoegdDoor: 'AMCE NHL Stenden',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 9, titel: 'WP3: Visuele AI-prototyping in Ad-ontwikkeling',
    omschrijving: 'Verkennen hoe beeldgeneratie-AI kan bijdragen aan sneller ontwerpen en presenteren van ideeën binnen Associate degree-opleidingen. Studenten leren van idee naar prototype te komen voor campagneconcepten, social formats, merkidentiteit en retail-visualisaties. Kritisch beoordelen van AI-beeld op kwaliteit, inclusie, stereotypering en auteursrecht is expliciet onderdeel van het didactisch format.',
    status: 'te-starten', prioriteit: 'gemiddeld', verantwoordelijke: 'AMCE: Frits van Essen',
    aiActKoppeling: 'aa4', datum: 'Q3 2026', toegevoegdDoor: 'AMCE NHL Stenden',
    pendingAfgerond: false, pendingReopen: false,
  },
  {
    id: 10, titel: 'WP4: Evaluatie agentic workflows: Claude vs Copilot',
    omschrijving: 'Vergelijkend onderzoek naar agentic AI-workflows: welke taken passen bij Microsoft Copilot (Microsoft 365-integratie, dagelijkse productiviteit) en welke bij Claude (complexer redeneren, documentanalyse, taakopdeling, iteratief samenwerken)? De evaluatie levert een helder advies op voor verantwoorde inzet van agentic AI in onderwijsontwikkeling en praktijkgerichte leeromgevingen.',
    status: 'te-starten', prioriteit: 'hoog', verantwoordelijke: 'AMCE: Patrick Bemelmans',
    aiActKoppeling: 'aa5', datum: 'Q4 2026', toegevoegdDoor: 'AMCE NHL Stenden',
    pendingAfgerond: false, pendingReopen: false,
  },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const LOGIN_CODE = 'Geheim'

function LoginScherm({ onLogin }) {
  const [input, setInput] = useState('')
  const [fout, setFout] = useState(false)

  function probeer() {
    if (input === LOGIN_CODE) {
      sessionStorage.setItem('ainetwerk_auth', 'ok')
      onLogin()
    } else {
      setFout(true)
      setInput('')
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{ fontFamily:"Inter, system-ui, sans-serif", background:"linear-gradient(160deg, #0F1E52 0%, #162D6E 40%, #1E3A8A 70%, #2563EB 100%)" }}>

      {/* Decoratieve cirkels */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", top:40, right:0, width:240, height:240, border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", bottom:-60, left:-80, width:360, height:360, border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", top:"40%", left:"30%", width:140, height:140, border:"1px solid rgba(255,255,255,0.05)", borderRadius:"50%" }}/>
      </div>

      {/* Login kaart */}
      <div className="relative w-full mx-4" style={{ maxWidth:400, zIndex:10 }}>

        {/* Logo boven het kaartje */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="/nhl-logo-transparent.png"
            alt="NHL Stenden"
            style={{ height:48, width:48, objectFit:"contain" }}
          />
          <div style={{ width:1, height:40, background:"rgba(255,255,255,0.25)" }}/>
          <div>
            <p style={{ fontWeight:800, color:"white", fontSize:16, letterSpacing:"0.01em" }}>AI-Netwerk NHL Stenden</p>
            <p style={{ fontSize:12, color:"#bfdbfe" }}>Transitieprogramma Digitalisering</p>
          </div>
        </div>

        {/* Wit kaartje */}
        <div className="bg-white overflow-hidden" style={{ borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

          {/* Roze accent balk bovenaan */}
          <div style={{ height:4, background:"linear-gradient(90deg, #E91E8C 0%, #F472B6 100%)" }}/>

          <div className="px-8 py-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
              style={{ background:"#EFF6FF", border:"1px solid #DBEAFE" }}>
              <span style={{ fontSize:14 }}>🔒</span>
              <span className="text-xs font-semibold" style={{ color:"#1E3A8A" }}>Toegang vereist</span>
            </div>

            <h2 className="font-bold mb-1" style={{ fontSize:18, color:"#162D6E" }}>Welkom</h2>
            <p className="text-sm mb-6" style={{ color:"#64748b" }}>Voer de toegangscode in om het AI-Netwerk te betreden.</p>

            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setFout(false) }}
              onKeyDown={e => e.key === 'Enter' && probeer()}
              placeholder="Toegangscode"
              autoFocus
              className="w-full px-4 py-3 text-sm focus:outline-none mb-2"
              style={{
                borderRadius:10,
                border: fout ? "2px solid #dc2626" : "2px solid #DBEAFE",
                letterSpacing:4,
                background:"#F8FAFF",
                fontSize:14,
                transition:"border-color 0.2s"
              }}
            />
            {fout && (
              <p className="text-xs mb-3 flex items-center gap-1" style={{ color:"#dc2626" }}>
                <span>⚠️</span> Toegangscode onjuist. Probeer opnieuw.
              </p>
            )}
            <button
              onClick={probeer}
              className="w-full text-white py-3 text-sm font-bold mt-2"
              style={{ background:"linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)", borderRadius:10, letterSpacing:"0.02em", boxShadow:"0 4px 12px rgba(37,99,235,0.4)" }}>
              Inloggen →
            </button>

            <p className="text-xs text-center mt-5" style={{ color:"#94a3b8" }}>
              Neem contact op met de beheerder van het AI-Netwerk voor de toegangscode.
            </p>
            <div className="mt-5 pt-4" style={{ borderTop:"1px solid #f1f5f9" }}>
              <p className="text-xs text-center leading-relaxed" style={{ color:"#cbd5e1" }}>
                🚧 <em>Werkend prototype</em>: ontwikkeld ter inspiratie en visualisatie van wat digitaal mogelijk is. Gebruik de inzichten als vertrekpunt, niet als definitieve conclusie.
              </p>
            </div>
          </div>
        </div>

        {/* Golf onder kaartje */}
        <div style={{ marginTop:-2 }}>
          <svg viewBox="0 0 400 40" fill="none" preserveAspectRatio="none"
            style={{ width:"100%", height:40, display:"block" }}>
            <path d="M0 40L400 40L400 15C360 28 300 5 240 12C180 19 120 35 60 28C30 24 10 14 0 18L0 40Z" fill="rgba(255,255,255,0.08)"/>
            <path d="M0 40L400 40L400 22C340 35 280 10 210 18C140 26 80 38 20 30L0 26L0 40Z" fill="rgba(255,255,255,0.05)"/>
          </svg>
        </div>
      </div>

      {/* Golf onderaan heel scherm */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0 }}>
        <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none"
          style={{ width:"100%", height:60, display:"block" }}>
          <path d="M0 60L1440 60L1440 20C1380 45 1280 5 1160 18C1040 31 920 55 800 48C680 41 560 12 440 22C320 32 200 52 80 42L0 36L0 60Z" fill="rgba(255,255,255,0.06)"/>
          <path d="M0 60L1440 60L1440 32C1360 52 1240 18 1100 28C960 38 840 58 700 50C560 42 440 20 300 30C160 40 80 58 0 48L0 60Z" fill="rgba(255,255,255,0.04)"/>
        </svg>
      </div>
    </div>
  )
}

function AppInner() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('ainetwerk_auth') === 'ok')
  const [berichten, setBerichten] = useState(() => {
    try {
      const opgeslagen = localStorage.getItem('aihub-berichten')
      return opgeslagen ? JSON.parse(opgeslagen) : []
    } catch { return [] }
  })

  const setBerichten_ = (fn) => {
    setBerichten(prev => {
      const nieuw = typeof fn === 'function' ? fn(prev) : fn
      try { localStorage.setItem('aihub-berichten', JSON.stringify(nieuw)) } catch {}
      return nieuw
    })
  }

  const [videos, setVideos] = useState(() => {
    try {
      const opgeslagen = localStorage.getItem('aihub-videos')
      return opgeslagen ? JSON.parse(opgeslagen) : INIT_VIDEOS
    } catch { return INIT_VIDEOS }
  })
  const [actiefVideoId, setActiefVideoId] = useState(null)

  const setVideos_ = (fn) => {
    setVideos(prev => {
      const nieuw = typeof fn === 'function' ? fn(prev) : fn
      try { localStorage.setItem('aihub-videos', JSON.stringify(nieuw)) } catch {}
      return nieuw
    })
  }

  const [pilots, setPilots] = useState(INIT_PILOTS)
  const [docs, setDocs] = useState(INIT_DOCS)
  const [evenementen, setEvenementen] = useState(INIT_EVENEMENTEN)
  const [linkjes, setLinkjes] = useState(INIT_LINKJES)
  const [inspiraties, setInspiraties] = useState(INIT_INSPIRATIES)
  const [roadmap, setRoadmap] = useState(INIT_ROADMAP)

  const location = useLocation()
  if (location.pathname === '/rapport') {
    return <Rapport pilots={pilots} inspiraties={inspiraties} />
  }

  if (!loggedIn) {
    return <LoginScherm onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Start videos={videos} pilots={pilots} evenementen={evenementen} berichten={berichten} />} />
          <Route path="/themas" element={<Themas />} />
          <Route path="/fundament" element={<Fundament />} />
          <Route path="/netwerk" element={<Netwerk />} />
          <Route path="/initiatieven" element={<Initiatieven roadmap={roadmap} setRoadmap={setRoadmap} inspiraties={inspiraties} setInspiraties={setInspiraties} />} />
          <Route path="/pilots" element={<Pilots pilots={pilots} setPilots={setPilots} />} />
          <Route path="/documentatie" element={<Documentatie docs={docs} setDocs={setDocs} />} />
          <Route path="/video" element={<Video videos={videos} setVideos={setVideos_} actiefVideoId={actiefVideoId} setActiefVideoId={setActiefVideoId} />} />
          <Route path="/evenementen" element={<Evenementen evenementen={evenementen} setEvenementen={setEvenementen} />} />
          <Route path="/linkjes" element={<Linkjes linkjes={linkjes} setLinkjes={setLinkjes} />} />
          <Route path="/meld" element={<Meld onNieuwBericht={(b) => setBerichten_(prev => [b, ...prev])} berichten={berichten} />} />
          <Route path="/inspiratie" element={<Navigate to="/initiatieven?tab=inzichten" replace />} />
          <Route path="/over" element={<Over />} />
          <Route path="/geletterdheid" element={<Geletterdheid />} />
          <Route path="/beleid" element={<Beleid />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/kader" element={<Kader />} />
          <Route path="/agentic-ai" element={<AgenticAI />} />
          <Route path="/dashboard" element={<Dashboard pilots={pilots} evenementen={evenementen} />} />
          <Route path="/wat-levert-het-op" element={<WatLeverHetOp />} />
          <Route path="/nvao" element={<NVAO />} />
          <Route path="/rapport" element={<Rapport pilots={pilots} inspiraties={inspiraties} />} />
          <Route path="/beheer" element={
            <Beheer
              berichten={berichten} setBerichten={setBerichten_}
              videos={videos} setVideos={setVideos_}
              actiefVideoId={actiefVideoId} setActiefVideoId={setActiefVideoId}
              pilots={pilots} setPilots={setPilots}
              docs={docs} setDocs={setDocs}
              inspiraties={inspiraties} setInspiraties={setInspiraties}
              roadmap={roadmap} setRoadmap={setRoadmap}
            />
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return <BrowserRouter>
      <PageTracker /><AppInner /></BrowserRouter>
}
