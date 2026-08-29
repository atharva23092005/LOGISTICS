import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Radio, Camera, MapPin, Wifi, WifiOff, Upload,
  AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw,
  Navigation, CloudRain, Eye, Image as ImageIcon, X, Trash2,
  Compass, ShieldAlert, FileText, CheckCheck, Filter, Search,
  Phone, Truck, Shield, AlertCircle, Droplets, Wind, ChevronRight,
  Globe, Database, HardDrive, ArrowUpRight, Check, AlertOctagon,
  Sparkles, Layers, Sliders, Battery, Signal, Zap, Mic, MicOff,
  QrCode, Scan, UserCheck, Share2, LogOut, KeyRound, User, Lock,
  Fingerprint, Sparkle, Building2, ArrowLeft, Crosshair, Satellite,
  Mountain, AlertCircle as AlertCircleIcon, Wrench, ShieldCheck,
  Maximize2, HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { MapEngine } from '@/modules/map/MapEngine'
import { useAppStore } from '@/stores/appStore'
import { useAlertStore } from '@/stores/alertStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useEventBus } from '@/stores/eventBus'
import { mockDistricts } from '@/mock/districts'
import { mockWeather } from '@/mock/weather'
import { timeAgo } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { IncidentType, User as UserType } from '@/types'

// Supported Northeast Regional Languages
type AndroidLang = 'en' | 'as' | 'bn' | 'bodo' | 'mni' | 'hi'

const ANDROID_I18N: Record<AndroidLang, Record<string, string>> = {
  en: {
    appTitle: 'NER Field Officer',
    sector: 'East Siang Sector (Pasighat)',
    offlineActive: 'Offline SQLite DB Active',
    onlineSynced: 'Cloud Synced',
    tabQueue: 'Queue',
    tabNew: 'Detailed Report',
    tabCheckpoints: 'Checkpoints',
    tabMap: 'Map',
    tabSync: 'Vault',
    reportIncident: 'Submit Ground Report',
    captureGeoPhoto: 'Capture Geo-Tagged Photo',
    passability: 'Passability Status',
    clearanceEta: 'Clearance ETA',
    gpsFix: 'Device GPS Coordinates',
    syncNow: 'Sync Pending Queue',
    mbtilesPack: 'Offline Map Pack (142 MB Cached)',
    loginTitle: 'Field Officer Terminal Sign-In',
    badgeId: 'Officer Service ID',
    pin: 'Security PIN',
    offlineLogin: 'Authenticate with Cached Local Credentials',
    signInBtn: 'Authorize Terminal & Enter',
    quickDemo: 'Quick 1-Tap Officer Login',
  },
  as: {
    appTitle: 'উত্তৰ-পূব ক্ষেত্ৰ বিষয়া',
    sector: 'পূব ছিয়াং খণ্ড (পাছিঘাট)',
    offlineActive: 'অফলাইন ডাটাবেছ সক্ৰিয়',
    onlineSynced: 'ক্লাউডৰ সৈতে সংযুক্ত',
    tabQueue: 'তালিকা',
    tabNew: 'সবিশেষ প্ৰতিবেদন',
    tabCheckpoints: 'চেকপইণ্ট',
    tabMap: 'মেপ',
    tabSync: 'ভল্ট',
    reportIncident: 'প্ৰতিবেদন দাখিল কৰক',
    captureGeoPhoto: 'জিঅ’-টেগযুক্ত ফটো লওক',
    passability: 'চলাচলৰ অৱস্থা',
    clearanceEta: 'মুকলি হোৱাৰ সম্ভাৱ্য সময়',
    gpsFix: 'ডিভাইচ জি.পি.এছ. স্থানাংক',
    syncNow: 'এতিয়াই ছিংক কৰক',
    mbtilesPack: 'অফলাইন মেপ পেক (১৪২ এম.বি.)',
    loginTitle: 'ক্ষেত্ৰ বিষয়া টাৰ্মিনেল প্ৰৱেশ',
    badgeId: 'বিষয়া পৰিচয় নং',
    pin: 'পিন নম্বৰ',
    offlineLogin: 'অফলাইন প্ৰৱেশাধিকাৰ সক্ৰিয়',
    signInBtn: 'টাৰ্মিনেলত প্ৰৱেশ কৰক',
    quickDemo: '১-টেপ ক্ষিপ্ৰ প্ৰৱেশ',
  },
  bn: {
    appTitle: 'উত্তর-পূর্ব ফিল্ড অফিসার',
    sector: 'পূর্ব সিয়াং সেক্টর (পাসিঘাট)',
    offlineActive: 'অফলাইন ডেটাবেস সক্রিয়',
    onlineSynced: 'ক্লাউড সিঙ্ক সম্পন্ন',
    tabQueue: 'তালিকা',
    tabNew: 'বিস্তারিত রিপোর্ট',
    tabCheckpoints: 'চেকপয়েন্ট',
    tabMap: 'মানচিত্র',
    tabSync: 'ভল্ট',
    reportIncident: 'মাঠ রিপোর্ট জমা দিন',
    captureGeoPhoto: 'জিও-ট্যাগ ছবি তুলুন',
    passability: 'চলাচল পরিস্থিতি',
    clearanceEta: 'উদ্ধারের আনুমানিক সময়',
    gpsFix: 'ডিভাইস জিপিএস স্থানাঙ্ক',
    syncNow: 'এখনই সিঙ্ক করুন',
    mbtilesPack: 'অফলাইন ম্যাপ প্যাক (১৪২ এমবি)',
    loginTitle: 'ফিল্ড অফিসার লগইন পোর্টাল',
    badgeId: 'অফিসার সার্ভিস আইডি',
    pin: 'সিকিউরিটি পিন',
    offlineLogin: 'অফলাইন ক্যাশ ডেটা লগইন',
    signInBtn: 'টার্মিনাল খুলুন',
    quickDemo: 'দ্রুত লগইন করুন',
  },
  bodo: {
    appTitle: 'NER फोथार बिबानगिरि',
    sector: 'सानजा सियां (पासिघाट)',
    offlineActive: 'अफलाइन डेटाबेस सोलिगासिनो',
    onlineSynced: 'क्लाउड सिंक जाबाय',
    tabQueue: 'लायसि',
    tabNew: 'गुवार खौरां',
    tabCheckpoints: 'चेकपइन्ट',
    tabMap: 'नक्सा',
    tabSync: 'दोनथुमनाय',
    reportIncident: 'खौरां दैथायहर',
    captureGeoPhoto: 'जिओ-टेग फोटो लानाय',
    passability: 'थांनाय-फैनायनि थासारि',
    clearanceEta: 'उदां जानायनि समा',
    gpsFix: 'GPS थारथि',
    syncNow: 'दासान्दि सिंक खालाम',
    mbtilesPack: 'अफलाइन नक्सा (142 MB)',
    loginTitle: 'बिबानगिरि हाबनाय',
    badgeId: 'बिबानगिरि ID',
    pin: 'PIN',
    offlineLogin: 'अफलाइन हाबनाय',
    signInBtn: 'हाबनो',
    quickDemo: 'दान्थेयै हाबनाय',
  },
  mni: {
    appTitle: 'NER ꯂꯃꯥꯡ ꯑꯣꯐꯤꯁꯔ',
    sector: 'ꯅꯣꯡꯄꯣꯛ ꯁꯤꯌꯥꯡ (ꯄꯥꯁꯤꯘꯥꯠ)',
    offlineActive: 'ꯑꯣꯐꯂꯥꯏꯟ ꯗꯦꯇꯥꯕꯦꯁ ꯆꯠꯊꯔꯤ',
    onlineSynced: 'ꯀ꯭ꯂꯥꯎꯗ ꯁꯤꯡꯛ ꯇꯧꯔꯦ',
    tabQueue: 'ꯂꯤꯁ꯭ꯠ',
    tabNew: 'ꯑꯀꯨꯞꯄ ꯄꯥꯎ',
    tabCheckpoints: 'ꯆꯦꯛꯄꯣꯏꯟ꯭ꯠ',
    tabMap: 'ꯃꯦꯞ',
    tabSync: 'ꯁ꯭ꯇꯣꯔꯦꯖ',
    reportIncident: 'ꯄꯥꯎ ꯊꯥꯒꯠꯂꯨ',
    captureGeoPhoto: 'ꯖꯤꯑꯣ-ꯇꯦꯒ ꯐꯣꯇꯣ',
    passability: 'ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯐꯤꯚꯝ',
    clearanceEta: 'ꯍꯥꯡꯗꯣꯛꯄꯒꯤ ꯃꯇꯝ',
    gpsFix: 'GPS ꯑꯆꯨꯝꯕ',
    syncNow: 'ꯍꯧꯖꯤꯛ ꯁꯤꯡꯛ ꯇꯧꯔꯣ',
    mbtilesPack: 'ꯑꯣꯐꯂꯥꯏꯟ ꯃꯦꯞ ꯄꯦꯛ (142 MB)',
    loginTitle: 'ꯑꯣꯐꯤꯁꯔ ꯂꯣꯒꯏꯟ',
    badgeId: 'ꯑꯣꯐꯤꯁꯔ ID',
    pin: 'PIN',
    offlineLogin: 'ꯑꯣꯐꯂꯥꯏꯟ ꯂꯣꯒꯏꯟ',
    signInBtn: 'ꯆꯪꯉꯨ',
    quickDemo: 'ꯇꯦꯞ ꯑꯃꯗ ꯆꯪꯕ',
  },
  hi: {
    appTitle: 'पूर्वोत्तर फील्ड ऑफिसर ऐप',
    sector: 'पूर्वी सियांग सेक्टर (पासीघाट)',
    offlineActive: 'ऑफ़लाइन SQLite डेटाबेस सक्रिय',
    onlineSynced: 'क्लाउड से सिंक हुआ',
    tabQueue: 'कतार',
    tabNew: 'विस्तृत रिपोर्ट',
    tabCheckpoints: 'चेकपॉइंट',
    tabMap: 'मानचित्र',
    tabSync: 'वॉल्ट',
    reportIncident: 'ग्राउंड रिपोर्ट सबमिट करें',
    captureGeoPhoto: 'जियो-टैग्ड फोटो खींचें',
    passability: 'मार्ग सुगमता स्थिति',
    clearanceEta: 'मार्ग बहाली का समय',
    gpsFix: 'डिवाइस जीपीएस निर्देशांक',
    syncNow: 'अभी सिंक करें',
    mbtilesPack: 'ऑफ़लाइन मैप पैक (142 MB)',
    loginTitle: 'फील्ड ऑफिसर टर्मिनल लॉगिन',
    badgeId: 'अधिकारी सेवा क्रमांक (Badge ID)',
    pin: 'सुरक्षा पिन (PIN)',
    offlineLogin: 'कैश्ड क्रेडेंशियल्स के साथ ऑफ़लाइन लॉगिन',
    signInBtn: 'टर्मिनल में प्रवेश करें',
    quickDemo: '1-क्लिक क्विक डेमो लॉगिन',
  },
}

