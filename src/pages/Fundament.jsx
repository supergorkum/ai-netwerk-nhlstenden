import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lagen, initiatieven } from '../data'
import GradientHeader from '../components/GradientHeader'

const eigenaarKleur = {
  'Alle Academies & Diensten': 'bg-blue-50 text-nhl-blauw border-blue-200',
  'Prog. Digitale Transitie': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'OO&I': 'bg-teal-50 text-teal-700 border-teal-200',
  'DLWO': 'bg-purple-50 text-purple-700 border-purple-200',
  'Facility Management': 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function Fundament() {
  const [actief, setActief] = useState(null)

  return (
    <div className="min-h-screen pt-16 bg-white">

      {/* Hero: pb verhoogd zodat tekst niet achter de golf verdwijnt */}
      <div className="nhl-gradient-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-72 h-72 border border-white rounded-full" />
          <div className="absolute -bottom-10 left-20 w-52 h-52 border border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-28 relative">
          <div className="max-w-3xl">
            <div className="section-label text-blue-300 mb-3">Het fundament</div>
            <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">Het vijflagenmodel</h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-3">
              AI is geen enkelvoudige tool, maar een <strong className="text-white">gelaagd systeem</strong>.
              Wat we ervaren als een simpele chattoepassing is slechts het topje van de ijsberg.
            </p>
            <p className="text-blue-200 leading-relaxed mb-4">
              Achter elke AI-toepassing gaan vijf lagen schuil: van energievoorziening tot eindgebruiker.
              Elke laag heeft een eigen primaire eigenaar, eigen vraagstukken en eigen verantwoordelijkheden.
              Het vijflagenmodel is het ordeningsprincipe achter het AI-Netwerk.
            </p>
            {/* Externe infra links direct in hero */}
            <div className="flex flex-wrap gap-3 mt-2">
              <a href="https://www.nijbegun.nl/projecten/ai-fabriek/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/25 text-blue-100 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                🏭 AI-Fabriek Groningen ↗
              </a>
              <a href="https://www.surf.nl/themas/artificial-intelligence/ai-fabriek" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/25 text-blue-100 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                🌐 SURF AI-Fabriek ↗
              </a>
              <a href="https://www.surf.nl/en/themes/artificial-intelligence/projects-and-collaborations/ai-hub" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/25 text-blue-100 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                🤝 SURF AI-Hub ↗
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 72" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0 72L1440 72L1440 28C1320 60 1200 8 1080 20C960 32 840 64 720 52C600 40 480 4 360 16C240 28 120 60 0 40L0 72Z" fill="white"/>
            <path d="M0 72L1440 72L1440 40C1320 68 1200 20 1080 36C960 52 840 72 720 64C600 56 480 20 360 32C240 44 120 68 0 52L0 72Z" fill="white" fillOpacity="0.5"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Kernprincipe */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="section-label mb-3">Waarom lagen?</div>
            <h2 className="text-2xl font-bold text-nhl-blauw mb-5">Eerst organiseren, dan automatiseren</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
              <p>
                Een keuze voor een AI-applicatie die je dagelijks gebruikt (laag 5) is tegelijk een keuze
                voor de energie, chips en data-infrastructuur van de leverancier (lagen 1-3). Wat we zien
                als een simpele tool heeft geopolitieke en ethische consequenties die veel dieper gaan.
              </p>
              <p>
                Door AI te ordenen in vijf lagen maken we duidelijk wie waarvoor verantwoordelijk is.
                Dat voorkomt dat dezelfde vraagstukken op tien plekken tegelijk worden opgepakt,
                en dat besluiten worden genomen zonder zicht op de consequenties voor andere lagen.
              </p>
              <p>De twee domeinen lopen als een rode draad door alle lagen:</p>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="font-bold text-nhl-blauw mb-1 text-sm">🏗️ Dienstverlening</div>
                <p className="text-blue-700 text-xs leading-relaxed">Lagen 1-4. FM, DLWO, OO&I en het Transitieprogramma leveren de randvoorwaarden waaronder de organisatie veilig, soeverein en duurzaam kan opereren.</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="font-bold text-teal-800 mb-1 text-sm">🎓 Het speelveld</div>
                <p className="text-teal-700 text-xs leading-relaxed">Laag 5. De Academies zijn verantwoordelijk voor innovatie en onderwijsvernieuwing binnen de kaders die de dienstverlening stelt.</p>
              </div>
            </div>

            {/* AI-Fabriek highlight */}
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="font-bold text-purple-800 mb-1 text-sm">🏭 AI-Fabriek Groningen</div>
              <p className="text-purple-700 text-xs leading-relaxed mb-2">
                Regionale soevereine rekenkracht voor het noorden van Nederland. Strategisch relevant als
                alternatief voor Big Tech cloud-infrastructuur, in lijn met de doelstellingen van het
                Nationaal Groeifonds (€200 miljoen investering 2025).
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="https://www.nijbegun.nl/projecten/ai-fabriek/" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-700 font-medium hover:text-purple-900 underline">nijbegun.nl ↗</a>
                <a href="https://www.surf.nl/themas/artificial-intelligence/ai-fabriek" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-700 font-medium hover:text-purple-900 underline">SURF AI-Fabriek ↗</a>
                <a href="https://www.rijksoverheid.nl/actueel/nieuws/2025/06/27/nederland-zet-in-op-200-miljoen-euro-voor-aifabriek-in-groningen" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-700 font-medium hover:text-purple-900 underline">Rijksoverheid 2025 ↗</a>
              </div>
            </div>
          </div>

          {/* Visuele stapel */}
          <div className="space-y-2">
            {lagen.map((laag, i) => (
              <button key={laag.nr} onClick={() => setActief(actief === laag.nr ? null : laag.nr)}
                className={`w-full text-left rounded-xl transition-all duration-200 border-2 overflow-hidden ${
                  actief === laag.nr ? 'border-transparent shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}>
                <div className="flex items-center gap-4 p-4" style={actief === laag.nr ? { backgroundColor: laag.kleur } : {}}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: actief === laag.nr ? 'rgba(255,255,255,0.2)' : laag.kleur }}>
                    {laag.nr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold flex items-center gap-2 ${actief === laag.nr ? 'text-white' : 'text-nhl-blauw'}`}>
                      {laag.naam}
                      {laag.urgent && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">Urgent</span>}
                    </div>
                    <div className={`text-sm mt-0.5 leading-relaxed ${actief === laag.nr ? 'text-white/80' : 'text-gray-500'}`}>
                      {laag.omschrijving}
                    </div>
                  </div>
                  <div className={`text-sm flex-shrink-0 ${actief === laag.nr ? 'text-white/60' : 'text-gray-300'}`}>
                    {actief === laag.nr ? '▲' : '▼'}
                  </div>
                </div>

                {actief === laag.nr && (
                  <div className="bg-white p-5 border-t-2" style={{ borderColor: laag.kleur }}>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Toelichting</div>
                        <p className="text-gray-600 text-sm leading-relaxed">{laag.uitleg}</p>

                        {/* Externe infra per laag */}
                        {laag.nr === 2 && (
                          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="text-xs font-semibold text-purple-700 mb-2">🏭 Relevante infrastructuur</div>
                            <div className="space-y-1">
                              <a href="https://www.nijbegun.nl/projecten/ai-fabriek/" target="_blank" rel="noopener noreferrer"
                                className="block text-xs text-purple-700 hover:underline font-medium">AI-Fabriek Groningen (nijbegun.nl) ↗</a>
                              <a href="https://www.surf.nl/themas/artificial-intelligence/ai-fabriek" target="_blank" rel="noopener noreferrer"
                                className="block text-xs text-purple-700 hover:underline font-medium">SURF AI-Fabriek ↗</a>
                              <a href="https://www.rijksoverheid.nl/actueel/nieuws/2025/06/27/nederland-zet-in-op-200-miljoen-euro-voor-aifabriek-in-groningen" target="_blank" rel="noopener noreferrer"
                                className="block text-xs text-purple-700 hover:underline font-medium">Rijksoverheid: €200M AI-Fabriek 2025 ↗</a>
                            </div>
                          </div>
                        )}
                        {laag.nr === 3 && (
                          <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-3">
                            <div className="text-xs font-semibold text-teal-700 mb-2">🤝 SURF AI-Hub onderdelen</div>
                            <div className="space-y-1">
                              <a href="https://www.surf.nl/en/themes/artificial-intelligence/projects-and-collaborations/ai-hub" target="_blank" rel="noopener noreferrer"
                                className="block text-xs text-teal-700 hover:underline font-medium">SURF AI-Hub (overzicht projecten) ↗</a>
                              <a href="https://gptnl.nl" target="_blank" rel="noopener noreferrer"
                                className="block text-xs text-teal-700 hover:underline font-medium">GPT-NL: soeverein Nederlands taalmodel ↗</a>
                            </div>
                          </div>
                        )}

                        {/* Initiatieven op deze laag */}
                        {(() => {
                          const laagInit = initiatieven.filter(i => i.laag === laag.nr)
                          if (!laagInit.length) return null
                          return (
                            <div className="mt-4">
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Initiatieven op deze laag</div>
                              <div className="flex flex-wrap gap-2">
                                {laagInit.map(i => (
                                  <Link key={i.id} to="/initiatieven"
                                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium transition-colors hover:opacity-80"
                                    style={{ borderColor: laag.kleur, color: laag.kleur, backgroundColor: `${laag.kleur}15` }}>
                                    <span>{i.type === 'surf' ? '🌐' : i.type === 'extern' ? '🤝' : '🏫'}</span>
                                    {i.naam}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primaire eigenaar</div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${eigenaarKleur[laag.eigenaar] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {laag.eigenaar}
                        </div>
                        <div className="mt-4">
                          <Link to="/initiatieven" onClick={e => e.stopPropagation()}
                            className="text-xs font-medium hover:underline" style={{ color: laag.kleur }}>
                            Alle initiatieven op laag {laag.nr} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Principe banner */}
        <div className="bg-nhl-blauw rounded-2xl p-8 mb-16 text-center">
          <div className="text-3xl mb-4">🧭</div>
          <blockquote className="text-white text-xl font-medium italic leading-relaxed max-w-3xl mx-auto mb-2">
            "Wie nu kiest op welke lagen hij wil sturen, bouwt aan een digitale omgeving die over vijf jaar nog steeds de eigen waarden dient."
          </blockquote>
          <div className="text-blue-300 text-sm">Wie nu niet kiest, wordt gekozen door de markt.</div>
        </div>

        {/* Twee domeinen */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="section-label mb-2">Twee domeinen</div>
            <h2 className="text-2xl font-bold text-nhl-blauw mb-3">Fundament en speelveld</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">
              Het vijflagenmodel kent twee domeinen van verantwoordelijkheid die door alle lagen heen lopen.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-8 border-t-4 border-nhl-blauw">
              <div className="text-3xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-nhl-blauw mb-2">Dienstverlening: het fundament</h3>
              <div className="text-sm text-gray-400 mb-4 font-medium">Lagen 1 t/m 4 · Eigenaren: FM, DLWO, OO&I, Prog. Digitale Transitie</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                De dienstverlening levert de randvoorwaarden waaronder de organisatie veilig, soeverein
                en duurzaam kan opereren. Zonder een stabiel fundament kan het speelveld niet functioneren.
              </p>
              <ul className="space-y-2">
                {['Energie en fysieke infrastructuur op orde', 'Voldoende en soevereine rekenkracht (AI-Fabriek Groningen)', 'Betrouwbare data-architectuur en AI-modellen (SURF, GPT-NL)', 'Governance over platforms en applicaties'].map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-nhl-blauw flex-shrink-0 mt-1.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-8 border-t-4 border-nhl-roze">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-nhl-blauw mb-2">Het onderwijs: het speelveld</h3>
              <div className="text-sm text-gray-400 mb-4 font-medium">Laag 5 · Eigenaar: Alle Academies & Diensten</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                De Academies zijn verantwoordelijk voor innovatie en onderwijsvernieuwing binnen de kaders
                die de dienstverlening stelt. Het speelveld gedijt het best als het fundament solide is.
              </p>
              <ul className="space-y-2">
                {['AI integreren in curriculum en didactiek', 'Studenten voorbereiden op de AI-arbeidsmarkt', 'Experimenteren met AI in begeleiding', 'Onderzoek naar AI in het onderwijs'].map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-nhl-roze flex-shrink-0 mt-1.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Eigenaarstabel */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="section-label mb-2">Eigenaarschap</div>
            <h2 className="text-2xl font-bold text-nhl-blauw mb-3">Wie is waarvoor verantwoordelijk?</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-nhl-blauw text-white">
                  <th className="text-left px-4 py-3 rounded-tl-xl font-semibold">Laag</th>
                  <th className="text-left px-4 py-3 font-semibold">Naam</th>
                  <th className="text-left px-4 py-3 font-semibold">Primaire eigenaar</th>
                  <th className="text-left px-4 py-3 rounded-tr-xl font-semibold">Kernvraagstuk</th>
                </tr>
              </thead>
              <tbody>
                {lagen.map((laag, i) => (
                  <tr key={laag.nr} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: laag.kleur }}>
                        {laag.nr}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-nhl-blauw">{laag.naam}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${eigenaarKleur[laag.eigenaar] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {laag.eigenaar}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs leading-relaxed">{laag.omschrijving}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI-Koers document */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="section-label mb-2">AI-Koers 2026 tot 2030</div>
            <h2 className="text-2xl font-bold text-nhl-blauw mb-3">Slimmer leren, sterker werken en verantwoord innoveren</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">Het volledige koersdocument, de bijbehorende presentatie en de poster in één overzicht.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid sm:grid-cols-2">
            <div className="bg-nhl-blauw/5 flex items-center justify-center p-6">
              <img src="/ai-koers/NHL-Stenden-AI-Koers-Poster-A2-preview.png" alt="NHL Stenden AI-Koers poster"
                className="rounded-xl shadow-md max-h-96 object-contain" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Zes koerslijnen, één richting: hoe NHL Stenden AI inzet voor leren, werken en onderzoek, verantwoord en met de student als maatstaf.
              </p>
              <div className="space-y-3">
                <a href="/ai-koers/NHL-Stenden-AI-Koers-v0_4-concept-restyle.html" target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-nhl-blauw hover:bg-nhl-blauw/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  📖 Bekijk het volledige document
                </a>
                <a href="/ai-koers/NHL-Stenden-AI-Koers-presentatie.pptx" download
                  className="w-full flex items-center justify-center gap-2 bg-white border border-nhl-blauw text-nhl-blauw hover:bg-blue-50 font-semibold py-3 rounded-xl text-sm transition-colors">
                  📊 Download presentatie (.pptx)
                </a>
                <a href="/ai-koers/NHL-Stenden-AI-Koers-Poster-A2-preview.png" download
                  className="w-full flex items-center justify-center gap-2 bg-white border border-nhl-blauw text-nhl-blauw hover:bg-blue-50 font-semibold py-3 rounded-xl text-sm transition-colors">
                  🖼️ Download poster (A2)
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-4">Concept v0.4, juli 2026</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/themas', icon: '🎯', titel: "AI Thema's", tekst: 'Hoe vertalen de lagen zich naar herkenbare thema\'s?' },
            { to: '/netwerk', icon: '🕸️', titel: 'Het AI-Netwerk', tekst: 'Wie is er actief op welke laag binnen NHL Stenden?' },
            { to: '/initiatieven', icon: '🚀', titel: 'Initiatieven', tekst: 'Welke initiatieven lopen op welke laag?' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="card card-hover p-5 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-nhl-blauw mb-1">{item.titel}</div>
              <div className="text-gray-500 text-sm">{item.tekst}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
