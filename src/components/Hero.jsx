import { APP_VERSIE, APP_VERSIE_DATUM } from '../data'

export default function Hero() {
  return (
    <section className="nhl-gradient pt-16 min-h-[92vh] flex items-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 border border-white rounded-full" />
        <div className="absolute top-32 right-32 w-64 h-64 border border-white rounded-full" />
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 border border-white rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: tekst */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-sm px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-nhl-oranje rounded-full pulse-soft" />
              In ontwikkeling: {APP_VERSIE} | {APP_VERSIE_DATUM}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              AI-Netwerk
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-blue-200 mt-2">
                NHL Stenden
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-8 max-w-xl">
              De plek waar NHL Stenden alles rond AI samenbrengt: wat we doen,
              wie we zijn en hoe we het <strong className="text-white">verantwoord aanpakken</strong>.
            </p>

            <p className="text-blue-200 mb-10 max-w-lg">
              Of je nu docent, student of medewerker bent:               hier vind je overzicht, verbinding en richting.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#sporen"
                className="bg-white text-nhl-blauw hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Ontdek het AI-Netwerk
              </a>
              <a
                href="#meld"
                className="bg-nhl-oranje hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Meld een initiatief
              </a>
            </div>
          </div>

          {/* Right: drie functies */}
          <div className="grid gap-4">
            {[
              {
                icon: '👁️',
                titel: 'Zichtbaarheid',
                tekst: 'Wat is er al? Wie doet wat? Het AI-Netwerk maakt het AI-landschap van NHL Stenden inzichtelijk voor iedereen.',
              },
              {
                icon: '🔗',
                titel: 'Verbinding',
                tekst: 'Een levend netwerk van mensen, teams en initiatieven: binnen en buiten de instelling. Samen slimmer.',
              },
              {
                icon: '🧭',
                titel: 'Richting',
                tekst: 'Het AI Kompas als gedeeld kompas. Hoe werken we verantwoord met AI, gebaseerd op onze eigen waarden?',
              },
            ].map((item) => (
              <div
                key={item.titel}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 flex gap-4 items-start hover:bg-white/15 transition-colors"
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <div className="text-white font-bold mb-1">{item.titel}</div>
                  <div className="text-blue-100 text-sm leading-relaxed">{item.tekst}</div>
                </div>
              </div>
            ))}

            <div className="bg-nhl-oranje/20 border border-nhl-oranje/40 rounded-xl p-4 mt-2">
              <p className="text-white text-sm italic text-center">
                "NHL Stenden benut AI om studiesucces te vergroten, werkprocessen te versterken en een verantwoorde digitale cultuur te bouwen, gedragen door iedereen die hier werkt en leert."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
