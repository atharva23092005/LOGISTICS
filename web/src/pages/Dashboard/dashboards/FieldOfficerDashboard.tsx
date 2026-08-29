import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio, Camera, MapPin, Wifi, WifiOff, Upload,
  AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw,
  Navigation, CloudRain, Eye, Image as ImageIcon, X, Trash2,
  Compass, ShieldAlert, FileText, CheckCheck, Filter, Search,
  Phone, Truck, Shield, AlertCircle, Droplets, Wind, ChevronRight,
  Globe, Database, HardDrive, ArrowUpRight, Check, AlertOctagon,
  Sparkles, Layers, Sliders, Battery, Signal, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetTrigger
} from '@/components/ui/sheet'
import { MapEngine } from '@/modules/map/MapEngine'
import { useAppStore } from '@/stores/appStore'
import { useAlertStore } from '@/stores/alertStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useEventBus } from '@/stores/eventBus'
import { mockDistricts } from '@/mock/districts'
import { mockWeather } from '@/mock/weather'
import { timeAgo } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { IncidentType } from '@/types'

// Supported Northeast Regional Languages per i18n-string-checker
type AndroidLang = 'en' | 'as' | 'bn' | 'bodo' | 'mni' | 'hi'

const ANDROID_I18N: Record<AndroidLang, Record<string, string>> = {
  en: {
    appTitle: 'NER Field Officer',
    sector: 'East Siang Sector (Pasighat)',
    offlineActive: 'Offline SQLite DB Active',
    onlineSynced: 'Cloud Synced',
    tabQueue: 'Reports Queue',
    tabNew: 'Report Obstacle',
    tabCheckpoints: 'Checkpoints',
    tabMap: 'Offline Map',
    tabSync: 'Sync & Storage',
    reportIncident: 'Submit Ground Report',
    captureGeoPhoto: 'Capture Geo-Tagged Photo',
    passability: 'Passability Status',
    clearanceEta: 'Clearance ETA',
    gpsFix: 'GPS Accuracy',
    syncNow: 'Sync Pending Queue',
    mbtilesPack: 'Offline Map Pack (142 MB Cached)',
  },
  as: {
    appTitle: 'উত্তৰ-পূব ক্ষেত্ৰ বিষয়া',
    sector: 'পূব ছিয়াং খণ্ড (পাছিঘাট)',
    offlineActive: 'অফলাইন ডাটাবেছ সক্ৰিয়',
    onlineSynced: 'ক্লাউডৰ সৈতে সংযুক্ত',
    tabQueue: 'প্ৰতিবেদন তালিকা',
    tabNew: 'নতুন প্ৰতিবেদন',
    tabCheckpoints: 'চেকপইণ্ট',
    tabMap: 'অফলাইন মেপ',
    tabSync: 'সংৰক্ষণ আৰু ছিংক',
    reportIncident: 'প্ৰতিবেদন দাখিল কৰক',
    captureGeoPhoto: 'জিঅ’-টেগযুক্ত ফটো লওক',
    passability: 'চলাচলৰ অৱস্থা',
    clearanceEta: 'মুকলি হোৱাৰ সম্ভাৱ্য সময়',
    gpsFix: 'জি.পি.এছ. সঠিকতা',
    syncNow: 'এতিয়াই ছিংক কৰক',
    mbtilesPack: 'অফলাইন মেপ পেক (১৪২ এম.বি.)',
  },
  bn: {
    appTitle: 'উত্তর-পূর্ব ফিল্ড অফিসার',
    sector: 'পূর্ব সিয়াং সেক্টর (পাসিঘাট)',
    offlineActive: 'অফলাইন ডেটাবেস সক্রিয়',
    onlineSynced: 'ক্লাউড সিঙ্ক সম্পন্ন',
    tabQueue: 'রিপোর্ট তালিকা',
    tabNew: 'নতুন রিপোর্ট',
    tabCheckpoints: 'চেকপয়েন্ট',
    tabMap: 'অফলাইন মানচিত্র',
    tabSync: 'সিঙ্ক ও স্টোরেজ',
    reportIncident: 'মাঠ রিপোর্ট জমা দিন',
    captureGeoPhoto: 'জিও-ট্যাগ ছবি তুলুন',
    passability: 'চলাচল পরিস্থিতি',
    clearanceEta: 'উদ্ধারের আনুমানিক সময়',
    gpsFix: 'জিপিএস নির্ভুলতা',
    syncNow: 'এখনই সিঙ্ক করুন',
    mbtilesPack: 'অফলাইন ম্যাপ প্যাক (১৪২ এমবি)',
  },
  bodo: {
    appTitle: 'NER फोथार बिबानगिरि',
    sector: 'सानजा सियां (पासिघाट)',
    offlineActive: 'अफलाइन डेटाबेस सोलिगासिनो',
    onlineSynced: 'क्लाउड सिंक जाबाय',
    tabQueue: 'फोरमायथि लायसि',
    tabNew: 'गोदान खौरां',
    tabCheckpoints: 'चेकपइन्ट',
    tabMap: 'अफलाइन नक्सा',
    tabSync: 'सिंक आरो दोनथुमनाय',
    reportIncident: 'खौरां दैथायहर',
    captureGeoPhoto: 'जिओ-टेग फोटो लानाय',
    passability: 'थांनाय-फैनायनि थासारि',
    clearanceEta: 'उदां जानायनि समा',
    gpsFix: 'GPS थारथि',
    syncNow: 'दासान्दि सिंक खालाम',
    mbtilesPack: 'अफलाइन नक्सा (142 MB)',
  },
  mni: {
    appTitle: 'NER ꯂꯃꯥꯡ ꯑꯣꯐꯤꯁꯔ',
    sector: 'ꯅꯣꯡꯄꯣꯛ ꯁꯤꯌꯥꯡ (ꯄꯥꯁꯤꯘꯥꯠ)',
    offlineActive: 'ꯑꯣꯐꯂꯥꯏꯟ ꯗꯦꯇꯥꯕꯦꯁ ꯆꯠꯊꯔꯤ',
    onlineSynced: 'ꯀ꯭ꯂꯥꯎꯗ ꯁꯤꯡꯛ ꯇꯧꯔꯦ',
    tabQueue: 'ꯔꯤꯄꯣꯔꯠ ꯂꯤꯁ꯭ꯠ',
    tabNew: 'ꯑꯅꯧꯕ ꯄꯥꯎ',
    tabCheckpoints: 'ꯆꯦꯛꯄꯣꯏꯟ꯭ꯠ',
    tabMap: 'ꯑꯣꯐꯂꯥꯏꯟ ꯃꯦꯞ',
    tabSync: 'ꯁꯤꯡꯛ ꯑꯃꯁꯨꯡ ꯁ꯭ꯇꯣꯔꯦꯖ',
    reportIncident: 'ꯄꯥꯎ ꯊꯥꯒꯠꯂꯨ',
    captureGeoPhoto: 'ꯖꯤꯑꯣ-ꯇꯦꯒ ꯐꯣꯇꯣ',
    passability: 'ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯐꯤꯚꯝ',
    clearanceEta: 'ꯍꯥꯡꯗꯣꯛꯄꯒꯤ ꯃꯇꯝ',
    gpsFix: 'GPS ꯑꯆꯨꯝꯕ',
    syncNow: 'ꯍꯧꯖꯤꯛ ꯁꯤꯡꯛ ꯇꯧꯔꯣ',
    mbtilesPack: 'ꯑꯣꯐꯂꯥꯏꯟ ꯃꯦꯞ ꯄꯦꯛ (142 MB)',
  },
  hi: {
    appTitle: 'पूर्वोत्तर फील्ड ऑफिसर ऐप',
    sector: 'पूर्वी सियांग सेक्टर (पासीघाट)',
    offlineActive: 'ऑफ़लाइन SQLite डेटाबेस सक्रिय',
    onlineSynced: 'क्लाउड से सिंक हुआ',
    tabQueue: 'रिपोर्ट सूची',
    tabNew: 'अवरोध दर्ज करें',
    tabCheckpoints: 'चेकपॉइंट',
    tabMap: 'ऑफ़लाइन मानचित्र',
    tabSync: 'सिंक एवं स्टोरेज',
    reportIncident: 'ग्राउंड रिपोर्ट सबमिट करें',
    captureGeoPhoto: 'जियो-टैग्ड फोटो खींचें',
    passability: 'मार्ग सुगमता स्थिति',
    clearanceEta: 'मार्ग बहाली का समय',
    gpsFix: 'जीपीएस सटीकता',
    syncNow: 'अभी सिंक करें',
    mbtilesPack: 'ऑफ़लाइन मैप पैक (142 MB)',
  },
}

