import type { PersistedData, Route } from '../types'
import { normalizeRoute, validateRoute } from './routes'

const KEY = 'fare-sprint:v1'

export const defaultRoute: Route = {
  id: 'japan-autumn',
  name: 'Япония осенью',
  segments: [
    { origin: 'MOW', destination: 'OSA', baseDate: '2026-10-12' },
    { origin: 'TYO', destination: 'MOW', baseDate: '2026-10-31' },
  ],
  flexDays: 3,
  passengers: 2,
  cabinClass: 'economy',
  currency: 'RUB',
  createdAt: '2026-07-02T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
}

export const defaultData: PersistedData = { version: 1, routes: [defaultRoute], selectedRouteId: defaultRoute.id }

export function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseImport(raw) : defaultData
  } catch {
    return defaultData
  }
}

export function saveData(data: PersistedData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function parseImport(raw: string): PersistedData {
  const value: unknown = JSON.parse(raw)
  if (!value || typeof value !== 'object') throw new Error('Файл не содержит данных FareSprint')
  const data = value as Partial<PersistedData>
  if (data.version !== 1 || !Array.isArray(data.routes) || !data.routes.length) throw new Error('Неподдерживаемый или пустой файл')
  const routes = data.routes.map((route, index) => {
    const normalized = normalizeRoute(route)
    const errors = validateRoute(normalized)
    if (errors.length) throw new Error(`Маршрут ${index + 1}: ${errors[0]}`)
    return normalized
  })
  const selectedRouteId = routes.some((route) => route.id === data.selectedRouteId) ? data.selectedRouteId! : routes[0].id
  return { version: 1, routes, selectedRouteId }
}

export function mergeData(current: PersistedData, imported: PersistedData): PersistedData {
  const routes = new Map(current.routes.map((route) => [route.id, route]))
  imported.routes.forEach((route) => routes.set(route.id, route))
  return { version: 1, routes: [...routes.values()], selectedRouteId: imported.selectedRouteId }
}
