import { useState } from 'react'
import { sporen } from '../data'

export default function Sporen() {
  const [actief, setActief] = useState(null)

  return (
    <section id="sporen" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-nhl-oranje font-semibold text-sm uppercase tracking-wider">Vier ingangen</span>
          <h2 className="text-3xl font-bold text-nhl-blauw mt-2 mb-4">De vier sporen</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Iedereen heeft een eigen ingang tot de AI-HUB. Kies het spoor dat het beste bij jouw 
            vraagstuk past: of verken ze allemaal. Ze zijn met elkaar verweven.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sporen.map((spoor) => (
            <button
              key={spoor.id}
              onClick={() => setActief(actief === spoor.id ? null : spoor.id)}
              className={`text-left rounded-2xl p-6 transition-all duration-200 border-2 ${
                actief === spoor.id
                  ? `${spoor.kleur} ${spoor.tekstKleur} border-transparent shadow-xl scale-105`
                  : `bg-white border-gray-200 hover:border-gray-300 hover:shadow-md`
              }`}
            >
              <div className="text-3xl mb-3">{spoor.icon}</div>
              <div className={`font-bold text-lg mb-2 ${actief === spoor.id ? 'text-white' : 'text-nhl-blauw'}`}>
                {spoor.titel}
              </div>
              <div className={`text-sm leading-relaxed ${actief === spoor.id ? 'text-white/90' : 'text-gray-600'}`}>
                {spoor.kort}
              </div>
              <div className={`mt-4 text-xs font-medium ${actief === spoor.id ? 'text-white/70' : 'text-nhl-oranje'}`}>
                {actief === spoor.id ? 'Klik om te sluiten ↑' : 'Meer lezen →'}
              </div>
            </button>
          ))}
        </div>

        {/* Uitklap detail */}
        {actief && (() => {
          const spoor = sporen.find(s => s.id === actief)
          return (
            <div className={`rounded-2xl p-8 ${spoor.kleur} text-white transition-all duration-300`}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl mb-3">{spoor.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{spoor.titel}</h3>
                  <p className="text-white/90 leading-relaxed">{spoor.waarom}</p>
                </div>
                <div>
                  <div className="font-semibold mb-3 text-white/80 uppercase text-xs tracking-wider">Thema's in dit spoor</div>
                  <div className="grid grid-cols-2 gap-2">
                    {spoor.themas.map(thema => (
                      <div key={thema} className="bg-white/15 rounded-lg px-3 py-2 text-sm">
                        {thema}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#initiatieven"
                    className="inline-block mt-6 bg-white text-nhl-blauw hover:bg-blue-50 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Bekijk initiatieven in dit spoor →
                  </a>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Spoor 4 basis uitleg */}
        <div className="mt-10 bg-nhl-grijs-licht rounded-2xl p-6 border-l-4 border-nhl-blauw-light">
          <div className="flex gap-4 items-start">
            <div className="text-2xl">📖</div>
            <div>
              <div className="font-bold text-nhl-blauw mb-1">AI-Geletterdheid is de basis onder alles</div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Geen enkel spoor werkt zonder mensen die begrijpen wat AI is en wat het van hen vraagt. 
                Geletterdheid is geen eenmalige training maar een doorlopend fundament: voors, 
                docenten, studenten en medewerkers. Aansluiting bij{' '}
                <a href="https://npuls.nl/onderwerpen/digitale-geletterdheid" target="_blank" rel="noopener noreferrer" className="text-nhl-teal underline">
                  NPULS Digitale Geletterdheid
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
