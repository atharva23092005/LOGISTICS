import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe, AlertTriangle, ShieldCheck, ArrowRight,
  Compass, MapPin, Search, Phone, ExternalLink,
  CloudRain, Navigation, CheckCircle2, AlertOctagon, Info, Zap
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/utils/cn'

type Language = 'en' | 'as' | 'hi' | 'bn'

interface RoadStatusItem {
  id: string
  name: string
  district: string
  status: 'open' | 'partial' | 'blocked'
  condition: string
  alternate?: string
  lastInspected: string
  rainfall: string
}

const HIGHWAY_DATA: RoadStatusItem[] = [
  {
    id: 'nh-415-km42',
    name: 'NH-415 (Itanagar – Banderdewa)',
    district: 'Papum Pare, Arunachal Pradesh',
    status: 'blocked',
    condition: 'Heavy mudslide at Km 42. Road blocked for all commercial and light vehicles.',
    alternate: 'Use SH-15 North Bank corridor via Gohpur for transit toward Assam.',
    lastInspected: '25 mins ago (Field Officer Sunil Pegu)',
    rainfall: '84 mm/h (Heavy Rainfall)',
  },
  {
    id: 'nh-27-nagaon',
    name: 'NH-27 (Guwahati – Nagaon 4-Lane)',
    district: 'Kamrup / Nagaon, Assam',
    status: 'open',
    condition: 'All 4 lanes clear. Surface dry and nominal visibility.',
    lastInspected: '12 mins ago (BRO Automated Telemetry)',
    rainfall: '4 mm/h (Clear Sky)',
  },
  {
    id: 'nh-6-shillong',
    name: 'NH-6 (Guwahati – Shillong Bypass)',
    district: 'Ri-Bhoi / East Khasi Hills, Meghalaya',
    status: 'partial',
    condition: 'Dense fog and minor rockfall near Nongpoh. Single lane operational with speed restrictions.',
    alternate: 'Maintain convoy speed under 35 km/h. Avoid night transit.',
    lastInspected: '40 mins ago (SDMA Patrol Unit)',
    rainfall: '28 mm/h (Moderate Rain / Mist)',
  },
  {
    id: 'sh-15-tezpur',
    name: 'SH-15 (Tezpur – North Lakhimpur Bypass)',
    district: 'Sonitpur / Lakhimpur, Assam',
    status: 'open',
    condition: 'Safe AI-recommended alternative corridor. Kolia Bhomora bridge clear with no weight limits.',
    lastInspected: '1 hour ago (BRO Checkpoint #4)',
    rainfall: '12 mm/h (Light Showers)',
  },
  {
    id: 'nh-102-imphal',
    name: 'NH-102 (Imphal – Moreh Corridor)',
    district: 'Tengnoupal, Manipur',
    status: 'partial',
    condition: 'Intermittent waterlogging near Lokchao Bridge. High-clearance vehicles only.',
    alternate: 'Heavy trucks queued at Pallel inspection gate.',
    lastInspected: '1.5 hours ago (State Transport Dept)',
    rainfall: '42 mm/h (Heavy Showers)',
  },
  {
    id: 'nh-2-kohima',
    name: 'NH-2 (Dimapur – Kohima Highway)',
    district: 'Kohima, Nagaland',
    status: 'open',
    condition: '4-lane mountain corridor clear. Slope mesh barriers intact.',
    lastInspected: '45 mins ago (NHIDCL Telemetry)',
    rainfall: '8 mm/h (Overcast)',
  },
]

const HELPLINES = [
  { name: 'Disaster Management State HQ', number: '1070 / 1077', area: 'All 8 NER States' },
  { name: 'Border Roads Emergency Control', number: '0361-2540892', area: 'Assam & Arunachal' },
  { name: 'Meghalaya Police Highway Patrol', number: '112 / 0364-2222214', area: 'NH-6 Corridor' },
  { name: 'Medical Lifeline Dispatch (SEOC)', number: '108 / 104', area: 'Regional Ambulance Network' },
]

