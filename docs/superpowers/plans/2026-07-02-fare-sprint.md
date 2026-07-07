# FareSprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React application for managing multi-city routes and opening shifted date combinations on Trip.com, Aviasales, and T-Bank Travel.

**Architecture:** Keep pure route/date/provider logic in focused TypeScript modules, browser persistence in a storage adapter, and UI state in React components. The main screen owns route selection and import/export; a modal editor owns validated route changes.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Project shell and domain model

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/types.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create the Vite/React configuration**

Add scripts for `dev`, `build`, and `test`, React/Vite dependencies, strict TypeScript options, and a jsdom Vitest setup.

- [ ] **Step 2: Define the route model**

Define `Segment`, `Route`, `CabinClass`, `Currency`, `DateCombination`, provider capability, and persisted-data interfaces exactly as named in the design.

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: dependencies install and a lockfile is created.

### Task 2: Date generation and route validation

**Files:**
- Create: `src/lib/routes.test.ts`
- Create: `src/lib/routes.ts`

- [ ] **Step 1: Write failing tests**

Cover inclusive shifts from `-flexDays` through `+flexDays`, preservation of each segment interval, leap/month boundaries, IATA normalization, chronological validation, minimum segment count, and minimum passenger count.

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- src/lib/routes.test.ts`
Expected: FAIL because `routes.ts` does not exist.

- [ ] **Step 3: Implement the pure route functions**

Implement UTC-safe ISO date shifting, combination generation, route normalization, and validation returning field-addressable error messages.

- [ ] **Step 4: Verify tests pass**

Run: `npm test -- src/lib/routes.test.ts`
Expected: all route tests PASS.

### Task 3: Provider adapters

**Files:**
- Create: `src/lib/providers.test.ts`
- Create: `src/lib/providers.ts`

- [ ] **Step 1: Write failing tests**

Assert that Trip.com URLs include every shifted segment, passenger count, mapped cabin, Russian locale, and currency. Assert that T-Bank URLs encode all segments and dates in the multi-way path with passenger and cabin parameters. Assert that Aviasales encodes `ORIGIN + DDMM + DESTINATION` segments and passenger count, using `partial` capability for non-economy cabins.

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- src/lib/providers.test.ts`
Expected: FAIL because provider adapters are missing.

- [ ] **Step 3: Implement adapters**

Create one adapter per provider. Trip.com and T-Bank return direct URLs. Aviasales returns a direct economy URL and a partial URL plus copy summary for other cabins.

- [ ] **Step 4: Verify tests pass**

Run: `npm test -- src/lib/providers.test.ts`
Expected: all provider tests PASS.

### Task 4: Versioned persistence and import/export

**Files:**
- Create: `src/lib/storage.test.ts`
- Create: `src/lib/storage.ts`

- [ ] **Step 1: Write failing tests**

Cover default seed data, localStorage round-trip, malformed JSON rejection without mutation, route-level import validation, merge with ID collision replacement, and full replacement.

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- src/lib/storage.test.ts`
Expected: FAIL because storage functions are missing.

- [ ] **Step 3: Implement storage**

Use a versioned `{ version: 1, routes, selectedRouteId }` document, validate all imported routes before writing, and expose merge/replace helpers.

- [ ] **Step 4: Verify tests pass**

Run: `npm test -- src/lib/storage.test.ts`
Expected: all storage tests PASS.

### Task 5: Route editor and main workflow

**Files:**
- Create: `src/components/RouteEditor.tsx`
- Create: `src/components/RouteEditor.test.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: Write failing component tests**

Cover opening the editor, rejecting invalid input, adding/removing/reordering segments, saving a normalized route, selecting/duplicating/deleting routes, rendering all combinations, and honest provider labels.

- [ ] **Step 2: Verify component tests fail**

Run: `npm test -- src/components/RouteEditor.test.tsx src/App.test.tsx`
Expected: FAIL because components are missing.

- [ ] **Step 3: Implement the editor**

Build an accessible dialog with labeled controls, inline errors, segment ordering controls, and save/cancel actions.

- [ ] **Step 4: Implement the main screen**

Connect storage, route actions, date rows, provider opening/copy fallback, import merge/replace prompt, export download, and non-color status messages.

- [ ] **Step 5: Verify component tests pass**

Run: `npm test -- src/components/RouteEditor.test.tsx src/App.test.tsx`
Expected: all component tests PASS.

### Task 6: Responsive visual design

**Files:**
- Create: `src/styles.css`

- [ ] **Step 1: Add the desktop workspace**

Create a warm editorial travel-tool design with a compact masthead, route cards, dense scan-friendly rows, clear focus states, and restrained provider accents.

- [ ] **Step 2: Add mobile behavior**

At narrow widths, stack controls and convert each date row into a readable card while preserving action order and touch target size.

- [ ] **Step 3: Build and visually verify**

Run: `npm run build`
Expected: TypeScript and Vite build succeed.

Open the local app at desktop and mobile widths, exercise add/edit/duplicate/delete, reload persistence, export/import, clipboard fallback, and provider links.

### Task 7: Final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document local usage**

Document `npm install`, `npm run dev`, `npm test`, `npm run build`, the no-scraping boundary, and provider capability behavior.

- [ ] **Step 2: Run all automated checks**

Run: `npm test -- --run && npm run build`
Expected: all tests PASS and production build exits 0.

- [ ] **Step 3: Review requirements**

Compare the built application against every section in `docs/superpowers/specs/2026-07-02-fare-sprint-design.md`, correcting any uncovered gap before completion.
