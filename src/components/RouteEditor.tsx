import { useState } from 'react'
import type { Route, Segment } from '../types'
import { normalizeRoute, validateRoute } from '../lib/routes'

interface Props {
  route?: Route
  onSave: (route: Route) => void
  onClose: () => void
}

const blankSegment = (): Segment => ({ origin: '', destination: '', baseDate: '' })

export function RouteEditor({ route, onSave, onClose }: Props) {
  const now = new Date().toISOString()
  const [draft, setDraft] = useState<Route>(
    route ?? {
      id: crypto.randomUUID(),
      name: '',
      segments: [blankSegment(), blankSegment()],
      flexDays: 3,
      passengers: 1,
      cabinClass: 'economy',
      currency: 'RUB',
      createdAt: now,
      updatedAt: now,
    },
  )
  const [errors, setErrors] = useState<string[]>([])

  const patchSegment = (index: number, patch: Partial<Segment>) =>
    setDraft((current) => ({
      ...current,
      segments: current.segments.map((segment, i) => (i === index ? { ...segment, ...patch } : segment)),
    }))

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= draft.segments.length) return
    const segments = [...draft.segments]
    ;[segments[index], segments[target]] = [segments[target], segments[index]]
    setDraft({ ...draft, segments })
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const normalized = normalizeRoute({ ...draft, updatedAt: new Date().toISOString() })
    const nextErrors = validateRoute(normalized)
    setErrors(nextErrors)
    if (!nextErrors.length) onSave(normalized)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="editor-head">
          <div>
            <p className="eyebrow">Настройка маршрута</p>
            <h2 id="editor-title">{route ? 'Редактировать' : 'Новый маршрут'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Закрыть редактор">×</button>
        </div>
        <form onSubmit={submit}>
          <label className="field full">Название<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Например, Япония осенью" /></label>
          <div className="segments">
            {draft.segments.map((segment, index) => (
              <fieldset className="segment-editor" key={index}>
                <legend><span>{String(index + 1).padStart(2, '0')}</span> Перелёт</legend>
                <label className="field">Откуда<input maxLength={3} value={segment.origin} onChange={(e) => patchSegment(index, { origin: e.target.value })} placeholder="MOW" /></label>
                <span className="route-arrow" aria-hidden>→</span>
                <label className="field">Куда<input maxLength={3} value={segment.destination} onChange={(e) => patchSegment(index, { destination: e.target.value })} placeholder="OSA" /></label>
                <label className="field date-field">Дата<input type="date" value={segment.baseDate} onChange={(e) => patchSegment(index, { baseDate: e.target.value })} /></label>
                <div className="segment-actions">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Переместить перелёт ${index + 1} выше`}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === draft.segments.length - 1} aria-label={`Переместить перелёт ${index + 1} ниже`}>↓</button>
                  <button type="button" onClick={() => setDraft({ ...draft, segments: draft.segments.filter((_, i) => i !== index) })} disabled={draft.segments.length <= 2} aria-label={`Удалить перелёт ${index + 1}`}>Удалить</button>
                </div>
              </fieldset>
            ))}
          </div>
          <button className="add-leg" type="button" onClick={() => setDraft({ ...draft, segments: [...draft.segments, blankSegment()] })}>+ Добавить перелёт</button>
          <div className="settings-grid">
            <label className="field">± дней<input type="number" min="0" max="7" value={draft.flexDays} onChange={(e) => setDraft({ ...draft, flexDays: Number(e.target.value) })} /></label>
            <label className="field">Пассажиры<input type="number" min="1" value={draft.passengers} onChange={(e) => setDraft({ ...draft, passengers: Number(e.target.value) })} /></label>
            <label className="field">Класс<select value={draft.cabinClass} onChange={(e) => setDraft({ ...draft, cabinClass: e.target.value as Route['cabinClass'] })}><option value="economy">Эконом</option><option value="premium-economy">Премиум-эконом</option><option value="business">Бизнес</option><option value="first">Первый</option></select></label>
            <label className="field">Валюта<select value={draft.currency} disabled><option>RUB</option></select></label>
          </div>
          {errors.length > 0 && <div className="error-box" role="alert"><strong>Проверьте маршрут</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
          <div className="editor-footer"><button className="text-button" type="button" onClick={onClose}>Отмена</button><button className="primary-button" type="submit">Сохранить маршрут</button></div>
        </form>
      </section>
    </div>
  )
}
