import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ner_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ner_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login:   (email: string, password: string) => api.post('/auth/login', { email, password }),
  refresh: () => api.post('/auth/refresh'),
}

export const vehicleApi = {
  getAll:      (params?: Record<string, string>) => api.get('/vehicles', { params }),
  getById:     (id: string) => api.get(`/vehicles/${id}`),
  update:      (id: string, data: Record<string, unknown>) => api.patch(`/vehicles/${id}`, data),
  getLocation: (id: string) => api.get(`/vehicles/${id}/location`),
}

export const alertApi = {
  getAll:      (params?: Record<string, string>) => api.get('/alerts', { params }),
  create:      (data: Record<string, unknown>) => api.post('/alerts', data),
  acknowledge: (id: string) => api.patch(`/alerts/${id}/acknowledge`),
  resolve:     (id: string) => api.patch(`/alerts/${id}/resolve`),
}

export const routeApi = {
  calculate:      (payload: Record<string, unknown>) => api.post('/routes/calculate', payload),
  getRoads:       () => api.get('/routes/roads'),
  getPredictions: () => api.get('/routes/predictions'),
  getForecast:    (rainfallMultiplier = 1.0) => api.get(`/routes/forecast?rainfall_multiplier=${rainfallMultiplier}`),
  predictSegment: (payload: Record<string, unknown>) => api.post('/routes/predict-segment', payload),
}

export const incidentApi = {
  getAll:  () => api.get('/incidents'),
  create:  (data: Record<string, unknown>) => api.post('/incidents', data),
  verify:  (id: string) => api.patch(`/incidents/${id}/verify`),
  resolve: (id: string) => api.patch(`/incidents/${id}/resolve`),
}

export const weatherApi = {
  getAll:       () => api.get('/weather'),
  getDistrict:  (district: string) => api.get(`/weather/${district}`),
}

export const emergencyApi = {
  getStatus:   () => api.get('/emergency/status'),
  activate:    (data: Record<string, unknown>) => api.post('/emergency/activate', data),
  deactivate:  () => api.post('/emergency/deactivate'),
  dispatch:    (data: Record<string, unknown>) => api.post('/emergency/dispatch', data),
}

export const analyticsApi = {
  getDisruptions:  () => api.get('/analytics/disruptions'),
  getDistricts:    () => api.get('/analytics/districts'),
  getSummary:      () => api.get('/analytics/summary'),
  getMlTelemetry:  () => api.get('/analytics/ml-telemetry'),
}

export const copilotApi = {
  chat: (message: string, context: Record<string, unknown> = {}, role = 'operator') =>
    api.post('/copilot/chat', { message, context, role }),
}

export default api
