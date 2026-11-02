import React, { useState } from 'react'
import GradientHeader from '../components/GradientHeader'

const CATEGORIEEN = [
  { id: 'strategie', label: 'Strategie & Beleid', icon: '🧭', kleur: '#1E3A8A' },
  { id: 'onderwijs', label: 'Onderwijs & Didactiek', icon: '🎓', kleur: '#0F766E' },
  { id: 'techniek', label: 'Techniek & Infrastructuur', icon: '⚙️', kleur: '#7C3AED' },
  { id: 'governance', label: 'Governance & Compliance', icon: '⚖️', kleur: '#E91E8C' },
  { id: 'inspiratie', label: 'Inzichten & Onderzoek', icon: '💡', kleur: '#D97706' },
  { id: 'overig', label: 'Overig', icon: '📁', kleur: '#64748B' },
]

const SPOREN_OPTIES = ['AI & Onderwijs', 'AI & Organisatie', 'AI & Verantwoordelijkheid', 'AI-Geletterdheid', 'Overkoepelend']

const typeKleur = {
  pdf:  'bg-red-50 text-red-600',
  pptx: 'bg-orange-50 text-orange-600',
  docx: 'bg-blue-50 text-blue-600',
  png:  'bg-purple-50 text-purple-600',
  jpg:  'bg-green-50 text-green-600',
  overig: 'bg-gray-100 text-gray-600',
}


function DocAuthWall({ doc, onSuccess, onCancel }) {
  const [poging, setPoging] = React.useState('')
  const [fout, setFout] = React.useState(false)
  const probeer = () => {
    // Demo (besluit van Edgar, 1 november 2026): de hele site opent alleen met
    // een doorgangspas van de portfolio (A2B-poort, sinds v2.54), dus dit scherm
    // laat iedereen door, ook met een leeg veld. Niet terugzetten tenzij Edgar
    // erom vraagt. Alleen Beheer en videobeheer vragen het beheerwachtwoord.
    onSuccess()
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-nhl-blauw/10 flex items-center justify-center text-2xl">&#128272;</div>
          <div>
            <div className="font-bold text-nhl-blauw text-base">Document downloaden</div>
            <div className="text-gray-400 text-xs">{doc && doc.titel}</div>
          </div>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-2">Dit document is bedoeld voor medewerkers van NHL Stenden.</p>
        <p className="text-gray-400 text-xs leading-relaxed mb-6">Het AI-Netwerk opent alleen via de portfolio van A.I. 2 Business. In deze demo kom je hier zonder code verder.</p>
        <div className="space-y-3">
          <input type="password" value={poging}
            onChange={function(e) { setPoging(e.target.value); setFout(false) }}
            onKeyDown={function(e) { if (e.key === 'Enter') probeer() }}
            placeholder="Code (niet nodig in deze demo)" autoFocus
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none border-gray-200 focus:border-nhl-blauw transition-colors" />
          {fout && <p className="text-red-500 text-xs">Onjuiste toegangscode. Neem contact op als je hulp nodig hebt.</p>}
          <button onClick={probeer} className="w-full bg-nhl-blauw hover:bg-nhl-blauw/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors">Toegang verkrijgen</button>
          <button onClick={onCancel} className="w-full text-gray-400 hover:text-gray-600 text-sm py-1 transition-colors">Annuleren</button>
        </div>
        <p className="text-center text-gray-300 text-xs mt-5 pt-4 border-t border-gray-100">NHL Stenden AI-Netwerk - 2026</p>
      </div>
    </div>
  )
}