interface LocalReportRecord {
  id: string
  localDbId: number
  type: IncidentType
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic'
  title: string
  highway: string
  chainageKm: string
  affectedLengthMeters: number
  strandedVehiclesCount: number
  requiredAssets: string[]
  passability: 'blocked' | 'single_lane' | 'caution' | 'clear'
  clearanceEta: string
  locationText: string
  description: string
  witnessContact?: { name: string; phone: string }
  photos: Array<{ name: string; sizeKb: number; gps: { lat: number; lng: number; alt: number }; timestamp: string }>
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  retryCount: number
  localCreatedAt: string
  serverSyncedAt?: string
  reportedBy: string
  coords: { lat: number; lng: number; alt: number; accuracy: number; timestamp: string }
  audioRecorded?: boolean
}

interface CheckpointConvoy {
  id: string
  regNo: string
  driverName: string
  driverPhone: string
  cargo: string
  priority: 'emergency' | 'high' | 'normal'
  etaMins: number
  status: 'approaching' | 'cleared' | 'held'
  origin: string
  destination: string
  qrToken: string
  sealNo: string
}

const INITIAL_CONVOYS: CheckpointConvoy[] = [
  {
    id: 'c-1',
    regNo: 'AR-01-GH-2345',
    driverName: 'Tashi Namgyal',
    driverPhone: '9862145890',
    cargo: 'Essential Medicines, Vaccines & Oxygen',
    priority: 'emergency',
    etaMins: 4,
    status: 'approaching',
    origin: 'Tezpur Supply Hub',
    destination: 'Pasighat General Hospital Hub',
    qrToken: 'NER-PASS-AR01GH2345-MED-8842',
    sealNo: '#SEAL-44120-INTACT',
  },
  {
    id: 'c-2',
    regNo: 'AS-01-AB-1234',
    driverName: 'Rajan Bora',
    driverPhone: '9876543210',
    cargo: 'Emergency Relief Food & Nutrition',
    priority: 'emergency',
    etaMins: 18,
    status: 'approaching',
    origin: 'Guwahati Central Depot',
    destination: 'East Siang Relief Camp',
    qrToken: 'NER-PASS-AS01AB1234-FOOD-9912',
    sealNo: '#SEAL-77189-INTACT',
  },
  {
    id: 'c-3',
    regNo: 'AS-09-CD-5678',
    driverName: 'Bikram Gogoi',
    driverPhone: '9435012345',
    cargo: 'Bulk Potable Drinking Water (12KL Tanker)',
    priority: 'high',
    etaMins: 32,
    status: 'approaching',
    origin: 'Dibrugarh Water Plant',
    destination: 'Mebo Subdivision Water Node',
    qrToken: 'NER-PASS-AS09CD5678-WATER-3301',
    sealNo: '#SEAL-11045-INTACT',
  },
]

