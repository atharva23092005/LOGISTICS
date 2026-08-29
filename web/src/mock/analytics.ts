import type { DisruptionTrend, DistrictPerformance, BottleneckData } from '@/types'

export const mockDisruptionTrends: DisruptionTrend[] = [
  { date: 'Aug 20', landslides: 1, floods: 0, accidents: 2, total: 3 },
  { date: 'Aug 21', landslides: 2, floods: 1, accidents: 1, total: 4 },
  { date: 'Aug 22', landslides: 1, floods: 2, accidents: 3, total: 6 },
  { date: 'Aug 23', landslides: 3, floods: 1, accidents: 1, total: 5 },
  { date: 'Aug 24', landslides: 2, floods: 3, accidents: 2, total: 7 },
  { date: 'Aug 25', landslides: 4, floods: 2, accidents: 1, total: 7 },
  { date: 'Aug 26', landslides: 3, floods: 4, accidents: 2, total: 9 },
  { date: 'Aug 27', landslides: 1, floods: 2, accidents: 1, total: 4 },
]

export const mockDistrictPerformance: DistrictPerformance[] = [
  { district: 'Guwahati',   onTime: 82, delayed: 14, blocked: 4,  avgDelay: 1.2 },
  { district: 'Jorhat',     onTime: 88, delayed: 10, blocked: 2,  avgDelay: 0.8 },
  { district: 'Dibrugarh',  onTime: 64, delayed: 28, blocked: 8,  avgDelay: 2.4 },
  { district: 'East Siang', onTime: 41, delayed: 32, blocked: 27, avgDelay: 4.8 },
  { district: 'Itanagar',   onTime: 71, delayed: 22, blocked: 7,  avgDelay: 1.8 },
  { district: 'Tawang',     onTime: 58, delayed: 30, blocked: 12, avgDelay: 3.1 },
  { district: 'Shillong',   onTime: 91, delayed: 7,  blocked: 2,  avgDelay: 0.6 },
]

export const mockBottlenecks: BottleneckData[] = [
  { roadId: 'nh415-seg1', roadName: 'NH-415', incidents: 12, avgDelay: 4.8, coordinates: { lat: 27.7000, lng: 95.0500 } },
  { roadId: 'nh13-seg1',  roadName: 'NH-13',  incidents: 8,  avgDelay: 3.2, coordinates: { lat: 27.3000, lng: 92.5000 } },
  { roadId: 'nh37-seg1',  roadName: 'NH-37',  incidents: 6,  avgDelay: 2.1, coordinates: { lat: 27.1000, lng: 93.8000 } },
  { roadId: 'sh15-seg1',  roadName: 'SH-15',  incidents: 4,  avgDelay: 1.6, coordinates: { lat: 26.9000, lng: 93.9000 } },
  { roadId: 'nh6-seg1',   roadName: 'NH-6',   incidents: 2,  avgDelay: 0.8, coordinates: { lat: 25.9000, lng: 91.8000 } },
]

export const mockKPIHistory = [
  { time: '06:00', onTime: 85, delayed: 12, blocked: 3 },
  { time: '08:00', onTime: 82, delayed: 14, blocked: 4 },
  { time: '10:00', onTime: 78, delayed: 18, blocked: 4 },
  { time: '12:00', onTime: 74, delayed: 20, blocked: 6 },
  { time: '14:00', onTime: 70, delayed: 22, blocked: 8 },
  { time: '16:00', onTime: 72, delayed: 20, blocked: 8 },
  { time: '18:00', onTime: 76, delayed: 18, blocked: 6 },
  { time: '20:00', onTime: 80, delayed: 15, blocked: 5 },
]