interface LocalReportRecord {
  id: string
  localDbId: number
  type: IncidentType
  title: string
  highway: string
  passability: 'blocked' | 'single_lane' | 'caution'
  clearanceEta: string
  locationText: string
  description: string
  photos: Array<{ name: string; sizeKb: number; gps: { lat: number; lng: number; alt: number }; timestamp: string }>
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  retryCount: number
  localCreatedAt: string
  serverSyncedAt?: string
  reportedBy: string
  coords: { lat: number; lng: number }
}

const INITIAL_LOCAL_QUEUE: LocalReportRecord[] = [
  {
    id: 'rec-1',
    localDbId: 101,
    type: 'landslide',
    title: 'Km 42 Mountain Mudslide Blockade',
    highway: 'NH-415',
    passability: 'blocked',
    clearanceEta: '2-6h',
    locationText: 'NH-415 Km 42 (Jeypore Pass)',
    description: 'Approx 200m road surface buried under rocky slurry. 3 freight trucks held. Heavy earthmover required.',
    photos: [
      { name: 'IMG_20250829_0915_GEO.jpg', sizeKb: 340, gps: { lat: 27.7000, lng: 95.0500, alt: 820 }, timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
      { name: 'IMG_20250829_0916_GEO.jpg', sizeKb: 410, gps: { lat: 27.7002, lng: 95.0503, alt: 822 }, timestamp: new Date(Date.now() - 24 * 60000).toISOString() },
    ],
    syncStatus: 'synced',
    retryCount: 0,
    localCreatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    serverSyncedAt: new Date(Date.now() - 24 * 60000).toISOString(),
    reportedBy: 'Field Officer Priya Das',
    coords: { lat: 27.7000, lng: 95.0500 },
  },
  {
    id: 'rec-2',
    localDbId: 102,
    type: 'bridge_damage',
    title: 'Expansion Joint Fracture — SH-15 Bridge',
    highway: 'SH-15',
    passability: 'single_lane',
    clearanceEta: '12-24h',
    locationText: 'SH-15 Pasighat Approach Span',
    description: 'Surface crack along eastern approach joint. Heavy multi-axle freight restricted to single lane.',
    photos: [
      { name: 'IMG_20250829_1040_GEO.jpg', sizeKb: 280, gps: { lat: 26.9000, lng: 93.9000, alt: 145 }, timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
    ],
    syncStatus: 'pending',
    retryCount: 0,
    localCreatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    reportedBy: 'Field Officer Priya Das',
    coords: { lat: 26.9000, lng: 93.9000 },
  },
]

export function FieldOfficerDashboard() {
  const user = useAppStore(s => s.user)
  const networkOnline = useAppStore(s => s.networkOnline)
  const emit = useEventBus(s => s.emit)

  const [lang, setLang] = useState<AndroidLang>('en')
  const [activeTab, setActiveTab] = useState<'queue' | 'new' | 'checkpoints' | 'map' | 'storage'>('queue')
  const [queue, setQueue] = useState<LocalReportRecord[]>(INITIAL_LOCAL_QUEUE)
  const [isSyncing, setIsSyncing] = useState(false)
  const [cameraModal, setCameraModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<LocalReportRecord | null>(null)
  const [viewDetailModal, setViewDetailModal] = useState(false)

  // Form state
  const [form, setForm] = useState({
    type: 'landslide' as IncidentType,
    title: '',
    highway: 'NH-415',
    passability: 'blocked' as 'blocked' | 'single_lane' | 'caution',
    clearanceEta: '2-6h',
    locationText: '',
    description: '',
  })
  const [attachedPhotos, setAttachedPhotos] = useState<Array<{ name: string; sizeKb: number; gps: { lat: number; lng: number; alt: number }; timestamp: string }>>([])
  const [gpsFix, setGpsFix] = useState({ lat: 27.7015, lng: 95.0512, alt: 818, accuracyMeters: 3.8 })

  const t = ANDROID_I18N[lang]

  const pendingCount = useMemo(() => queue.filter(q => q.syncStatus === 'pending').length, [queue])
  const syncedCount = useMemo(() => queue.filter(q => q.syncStatus === 'synced').length, [queue])

  // Simulated Auto-Sync Service (Exponential Backoff per offline-first-sync-scaffolder)
  const drainSyncQueue = useCallback(() => {
    if (pendingCount === 0) {
      toast.info('Local SQLite database is already fully synced.')
      return
    }

    setIsSyncing(true)
    toast.info(`🔄 Sync Service: Draining ${pendingCount} pending records from local storage...`)

    setTimeout(() => {
      setQueue(prev =>
        prev.map(item =>
          item.syncStatus === 'pending'
            ? { ...item, syncStatus: 'synced', serverSyncedAt: new Date().toISOString() }
            : item
        )
      )
      setIsSyncing(false)
      toast.success(`✅ Cloud Sync Complete: ${pendingCount} reports uploaded to HQ`, {
        description: 'Tamper-evident geo-tags & photos verified by backend gateway.',
      })
      emit('OFFLINE_SYNC', { reportCount: pendingCount, photosUploaded: 3 })
    }, 2000)
  }, [pendingCount, emit])

  // Capture Geo-Tagged Photo simulation (geo-photo-capture)
  const handleSnapPhoto = () => {
    const timestamp = new Date().toISOString()
    const fileName = `GEO_${Date.now().toString().slice(-6)}_NH415.jpg`
    const photo = {
      name: fileName,
      sizeKb: 365, // Compressed under 500KB budget with EXIF intact
      gps: { lat: gpsFix.lat, lng: gpsFix.lng, alt: gpsFix.alt },
      timestamp,
    }
    setAttachedPhotos(prev => [photo, ...prev])
    setCameraModal(false)
    toast.success(`📸 Photo captured with GPS EXIF metadata`, {
      description: `${gpsFix.lat.toFixed(4)}°N, ${gpsFix.lng.toFixed(4)}°E (Alt ${gpsFix.alt}m • ±${gpsFix.accuracyMeters}m)`,
    })
  }

  const handleSubmitNewReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Please provide an incident summary title')
      return
    }

    const newRec: LocalReportRecord = {
      id: `rec-${Date.now()}`,
      localDbId: 100 + queue.length + 1,
      type: form.type,
      title: form.title,
      highway: form.highway,
      passability: form.passability,
      clearanceEta: form.clearanceEta,
      locationText: form.locationText || `${form.highway}, East Siang Sector`,
      description: form.description || 'Ground survey submitted via Android Field Officer terminal.',
      photos: attachedPhotos.length > 0 ? attachedPhotos : [
        { name: `GEO_DEFAULT_${Date.now().toString().slice(-4)}.jpg`, sizeKb: 320, gps: { lat: gpsFix.lat, lng: gpsFix.lng, alt: gpsFix.alt }, timestamp: new Date().toISOString() }
      ],
      syncStatus: networkOnline ? 'synced' : 'pending',
      retryCount: 0,
      localCreatedAt: new Date().toISOString(),
      serverSyncedAt: networkOnline ? new Date().toISOString() : undefined,
      reportedBy: user?.name ?? 'Field Officer Priya Das',
      coords: { lat: gpsFix.lat, lng: gpsFix.lng },
    }

    setQueue(prev => [newRec, ...prev])
    
    // Reset form
    setForm({
      type: 'landslide',
      title: '',
      highway: 'NH-415',
      passability: 'blocked',
      clearanceEta: '2-6h',
      locationText: '',
      description: '',
    })
    setAttachedPhotos([])

    if (networkOnline) {
      toast.success('Ground report written to local DB & synced to HQ', {
        description: newRec.title,
      })
      emit('FIELD_INCIDENT_REPORTED', {
        type: newRec.type,
        location: newRec.coords,
        reportedBy: newRec.reportedBy,
      })
    } else {
      toast.warning('Offline: Written to encrypted local SQLite queue. Will sync automatically upon reconnect.', {
        duration: 7000,
      })
    }

    setActiveTab('queue')
  }

  return (
    <div className="h-screen w-full bg-[#070B14] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-white flex flex-col max-w-md mx-auto border-x border-slate-800 shadow-2xl overflow-hidden relative">
      
      {/* ── Android Status Bar (System Bar) ── */}
      <div className="h-6 bg-[#04070D] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 flex-shrink-0 z-40 select-none">
        <div className="flex items-center gap-1.5">
          <span>09:41</span>
          <span className="text-[10px] text-slate-500">•</span>
          <span className="text-[10px] text-blue-400">NER-PWA v2.4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-slate-300">
            <Signal className="h-3 w-3 text-emerald-400" />
            4G / Flaky
          </span>
          <span className="flex items-center gap-0.5 text-slate-300">
            <Battery className="h-3.5 w-3.5 text-emerald-400" />
            86%
          </span>
        </div>
      </div>

      {/* ── Android App Bar (Header) ── */}
      <header className="p-3 bg-[#0A101E] border-b border-slate-800/90 flex items-center justify-between gap-2 flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-bold text-xs sm:text-sm text-white tracking-tight leading-tight flex items-center gap-1.5">
              {t.appTitle}
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                LOCAL DB
              </span>
            </h1>
            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
              {user?.name ?? 'Priya Das'} • {t.sector}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Switcher Dropdown */}
          <select
            value={lang}
            onChange={e => setLang(e.target.value as AndroidLang)}
            className="bg-slate-900 border border-slate-700 text-[10px] text-white rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="en">English</option>
            <option value="as">অসমীয়া</option>
            <option value="bn">বাংলা</option>
            <option value="bodo">बड़ो</option>
            <option value="mni">ꯃꯩꯇꯩ</option>
            <option value="hi">हिंदी</option>
          </select>

          {/* Sync Queue Trigger Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={drainSyncQueue}
            disabled={isSyncing}
            className="h-7 px-2 text-[10px] gap-1 border-slate-700 bg-slate-900/80 text-slate-200"
          >
            <RefreshCw className={cn('h-3 w-3 text-blue-400', isSyncing && 'animate-spin')} />
            <span className="font-mono font-bold text-amber-400">{pendingCount}</span>
          </Button>
        </div>
      </header>

      {/* ── Offline DB & GPS Telemetry Chip Strip ── */}
      <div className="bg-[#050912] px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-1.5 font-mono">
          <Database className="h-3 w-3 text-blue-400" />
          <span>SQLite: <strong>{queue.length} recs</strong> ({pendingCount} pending)</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-emerald-400">
          <Compass className="h-3 w-3" />
          <span>GPS: ±{gpsFix.accuracyMeters}m (Fix OK)</span>
        </div>
      </div>

      {/* ── Main Android Tab Views Container ── */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3 relative pb-16">
        
        {/* ── TAB 1: REPORTS QUEUE (LOCAL SQLITE STORAGE) ── */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Ground Inspection Records
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {syncedCount} Synced • {pendingCount} Pending
              </span>
            </div>

            {queue.map(item => (
              <Card
                key={item.id}
                className={cn(
                  'bg-[#0C1220] border p-3.5 space-y-2.5 transition-all text-white',
                  item.syncStatus === 'pending'
                    ? 'border-amber-500/40 shadow-md shadow-amber-950/20 bg-amber-950/5'
                    : 'border-slate-800/80'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {item.locationText}
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider',
                      item.syncStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    )}
                  >
                    {item.syncStatus === 'pending' ? '⏳ PENDING' : '✓ SYNCED'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60 font-mono">
                  <span>Photos: <strong>{item.photos.length} attached</strong></span>
                  <span>{timeAgo(item.localCreatedAt)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setSelectedRecord(item); setViewDetailModal(true) }}
                    className="w-full text-xs h-8 gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-400" />
                    Inspect Local Record (JSON & EXIF)
                  </Button>
                </div>
              </Card>
            ))}

            {/* Quick Action: Sync Now Banner */}
            {pendingCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                <span>{pendingCount} offline report(s) queued for sync.</span>
                <Button size="sm" onClick={drainSyncQueue} className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-7 text-xs">
                  Sync Now
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: NEW OBSTACLE REPORT (OFFLINE-FIRST FORM) ── */}
        {activeTab === 'new' && (
          <form onSubmit={handleSubmitNewReport} className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {t.reportIncident}
            </div>

            <Card className="bg-[#0C1220] border-slate-800 p-3.5 space-y-3 text-xs text-white">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Obstacle Summary Title:</label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Km 48 Active Rockfall Obstruction..."
                  className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Highway:</label>
                  <select
                    value={form.highway}
                    onChange={e => setForm({ ...form, highway: e.target.value })}
                    className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2 text-white text-xs"
                  >
                    <option value="NH-415">NH-415 (Dibrugarh – Pasighat)</option>
                    <option value="SH-15">SH-15 (North Lakhimpur – Pasighat)</option>
                    <option value="NH-27">NH-27 (Guwahati – Nagaon)</option>
                    <option value="NH-37">NH-37 (Guwahati – Lumding)</option>
                    <option value="NH-13">NH-13 (Itanagar – Along)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">{t.passability}:</label>
                  <select
                    value={form.passability}
                    onChange={e => setForm({ ...form, passability: e.target.value as any })}
                    className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2 text-white text-xs"
                  >
                    <option value="blocked">Total Blockade (Impassable)</option>
                    <option value="single_lane">Single-Lane Alternate Flow</option>
                    <option value="caution">Caution / High Clearance 4x4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Survey Description & Damage Notes:</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe debris volume, road width affected, excavator requirement..."
                  className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Geo-Tagged Camera Attachment Box (geo-photo-capture) */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Geo-Tagged Evidence Photos ({attachedPhotos.length}):</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setCameraModal(true)}
                    className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    <Camera className="h-3 w-3" />
                    Take Geo-Photo
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {attachedPhotos.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="truncate">
                        <div className="font-mono text-white truncate">{p.name}</div>
                        <div className="text-[9px] text-slate-400">{p.sizeKb}KB • GPS Tagged</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 shadow-lg shadow-emerald-950/40"
              >
                <Check className="h-4 w-4 mr-1" />
                Write to Local SQLite & Sync
              </Button>
            </Card>
          </form>
        )}

        {/* ── TAB 3: CHECKPOINTS & INFRASTRUCTURE LOGS ── */}
        {activeTab === 'checkpoints' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Patrol Sector Checkpoints
            </div>

            {[
              { name: 'Pasighat Brahmaputra Span Bridge', highway: 'NH-415', status: 'Operational', notes: 'Deck joints clear. Water level normal.', verified: '20m ago' },
              { name: 'Km 42 Slope Stabilization Point', highway: 'NH-415', status: 'Mudslide Blocked', notes: 'Active debris runoff. Road impassable.', verified: '25m ago' },
              { name: 'SH-15 Approach Span Abutment', highway: 'SH-15', status: 'Caution (Single Lane)', notes: 'Expansion crack monitored.', verified: '1h ago' },
            ].map(cp => (
              <Card key={cp.name} className="bg-[#0C1220] border-slate-800 p-3 space-y-1.5 text-xs text-white">
                <div className="flex items-center justify-between">
                  <strong className="text-white">{cp.name}</strong>
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded font-mono',
                    cp.status.includes('Blocked') ? 'bg-rose-500/20 text-rose-400' : cp.status.includes('Caution') ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {cp.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{cp.notes}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 font-mono">
                  Checked by Officer Priya Das • {cp.verified}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── TAB 4: OFFLINE MAP TILES (MBTILES PACKER) ── */}
        {activeTab === 'map' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <HardDrive className="h-3.5 w-3.5 text-blue-400" />
                {t.mbtilesPack}
              </span>
              <Badge variant="success" className="text-[9px]">OFFLINE READY</Badge>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 min-h-[320px] relative">
              <MapEngine className="w-full h-full" />
            </div>
          </div>
        )}

        {/* ── TAB 5: SYNC & STORAGE AUDIT ── */}
        {activeTab === 'storage' && (
          <div className="space-y-3 text-xs">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {t.tabSync}
            </div>

            <Card className="bg-[#0C1220] border-slate-800 p-3.5 space-y-3 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Local SQLite DB Engine:</span>
                <strong className="text-emerald-400 font-mono">Room/SQLite v3.4</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Total Local Queue Records:</span>
                <strong className="font-mono">{queue.length} items</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Pending Server Sync:</span>
                <strong className="font-mono text-amber-400">{pendingCount} items</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Pre-Packaged MBTiles:</span>
                <strong className="font-mono text-blue-400">East Siang (142 MB)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Conflict Resolution:</span>
                <strong className="text-slate-300">Server Canonical / Client Reconcile</strong>
              </div>

              <Button
                onClick={drainSyncQueue}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 mt-2"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Force Drain Sync Queue
              </Button>
            </Card>
          </div>
        )}
      </main>

      {/* ── Android Floating Camera Trigger (FAB) ── */}
      <div className="absolute right-4 bottom-16 z-30">
        <Button
          size="lg"
          onClick={() => { setActiveTab('new'); setCameraModal(true) }}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-900/60 p-0 flex items-center justify-center border border-blue-400/40"
          title="Quick Geo-Photo Report"
        >
          <Camera className="h-5 w-5" />
        </Button>
      </div>

      {/* ── Android Bottom Navigation Bar ── */}
      <nav className="h-14 bg-[#0A101E] border-t border-slate-800/90 grid grid-cols-5 items-center justify-around flex-shrink-0 z-40 select-none">
        <button
          onClick={() => setActiveTab('queue')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'queue' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <FileText className="h-4 w-4" />
          <span className="text-[10px]">Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('new')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'new' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="text-[10px]">Report</span>
        </button>

        <button
          onClick={() => setActiveTab('checkpoints')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'checkpoints' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          <span className="text-[10px]">Patrol</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'map' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Compass className="h-4 w-4" />
          <span className="text-[10px]">Map</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'storage' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Database className="h-4 w-4" />
          <span className="text-[10px]">Sync</span>
        </button>
      </nav>

      {/* ── Geo-Camera Viewfinder Simulation Modal (geo-photo-capture) ── */}
      {cameraModal && (
        <Modal
          open={cameraModal}
          onClose={() => setCameraModal(false)}
          title="Android Geo-Camera Viewfinder"
          description="GPS Metadata EXIF Embedded Automatically"
          size="md"
        >
          <div className="space-y-3 text-xs">
            {/* Viewfinder Canvas */}
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-700 h-48 relative flex items-center justify-center">
              <div className="text-center space-y-2 text-slate-400">
                <Camera className="h-10 w-10 text-blue-400 mx-auto animate-pulse" />
                <div className="text-xs text-slate-300">Live Lens Preview (Mountain Slope NH-415)</div>
                <div className="text-[10px] font-mono text-emerald-400">
                  EXIF: {gpsFix.lat.toFixed(4)}°N, {gpsFix.lng.toFixed(4)}°E (Alt: {gpsFix.alt}m)
                </div>
              </div>

              {/* Viewfinder Crosshairs */}
              <div className="absolute inset-4 border border-dashed border-white/20 pointer-events-none rounded-lg" />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-400">Target Budget: <strong className="text-white">&lt; 500 KB (High-Compression PWA)</strong></div>
              <div className="text-slate-400">Tamper-Proof EXIF: <strong className="text-emerald-400">Embedded Before Compression</strong></div>
            </div>

            <Button
              onClick={handleSnapPhoto}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10"
            >
              Capture & Embed Geo-Metadata
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Record Inspector Modal ── */}
      {viewDetailModal && selectedRecord && (
        <Modal
          open={viewDetailModal}
          onClose={() => setViewDetailModal(false)}
          title={`SQLite Local Record: ${selectedRecord.title}`}
          description={`Local DB ID: #${selectedRecord.localDbId} • Status: ${selectedRecord.syncStatus.toUpperCase()}`}
          size="md"
        >
          <div className="space-y-3 text-xs text-white">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div>Highway: <span className="text-blue-400">{selectedRecord.highway}</span></div>
              <div>Passability: <span className="text-amber-400">{selectedRecord.passability}</span></div>
              <div>Clearance ETA: <span>{selectedRecord.clearanceEta}</span></div>
              <div>GPS Fix: <span className="text-emerald-400">{selectedRecord.coords.lat}°N, {selectedRecord.coords.lng}°E</span></div>
              <div>Created: <span>{selectedRecord.localCreatedAt}</span></div>
              {selectedRecord.serverSyncedAt && (
                <div>Server Synced: <span className="text-emerald-400">{selectedRecord.serverSyncedAt}</span></div>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Damage Description:</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                {selectedRecord.description}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Attached Geo-Photos ({selectedRecord.photos.length}):</label>
              <div className="space-y-1.5">
                {selectedRecord.photos.map(p => (
                  <div key={p.name} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span>{p.name} ({p.sizeKb}KB)</span>
                    <span className="text-emerald-400">{p.gps.lat}°N, {p.gps.lng}°E</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