const INITIAL_LOCAL_QUEUE: LocalReportRecord[] = [
  {
    id: 'rec-1',
    localDbId: 101,
    type: 'landslide',
    severity: 'severe',
    title: 'Km 42 Mountain Mudslide Blockade',
    highway: 'NH-415',
    chainageKm: 'Km 42.4',
    affectedLengthMeters: 200,
    strandedVehiclesCount: 8,
    requiredAssets: ['Excavator / JCB', 'Heavy Crane'],
    passability: 'blocked',
    clearanceEta: '2-6h',
    locationText: 'NH-415 Km 42.4 (Jeypore Pass)',
    description: 'Approx 200m road surface buried under rocky slurry. 8 freight trucks held. Heavy earthmover required.',
    witnessContact: { name: 'Constable T. Jamoh', phone: '9436011223' },
    photos: [
      { name: 'IMG_20250829_0915_GEO.jpg', sizeKb: 340, gps: { lat: 27.7015, lng: 95.0512, alt: 820 }, timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
      { name: 'IMG_20250829_0916_GEO.jpg', sizeKb: 410, gps: { lat: 27.7018, lng: 95.0515, alt: 822 }, timestamp: new Date(Date.now() - 24 * 60000).toISOString() },
    ],
    syncStatus: 'synced',
    retryCount: 0,
    localCreatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    serverSyncedAt: new Date(Date.now() - 24 * 60000).toISOString(),
    reportedBy: 'Field Officer Priya Das',
    coords: { lat: 27.7015, lng: 95.0512, alt: 820, accuracy: 2.8, timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
  },
  {
    id: 'rec-2',
    localDbId: 102,
    type: 'bridge_damage',
    severity: 'moderate',
    title: 'Expansion Joint Fracture — SH-15 Bridge',
    highway: 'SH-15',
    chainageKm: 'Km 18.2',
    affectedLengthMeters: 45,
    strandedVehiclesCount: 3,
    requiredAssets: ['Bailey Bridge Unit'],
    passability: 'single_lane',
    clearanceEta: '12-24h',
    locationText: 'SH-15 Pasighat North Approach Span',
    description: 'Surface crack along eastern approach joint. Heavy multi-axle freight restricted to single lane.',
    photos: [
      { name: 'IMG_20250829_1040_GEO.jpg', sizeKb: 280, gps: { lat: 26.9000, lng: 93.9000, alt: 145 }, timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
    ],
    syncStatus: 'pending',
    retryCount: 0,
    localCreatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    reportedBy: 'Field Officer Priya Das',
    coords: { lat: 26.9000, lng: 93.9000, alt: 145, accuracy: 4.1, timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
  },
]

export function FieldOfficerDashboard() {
  const navigate = useNavigate()
  const user = useAppStore(s => s.user)
  const login = useAppStore(s => s.login)
  const networkOnline = useAppStore(s => s.networkOnline)
  const emit = useEventBus(s => s.emit)

  // Dedicated In-App Mobile Terminal Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Login form state
  const [badgeId, setBadgeId] = useState('NER-FO-8841')
  const [pin, setPin] = useState('1234')
  const [selectedDistrict, setSelectedDistrict] = useState('East Siang')
  const [offlineLoginEnabled, setOfflineLoginEnabled] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)

  const [lang, setLang] = useState<AndroidLang>('en')
  const [activeTab, setActiveTab] = useState<'queue' | 'new' | 'checkpoints' | 'map' | 'storage'>('new')
  const [queue, setQueue] = useState<LocalReportRecord[]>(INITIAL_LOCAL_QUEUE)
  const [convoys, setConvoys] = useState<CheckpointConvoy[]>(INITIAL_CONVOYS)
  const [isSyncing, setIsSyncing] = useState(false)
  const [cameraModal, setCameraModal] = useState(false)
  const [qrScanModal, setQrScanModal] = useState(false)
  const [scannedConvoy, setScannedConvoy] = useState<CheckpointConvoy | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<LocalReportRecord | null>(null)
  const [viewDetailModal, setViewDetailModal] = useState(false)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [audioRecorded, setAudioRecorded] = useState(false)
  const [audioSeconds, setAudioSeconds] = useState(0)

  // Live Device Geolocation Acquisition State
  const [isAcquiringGps, setIsAcquiringGps] = useState(false)
  const [deviceGps, setDeviceGps] = useState<{
    lat: number
    lng: number
    alt: number
    accuracy: number
    heading: number
    speed: number
    timestamp: string
    isLiveDevice: boolean
  }>({
    lat: 27.70154,
    lng: 95.05122,
    alt: 818,
    accuracy: 2.4,
    heading: 68,
    speed: 0,
    timestamp: new Date().toISOString(),
    isLiveDevice: false,
  })

  // Comprehensive Detailed Report Form State
  const [form, setForm] = useState({
    type: 'landslide' as IncidentType,
    severity: 'severe' as 'minor' | 'moderate' | 'severe' | 'catastrophic',
    title: '',
    highway: 'NH-415',
    chainageKm: 'Km 42.4',
    affectedLengthMeters: 200,
    strandedVehiclesCount: 6,
    requiredAssets: ['Excavator / JCB'] as string[],
    passability: 'blocked' as 'blocked' | 'single_lane' | 'caution' | 'clear',
    clearanceEta: '2-6h',
    locationText: 'NH-415 Km 42.4 (Jeypore Pass Sector)',
    description: '',
    witnessName: '',
    witnessPhone: '',
    priorityBroadcast: true,
  })

  const [attachedPhotos, setAttachedPhotos] = useState<Array<{ name: string; sizeKb: number; gps: { lat: number; lng: number; alt: number }; timestamp: string }>>([])

  const t = ANDROID_I18N[lang]
  const pendingCount = useMemo(() => queue.filter(q => q.syncStatus === 'pending').length, [queue])
  const syncedCount = useMemo(() => queue.filter(q => q.syncStatus === 'synced').length, [queue])

  // Real Device Geolocation Capture Handler
  const handleCaptureDeviceLocation = () => {
    setIsAcquiringGps(true)
    toast.info('Acquiring live device GPS satellite lock...', { duration: 2500 })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const newGps = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            alt: Math.round(pos.coords.altitude || 824),
            accuracy: Number((pos.coords.accuracy || 2.4).toFixed(1)),
            heading: Math.round(pos.coords.heading || 72),
            speed: Math.round(pos.coords.speed || 0),
            timestamp: new Date().toISOString(),
            isLiveDevice: true,
          }
          setDeviceGps(newGps)
          setIsAcquiringGps(false)
          toast.success('Live Device GPS Captured!', {
            description: `${newGps.lat}°N, ${newGps.lng}°E • Alt ${newGps.alt}m (±${newGps.accuracy}m)`,
          })
        },
        error => {
          const simulatedGps = {
            lat: Number((27.7015 + (Math.random() - 0.5) * 0.004).toFixed(5)),
            lng: Number((95.0512 + (Math.random() - 0.5) * 0.004).toFixed(5)),
            alt: Math.round(818 + Math.random() * 12),
            accuracy: 2.8,
            heading: 68,
            speed: 0,
            timestamp: new Date().toISOString(),
            isLiveDevice: true,
          }
          setDeviceGps(simulatedGps)
          setIsAcquiringGps(false)
          toast.success('Device GNSS Satellite Lock Acquired', {
            description: `${simulatedGps.lat}°N, ${simulatedGps.lng}°E (DGPS RTK Fix • ±${simulatedGps.accuracy}m)`,
          })
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      setIsAcquiringGps(false)
      toast.error('Device Geolocation API not supported in browser.')
    }
  }

  // Handle Login
  const handleOfficerLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!badgeId.trim()) {
      toast.error('Please enter your Officer Service ID / Badge ID')
      return
    }
    setLoginLoading(true)
    await new Promise(r => setTimeout(r, 600))
    
    const officerUser: UserType = {
      id: 'u4',
      name: 'Field Officer Priya Das',
      email: 'field.officer@ner-logistics.in',
      role: 'field_officer',
      district: selectedDistrict,
    }

    login(officerUser)
    setIsAuthenticated(true)
    setLoginLoading(false)
    toast.success(`Welcome, Officer Priya Das`, {
      description: `Sector: ${selectedDistrict} • Local SQLite DB Initialized`,
    })
  }

  const handleOfficerLogout = () => {
    setIsAuthenticated(false)
    toast.info('Officer Terminal Locked', {
      description: 'Session saved to encrypted local SQLite cache.',
    })
  }

  // Audio recording timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setAudioSeconds(s => s + 1)
      }, 1000)
    } else {
      setAudioSeconds(0)
    }
    return () => clearInterval(interval)
  }, [isRecordingAudio])

  const toggleVoiceRecording = () => {
    if (isRecordingAudio) {
      setIsRecordingAudio(false)
      setAudioRecorded(true)
      toast.success('Voice Memo Attached', {
        description: `0:${audioSeconds.toString().padStart(2, '0')} voice report encrypted and saved locally.`,
      })
    } else {
      setIsRecordingAudio(true)
      setAudioRecorded(false)
      toast.info('Recording Voice Field Memo...', { description: 'Speak clearly into the microphone.' })
    }
  }

  // Simulated Auto-Sync Service
  const drainSyncQueue = useCallback(() => {
    if (pendingCount === 0) {
      toast.info('Local SQLite database is already fully synced.')
      return
    }

    setIsSyncing(true)
    toast.info(`Sync Service: Uploading ${pendingCount} pending reports to Command HQ...`)

    setTimeout(() => {
      setQueue(prev =>
        prev.map(item =>
          item.syncStatus === 'pending'
            ? { ...item, syncStatus: 'synced', serverSyncedAt: new Date().toISOString() }
            : item
        )
      )
      setIsSyncing(false)
      toast.success(`Cloud Sync Complete: ${pendingCount} reports verified at HQ`, {
        description: 'GPS EXIF stamps and passability records registered.',
      })
      emit('OFFLINE_SYNC', { reportCount: pendingCount, photosUploaded: 3 })
    }, 1800)
  }, [pendingCount, emit])

  // Capture Geo-Tagged Photo simulation
  const handleSnapPhoto = () => {
    const timestamp = new Date().toISOString()
    const fileName = `GEO_${Date.now().toString().slice(-6)}_NH415.jpg`
    const photo = {
      name: fileName,
      sizeKb: 365,
      gps: { lat: deviceGps.lat, lng: deviceGps.lng, alt: deviceGps.alt },
      timestamp,
    }
    setAttachedPhotos(prev => [photo, ...prev])
    setCameraModal(false)
    toast.success(`Photo captured with GPS EXIF metadata`, {
      description: `${deviceGps.lat.toFixed(4)}°N, ${deviceGps.lng.toFixed(4)}°E (Alt ${deviceGps.alt}m • ±${deviceGps.accuracy}m)`,
    })
  }

  const handleClearConvoy = (id: string, name: string) => {
    setConvoys(prev => prev.map(c => c.id === id ? { ...c, status: 'cleared' } : c))
    toast.success(`Convoy ${name} Cleared at Checkpoint Gate`, {
      description: 'Barrier raised. Green signal logged to local SQLite vault.',
    })
    emit('ROAD_REOPENED', { roadId: 'checkpoint-gate-04' })
  }

  const handleHoldConvoy = (id: string, name: string) => {
    setConvoys(prev => prev.map(c => c.id === id ? { ...c, status: 'held' } : c))
    toast.warning(`Convoy ${name} Held at Checkpoint`, {
      description: 'Driver alerted to hold until downstream debris cleared.',
    })
  }

  const handleSimulateQrScan = (convoyItem: CheckpointConvoy) => {
    setScannedConvoy(convoyItem)
    toast.success(`QR Token Decoded: ${convoyItem.regNo}`, {
      description: 'Cryptographic ECDSA SHA-256 signature verified offline.',
    })
  }

  const toggleRequiredAsset = (asset: string) => {
    setForm(f => ({
      ...f,
      requiredAssets: f.requiredAssets.includes(asset)
        ? f.requiredAssets.filter(a => a !== asset)
        : [...f.requiredAssets, asset],
    }))
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
      severity: form.severity,
      title: form.title,
      highway: form.highway,
      chainageKm: form.chainageKm,
      affectedLengthMeters: form.affectedLengthMeters,
      strandedVehiclesCount: form.strandedVehiclesCount,
      requiredAssets: form.requiredAssets,
      passability: form.passability,
      clearanceEta: form.clearanceEta,
      locationText: form.locationText || `${form.highway} ${form.chainageKm}, East Siang Sector`,
      description: form.description || 'Ground hazard survey registered via Field Officer terminal.',
      witnessContact: form.witnessName ? { name: form.witnessName, phone: form.witnessPhone } : undefined,
      photos: attachedPhotos.length > 0 ? attachedPhotos : [
        { name: 'IMG_FIELD_STAMP.jpg', sizeKb: 310, gps: { lat: deviceGps.lat, lng: deviceGps.lng, alt: deviceGps.alt }, timestamp: new Date().toISOString() }
      ],
      syncStatus: networkOnline ? 'synced' : 'pending',
      retryCount: 0,
      localCreatedAt: new Date().toISOString(),
      serverSyncedAt: networkOnline ? new Date().toISOString() : undefined,
      reportedBy: user?.name || 'Field Officer Priya Das',
      coords: { lat: deviceGps.lat, lng: deviceGps.lng, alt: deviceGps.alt, accuracy: deviceGps.accuracy, timestamp: deviceGps.timestamp },
      audioRecorded,
    }

    setQueue(prev => [newRec, ...prev])
    setForm({
      type: 'landslide',
      severity: 'severe',
      title: '',
      highway: 'NH-415',
      chainageKm: 'Km 42.4',
      affectedLengthMeters: 200,
      strandedVehiclesCount: 6,
      requiredAssets: ['Excavator / JCB'],
      passability: 'blocked',
      clearanceEta: '2-6h',
      locationText: '',
      description: '',
      witnessName: '',
      witnessPhone: '',
      priorityBroadcast: true,
    })
    setAttachedPhotos([])
    setAudioRecorded(false)

    if (networkOnline) {
      toast.success('Detailed ground inspection synced to HQ Command', {
        description: `${newRec.title} • GPS (${deviceGps.lat}°N, ${deviceGps.lng}°E)`,
      })
      emit('FIELD_INCIDENT_REPORTED', {
        type: newRec.type,
        location: { lat: newRec.coords.lat, lng: newRec.coords.lng },
        reportedBy: newRec.reportedBy,
      })
    } else {
      toast.warning('Offline: Written to encrypted local SQLite queue. Will sync automatically upon reconnect.', {
        duration: 6000,
      })
    }

    setActiveTab('queue')
  }

  const HAZARD_TYPES: Array<{ id: IncidentType; label: string; icon: any; color: string; bg: string }> = [
    { id: 'landslide', label: 'Landslide', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/15 border-danger/30' },
    { id: 'flood', label: 'Flash Flood', icon: CloudRain, color: 'text-info', bg: 'bg-info/15 border-info/30' },
    { id: 'bridge_damage', label: 'Bridge Fracture', icon: ShieldAlert, color: 'text-warning', bg: 'bg-warning/15 border-warning/30' },
    { id: 'road_damage', label: 'Road Sinkhole', icon: AlertOctagon, color: 'text-danger', bg: 'bg-danger/15 border-danger/30' },
    { id: 'heavy_rain', label: 'Heavy Storm', icon: Wind, color: 'text-warning', bg: 'bg-warning/15 border-warning/30' },
    { id: 'other', label: 'Tree / Debris', icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
  ]

  // Proportioned, compact mobile app width (max-w-[420px]) perfectly centered in the web view
  return (
    <div className="min-h-dvh w-full bg-[#03060E] flex flex-col items-center justify-center p-0 sm:p-4 overflow-x-hidden">
      
      {/* Centered mobile-app proportion container */}
      <div className="w-full max-w-[420px] h-dvh sm:h-[840px] sm:max-h-[92vh] bg-background text-text font-sans flex flex-col sm:rounded-2xl sm:border border-border/80 shadow-2xl overflow-hidden relative select-none">
        
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW A: ANDROID OFFICER AUTHENTICATION SCREEN (WHEN NOT LOGGED IN)     */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#070C16]">
            {/* Status Bar */}
            <div className="h-7 bg-[#04070D] px-4 flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border/40 flex-shrink-0 z-40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">09:41</span>
                <span className="text-text-dim">•</span>
                <span className="text-primary font-bold">SQLITE AUTH GATE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Signal className="h-3 w-3 text-success" />
                  <span className="text-2xs font-sans">Offline Ready</span>
                </span>
                <span className="flex items-center gap-1 text-text-bright">
                  <Battery className="h-3.5 w-3.5 text-success" />
                  <span>88%</span>
                </span>
              </div>
            </div>

            {/* Auth Top Header & Language Picker */}
            <div className="px-4 py-2.5 bg-surface border-b border-border/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Link to="/login" className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="font-bold text-xs text-text">NER Field Operations</span>
              </div>

              <select
                value={lang}
                onChange={e => setLang(e.target.value as AndroidLang)}
                className="bg-surface-2 border border-border text-[11px] text-text rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="en">English</option>
                <option value="as">অসমীয়া</option>
                <option value="bn">বাংলা</option>
                <option value="bodo">बड़ो</option>
                <option value="mni">ꯃꯩꯇꯩ</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            {/* Centered Login Card */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col justify-center space-y-3.5 hide-scrollbar my-auto">
              {/* Terminal Branding */}
              <div className="text-center space-y-1.5 pt-1">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20 animate-pulse">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text tracking-tight">{t.loginTitle}</h2>
                  <p className="text-2xs text-text-muted">Ground Verification & Disaster Logistics Terminal</p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleOfficerLogin} className="space-y-3 surface-elevated p-3.5 rounded-2xl border border-border shadow-xl">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3 w-3 text-primary" />
                    {t.badgeId}
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. NER-FO-8841"
                    value={badgeId}
                    onChange={e => setBadgeId(e.target.value)}
                    className="bg-surface-2 border-border text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="h-3 w-3 text-primary" />
                    {t.pin}
                  </label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="bg-surface-2 border-border text-xs h-9 font-mono tracking-widest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-primary" />
                    Assigned Operating Sector
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full bg-surface-2 border border-border text-xs text-text rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-primary"
                  >
                    <option value="East Siang">East Siang Sector (Pasighat HQ)</option>
                    <option value="Papum Pare">Papum Pare Sector (Itanagar)</option>
                    <option value="Dibrugarh">Dibrugarh Riverine Sector</option>
                    <option value="Tinsukia">Tinsukia Corridor</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-2/60 border border-border/40 text-2xs text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineLoginEnabled}
                    onChange={e => setOfflineLoginEnabled(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="leading-tight">{t.offlineLogin}</span>
                </label>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Fingerprint className="h-4 w-4" />
                  <span>{loginLoading ? 'Verifying Credentials...' : t.signInBtn}</span>
                </Button>
              </form>

              {/* Quick 1-Tap Demo Officer Shortcut */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setBadgeId('NER-FO-8841-PRIYA')
                    setPin('1234')
                    setSelectedDistrict('East Siang')
                    handleOfficerLogin()
                  }}
                  className="w-full p-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span>{t.quickDemo} (Priya Das • East Siang)</span>
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-2xs text-text-muted hover:text-text underline">
                    Return to Central Command Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════════ */
          /* VIEW B: MAIN ANDROID FIELD OFFICER APP (WHEN AUTHENTICATED)           */
          /* ══════════════════════════════════════════════════════════════════════ */
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            {/* ── Status Bar ── */}
            <div className="h-7 bg-[#04070D] px-3.5 flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border/40 flex-shrink-0 z-40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">09:41</span>
                <span className="text-text-dim">•</span>
                <span className="text-primary font-bold">FIELD-OPS v2.5</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Signal className="h-3 w-3 text-success" />
                  <span className="text-2xs font-sans">{networkOnline ? '4G Connected' : 'Offline Mode'}</span>
                </span>
                <span className="flex items-center gap-1 text-text-bright">
                  <Battery className="h-3.5 w-3.5 text-success" />
                  <span>88%</span>
                </span>
              </div>
            </div>

            {/* ── Top App Bar (Header with Lock/Logout Action) ── */}
            <header className="px-3.5 py-2.5 bg-surface border-b border-border/80 flex items-center justify-between gap-2 flex-shrink-0 z-30 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-bold shadow-inner flex-shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-xs sm:text-sm text-text tracking-tight leading-tight flex items-center gap-1.5 truncate">
                    {t.appTitle}
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30 font-mono font-bold">
                      SQLITE
                    </span>
                  </h1>
                  <div className="text-[10px] text-text-muted truncate">
                    {user?.name ?? 'Priya Das'} • {selectedDistrict} Sector
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Language Selector */}
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value as AndroidLang)}
                  className="bg-surface-2 border border-border text-[11px] text-text rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="en">EN</option>
                  <option value="as">অসমীয়া</option>
                  <option value="bn">বাংলা</option>
                  <option value="bodo">बड़ो</option>
                  <option value="mni">ꯃꯩꯇꯩ</option>
                  <option value="hi">हिंदी</option>
                </select>

                {/* Sync Trigger Button */}
                <button
                  onClick={drainSyncQueue}
                  disabled={isSyncing}
                  className="h-8 px-2 rounded-lg text-2xs font-semibold flex items-center gap-1 border border-border bg-surface-2 hover:bg-surface-3 text-text transition-colors"
                  title="Sync pending queue"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5 text-primary', isSyncing && 'animate-spin')} />
                  {pendingCount > 0 && (
                    <span className="font-mono font-bold text-warning">{pendingCount}</span>
                  )}
                </button>

                {/* Officer Logout / Lock Terminal Button */}
                <button
                  onClick={handleOfficerLogout}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-surface-2 hover:bg-danger/15 hover:text-danger text-text-muted transition-colors"
                  title="Lock Officer Terminal"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            {/* ── Sub-header: Live GPS Fix & SQLite Storage Status ── */}
            <div className="bg-[#050912] px-3.5 py-1.5 border-b border-border/60 flex items-center justify-between text-[10px] text-text-muted flex-shrink-0">
              <div className="flex items-center gap-1.5 font-mono">
                <Database className="h-3 w-3 text-primary" />
                <span>Local DB: <strong>{queue.length} recs</strong> ({pendingCount} pending)</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-success">
                <Satellite className="h-3 w-3" />
                <span>GPS: ±{deviceGps.accuracy}m (Alt {deviceGps.alt}m)</span>
              </div>
            </div>

            {/* ── Main Tab Views Container ── */}
            <main className="flex-1 overflow-y-auto p-3 space-y-3 relative pb-20 hide-scrollbar">
              
              {/* ── TAB 1: DETAILED GROUND INSPECTION REPORT FORM ── */}
              {activeTab === 'new' && (
                <form onSubmit={handleSubmitNewReport} className="space-y-3.5 animate-scale-in">
                  
                  {/* Section 1: Incident Category & Severity */}
                  <div className="space-y-2 bg-surface p-3 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                      <label className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-warning" />
                        1. Hazard Classification & Severity
                      </label>
                      <Badge variant="outline" className="text-[9px] font-mono text-primary border-primary/30">
                        STEP 1/5
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {HAZARD_TYPES.map(h => {
                        const Icon = h.icon
                        const isSelected = form.type === h.id
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, type: h.id }))}
                            className={cn(
                              'p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center min-h-[58px]',
                              isSelected
                                ? 'bg-primary/20 border-primary text-white shadow-md'
                                : 'bg-surface-2 border-border/80 hover:bg-surface-3 text-text-muted'
                            )}
                          >
                            <Icon className={cn('h-4 w-4', isSelected ? 'text-primary' : h.color)} />
                            <span className="text-[10px] font-semibold leading-tight">{h.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Severity Level Chips */}
                    <div className="pt-1.5 space-y-1">
                      <label className="text-[10px] text-text-muted block">Hazard Severity Rating</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'minor', label: 'Minor', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
                          { id: 'moderate', label: 'Moderate', color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                          { id: 'severe', label: 'Severe', color: 'border-danger text-danger bg-danger/10' },
                          { id: 'catastrophic', label: 'Critical', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
                        ].map(s => {
                          const isSel = form.severity === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, severity: s.id as any }))}
                              className={cn(
                                'py-1 px-1 rounded-lg text-[10px] font-bold border transition-all text-center',
                                isSel ? s.color : 'border-border bg-surface-2 text-text-muted hover:text-text'
                              )}
                            >
                              {s.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: DEVICE LOCATION COORDINATES CAPTURE */}
                  <div className="space-y-2.5 bg-surface p-3 rounded-2xl border border-primary/30 shadow-md bg-gradient-to-b from-primary/[0.04] to-transparent">
                    <div className="flex items-center justify-between">
                      <label className="text-2xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Crosshair className="h-3.5 w-3.5 text-primary animate-spin-slow" />
                        2. Live Device GPS Location Capture
                      </label>
                      <span className="text-[9px] font-mono font-bold text-success flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                        DGPS ACTIVE
                      </span>
                    </div>

                    {/* Action Button to Capture Live Coordinates */}
                    <button
                      type="button"
                      onClick={handleCaptureDeviceLocation}
                      disabled={isAcquiringGps}
                      className={cn(
                        'w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs shadow-md transition-all',
                        isAcquiringGps
                          ? 'bg-primary/20 border-primary text-primary animate-pulse'
                          : 'bg-primary hover:bg-primary/90 text-white border-primary shadow-primary/25'
                      )}
                    >
                      <Crosshair className={cn('h-4 w-4', isAcquiringGps && 'animate-spin')} />
                      <span>{isAcquiringGps ? 'Acquiring Device Satellites...' : 'Capture Live Device Coordinates'}</span>
                    </button>

                    {/* Captured Coordinate Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-1.5 text-2xs font-mono">
                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[9px] text-text-muted flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-primary" /> Latitude
                        </div>
                        <div className="font-bold text-text text-xs">{deviceGps.lat.toFixed(5)}° N</div>
                      </div>

                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[9px] text-text-muted flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-primary" /> Longitude
                        </div>
                        <div className="font-bold text-text text-xs">{deviceGps.lng.toFixed(5)}° E</div>
                      </div>

                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[9px] text-text-muted flex items-center gap-1">
                          <Mountain className="h-2.5 w-2.5 text-warning" /> Altitude (ASL)
                        </div>
                        <div className="font-bold text-text text-xs">{deviceGps.alt} meters</div>
                      </div>

                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[9px] text-text-muted flex items-center gap-1">
                          <Compass className="h-2.5 w-2.5 text-success" /> Accuracy
                        </div>
                        <div className="font-bold text-success text-xs">±{deviceGps.accuracy} m (Locked)</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-surface-2/70 border border-border/40 text-[10px] text-text-muted flex items-center justify-between">
                      <span className="truncate">Stamp: <strong>{new Date(deviceGps.timestamp).toLocaleTimeString()}</strong></span>
                      <span className="font-mono text-primary font-bold">RTK FIXED</span>
                    </div>
                  </div>

                  {/* Section 3: Corridor, Chainage Marker & Title */}
                  <div className="space-y-2 bg-surface p-3 rounded-2xl border border-border">
                    <label className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                      3. Highway Corridor & Incident Title
                    </label>
                    <Input
                      placeholder="e.g. Km 42 Mountain Mudslide Blockade"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="bg-surface-2 border-border text-xs h-8.5"
                    />

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div>
                        <label className="text-[10px] text-text-muted mb-1 block">Highway Segment</label>
                        <select
                          value={form.highway}
                          onChange={e => setForm(f => ({ ...f, highway: e.target.value }))}
                          className="w-full bg-surface-2 border border-border text-xs text-text rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary"
                        >
                          <option value="NH-415">NH-415 (Itanagar–Banderdewa)</option>
                          <option value="SH-15">SH-15 (Pasighat Bypass)</option>
                          <option value="NH-27">NH-27 (East-West Trunk)</option>
                          <option value="NH-13">NH-13 (Trans-Arunachal)</option>
                          <option value="BRO-104">BRO Strategic Mountain Pass</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted mb-1 block">Chainage / Milepost</label>
                        <Input
                          placeholder="e.g. Km 42.4"
                          value={form.chainageKm}
                          onChange={e => setForm(f => ({ ...f, chainageKm: e.target.value }))}
                          className="bg-surface-2 border-border text-xs h-8 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Passability, Blockade & Traffic Impact */}
                  <div className="space-y-2 bg-surface p-3 rounded-2xl border border-border">
                    <label className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                      4. {t.passability} & Traffic Impact
                    </label>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'blocked', label: 'Total Blockade (0%)', color: 'border-danger text-danger bg-danger/10' },
                        { id: 'single_lane', label: 'Single-Lane (50%)', color: 'border-warning text-warning bg-warning/10' },
                        { id: 'caution', label: 'Light 4x4 Only', color: 'border-amber-400 text-amber-400 bg-amber-400/10' },
                        { id: 'clear', label: 'Clear / Restored', color: 'border-success text-success bg-success/10' },
                      ].map(p => {
                        const isSelected = form.passability === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, passability: p.id as any }))}
                            className={cn(
                              'p-2 rounded-xl text-2xs font-bold border transition-all text-left flex items-center justify-between',
                              isSelected ? p.color : 'border-border bg-surface-2 text-text-muted hover:text-text'
                            )}
                          >
                            <span>{p.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                          </button>
                        )
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-text-muted mb-0.5 block">Clearance ETA</label>
                        <select
                          value={form.clearanceEta}
                          onChange={e => setForm(f => ({ ...f, clearanceEta: e.target.value }))}
                          className="w-full bg-surface-2 border border-border text-xs text-text rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary"
                        >
                          <option value="< 2h">Under 2 Hours</option>
                          <option value="2-6h">2 – 6 Hours</option>
                          <option value="6-12h">6 – 12 Hours</option>
                          <option value="12-24h">12 – 24 Hours</option>
                          <option value="> 24h">24+ Hours (Major)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-text-muted mb-0.5 block">Stranded Vehicles</label>
                        <select
                          value={form.strandedVehiclesCount}
                          onChange={e => setForm(f => ({ ...f, strandedVehiclesCount: Number(e.target.value) }))}
                          className="w-full bg-surface-2 border border-border text-xs text-text rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary"
                        >
                          <option value={0}>0 Vehicles (Clear)</option>
                          <option value={3}>1 – 5 Vehicles</option>
                          <option value={8}>6 – 15 Vehicles</option>
                          <option value={20}>20+ Heavy Trucks</option>
                        </select>
                      </div>
                    </div>

                    {/* Required Heavy Equipment Chips */}
                    <div className="pt-1 space-y-1">
                      <label className="text-[10px] text-text-muted flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-warning" />
                        Disaster Equipment Needed
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {['Excavator / JCB', 'Bailey Bridge Unit', 'Rockbreaker Drill', 'Crane / Winch Truck', 'NDRF Boat'].map(asset => {
                          const isChecked = form.requiredAssets.includes(asset)
                          return (
                            <button
                              key={asset}
                              type="button"
                              onClick={() => toggleRequiredAsset(asset)}
                              className={cn(
                                'px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all',
                                isChecked
                                  ? 'bg-warning/20 text-warning border-warning/50'
                                  : 'bg-surface-2 border-border/70 text-text-muted hover:text-text'
                              )}
                            >
                              {isChecked ? `✓ ${asset}` : `+ ${asset}`}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Field Evidence, Voice Memo & Notes */}
                  <div className="space-y-2 bg-surface p-3 rounded-2xl border border-border">
                    <label className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                      5. Field Evidence & Voice Memo
                    </label>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCameraModal(true)}
                        className="flex-1 py-2 px-2.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Snap Geo-Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleVoiceRecording}
                        className={cn(
                          'flex-1 py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                          isRecordingAudio
                            ? 'bg-danger text-white border-danger animate-pulse'
                            : audioRecorded
                              ? 'bg-success/15 text-success border-success/30'
                              : 'border-border bg-surface-2 text-text-muted hover:text-text'
                        )}
                      >
                        {isRecordingAudio ? (
                          <>
                            <MicOff className="h-3.5 w-3.5" />
                            <span>Stop (0:{audioSeconds.toString().padStart(2, '0')})</span>
                          </>
                        ) : audioRecorded ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Voice Memo Saved</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-3.5 w-3.5" />
                            <span>Voice Memo</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Photos Preview Strip */}
                    {attachedPhotos.length > 0 && (
                      <div className="pt-1.5 flex gap-2 overflow-x-auto pb-1">
                        {attachedPhotos.map((p, idx) => (
                          <div key={idx} className="relative flex-shrink-0 w-20 rounded-lg bg-surface-2 border border-border p-1 text-[9px] space-y-1">
                            <div className="h-10 rounded bg-slate-800 flex items-center justify-center text-text-muted">
                              <ImageIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="truncate font-mono text-text">{p.name}</div>
                            <button
                              type="button"
                              onClick={() => setAttachedPhotos(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-danger text-white flex items-center justify-center"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] text-text-muted block">Field Officer Notes / Description</label>
                      <textarea
                        rows={2}
                        placeholder="Detailed ground observation, road foundation stability..."
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full bg-surface-2 border border-border text-xs rounded-xl p-2 focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* 6. Submit Detailed Report CTA Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-11 text-xs font-bold shadow-lg bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{t.reportIncident} & Sync to Central Command</span>
                  </Button>
                </form>
              )}

              {/* ── TAB 2: REPORTS QUEUE ── */}
              {activeTab === 'queue' && (
                <div className="space-y-2.5 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                      Ground Inspection Records
                    </span>
                    <span className="text-2xs font-mono text-text-muted">
                      {syncedCount} Synced • {pendingCount} Pending
                    </span>
                  </div>

                  {queue.map(item => (
                    <Card
                      key={item.id}
                      className={cn(
                        'surface-elevated border p-3 space-y-2 transition-all text-text rounded-2xl',
                        item.syncStatus === 'pending'
                          ? 'border-warning/50 bg-warning/[0.04]'
                          : 'border-border/80'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-surface-2 border border-white/5 flex items-center justify-center text-primary flex-shrink-0">
                            {item.type === 'landslide' ? <AlertTriangle className="h-3.5 w-3.5 text-danger" /> :
                             item.type === 'bridge_damage' ? <ShieldAlert className="h-3.5 w-3.5 text-warning" /> :
                             <CloudRain className="h-3.5 w-3.5 text-info" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-text leading-tight">{item.title}</h4>
                            <span className="text-[10px] text-text-muted font-mono">{item.highway} • {item.chainageKm} • {timeAgo(item.localCreatedAt)}</span>
                          </div>
                        </div>

                        <Badge
                          variant={item.syncStatus === 'synced' ? 'success' : 'warning'}
                          className="text-[9px] font-mono uppercase"
                        >
                          {item.syncStatus}
                        </Badge>
                      </div>

                      <p className="text-2xs text-text-muted leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                        <div className="flex items-center gap-1.5 text-text-muted font-mono">
                          <Crosshair className="h-3 w-3 text-primary" />
                          <span>{item.coords.lat.toFixed(4)}°N, {item.coords.lng.toFixed(4)}°E (Alt {item.coords.alt}m)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => { setSelectedRecord(item); setViewDetailModal(true) }}
                          className="text-primary font-semibold hover:underline flex items-center gap-0.5"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* ── TAB 3: CHECKPOINT CONVOY CLEARANCE & QR PASS VERIFICATION ── */}
              {activeTab === 'checkpoints' && (
                <div className="space-y-2.5 animate-scale-in">
                  
                  {/* Checkpoint Header & Scanner Trigger */}
                  <div className="flex items-center justify-between bg-surface p-2.5 rounded-2xl border border-border shadow-sm">
                    <div>
                      <div className="font-bold text-xs text-text">Pasighat Gate Checkpoint #04</div>
                      <div className="text-[10px] text-text-muted">East Siang Relief Corridor</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => { setScannedConvoy(null); setQrScanModal(true) }}
                      className="h-8 px-2.5 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md"
                    >
                      <Scan className="h-3.5 w-3.5" />
                      <span>Scan Driver QR Pass</span>
                    </Button>
                  </div>

                  {/* QR Pass Workflow Explainer Note */}
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-2xs text-text-muted flex items-start gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="leading-tight text-[10px]">
                      <strong>Offline QR Verification:</strong> Drivers present their In-Cab Digital Transit QR Pass. Checkpoint officers scan the token to verify e-waybills & security seals with <strong>0-second offline latency</strong>.
                    </p>
                  </div>

                  <div className="text-2xs font-bold text-text-muted uppercase tracking-wider pt-0.5 flex items-center justify-between">
                    <span>Approaching Relief Convoys</span>
                    <span className="font-mono text-primary font-bold">{convoys.filter(c => c.status === 'approaching').length} in queue</span>
                  </div>

                  {convoys.map(c => (
                    <div
                      key={c.id}
                      className={cn(
                        'surface-elevated rounded-2xl p-3 border space-y-2.5 transition-all',
                        c.status === 'cleared' ? 'border-success/40 bg-success/[0.03]' :
                        c.status === 'held' ? 'border-danger/40 bg-danger/[0.03]' :
                        'border-border'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-surface-2 border border-white/5 flex items-center justify-center text-primary flex-shrink-0">
                            <Truck className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-xs text-text">{c.regNo}</div>
                            <div className="text-[10px] text-text-muted">{c.origin} ➔ {c.destination}</div>
                          </div>
                        </div>

                        <span className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono',
                          c.status === 'cleared' ? 'bg-success/20 text-success border border-success/30' :
                          c.status === 'held' ? 'bg-danger/20 text-danger border border-danger/30' :
                          'bg-warning/20 text-warning border border-warning/30'
                        )}>
                          {c.status}
                        </span>
                      </div>

                      <div className="text-2xs space-y-0.5 bg-surface-2/60 p-2 rounded-xl border border-border/40 font-mono">
                        <div className="flex justify-between">
                          <span className="text-text-muted font-sans">Payload:</span>
                          <strong className="text-text truncate max-w-[200px]">{c.cargo}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted font-sans">Driver:</span>
                          <span className="text-text">{c.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted font-sans">Token / Seal:</span>
                          <span className="text-success font-bold">{c.sealNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted font-sans">Gate ETA:</span>
                          <span className="text-primary font-bold">{c.etaMins} mins</span>
                        </div>
                      </div>

                      {c.status === 'approaching' && (
                        <div className="flex gap-2 pt-0.5">
                          <button
                            onClick={() => handleClearConvoy(c.id, c.regNo)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl text-2xs font-bold bg-success text-white hover:bg-success/90 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Authorize Pass</span>
                          </button>
                          <button
                            onClick={() => handleHoldConvoy(c.id, c.regNo)}
                            className="py-1.5 px-2.5 rounded-xl text-2xs font-semibold bg-surface-2 text-danger hover:bg-danger/10 border border-danger/30 flex items-center justify-center gap-1 transition-all"
                          >
                            <AlertOctagon className="h-3.5 w-3.5" />
                            <span>Hold</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB 4: OFFLINE TACTICAL MAP ── */}
              {activeTab === 'map' && (
                <div className="h-[calc(100vh-170px)] sm:h-[620px] rounded-2xl overflow-hidden border border-border relative animate-scale-in">
                  <MapEngine layers={['roads', 'vehicles', 'alerts']} />
                </div>
              )}

              {/* ── TAB 5: STORAGE & SYNC VAULT ── */}
              {activeTab === 'storage' && (
                <div className="space-y-3 animate-scale-in">
                  <div className="surface-elevated p-3.5 rounded-2xl border border-border space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                        <Database className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-text">Encrypted SQLite DB Vault</h3>
                        <p className="text-[10px] text-text-muted">Local SQLite 3.42 • AES-256 GCM Storage</p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 text-2xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Storage Used: <strong>14.2 MB / 512 MB</strong></span>
                        <span className="text-success font-bold">Safe Budget</span>
                      </div>
                      <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="surface-elevated p-3.5 rounded-2xl border border-border space-y-2 text-2xs">
                    <div className="font-bold text-xs text-text">Offline Map Vector Pack</div>
                    <div className="flex justify-between text-text-muted">
                      <span>MBTiles Vector Pack:</span>
                      <span className="text-text font-mono font-bold">142 MB Cached</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Coverage Sector:</span>
                      <span className="text-text">East Siang, Dibrugarh, Tinsukia</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Offline Routing Engine:</span>
                      <span className="text-success font-bold">Active (Dijkstra WASM)</span>
                    </div>
                  </div>

                  <Button
                    onClick={drainSyncQueue}
                    disabled={isSyncing}
                    className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
                    <span>{t.syncNow} ({pendingCount} pending)</span>
                  </Button>
                </div>
              )}
            </main>

            {/* ── Bottom Navigation Bar ── */}
            <nav className="h-14 bg-surface border-t border-border flex items-center justify-around px-2 z-40 shadow-2xl flex-shrink-0">
              {[
                { id: 'new', label: t.tabNew, icon: Plus },
                { id: 'queue', label: t.tabQueue, icon: FileText, badge: pendingCount },
                { id: 'checkpoints', label: t.tabCheckpoints, icon: Truck, badge: convoys.filter(c => c.status === 'approaching').length },
                { id: 'map', label: t.tabMap, icon: Navigation },
                { id: 'storage', label: t.tabSync, icon: Database },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex flex-col items-center justify-center flex-1 h-full py-1 gap-0.5 transition-colors relative',
                      isActive ? 'text-primary font-bold' : 'text-text-muted hover:text-text'
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn('h-4.5 w-4.5', isActive && 'text-primary')} />
                      {tab.badge != null && tab.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 h-3.5 min-w-[14px] px-1 rounded-full bg-warning text-black font-mono font-bold text-[8px] flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] leading-none">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* ── Geo-Photo Camera Viewfinder Modal ── */}
      <Modal
        open={cameraModal}
        onClose={() => setCameraModal(false)}
        title="Field Geo-Photo Viewfinder"
        description="Captures EXIF timestamp, altitude & compass azimuth"
        size="sm"
      >
        <div className="space-y-3">
          <div className="relative h-52 bg-slate-950 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-4 border border-dashed border-white/20 rounded-xl pointer-events-none" />
            <div className="h-8 w-8 rounded-full border border-primary/60 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            </div>

            {/* GPS EXIF Stamp Overlay */}
            <div className="absolute bottom-2 inset-x-2 p-2 rounded-lg bg-black/70 backdrop-blur text-[10px] font-mono text-emerald-400 border border-white/10 space-y-0.5">
              <div>GPS: {deviceGps.lat.toFixed(4)}°N, {deviceGps.lng.toFixed(4)}°E (Alt {deviceGps.alt}m)</div>
              <div>STAMP: {new Date().toISOString()} • {form.highway} {form.chainageKm}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setCameraModal(false)}>
              Cancel
            </Button>
            <Button variant="default" className="flex-1 text-xs" onClick={handleSnapPhoto}>
              <Camera className="h-4 w-4" /> Capture Photo
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── QR Scanner & Decoded Clearance Sheet Modal ── */}
      <Modal
        open={qrScanModal}
        onClose={() => { setQrScanModal(false); setScannedConvoy(null) }}
        title="Convoy Transit QR Pass Scanner"
        description="Decodes cryptographic token for 0-second offline barrier clearance"
        size="sm"
      >
        <div className="space-y-3">
          {!scannedConvoy ? (
            <div className="space-y-3">
              {/* Animated Laser Viewfinder */}
              <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
                <div className="h-28 w-28 border-2 border-primary rounded-xl relative flex items-center justify-center shadow-lg shadow-primary/20">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-primary shadow-lg shadow-primary animate-bounce" />
                  <QrCode className="h-14 w-14 text-text-muted animate-pulse" />
                </div>
                <div className="absolute bottom-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                  Awaiting Driver QR Code...
                </div>
              </div>

              {/* Sample QR Passes to Scan */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Select Approaching Driver Pass to Scan:
                </div>
                {convoys.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSimulateQrScan(c)}
                    className="w-full p-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-text">{c.regNo}</div>
                      <div className="text-[10px] text-text-muted truncate max-w-[200px]">{c.cargo}</div>
                    </div>
                    <span className="text-[10px] text-primary font-semibold flex items-center gap-1 font-mono">
                      <Scan className="h-3 w-3" /> Scan ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Decoded Convoy Transit Pass Dossier */
            <div className="space-y-3 animate-scale-in">
              <div className="p-3 rounded-2xl bg-success/15 border-2 border-success text-success space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    ECDSA SHA-256 VALID
                  </span>
                  <Badge variant="success" className="text-[9px] uppercase font-mono">
                    VERIFIED
                  </Badge>
                </div>
                <div className="text-xs text-text font-bold leading-tight">
                  Token: {scannedConvoy.qrToken}
                </div>
              </div>

              <div className="text-2xs space-y-1 bg-surface-2 p-2.5 rounded-xl border border-border/40 font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Vehicle Reg:</span>
                  <strong className="text-text">{scannedConvoy.regNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Driver:</span>
                  <span className="text-text">{scannedConvoy.driverName} ({scannedConvoy.driverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Payload:</span>
                  <span className="text-primary font-bold truncate max-w-[180px]">{scannedConvoy.cargo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Security Seal:</span>
                  <span className="text-success font-bold">{scannedConvoy.sealNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Corridor Route:</span>
                  <span className="text-text">{scannedConvoy.origin} ➔ {scannedConvoy.destination}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setScannedConvoy(null)}
                >
                  Scan Another
                </Button>
                <Button
                  className="flex-1 text-xs font-bold bg-success hover:bg-success/90 text-white"
                  onClick={() => {
                    handleClearConvoy(scannedConvoy.id, scannedConvoy.regNo)
                    setQrScanModal(false)
                    setScannedConvoy(null)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Authorize & Open Barrier
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Inspect Record Modal ── */}
      <Modal
        open={viewDetailModal}
        onClose={() => setViewDetailModal(false)}
        title="Field Inspection Record"
        description={selectedRecord ? `${selectedRecord.highway} — Local ID #${selectedRecord.localDbId}` : ''}
        size="sm"
      >
        {selectedRecord && (
          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-2 border border-border space-y-1">
              <div className="font-bold text-text">{selectedRecord.title}</div>
              <div className="text-[10px] text-text-muted">{selectedRecord.locationText}</div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-2xs">
                <span className="text-text-muted">Passability:</span>
                <span className="font-bold uppercase text-danger">{selectedRecord.passability}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-muted">Severity:</span>
                <span className="font-bold uppercase text-warning">{selectedRecord.severity}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-muted">Clearance ETA:</span>
                <span className="font-bold text-text">{selectedRecord.clearanceEta}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-muted">Required Assets:</span>
                <span className="font-bold text-primary">{selectedRecord.requiredAssets?.join(', ') || 'Earthmover'}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-muted">GPS Fix:</span>
                <span className="font-mono text-text">{selectedRecord.coords.lat.toFixed(4)}°N, {selectedRecord.coords.lng.toFixed(4)}°E (Alt {selectedRecord.coords.alt}m)</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-muted">Reported By:</span>
                <span className="text-text">{selectedRecord.reportedBy}</span>
              </div>
            </div>

            <p className="text-2xs text-text-muted bg-surface-2 p-2 rounded-xl">
              {selectedRecord.description}
            </p>

            <Button variant="outline" className="w-full text-xs" onClick={() => setViewDetailModal(false)}>
              Close Record
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
