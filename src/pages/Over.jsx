import { Link } from 'react-router-dom'
import { useState } from 'react'
import GradientHeader from '../components/GradientHeader'

const kernteam = [
  {
    rol: 'Kwartiermaker Digitale Samenhang',
    subtitel: 'Spil & Strategie',
    omschrijving: 'De Kwartiermaker is de initiator, strateeg en bestuurlijk aanspreekpunt van het AI-Netwerk. Verbindt het AI-Netwerk aan de bredere digitaliseringsstrategie van NHL Stenden.',
    taken: [
      'Bewaakt de koers en samenhang van het AI-Netwerk als geheel',
      'Bestuurlijk aanspreekpunt richting Stuurgroep Transitieprogramma en directie',
      'Verbindt het AI-Netwerk met het externe netwerk: SURF, NPULS, Vereniging Hogescholen',
      'Bewaakt de vier thema\u2019s en zorgt voor aansluiting op de organisatiepraktijk',
    ],
    kleur: '#1E3A8A',
    icon: '🧭',
    contact: null,
  },
  {
    rol: 'Informatiemanager',
    subtitel: 'Inhoud & Netwerk',
    omschrijving: 'De Informatiemanager is verantwoordelijk voor de inhoudelijke kwaliteit en actualiteit van het AI-Netwerk. Brug tussen de informatiearchitectuur en de praktijk van AI-gebruik.',
    taken: [
      'Beheert en actualiseert de inhoud: initiatieven, mensen, kaders en vraagstukken',
      'Verbindt initiatieven aan het juiste thema en laag',
      'Bewaakt de aansluiting op bestaande informatiestromen en governance-processen',
      'Ondersteunt de AI-desk bij het beoordelen van nieuwe AI-initiatieven',
    ],
    kleur: '#0F766E',
    icon: '🗂️',
    contact: null,
  },
  {
    rol: 'ICT Analist',
    subtitel: 'Techniek & Instrument',
    omschrijving: 'De ICT Analist is verantwoordelijk voor de technische realisatie en het beheer van het digitale AI-Netwerk instrument. Verbindt de inhoudelijke ambitie aan de technische mogelijkheden.',
    taken: [
      'Ontwikkelt en beheert het digitale AI-Netwerk instrument (webtool)',
      'Analyseert technische vraagstukken rondom AI-inzet: platforms, API-koppelingen, datastromen',
      'Ondersteunt de inrichting van sandbox-omgevingen en de AI-desk vanuit technisch perspectief',
      'Volgt technische ontwikkelingen in het externe netwerk en vertaalt deze naar de interne context',
    ],
    kleur: '#7C3AED',
    icon: '⚙️',
    contact: null,
  },
]

const techLaag = [
  {
    titel: 'Veiligheid & AVG',
    omschrijving: 'Borgt dat AI-toepassingen voldoen aan privacywetgeving, informatiebeveiliging en het NHL Stenden beleidskader.',
    icon: '🔒',
    kleur: '#DC2626',
  },
  {
    titel: 'Integratie & API',
    omschrijving: 'Verbindt AI-tools aan de bestaande ICT-infrastructuur van NHL Stenden via veilige koppelingen en datastromen.',
    icon: '🔗',
    kleur: '#0E7490',
  },
  {
    titel: 'Solution Partnership',
    omschrijving: 'Denkt als sparringpartner mee met academies en diensten over hoe AI veilig en effectief geïntegreerd kan worden.',
    icon: '🤝',
    kleur: '#0F766E',
  },
  {
    titel: 'Actuele kennis AI-landschap',
    omschrijving: 'Volgt nieuwe ontwikkelingen in tools, modellen en infrastructuur en vertaalt dit naar kansen voor de organisatie.',
    icon: '🔭',
    kleur: '#7C3AED',
  },
]

const themasTrekkers = [
  { thema: 'AI & Leren', icon: '🎓', kleur: '#1E3A8A', trekker: 'Volgt', afdeling: 'OO&I', contact: null },
  { thema: 'AI & Werken', icon: '⚙️', kleur: '#0F766E', trekker: 'Volgt', afdeling: 'DLWO', contact: null },
  { thema: 'AI & Verantwoordelijkheid', icon: '⚖️', kleur: '#E91E8C', trekker: 'Volgt', afdeling: 'Concernstaf', contact: null },
  { thema: 'AI & Geletterdheid', icon: '📖', kleur: '#7C3AED', trekker: 'Volgt', afdeling: 'OO&I, HRM & DLWO', contact: null },
  { thema: 'AI & Werkveld', icon: '🏢', kleur: '#B45309', trekker: 'Volgt', afdeling: 'Academie', contact: null },
  { thema: 'AI & Onderzoek', icon: '🔬', kleur: '#0E7490', trekker: 'Volgt', afdeling: 'OO&I & Lectoraat', contact: null },
]

