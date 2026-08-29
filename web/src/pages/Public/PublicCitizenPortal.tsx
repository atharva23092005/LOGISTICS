import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, MapPin, AlertTriangle, CheckCircle2, Clock,
  Search, Globe, Phone, Info, CloudRain, ChevronRight,
  ExternalLink, Zap, Compass, RefreshCw, ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { mockDistricts } from '@/mock/districts'
import { mockWeather } from '@/mock/weather'
import { mockRoads } from '@/mock/roads'
import { cn } from '@/utils/cn'

type Language = 'en' | 'as' | 'hi' | 'bn'

const I18N_STRINGS: Record<Language, Record<string, string>> = {
  en: {
    title: 'Northeast Highway & Road Accessibility Portal',
    subtitle: 'Official public road status, weather advisories & safe transit guidance across Northeast India.',
    searchPlaceholder: 'Search district, highway, or town (e.g., East Siang, NH-415, Jorhat)...',
    openRoads: 'Open Roads',
    restrictedRoads: 'Caution / Single Lane',
    blockedRoads: 'Blocked / Landslide',
    allDistricts: 'All Districts',
    emergencyHelplines: 'Emergency & Highway Helplines',
    lastUpdated: 'Live updates refreshed every 15 minutes from District Emergency Operation Centers (DEOC).',
    viewCommandCenter: 'Official Login',
    safeToTravel: 'Safe for Travel',
    travelWithCaution: 'Travel with Caution',
    avoidTravel: 'Avoid Non-Essential Travel',
    helplineTitle: 'State Emergency Operation Centers',
  },
  as: {
    title: 'উত্তৰ-পূব ঘাইপথ আৰু পথ সুগমতা প’ৰ্টেল',
    subtitle: 'উত্তৰ-পূব ভাৰতৰ চৰকাৰী পথৰ অৱস্থা, বতৰৰ সতৰ্কবাণী আৰু সুৰক্ষিত যাতায়ত তথ্য।',
    searchPlaceholder: 'জিলা, ঘাইপথ বা চহৰ সন্ধান কৰক (যেনেঃ পূব ছিয়াং, NH-415, যোৰহাট)...',
    openRoads: 'খোলা পথসমূহ',
    restrictedRoads: 'সতৰ্কতা / একমুখী চলাচল',
    blockedRoads: 'বন্ধ / ভূমিস্খলন',
    allDistricts: 'সকলো জিলা',
    emergencyHelplines: 'জৰুৰীকালীন আৰু ঘাইপথ হেল্পলাইন',
    lastUpdated: 'জিলা জৰুৰীকালীন সেৱা কেন্দ্ৰৰ পৰা প্ৰতি ১৫ মিনিটত আপডেট কৰা হয়।',
    viewCommandCenter: 'চৰকাৰী প্ৰৱেশ',
    safeToTravel: 'যাত্ৰাৰ বাবে সুৰক্ষিত',
    travelWithCaution: 'সতৰ্কতাৰে যাত্ৰা কৰক',
    avoidTravel: 'যাত্ৰা পৰিহাৰ কৰক',
    helplineTitle: 'ৰাজ্যিক জৰুৰীকালীন নিয়ন্ত্ৰণ কক্ষ',
  },
  hi: {
    title: 'पूर्वोत्तर राजमार्ग एवं सड़क सुगमता पोर्टल',
    subtitle: 'पूर्वोत्तर भारत भर में आधिकारिक सड़क स्थिति, मौसम सलाह और सुरक्षित पारगमन मार्गदर्शन।',
    searchPlaceholder: 'ज़िला, राजमार्ग या शहर खोजें (उदा. पूर्वी सियांग, NH-415, जोरहाट)...',
    openRoads: 'खुले मार्ग',
    restrictedRoads: 'सावधानी / एकल लेन',
    blockedRoads: 'अवरुद्ध / भूस्खलन',
    allDistricts: 'सभी ज़िले',
    emergencyHelplines: 'आपातकालीन एवं राजमार्ग हेल्पलाइन',
    lastUpdated: 'ज़िला आपदा नियंत्रण केंद्रों द्वारा हर 15 मिनट में लाइव अपडेट किया जाता है।',
    viewCommandCenter: 'अधिकारी लॉगिन',
    safeToTravel: 'यात्रा हेतु सुरक्षित',
    travelWithCaution: 'सावधानीपूर्वक यात्रा करें',
    avoidTravel: 'अनावश्यक यात्रा से बचें',
    helplineTitle: 'राज्य आपातकालीन संचालन केंद्र',
  },
  bn: {
    title: 'উত্তর-পূর্ব মহাসড়ক ও সড়ক যোগাযোগ পোর্টাল',
    subtitle: 'উত্তর-পূর্ব ভারতের সরকারি সড়ক অবস্থা, আবহাওয়া সতর্কতা ও নিরাপদ যাতায়াত নির্দেশিকা।',
    searchPlaceholder: 'জেলা, মহাসড়ক বা শহর অনুসন্ধান করুন (যেমনঃ পূর্ব সিয়াং, NH-415, জোরহাট)...',
    openRoads: 'উন্মুক্ত সড়ক',
    restrictedRoads: 'সতর্কতা / একমুখী চলাচল',
    blockedRoads: 'অবরুদ্ধ / ভূমিধস',
    allDistricts: 'সকল জেলা',
    emergencyHelplines: 'জরুরি ও মহাসড়ক হেল্পলাইন',
    lastUpdated: 'জেলা জরুরি অপারেশন সেন্টার থেকে প্রতি ১৫ মিনিটে হালনাগাদ করা হয়।',
    viewCommandCenter: 'অফিসিয়াল লগইন',
    safeToTravel: 'যাত্রার জন্য নিরাপদ',
    travelWithCaution: 'সতর্কতার সাথে যাত্রা করুন',
    avoidTravel: 'ভ্রমণ এড়িয়ে চলুন',
    helplineTitle: 'রাজ্য জরুরি অপারেশন কেন্দ্র',
  },
}

