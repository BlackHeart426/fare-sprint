import type { DateCombination, Route, Segment } from '../types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const IATA = /^[A-Z]{3}$/

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function generateCombinations(route: Route): DateCombination[] {
  return Array.from({ length: route.flexDays * 2 + 1 }, (_, index) => {
    const shift = index - route.flexDays
    return {
      shift,
      segments: route.segments.map((segment) => ({
        ...segment,
        baseDate: shiftDate(segment.baseDate, shift),
      })),
    }
  })
}

export function normalizeRoute(route: Route): Route {
  return {
    ...route,
    name: route.name.trim(),
    segments: route.segments.map((segment) => ({
      origin: segment.origin.trim().toUpperCase(),
      destination: segment.destination.trim().toUpperCase(),
      baseDate: segment.baseDate,
    })),
  }
}

function validDate(value: string): boolean {
  return ISO_DATE.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())
}

export function validateRoute(input: Route): string[] {
  const route = normalizeRoute(input)
  const errors: string[] = []
  if (!route.name) errors.push('Укажите название маршрута')
  if (route.segments.length < 2) errors.push('Добавьте минимум два перелёта')
  route.segments.forEach((segment, index) => {
    if (!IATA.test(segment.origin)) errors.push(`Код вылета в перелёте ${index + 1} должен состоять из трёх латинских букв`)
    if (!IATA.test(segment.destination)) errors.push(`Код прилёта в перелёте ${index + 1} должен состоять из трёх латинских букв`)
    if (!validDate(segment.baseDate)) errors.push(`Укажите корректную дату перелёта ${index + 1}`)
    const previous = route.segments[index - 1]
    if (previous && validDate(previous.baseDate) && validDate(segment.baseDate) && segment.baseDate < previous.baseDate) {
      errors.push(`Дата перелёта ${index + 1} не может быть раньше предыдущей`)
    }
  })
  if (!Number.isInteger(route.flexDays) || route.flexDays < 0 || route.flexDays > 7) errors.push('Гибкость должна быть от 0 до 7 дней')
  if (!Number.isInteger(route.passengers) || route.passengers < 1) errors.push('Укажите хотя бы одного пассажира')
  return errors
}

export function routePath(segments: Segment[]): string {
  if (!segments.length) return ''
  return [segments[0].origin, ...segments.map((segment) => segment.destination)].join(' → ')
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}