export default function Documentatie({ docs, setDocs }) {
  const [filterCat, setFilterCat] = useState(null)
  const [authDoc, setAuthDoc] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadStap, setUploadStap] = useState(0)
  const [bestand, setBestand] = useState(null)
  const [bestand2, setBestand2] = useState(null)
  const [bestandData, setBestandData] = useState(null)
  const [bestandData2, setBestandData2] = useState(null)
  const [uploadForm, setUploadForm] = useState({ titel: '', categorie: '', spoor: '', omschrijving: '' })
  const [fout, setFout] = useState('')

  const gefilterd = filterCat ? docs.filter(d => d.categorie === filterCat) : docs

  const leesBestand = (file, setData) => {
    const reader = new FileReader()
    reader.onload = (e) => setData(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleBestand = (file, nummer = 1) => {
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { setFout('Bestand mag maximaal 50 MB zijn.'); return }
    setFout('')
    if (nummer === 1) {
      setBestand(file)
      leesBestand(file, setBestandData)
      const ext = file.name.split('.').pop().toLowerCase()
      setUploadForm(f => ({ ...f, titel: file.name.replace(`.${ext}`, '') }))
    } else {
      setBestand2(file)
      leesBestand(file, setBestandData2)
    }
  }

  const verstuurUpload = () => {
    if (!bestand || !uploadForm.titel || !uploadForm.categorie) return
    const ext = bestand.name.split('.').pop().toLowerCase()
    const icon = ext === 'pdf' ? '📄' : ['png','jpg','jpeg'].includes(ext) ? '🖼️' : ext === 'pptx' ? '📊' : '📝'
    const nieuweItems = [{
      id: Date.now(),
      ...uploadForm,
      type: ext,
      bestandNaam: bestand.name,
      bestandData: bestandData,
      datum: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
      icon,
      nieuw: true,
    }]
    // Tweede bestand als apart document
    if (bestand2 && bestandData2) {
      const ext2 = bestand2.name.split('.').pop().toLowerCase()
      const icon2 = ext2 === 'pdf' ? '📄' : ['png','jpg','jpeg'].includes(ext2) ? '🖼️' : ext2 === 'pptx' ? '📊' : '📝'
      nieuweItems.push({
        id: Date.now() + 1,
        ...uploadForm,
        titel: `${uploadForm.titel} (bijlage)`,
        type: ext2,
        bestandNaam: bestand2.name,
        bestandData: bestandData2,
        datum: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
        icon: icon2,
        nieuw: true,
      })
    }
    setDocs(prev => [...nieuweItems, ...prev])
    setUploadOpen(false)
    setUploadStap(0)
    setBestand(null)
    setBestand2(null)
    setBestandData(null)
    setBestandData2(null)
    setUploadForm({ titel: '', categorie: '', spoor: '', omschrijving: '' })
  }

  const voerDownloadUit = (doc) => {
    if (doc.bestand) {
      window.open(doc.bestand, '_blank')
    } else if (doc.bestandData) {
      const a = document.createElement('a')
      a.href = doc.bestandData
      a.download = doc.bestandNaam || `${doc.titel}.${doc.type}`
      a.click()
    } else if (doc.url) {
      window.open(doc.url, '_blank')
    } else {
      return
    }
  }

  const downloadDoc = (doc) => { voerDownloadUit(doc) }

  const kanVersturen = bestand && uploadForm.titel && uploadForm.categorie

  return (
    <>
    <div className="min-h-screen pt-16 bg-white">
      <GradientHeader
        label="Kennis & materiaal"
        title="Documentatie"
        subtitle="Presentaties, rapporten, beleidsdocumenten en andere materialen over AI bij NHL Stenden."
      >
        <div className="mt-5">
          <button onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 bg-nhl-roze hover:bg-nhl-roze-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
            + Document uploaden
          </button>
        </div>
      </GradientHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Categorie filter */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mb-8">
          <button
            onClick={() => setFilterCat(null)}
            className={`rounded-xl p-3 text-center border-2 transition-colors ${!filterCat ? 'border-nhl-blauw bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <div className="text-xl mb-1">📚</div>
            <div className="text-xs font-medium text-gray-700">Alles</div>
            <div className="text-xs text-gray-400">{docs.length}</div>
          </button>
          {CATEGORIEEN.map(cat => {
            const n = docs.filter(d => d.categorie === cat.id).length
            return (
              <button key={cat.id} onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
                className={`rounded-xl p-3 text-center border-2 transition-colors ${filterCat === cat.id ? 'border-transparent text-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                style={filterCat === cat.id ? { backgroundColor: cat.kleur } : {}}>
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className={`text-xs font-medium ${filterCat === cat.id ? 'text-white' : 'text-gray-700'}`}>{cat.label}</div>
                <div className={`text-xs ${filterCat === cat.id ? 'text-white/70' : 'text-gray-400'}`}>{n}</div>
              </button>
            )
          })}
        </div>

        {/* Document grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gefilterd.map(doc => {
            const cat = CATEGORIEEN.find(c => c.id === doc.categorie)
            const kanDownloaden = !!(doc.bestandData || doc.url || doc.bestand)
            return (
              <div key={doc.id} className="card card-hover p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{doc.icon}</div>
                  <div className="flex gap-2 items-center">
                    {doc.nieuw && <span className="text-xs bg-nhl-roze/10 text-nhl-roze px-2 py-0.5 rounded-full font-medium">Nieuw</span>}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeKleur[doc.type] || typeKleur.overig}`}>{doc.type?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="font-bold text-nhl-blauw mb-1 leading-snug">{doc.titel}</div>
                {doc.omschrijving && <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1">{doc.omschrijving}</p>}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto flex-wrap">
                  {cat && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: cat.kleur }}>
                      {cat.icon} {cat.label}
                    </span>
                  )}
                  {doc.spoor && <span className="text-xs text-gray-400">· {doc.spoor}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{doc.datum}</span>
                </div>
                {/* Download knop */}
                <button
                  onClick={() => downloadDoc(doc)}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${kanDownloaden ? 'bg-nhl-blauw text-white hover:bg-nhl-blauw-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  title={kanDownloaden ? 'Download dit document' : 'Geen bestand beschikbaar'}
                >
                  <span>⬇</span> Download
                </button>
              </div>
            )
          })}
        </div>

        {gefilterd.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📁</div>
            <div className="font-medium">Geen documenten in deze categorie.</div>
          </div>
        )}
      </div>

      {/* Upload modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-nhl-blauw text-lg">Document uploaden</h2>
              <button onClick={() => { setUploadOpen(false); setUploadStap(0); setBestand(null) }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {uploadStap === 0 && (
                <div className="space-y-4">
                  {/* Eerste bestand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bestand 1 <span className="text-red-400">*</span></label>
                    <div onClick={() => document.getElementById('doc-upload').click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleBestand(e.dataTransfer.files[0], 1) }}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-nhl-blauw hover:bg-blue-50 transition-colors">
                      {bestand ? (
                        <div className="flex items-center gap-3 justify-center">
                          <span className="text-2xl">{bestand.type.includes('pdf') ? '📄' : bestand.type.includes('image') ? '🖼️' : '📝'}</span>
                          <div className="text-left">
                            <div className="font-medium text-nhl-blauw text-sm">{bestand.name}</div>
                            <div className="text-xs text-gray-400">{(bestand.size / 1024).toFixed(0)} KB</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setBestand(null); setBestandData(null) }} className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl mb-2">📤</div>
                          <div className="font-medium text-gray-700 mb-1 text-sm">Klik of sleep een bestand hierheen</div>
                          <div className="text-xs text-gray-400">PDF, Word, PowerPoint, PNG of JPEG · max 50 MB</div>
                        </div>
                      )}
                    </div>
                    <input id="doc-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.pptx,.png,.jpg,.jpeg" onChange={e => handleBestand(e.target.files[0], 1)} />
                  </div>

                  {/* Tweede bestand: optioneel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bestand 2 <span className="text-gray-400 font-normal">(optioneel: bijv. bijlage)</span></label>
                    <div onClick={() => document.getElementById('doc-upload-2').click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleBestand(e.dataTransfer.files[0], 2) }}
                      className="border-2 border-dashed border-gray-100 rounded-xl p-5 text-center cursor-pointer hover:border-nhl-blauw hover:bg-blue-50 transition-colors">
                      {bestand2 ? (
                        <div className="flex items-center gap-3 justify-center">
                          <span className="text-2xl">{bestand2.type.includes('pdf') ? '📄' : bestand2.type.includes('image') ? '🖼️' : '📝'}</span>
                          <div className="text-left">
                            <div className="font-medium text-nhl-blauw text-sm">{bestand2.name}</div>
                            <div className="text-xs text-gray-400">{(bestand2.size / 1024).toFixed(0)} KB</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setBestand2(null); setBestandData2(null) }} className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl mb-1">📎</div>
                          <div className="text-sm text-gray-400">Tweede bestand toevoegen (optioneel)</div>
                        </div>
                      )}
                    </div>
                    <input id="doc-upload-2" type="file" className="hidden" accept=".pdf,.doc,.docx,.pptx,.png,.jpg,.jpeg" onChange={e => handleBestand(e.target.files[0], 2)} />
                  </div>

                  {fout && <div className="text-red-500 text-xs">{fout}</div>}
                  {bestand && (
                    <button onClick={() => setUploadStap(1)} className="btn-primary w-full">Volgende: Rubriceren →</button>
                  )}
                </div>
              )}
              {uploadStap === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel <span className="text-red-400">*</span></label>
                    <input type="text" value={uploadForm.titel} onChange={e => setUploadForm(f => ({ ...f, titel: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Categorie <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIEEN.map(cat => (
                        <button key={cat.id} onClick={() => setUploadForm(f => ({ ...f, categorie: cat.id }))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition-colors ${uploadForm.categorie === cat.id ? 'border-transparent text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                          style={uploadForm.categorie === cat.id ? { backgroundColor: cat.kleur } : {}}>
                          <span>{cat.icon}</span><span className="font-medium text-xs">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gerelateerd thema</label>
                    <select value={uploadForm.spoor} onChange={e => setUploadForm(f => ({ ...f, spoor: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw">
                      <option value="">Kies een thema...</option>
                      {SPOREN_OPTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Korte omschrijving</label>
                    <textarea value={uploadForm.omschrijving} onChange={e => setUploadForm(f => ({ ...f, omschrijving: e.target.value }))} rows={3}
                      placeholder="Waar gaat dit document over?"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setUploadStap(0)} className="btn-ghost flex-1">← Terug</button>
                    <button onClick={verstuurUpload} disabled={!kanVersturen}
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${kanVersturen ? 'bg-nhl-roze text-white hover:bg-nhl-roze-dark' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      Document toevoegen ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
    </>
  )
}