const PUBLIC_HIGHWAYS = [
  {
    id: 'nh415-p',
    name: 'NH-415 (Dibrugarh – Pasighat / Itanagar)',
    district: 'East Siang & Papum Pare',
    status: 'blocked',
    condition: 'Major landslide at Km 42. Excavation in progress.',
    alternate: 'Use SH-15 & NH-27 North Bank Safe Corridor.',
    rainfall: '84 mm/h (Heavy Rain)',
    lastInspected: '25 mins ago',
  },
  {
    id: 'nh37-p',
    name: 'NH-37 (Guwahati – Nagaon – Dibrugarh)',
    district: 'Nagaon & Jorhat',
    status: 'partial',
    condition: 'Waterlogging near Kaziranga lowland sector (depth 25cm). Slow moving traffic.',
    alternate: 'Commercial heavy vehicles permitted; small vehicles use bypass.',
    rainfall: '38 mm/h (Moderate Rain)',
    lastInspected: '40 mins ago',
  },
  {
    id: 'nh27-p',
    name: 'NH-27 (Guwahati – Nagaon Bypass)',
    district: 'Kamrup & Nagaon',
    status: 'open',
    condition: 'All 4 lanes clear. Normal speeds operational.',
    alternate: 'Primary recommended transit corridor.',
    rainfall: '12 mm/h (Light Showers)',
    lastInspected: '15 mins ago',
  },
  {
    id: 'sh15-p',
    name: 'SH-15 (North Lakhimpur – Pasighat Safe Corridor)',
    district: 'Lakhimpur & Dhemaji',
    status: 'open',
    condition: 'Clear paved corridor. Dedicated emergency relief bypass active.',
    alternate: 'Primary safe detour around NH-415 blockade.',
    rainfall: '18 mm/h (Overcast)',
    lastInspected: '10 mins ago',
  },
  {
    id: 'nh13-p',
    name: 'NH-13 (Itanagar – Along Corridor)',
    district: 'West Siang',
    status: 'partial',
    condition: 'Single-lane traffic flow near mountain ascent due to minor slope rockfall.',
    alternate: 'Travel in daytime daylight hours recommended.',
    rainfall: '45 mm/h (Rain & Fog)',
    lastInspected: '1 hour ago',
  },
  {
    id: 'nh6-p',
    name: 'NH-6 (Guwahati – Shillong – Silchar)',
    district: 'East Khasi Hills & Ri-Bhoi',
    status: 'open',
    condition: 'All lanes open. Heavy fog caution at elevation above 1200m.',
    alternate: 'Standard safe transit.',
    rainfall: '8 mm/h (Cloudy)',
    lastInspected: '30 mins ago',
  },
]

const HELPLINES = [
  { name: 'Arunachal Pradesh Disaster Management (SDMA)', number: '1070 / 0360-2212222', area: 'Statewide' },
  { name: 'Assam State Disaster Management Authority (ASDMA)', number: '1079 / 0361-2237221', area: 'Statewide' },
  { name: 'National Highway Traffic & Emergency Helpline', number: '1033', area: 'All NH Corridors' },
  { name: 'Police Emergency Response Support System', number: '112', area: 'Toll-Free 24x7' },
]

