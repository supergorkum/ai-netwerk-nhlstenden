import { NavLink } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'

const navGroepen = [
  { label: 'Verkennen', items: [
    { label: 'Fundament', to: '/fundament', icon: '🏛️' },
    { label: 'Netwerk', to: '/netwerk', icon: '🕸️' },
    { label: "Thema's", to: '/themas', icon: '🎯' },
    { label: 'Wat levert het op?', to: '/wat-levert-het-op', icon: '✨' },
  ]},
  { label: 'Aan de slag', items: [
    { label: 'Evenementen', to: '/evenementen', icon: '📅' },
    { label: 'Initiatieven', to: '/initiatieven', icon: '🚀' },
    { label: 'Pilots', to: '/pilots', icon: '🧪' },
    { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  ]},
  { label: 'Kennis', items: [
    { label: 'AI & Geletterdheid', to: '/geletterdheid', icon: '📖' },
    { label: 'Bronnen', to: '/linkjes', icon: '🔗' },
    { label: 'Agentic AI', to: '/agentic-ai', icon: '🧩' },
  ]},
  { label: 'Beleid', items: [
    { label: 'AI Act & Compliance', to: '/initiatieven?tab=aiact', icon: '⚖️' },
    { label: 'AI-Governance', to: '/governance', icon: '🏛️' },
    { label: 'Beleid & Kaders', to: '/beleid', icon: '📋' },
    { label: 'Roadmap', to: '/initiatieven?tab=roadmap', icon: '🗺️' },
  ]},
]

// Gedeelde activeGroep state in parent zodat slechts één dropdown tegelijk open is
function DropdownGroep({ groep, activeGroep, setActiveGroep }) {
  const t = useRef(null)
  const isOpen = activeGroep === groep.label

  const enter = useCallback(() => {
    if (t.current) clearTimeout(t.current)
    setActiveGroep(groep.label)
  }, [groep.label, setActiveGroep])

  const leave = useCallback(() => {
    // Langere delay (300ms) zodat muisbeweging tussen items soepel gaat
    t.current = setTimeout(() => {
      setActiveGroep(prev => prev === groep.label ? null : prev)
    }, 300)
  }, [groep.label, setActiveGroep])

  const cancelLeave = useCallback(() => {
    if (t.current) clearTimeout(t.current)
  }, [])

  return (
    <div className="relative h-16 flex items-center" onMouseEnter={enter} onMouseLeave={leave}>
      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isOpen ? 'bg-white/20 text-white' : 'text-blue-100 hover:text-white hover:bg-white/10'}`}>
        {groep.label}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-52 z-50"
          style={{marginTop:'-1px'}}
          onMouseEnter={cancelLeave}
          onMouseLeave={leave}
        >
          {groep.items.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setActiveGroep(null)}
              className={({isActive}) => `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-nhl-blauw font-semibold bg-blue-50' : 'text-gray-700 hover:bg-gray-50 hover:text-nhl-blauw'}`}>
              <span className="w-5 text-center">{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Nav() {
  const [mob, setMob] = useState(false)
  const [mobGroep, setMobGroep] = useState(null)
  // Gedeelde state: slechts één dropdown tegelijk
  const [activeGroep, setActiveGroep] = useState(null)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{backgroundColor:'#1E3A8A'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <NavLink to="/" className="flex items-center gap-2.5">
              <img
                src="/nhl-logo-transparent.png"
                alt="NHL Stenden"
                style={{height:36, width:36, objectFit:'contain', display:'block'}}
              />
              <div className="border-l border-white/25 pl-2.5">
                <div className="text-white font-bold text-sm leading-tight">AI-Netwerk</div>
                <div className="text-blue-200 text-xs leading-tight">NHL Stenden</div>
              </div>
            </NavLink>
            <NavLink to="/" className={({isActive}) => `flex items-center gap-1 ml-3 pl-3 border-l border-white/20 py-2 text-xs font-semibold transition-colors ${isActive ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
              🏠 Start
            </NavLink>
          </div>
          <div className="hidden lg:flex items-center h-16 gap-0.5">
            {navGroepen.map(g => (
              <DropdownGroep
                key={g.label}
                groep={g}
                activeGroep={activeGroep}
                setActiveGroep={setActiveGroep}
              />
            ))}
            <NavLink to="/ai-koers" className={({isActive}) => `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isActive ? 'bg-nhl-roze text-white' : 'text-white bg-nhl-roze/80 hover:bg-nhl-roze'}`}>🎤 AI Koers</NavLink>
            <NavLink to="/over" className={({isActive}) => `flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:text-white hover:bg-white/10'}`}>Over</NavLink>
            <div className="w-px h-5 bg-white/20 mx-2"/>
            <NavLink to="/meld" className="flex items-center gap-1.5 bg-nhl-roze hover:bg-nhl-roze-dark text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap">+ Vraag of idee</NavLink>
          </div>
          <button onClick={() => setMob(!mob)} className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10">
            <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all origin-center ${mob ? 'rotate-45 translate-y-2' : ''}`}/>
            <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all ${mob ? 'opacity-0' : ''}`}/>
            <div className={`w-5 h-0.5 bg-white transition-all origin-center ${mob ? '-rotate-45 -translate-y-2' : ''}`}/>
          </button>
        </div>
        {mob && (
          <div className="lg:hidden border-t border-white/20 py-4">
            <NavLink to="/" onClick={() => setMob(false)} className="block px-3 py-2.5 text-sm font-semibold text-blue-100 hover:text-white mb-1">🏠 Start</NavLink>
            {navGroepen.map(g => (
              <div key={g.label}>
                <button onClick={() => setMobGroep(mobGroep === g.label ? null : g.label)} className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-blue-300 uppercase tracking-widest hover:text-white">
                  {g.label}
                  <svg className={`w-3.5 h-3.5 transition-transform ${mobGroep === g.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {mobGroep === g.label && (
                  <div className="ml-3 mb-2 space-y-0.5">
                    {g.items.map(item => (
                      <NavLink key={item.to} to={item.to} onClick={() => {setMob(false); setMobGroep(null)}}
                        className={({isActive}) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/20 text-white font-medium' : 'text-blue-100 hover:text-white hover:bg-white/10'}`}>
                        <span>{item.icon}</span><span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <NavLink to="/ai-koers" onClick={() => setMob(false)} className={({isActive}) => `flex items-center gap-2 mx-3 mb-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-nhl-roze text-white' : 'bg-nhl-roze/80 text-white'}`}>🎤 AI Koers</NavLink>
            <NavLink to="/over" onClick={() => setMob(false)} className={({isActive}) => `block px-3 py-2.5 text-sm transition-colors ${isActive ? 'text-white font-medium' : 'text-blue-100 hover:text-white'}`}>Over het Netwerk</NavLink>
            <NavLink to="/meld" onClick={() => setMob(false)} className="flex items-center gap-2 mx-3 mt-3 px-4 py-2.5 rounded-xl text-sm bg-nhl-roze text-white font-bold">+ Vraag of idee</NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
