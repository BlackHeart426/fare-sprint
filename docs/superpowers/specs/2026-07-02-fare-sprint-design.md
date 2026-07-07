# FareSprint Design

## Goal

Build a small static website that lets one person quickly open the same
multi-city flight route and date combinations on Trip.com, Aviasales, and
T-Bank Travel.

The website does not scrape prices. Its job is to remove repetitive route and
date entry so the user can inspect prices manually in normal browser tabs.

## Primary Workflow

1. Open FareSprint locally in a browser.
2. Select a saved route.
3. Review generated date combinations.
4. Click Trip.com, Aviasales, or T-Bank for a combination.
5. Inspect the price on the provider website.
6. Return to FareSprint and open the next combination.

Provider pages open in new tabs. FareSprint stays open and keeps the user's
place in the list.

## Route Model

Each saved route contains:

- `id`
- `name`
- ordered `segments`
- `flexDays`
- `passengers`
- `cabinClass`
- `currency`
- `createdAt`
- `updatedAt`

Each segment contains:

- `origin` IATA city or airport code
- `destination` IATA city or airport code
- `baseDate` in `YYYY-MM-DD`

The initial product supports two or more segments.

## Date Combinations

FareSprint uses the first segment as the anchor and shifts every segment by the
same number of days. This preserves the interval between flights.

For a route with `flexDays = 3`, FareSprint generates seven combinations:

- base dates minus 3 days
- base dates minus 2 days
- base dates minus 1 day
- base dates
- base dates plus 1 day
- base dates plus 2 days
- base dates plus 3 days

The list is ordered from earliest to latest. Each row shows every segment date,
not only the first and last date.

## Main Screen

The first screen is the working interface, not a landing page.

It contains:

- compact header with the FareSprint name;
- route selector;
- add, edit, duplicate, and delete route controls;
- selected route summary;
- passengers, cabin, and currency summary;
- date-combination table;
- one provider action per supported provider in every row;
- export and import controls.

Each date row shows:

- shift label, such as `-2`, `base`, or `+3`;
- ordered segment dates;
- `Trip.com` action;
- `Aviasales` action;
- `T-Bank` action;
- copy-route action when a provider cannot be fully prefilled.

The layout is optimized for fast repeated scanning on desktop but remains
usable on mobile.

## Route Editor

The editor opens as a modal or dedicated panel. It supports:

- route name;
- adding, removing, and reordering segments;
- origin and destination IATA codes;
- base date for each segment;
- flexibility from 0 to 7 days;
- passenger count;
- economy, premium economy, business, or first class;
- RUB as the default currency.

Validation prevents saving:

- fewer than two segments;
- malformed IATA codes;
- invalid dates;
- a later segment dated before an earlier segment;
- passenger counts below one.

## Provider Links

### Trip.com

Trip.com is the reference implementation because its direct multi-city URL was
verified in a normal browser.

FareSprint generates:

```text
https://ru.trip.com/flights/showfarefirst
  ?multdcity0=mow
  &multacity0=osa
  &multddate0=2026-10-12
  &multdcity1=tyo
  &multacity1=mow
  &multddate1=2026-10-31
  &triptype=mt
  &class=y
  &quantity=2
  &locale=ru-RU
  &curr=RUB
```

The actual URL is encoded without whitespace. Segment parameters are generated
for all route segments. Cabin and passenger values are mapped to Trip.com query
parameters.

### Aviasales

Aviasales uses a direct multi-city search path. Every segment is encoded as
`ORIGIN + DDMM + DESTINATION`, segments are joined with `-`, and the passenger
count is appended to the final segment:

```text
https://www.aviasales.ru/search/MOW0810OSA-TYO27102
```

When the last segment returns to the first segment's origin, Aviasales omits
that final destination from the path. The path reliably represents routes,
dates, passengers, and economy class. Tracking and ticket-subscription query
parameters are not copied. For non-economy cabins the adapter is `partial`: it
opens the route and copies the full request so the cabin can be selected
manually.

### T-Bank Travel

T-Bank uses a verified direct multi-city URL. Segments and `MM-DD` dates are
encoded as alternating path components:

```text
https://www.tbank.ru/travel/flights/multi-way/
  MOW-OSA/10-12/
  TYO-MOW/10-31/
  ?adults=1
  &children=0
  &infants=0
  &cabin=Y
  &composite=1
```

The actual URL contains no whitespace. Passenger count maps to `adults`;
children and infants remain zero in the MVP. Cabin maps to the provider's
uppercase code.

## Provider Capability Model

Each provider adapter declares:

- `direct`: all route parameters are supported in the URL;
- `partial`: some parameters are supported and missing values are copied;
- `open-only`: no stable parameterized URL exists, so the base page opens and
  all route details are copied.

The UI labels each action honestly:

- `Open`
- `Open + copy`
- `Copy`

This allows provider behavior to change without changing the route model or the
main screen.

## Persistence

The MVP has no backend.

Routes and preferences are stored in browser `localStorage`. A versioned JSON
format supports:

- export to a local JSON file;
- import with validation;
- replacement or merge when importing;
- future data migrations.

The project includes one default example route:

- Moscow to Osaka on 2026-10-12;
- Tokyo to Moscow on 2026-10-31;
- flexibility of 3 days;
- two adults;
- economy;
- RUB.

## Technical Shape

FareSprint is a standalone static frontend project.

Recommended stack:

- Vite;
- TypeScript;
- React;
- localStorage;
- Vitest for focused link and date-generation logic.

No server, database, Telegram integration, Docker container, authentication, or
scheduled jobs are required for the MVP.

The app can run with:

```text
npm install
npm run dev
```

It can later be published as static files on GitHub Pages, Cloudflare Pages, or
another static host.

## Error Handling

- Invalid routes cannot be saved.
- Failed clipboard access shows the route summary for manual copying.
- A popup-blocked provider action shows a direct fallback link.
- Import errors identify the invalid route without deleting existing data.
- Provider adapters never attempt to scrape prices or bypass CAPTCHA.

## Accessibility

- Provider actions are real links when possible.
- All icon buttons have accessible names and tooltips.
- Keyboard navigation covers route selection, editing, and provider actions.
- Dates are rendered in Russian for display and ISO format in generated URLs.
- Status feedback does not rely on color alone.

## Verification

Before the MVP is considered ready:

- date shifts preserve every segment interval;
- Trip.com links reproduce all segments, dates, passengers, cabin, locale, and
  currency;
- provider capability labels match actual behavior;
- routes survive a reload;
- export/import round-trips without data loss;
- the main workflow works at desktop and mobile widths.

Live provider verification is manual because providers can change URLs and
anti-bot behavior independently of FareSprint.

## Deferred Features

The following are deliberately postponed:

- automatic price scraping;
- scheduled checks;
- Telegram notifications;
- server deployment;
- user accounts;
- manual price-entry fields;
- cheapest-price highlighting;
- browser extension autofill.
