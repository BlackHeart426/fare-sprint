import { useEffect, useRef, useState } from 'react'
import { RouteEditor } from './components/RouteEditor'
import { formatDate, generateCombinations, routePath } from './lib/routes'
import { providerActions, routeSummary } from './lib/providers'
import { loadData, mergeData, parseImport, saveData } from './lib/storage'
import type { DateCombination, PersistedData, ProviderAction, Route } from './types'

const cabinNames: Record<Route['cabinClass'], string> = {
  economy: 'Эконом',
  'premium-economy': 'Премиум-эконом',
  business: 'Бизнес',
  first: 'Первый',
}

export default function App() {
  const [data, setData] = useState<PersistedData>(loadData)
  const [editor, setEditor] = useState<Route | 'new' | null>(null)
  const [status, setStatus] = useState('')
  const [manualCopy, setManualCopy] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const selected = data.routes.find((route) => route.id === data.selectedRouteId) ?? data.routes[0]
  const combinations = selected ? generateCombinations(selected) : []

  useEffect(() => saveData(data), [data])

  const updateData = (next: PersistedData, message?: string) => {
    setData(next)
    if (message) setStatus(message)
  }

  const saveRoute = (route: Route) => {
    const exists = data.routes.some((item) => item.id === route.id)
    const routes = exists ? data.routes.map((item) => (item.id === route.id ? route : item)) : [...data.routes, route]
    updateData({ ...data, routes, selectedRouteId: route.id }, exists ? 'Маршрут обновлён' : 'Маршрут добавлен')
    setEditor(null)
  }

  const duplicate = () => {
    if (!selected) return
    const time = new Date().toISOString()
    const copy = { ...selected, id: crypto.randomUUID(), name: `${selected.name} — копия`, createdAt: time, updatedAt: time }
    updateData({ ...data, routes: [...data.routes, copy], selectedRouteId: copy.id }, 'Создана копия маршрута')
  }

  const remove = () => {
    if (!selected || !confirm(`Удалить маршрут «${selected.name}»?`)) return
    if (data.routes.length === 1) {
      setStatus('Нельзя удалить единственный маршрут')
      return
    }
    const routes = data.routes.filter((route) => route.id !== selected.id)
    updateData({ ...data, routes, selectedRouteId: routes[0].id }, 'Маршрут удалён')
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Маршрут скопирован — вставьте его в форму провайдера')
      setManualCopy('')
      return true
    } catch {
      setManualCopy(text)
      setStatus('Не удалось скопировать автоматически')
      return false
    }
  }

  const launch = async (action: ProviderAction) => {
    if (action.copyText) await copy(action.copyText)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `fare-sprint-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus('Маршруты экспортированы')
  }

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = parseImport(await file.text())
      const shouldMerge = confirm('Нажмите ОК, чтобы объединить маршруты. Отмена полностью заменит текущие данные.')
      updateData(shouldMerge ? mergeData(data, imported) : imported, 'Импорт завершён')
    } catch (error) {
      setStatus(error instanceof Error ? `Ошибка импорта: ${error.message}` : 'Не удалось импортировать файл')
    }
  }

  if (!selected) return null

  return (
    <>
      <header className="masthead">
        <a className="brand" href="#" aria-label="FareSprint — начало"><span className="brand-mark">FS</span><span>FareSprint</span></a>
        <p>Маршруты без рутины</p>
        <div className="data-actions">
          <button onClick={exportData}>Экспорт</button>
          <button onClick={() => importRef.current?.click()}>Импорт</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={importData} />
        </div>
      </header>

      <main>
        <section className="route-bar">
          <div className="route-select-wrap">
            <label htmlFor="route-select">Маршрут</label>
            <select id="route-select" value={selected.id} onChange={(e) => updateData({ ...data, selectedRouteId: e.target.value })}>
              {data.routes.map((route) => <option value={route.id} key={route.id}>{route.name}</option>)}
            </select>
          </div>
          <div className="route-tools" aria-label="Действия с маршрутом">
            <button className="primary-small" onClick={() => setEditor('new')}>+ Новый</button>
            <button onClick={() => setEditor(selected)}>Изменить</button>
            <button onClick={duplicate}>Дублировать</button>
            <button className="danger" onClick={remove}>Удалить</button>
          </div>
        </section>

        <section className="route-hero">
          <div>
            <p className="eyebrow">Активный маршрут</p>
            <h1>{routePath(selected.segments)}</h1>
            <div className="leg-line">
              {selected.segments.map((segment, index) => (
                <span key={`${segment.origin}-${segment.destination}-${index}`}>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  {segment.origin} — {segment.destination}
                  <time>{formatDate(segment.baseDate)}</time>
                </span>
              ))}
            </div>
          </div>
          <dl className="route-meta">
            <div><dt>Диапазон</dt><dd>±{selected.flexDays} {selected.flexDays === 1 ? 'день' : 'дней'}</dd></div>
            <div><dt>Пассажиры</dt><dd>{selected.passengers}</dd></div>
            <div><dt>Класс</dt><dd>{cabinNames[selected.cabinClass]}</dd></div>
            <div><dt>Валюта</dt><dd>{selected.currency}</dd></div>
          </dl>
        </section>

        <section className="results">
          <div className="section-title">
            <div><p className="eyebrow">Варианты дат</p><h2>{combinations.length} комбинаций</h2></div>
            <p>Все даты сдвигаются вместе — интервалы между перелётами сохраняются.</p>
          </div>
          <div className="combo-table">
            <div className="combo-head" aria-hidden><span>Сдвиг</span><span>Даты перелётов</span><span>Провайдеры</span><span>Копия</span></div>
            {combinations.map((combination) => (
              <CombinationRow
                key={combination.shift}
                route={selected}
                combination={combination}
                onLaunch={launch}
                onCopy={() => copy(routeSummary(selected, combination))}
              />
            ))}
          </div>
        </section>
      </main>

      <footer><span>FareSprint не ищет и не сравнивает цены.</span><span>Он только экономит ваши клики.</span></footer>
      <div className="status" role="status" aria-live="polite">{status}</div>
      {manualCopy && <div className="copy-fallback"><p>Скопируйте вручную:</p><textarea readOnly value={manualCopy} onFocus={(e) => e.target.select()} /><button onClick={() => setManualCopy('')}>Закрыть</button></div>}
      {editor && <RouteEditor route={editor === 'new' ? undefined : editor} onSave={saveRoute} onClose={() => setEditor(null)} />}
    </>
  )
}

function CombinationRow({ route, combination, onLaunch, onCopy }: {
  route: Route
  combination: DateCombination
  onLaunch: (action: ProviderAction) => void
  onCopy: () => void
}) {
  const actions = providerActions(route, combination)
  const shift = combination.shift === 0 ? 'База' : combination.shift > 0 ? `+${combination.shift}` : String(combination.shift)
  return (
    <article className={`combo-row ${combination.shift === 0 ? 'is-base' : ''}`}>
      <div className="shift"><span>{shift}</span>{combination.shift === 0 && <small>исходные даты</small>}</div>
      <div className="combo-dates">
        {combination.segments.map((segment, index) => <span key={index}><b>{segment.origin} → {segment.destination}</b><time dateTime={segment.baseDate}>{formatDate(segment.baseDate)}</time></span>)}
      </div>
      <div className="providers">
        {actions.map((action) => (
          <a key={action.id} className={`provider ${action.id}`} href={action.href} target="_blank" rel="noreferrer" onClick={() => onLaunch(action)}>
            <strong>{action.name}</strong><small>{action.label}</small><span aria-hidden>↗</span>
          </a>
        ))}
      </div>
      <button className="copy-button" onClick={onCopy} title="Копировать маршрут" aria-label={`Копировать маршрут для сдвига ${shift}`}>⧉</button>
    </article>
  )
}