const I18N = {
  en: {
    title: 'Northeast India Highway Live Accessibility',
    subtitle: 'Real-time road conditions, verified landslide blockades, and official detour advisories for citizens and transporters.',
    searchPlaceholder: 'Search highway, district, or town (e.g. NH-415, Itanagar, Shillong)...',
    openRoads: 'Open & Safe',
    restrictedRoads: 'Caution / Restricted',
    blockedRoads: 'Critical Blockade',
    emergencyHelplines: 'Emergency Assistance & Incident Reporting',
    lastUpdated: 'Live automated feed updated every 60 seconds from BRO, IMD Doppler & Field Officers.',
    viewCommandCenter: 'Official Command Center',
    safeToTravel: 'Safe for all convoys',
    travelWithCaution: 'Drive slow / Speed limits',
    avoidTravel: 'Road closed to traffic',
  },
  as: {
    title: 'উত্তৰ-পূব ভাৰত ঘাইপথৰ লাইভ অৱস্থা',
    subtitle: 'নাগৰিক আৰু পৰিবহণকাৰীসকলৰ বাবে বাস্তৱ সময়ৰ পথৰ অৱস্থা, ভূস্খলনৰ তথ্য আৰু চৰকাৰী বিকল্প পথৰ পৰামৰ্শ।',
    searchPlaceholder: 'ঘাইপথ বা জিলাৰ নাম লিখক (যেনে: NH-415, তেজপুৰ, শ্বিলং)...',
    openRoads: 'খোলা আৰু সুৰক্ষিত',
    restrictedRoads: 'সাৱধানতা প্ৰয়োজন',
    blockedRoads: 'পথ বন্ধ / বিপজ্জনক',
    emergencyHelplines: 'জৰুৰীকালীন সাহায্য আৰু হেল্পলাইন',
    lastUpdated: 'প্ৰতি ৬০ ছেকেণ্ডত তথ্য নৱীকৰণ কৰা হয়।',
    viewCommandCenter: 'কমাণ্ড চেণ্টাৰত প্ৰৱেশ',
    safeToTravel: 'সকলো বাহনৰ বাবে সুৰক্ষিত',
    travelWithCaution: 'ধীৰে চলাওক',
    avoidTravel: 'যাতায়াত স্থগিত ৰাখক',
  },
  hi: {
    title: 'पूर्वोत्तर भारत राष्ट्रीय राजमार्ग लाइव स्थिति',
    subtitle: 'नागरिकों और वाहन चालकों के लिए वास्तविक समय में सड़क की स्थिति, भूस्खलन की चेतावनी और वैकल्पिक मार्ग।',
    searchPlaceholder: 'राजमार्ग या जिले का नाम खोजें (उदा. NH-415, ईटानगर, शिलांग)...',
    openRoads: 'खुला और सुरक्षित',
    restrictedRoads: 'सावधानी बरतें',
    blockedRoads: 'पूर्णतः अवरुद्ध',
    emergencyHelplines: 'आपातकालीन सहायता एवं रिपोर्टिंग',
    lastUpdated: 'BRO और मौसम विज्ञान विभाग द्वारा प्रति मिनट अपडेट।',
    viewCommandCenter: 'कमांड सेंटर लॉगिन',
    safeToTravel: 'सभी वाहनों के लिए सुरक्षित',
    travelWithCaution: 'धीमी गति से चलें',
    avoidTravel: 'यात्रा से बचें',
  },
  bn: {
    title: 'উত্তর-পূর্ব ভারত জাতীয় সড়ক লাইভ তথ্য',
    subtitle: 'নাগরিক এবং পরিবহনকারীদের জন্য লাইভ রাস্তার অবস্থা, ভূমিধসের সতর্কতা এবং বিকল্প রুট।',
    searchPlaceholder: 'হাইওয়ে বা জেলার নাম লিখুন (যেমন: NH-415, গুয়াহাটি)...',
    openRoads: 'খোলা ও নিরাপদ',
    restrictedRoads: 'সতর্কতা প্রয়োজন',
    blockedRoads: 'রাস্তা বন্ধ',
    emergencyHelplines: 'জরুরি হেল্পলাইন নম্বর',
    lastUpdated: 'প্রতি মিনিটে লাইভ তথ্য আপডেট করা হচ্ছে।',
    viewCommandCenter: 'কমান্ড সেন্টারে যান',
    safeToTravel: 'চলাচল নিরাপদ',
    travelWithCaution: 'ধীরে গাড়ি চালান',
    avoidTravel: 'যাতায়াত করবেন না',
  },
}