export default function Over() {
  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <GradientHeader
        label="Over het AI-Netwerk"
        title="Wie zijn wij?"
        subtitle="Het AI-Netwerk is een initiatief van NHL Stenden dat AI-initiatieven, kennis en mensen verbindt. Klein van opzet, groot in ambitie."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Missie */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="font-bold text-nhl-blauw text-lg mb-3">Onze missie</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            Het AI-Netwerk brengt alle AI-initiatieven, pilots, thema's, kennis en mensen bij NHL Stenden samen op één plek. Het is geen structuur die van bovenaf wordt opgelegd, maar een netwerk dat groeit vanuit vertrouwen, eigenaarschap en gedeelde ambitie.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Het kernteam is de motor die dat proces op gang houdt. Licht en wendbaar, verbindend in plaats van controlerend, transparant over wat loopt: ook als iets nog niet af is.
          </p>
        </div>

        {/* Hoe het werkt */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="font-bold text-nhl-blauw text-lg mb-3">Hoe het AI-Netwerk werkt</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            Het AI-Netwerk is een verbinder die overzicht en samenhang biedt, geen tweede inhoudelijke eigenaar. De inhoudelijke kaders voor toetsing, didactiek, AVG of onderzoeksintegriteit liggen bij de vakeigenaren, zoals het Centre for Teaching and Learning en OO&I. Het AI-Netwerk vat hun werk kort samen en verwijst expliciet door naar de oorspronkelijke bron, zodat er overzicht ontstaat zonder een tweede, mogelijk conflicterende regelbron.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Wat het AI-Netwerk onderscheidt van een gewone informatiepagina, is dat het rekent. De verplichtingen uit de EU AI Act zijn vastgelegd met hun deadline, en het systeem berekent continu of daaraan gekoppeld werk daadwerkelijk loopt. Diezelfde berekende basis voedt de agendavoorstellen voor de overleggen binnen het netwerk, van de stuurgroep tot de thema-overleggen, en signaleert wanneer nieuwe ontwikkelingen van buiten opvolging verdienen. Zo ondersteunt het AI-Netwerk niet alleen het overzicht, maar ook de daadwerkelijke aansturing van de AI-ontwikkelingen binnen NHL Stenden.
          </p>
        </div>

        {/* Kernteam */}
        <h2 className="font-bold text-nhl-blauw text-xl mb-5">Het kernteam</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {kernteam.map(lid => (
            <div key={lid.rol} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: lid.kleur }}>
                <span className="text-2xl">{lid.icon}</span>
                <div>
                  <div className="text-white font-bold text-sm leading-tight">{lid.rol}</div>
                  <div className="text-white/70 text-xs">{lid.subtitel}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{lid.omschrijving}</p>
                <div className="space-y-1.5">
                  {lid.taken.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className="mt-0.5 text-gray-300">→</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                {lid.contact && (
                  <a href={`mailto:${lid.contact}`}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: lid.kleur }}>
                    ✉️ Neem contact op
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Techniek & Infrastructuur laag */}
        <div className="bg-nhl-blauw/8 border border-nhl-blauw/15 rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏗️</span>
            <div>
              <div className="text-nhl-blauw font-bold text-base">Techniek & Infrastructuur</div>
              <div className="text-gray-500 text-xs">Fundament van het AI-Netwerk: solution partners voor veilige AI-integratie</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            Onder het kernteam staat een laag van mensen die technisch en functioneel bezig zijn met de AI-infrastructuur van NHL Stenden. Zij hebben de expertise om als solution partner mee te denken over hoe AI veilig en effectief geïntegreerd kan worden in de ICT-omgeving, alternatieve oplossingen te bedenken en thuis te zijn in het laatste applicatie- en technieklandschap van AI.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {techLaag.map(t => (
              <div key={t.titel} className="bg-white border border-nhl-blauw/15 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-nhl-blauw text-xs font-semibold">{t.titel}</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{t.omschrijving}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kernteam groeit mee */}
        <h2 className="font-bold text-nhl-blauw text-xl mb-2">Het kernteam groeit mee</h2>
        <p className="text-gray-500 text-sm mb-5">Het AI-Netwerk groeit. Per thema zijn er vaste trekkers die het thema actief voeden en vertegenwoordigen.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {themasTrekkers.map(t => (
            <div key={t.thema} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: t.kleur }}>
                <span>{t.icon}</span>
                <span className="text-white text-xs font-bold">{t.thema}</span>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-1">Trekker</div>
                <div className="text-sm font-semibold text-gray-700 mb-2">{t.trekker}</div>
                {t.afdeling && (
                  <div className="text-xs text-gray-400 mb-3">
                    <span className="text-gray-400">Afdeling: </span>
                    <span className="text-gray-500 font-medium">{t.afdeling}</span>
                  </div>
                )}
                {t.contact ? (
                  <a href={`mailto:${t.contact}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: t.kleur }}>
                    ✉️ Contact
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                    ✉️ Contact volgt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-nhl-blauw rounded-2xl p-8 text-center text-white">
          <h3 className="font-bold text-xl mb-2">Doe mee aan het AI-Netwerk</h3>
          <p className="text-white/80 text-sm mb-5">Jouw kennis, initiatief of vraag maakt het netwerk rijker.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/meld" className="bg-nhl-roze hover:bg-nhl-roze/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              + Meld een initiatief
            </Link>
            <Link to="/netwerk" className="bg-white text-nhl-blauw hover:bg-blue-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              Bekijk het netwerk
            </Link>
            <Link to="/themas" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              Ontdek de thema's
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
