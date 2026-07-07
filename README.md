# FareSprint

Статический помощник для быстрого открытия одного мульти-маршрута с разными
датами на Trip.com, Aviasales и в Т-Банк Путешествиях.

```bash
npm install
npm run dev
```

Производственная сборка:

```bash
npm run build
```

## GitHub Pages

Проект готов к публикации через GitHub Actions. После пуша в ветку `main`
workflow `.github/workflows/deploy.yml` соберёт `dist` и опубликует сайт в
GitHub Pages.

В GitHub нужно один раз включить:

1. `Settings → Pages`
2. `Build and deployment → Source → GitHub Actions`

После этого сайт будет доступен по адресу вида:

```text
https://USERNAME.github.io/REPOSITORY/
```

FareSprint не собирает цены и не обходит CAPTCHA. Trip.com и Т-Банк получают
полностью заполненные ссылки. Aviasales получает прямую ссылку для эконом-класса;
для остальных классов приложение дополнительно копирует параметры маршрута.

Маршруты хранятся локально в `localStorage`; импорт и экспорт используют
версионированный JSON.
