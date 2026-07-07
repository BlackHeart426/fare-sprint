import type { DateCombination, ProviderAction, Route } from '../types'

const cabinCodes = {
  economy: 'y',
  'premium-economy': 'w',
  business: 'c',
  first: 'f',
} as const

const tbankCabinCodes = {
  economy: 'Y',
  'premium-economy': 'W',
  business: 'C',
  first: 'F',
} as const

export function routeSummary(route: Route, combination: DateCombination): string {
  const legs = combination.segments
    .map((segment, index) => `${index + 1}. ${segment.origin}–${segment.destination} ${segment.baseDate}`)
    .join('; ')
  return `${route.name}: ${legs}. Пассажиры: ${route.passengers}, класс: ${route.cabinClass}, валюта: ${route.currency}`
}

export function tripLink(route: Route, combination: DateCombination): string {
  const url = new URL('https://ru.trip.com/flights/showfarefirst')
  combination.segments.forEach((segment, index) => {
    url.searchParams.set(`multdcity${index}`, segment.origin.toLowerCase())
    url.searchParams.set(`multacity${index}`, segment.destination.toLowerCase())
    url.searchParams.set(`multddate${index}`, segment.baseDate)
  })
  url.searchParams.set('triptype', 'mt')
  url.searchParams.set('class', cabinCodes[route.cabinClass])
  url.searchParams.set('quantity', String(route.passengers))
  url.searchParams.set('locale', 'ru-RU')
  url.searchParams.set('curr', route.currency)
  return url.toString()
}

export function tbankLink(route: Route, combination: DateCombination): string {
  const path = combination.segments
    .flatMap((segment) => [
      `${segment.origin}-${segment.destination}`,
      segment.baseDate.slice(5),
    ])
    .join('/')
  const url = new URL(`https://www.tbank.ru/travel/flights/multi-way/${path}/`)
  url.searchParams.set('adults', String(route.passengers))
  url.searchParams.set('children', '0')
  url.searchParams.set('infants', '0')
  url.searchParams.set('cabin', tbankCabinCodes[route.cabinClass])
  url.searchParams.set('composite', '1')
  return url.toString()
}

export function aviasalesLink(route: Route, combination: DateCombination): string {
  const path = combination.segments
    .map((segment, index) => {
      const [, month, day] = segment.baseDate.split('-')
      const closesRoute =
        index === combination.segments.length - 1 &&
        segment.destination === combination.segments[0].origin
      return `${segment.origin}${day}${month}${closesRoute ? '' : segment.destination}`
    })
    .join('-')
  return `https://www.aviasales.ru/search/${path}${route.passengers}`
}

export function providerActions(route: Route, combination: DateCombination): ProviderAction[] {
  const copyText = routeSummary(route, combination)
  const aviasalesDirect = route.cabinClass === 'economy'
  return [
    { id: 'trip', name: 'Trip.com', capability: 'direct', href: tripLink(route, combination), label: 'Открыть' },
    {
      id: 'aviasales',
      name: 'Aviasales',
      capability: aviasalesDirect ? 'direct' : 'partial',
      href: aviasalesLink(route, combination),
      label: aviasalesDirect ? 'Открыть' : 'Открыть + копировать',
      copyText: aviasalesDirect ? undefined : copyText,
    },
    {
      id: 'tbank',
      name: 'Т-Банк',
      capability: 'direct',
      href: tbankLink(route, combination),
      label: 'Открыть',
    },
  ]
}