export function PublicCitizenPortal() {
  const [lang, setLang] = useState<Language>('en')
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'partial' | 'blocked'>('all')

  const t = I18N_STRINGS[lang]

  const stats = useMemo(() => {
    return {
      total: PUBLIC_HIGHWAYS.length,
      open: PUBLIC_HIGHWAYS.filter(h => h.status === 'open').length,
      partial: PUBLIC_HIGHWAYS.filter(h => h.status === 'partial').length,
      blocked: PUBLIC_HIGHWAYS.filter(h => h.status === 'blocked').length,
    }
  }, [])

  const filteredHighways = useMemo(() => {
    return PUBLIC_HIGHWAYS.filter(h => {
      if (selectedFilter !== 'all' && h.status !== selectedFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          h.name.toLowerCase().includes(q) ||
          h.district.toLowerCase().includes(q) ||
          h.condition.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, selectedFilter])

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-white pb-16">
      {/* ── Top Public Header ── */}
      <header className="border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                NER Road Watch
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Public Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Northeast India Real-Time Highway Accessibility
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
              <Globe className="h-3.5 w-3.5 text-slate-400 ml-1 mr-0.5" />
              {(['en', 'as', 'hi', 'bn'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    'px-2 py-0.5 rounded font-medium transition-all text-xs',
                    lang === l
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {l === 'en' ? 'EN' : l === 'as' ? 'অসমীয়া' : l === 'hi' ? 'हिंदी' : 'বাংলা'}
                </button>
              ))}
            </div>

            {/* Official Login Link */}
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span>{t.viewCommandCenter}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* ── Hero Banner ── */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/30 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Highway Bulletin • Monitored 24/7
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Search Box */}
          <div className="mt-6 max-w-2xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-inner"
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
                ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-900/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            )}
          >
            <div className="text-xs text-slate-400 font-medium">Total Corridors</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">All monitored highways</div>
          </button>

          <button
            onClick={() => setSelectedFilter('open')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'open'
                ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-900/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            )}
          >
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t.openRoads}
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.open}</div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">{t.safeToTravel}</div>
          </button>

          <button
            onClick={() => setSelectedFilter('partial')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'partial'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-900/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            )}
          >
            <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t.restrictedRoads}
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.partial}</div>
            <div className="text-[11px] text-amber-500/80 mt-0.5">{t.travelWithCaution}</div>
          </button>

          <button
            onClick={() => setSelectedFilter('blocked')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedFilter === 'blocked'
                ? 'bg-rose-500/15 border-rose-500/50 shadow-lg shadow-rose-900/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            )}
          >
            <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {t.blockedRoads}
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.blocked}</div>
            <div className="text-[11px] text-rose-500/80 mt-0.5">{t.avoidTravel}</div>
          </button>
        </div>

        {/* ── Highway Status List ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-400" />
              Major Highway Corridors Status
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredHighways.length} corridors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHighways.map(h => (
              <div
                key={h.id}
                className={cn(
                  'rounded-xl border p-5 transition-all space-y-3 bg-slate-900/70',
                  h.status === 'blocked'
                    ? 'border-rose-500/40 hover:border-rose-500/70 bg-rose-950/10'
                    : h.status === 'partial'
                    ? 'border-amber-500/40 hover:border-amber-500/70 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-white">{h.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {h.district}
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider',
                      h.status === 'blocked'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : h.status === 'partial'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    )}
                  >
                    {h.status === 'blocked' ? 'BLOCKED' : h.status === 'partial' ? 'RESTRICTED' : 'OPEN'}
                  </span>
                </div>

                <div className="text-sm text-slate-200 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Current Condition:</div>
                  {h.condition}
                </div>

                {h.alternate && (
                  <div className="text-xs text-blue-300/90 bg-blue-950/30 p-2.5 rounded-lg border border-blue-900/40 flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-300">Public Advisory: </span>
                      {h.alternate}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                  <span className="flex items-center gap-1">
                    <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                    {h.rainfall}
                  </span>
                  <span>Verified: {h.lastInspected}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Emergency Helplines Section ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Phone className="h-5 w-5 text-rose-400" />
            {t.emergencyHelplines}
          </div>
          <p className="text-xs text-slate-400">
            For stranded travelers, medical evacuations, or reporting unrecorded road landslides:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HELPLINES.map(item => (
              <div key={item.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                <div className="text-sm font-mono font-bold text-rose-400">{item.number}</div>
                <div className="text-[10px] text-slate-500">{item.area}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer / Privacy Notice ── */}
        <div className="text-center text-xs text-slate-500 space-y-1 pt-4 border-t border-slate-800/60">
          <p>{t.lastUpdated}</p>
          <p className="text-[11px] text-slate-600">
            Official Public Transparency Portal • National Highway Infrastructure & Logistics Authority
          </p>
        </div>
      </main>
    </div>
  )
}