export function PublicCitizenPortal() {
  const [lang, setLang] = useState<Language>('en')
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'partial' | 'blocked'>('all')

  const t = I18N[lang]

  const stats = useMemo(() => {
    const total = HIGHWAY_DATA.length
    const open = HIGHWAY_DATA.filter(h => h.status === 'open').length
    const partial = HIGHWAY_DATA.filter(h => h.status === 'partial').length
    const blocked = HIGHWAY_DATA.filter(h => h.status === 'blocked').length
    return { total, open, partial, blocked }
  }, [])

  const filteredHighways = useMemo(() => {
    return HIGHWAY_DATA.filter(item => {
      if (selectedFilter !== 'all' && item.status !== selectedFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.condition.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, selectedFilter])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-text font-sans selection:bg-blue-600/30 selection:text-white pb-16 transition-colors duration-200">
      
      {/* ── Top Public Header ── */}
      <header className="border-b border-slate-200 dark:border-border bg-white/90 dark:bg-surface/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 dark:bg-primary text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                NER Road Watch
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-primary/20 text-blue-700 dark:text-primary border border-blue-200 dark:border-primary/30 font-medium">
                  Public Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-text-muted hidden sm:block">
                Northeast India Real-Time Highway Accessibility
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-2 border border-slate-200 dark:border-border rounded-lg p-1 text-xs">
              <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-text-muted ml-1 mr-0.5" />
              {(['en', 'as', 'hi', 'bn'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    'px-2 py-0.5 rounded font-medium transition-all text-xs',
                    lang === l
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-surface-3'
                  )}
                >
                  {l === 'en' ? 'EN' : l === 'as' ? 'অসমীয়া' : l === 'hi' ? 'हिंदी' : 'বাংলা'}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Official Login Link */}
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors hidden sm:flex items-center gap-1.5 shadow-sm"
            >
              <span>{t.viewCommandCenter}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* ── Hero Banner ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-surface p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-tactical-grid opacity-50 dark:opacity-20 pointer-events-none" />
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/20 text-blue-700 dark:text-primary text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Highway Bulletin • Monitored 24/7
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-muted leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Search Box */}
          <div className="mt-6 max-w-2xl relative z-10">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-2 border border-slate-200 dark:border-border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-inner"
            />
          </div>
        </div>

        {/* ── Status Metric Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'all'
                ? 'bg-blue-50 dark:bg-primary/15 border-blue-300 dark:border-primary/50 shadow-sm'
                : 'bg-white dark:bg-surface border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-white/15'
            )}
          >
            <div className="text-xs text-slate-500 dark:text-text-muted font-medium">Total Corridors</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</div>
            <div className="text-[11px] text-slate-400 dark:text-text-dim mt-0.5">All monitored highways</div>
          </button>

          <button
            onClick={() => setSelectedFilter('open')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'open'
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/50 shadow-sm'
                : 'bg-white dark:bg-surface border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-white/15'
            )}
          >
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t.openRoads}
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.open}</div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80 mt-0.5">{t.safeToTravel}</div>
          </button>

          <button
            onClick={() => setSelectedFilter('partial')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'partial'
                ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/50 shadow-sm'
                : 'bg-white dark:bg-surface border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-white/15'
            )}
          >
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t.restrictedRoads}
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.partial}</div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-500/80 mt-0.5">{t.travelWithCaution}</div>
          </button>

          <button
            onClick={() => setSelectedFilter('blocked')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'blocked'
                ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/50 shadow-sm'
                : 'bg-white dark:bg-surface border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-white/15'
            )}
          >
            <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {t.blockedRoads}
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.blocked}</div>
            <div className="text-[11px] text-rose-600/80 dark:text-rose-500/80 mt-0.5">{t.avoidTravel}</div>
          </button>
        </div>

        {/* ── Highway Status List ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600 dark:text-primary" />
              Major Highway Corridors Status
            </h2>
            <span className="text-xs text-slate-500 dark:text-text-muted font-medium">
              Showing {filteredHighways.length} corridors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHighways.map(h => (
              <div
                key={h.id}
                className={cn(
                  'rounded-xl border p-5 transition-all space-y-3 bg-white dark:bg-surface shadow-2xs',
                  h.status === 'blocked'
                    ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/10'
                    : h.status === 'partial'
                    ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-white/15'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{h.name}</h3>
                    <div className="text-xs text-slate-500 dark:text-text-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {h.district}
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider',
                      h.status === 'blocked'
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                        : h.status === 'partial'
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                    )}
                  >
                    {h.status === 'blocked' ? 'BLOCKED' : h.status === 'partial' ? 'RESTRICTED' : 'OPEN'}
                  </span>
                </div>

                <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-surface-2 p-3 rounded-lg border border-slate-200/80 dark:border-border">
                  <div className="text-xs font-semibold text-slate-500 dark:text-text-muted mb-1">Current Condition:</div>
                  {h.condition}
                </div>

                {h.alternate && (
                  <div className="text-xs text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/40 flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-900 dark:text-blue-300">Public Advisory: </span>
                      {h.alternate}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-text-dim pt-1 border-t border-slate-100 dark:border-border">
                  <span className="flex items-center gap-1 font-medium">
                    <CloudRain className="h-3.5 w-3.5 text-blue-500" />
                    {h.rainfall}
                  </span>
                  <span>Verified: {h.lastInspected}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Emergency Helplines Section ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Phone className="h-5 w-5 text-rose-500" />
            {t.emergencyHelplines}
          </div>
          <p className="text-xs text-slate-600 dark:text-text-muted">
            For stranded travelers, medical evacuations, or reporting unrecorded road landslides:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HELPLINES.map(item => (
              <div key={item.name} className="p-3.5 rounded-xl bg-slate-50 dark:bg-surface-2 border border-slate-200 dark:border-border space-y-1.5">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                <div className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{item.number}</div>
                <div className="text-[10px] text-slate-500 dark:text-text-dim">{item.area}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer / Privacy Notice ── */}
        <div className="text-center text-xs text-slate-500 dark:text-text-dim space-y-1 pt-4 border-t border-slate-200 dark:border-border">
          <p>{t.lastUpdated}</p>
          <p className="text-[11px] text-slate-400 dark:text-text-subtle">
            Official Public Transparency Portal • National Highway Infrastructure & Logistics Authority
          </p>
        </div>
      </main>
    </div>
  )
}
