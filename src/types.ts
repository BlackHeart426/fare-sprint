export type CabinClass = 'economy' | 'premium-economy' | 'business' | 'first'
export type Currency = 'RUB'

export interface Segment {
  origin: string
  destination: string
  baseDate: string
}

export interface Route {
  id: string
  name: string
  segments: Segment[]
  flexDays: number
  passengers: number
  cabinClass: CabinClass
  currency: Currency
  createdAt: string
  updatedAt: string
}

export interface DateCombination {
  shift: number
  segments: Segment[]
}

export type ProviderCapability = 'direct' | 'partial' | 'open-only'

export interface ProviderAction {
  id: string
  name: string
  capability: ProviderCapability
  href: string
  label: 'Открыть' | 'Открыть + копировать' | 'Копировать'
  copyText?: string
}

export interface PersistedData {
  version: 1
  routes: Route[]
  selectedRouteId: string
}
