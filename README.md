# t2pr-pilot: Brew Supply

A small web shop, built as the pilot repository for ticket-to-pr: a React web app and three NestJS
microservices in one npm + Nx monorepo. Everything keeps its data in memory, so every test runs offline.

## Layout

```
apps/web            React 19 + Vite 8 web app (product list, cart, orders)
services/gateway    NestJS API gateway, port 3000: the only service the web app calls (/api/...)
services/catalog    NestJS catalog service, port 3001: products, prices, stock
services/orders     NestJS order service, port 3002: places and cancels orders, reserves stock in the catalog
packages/shared     zod schemas, types and helpers shared by all of the above
```

```
web ──/api──▶ gateway ──▶ catalog
                 │            ▲
                 └──▶ orders ─┘   (orders reserves and releases stock over HTTP)
```

The gateway exposes only the public routes: `GET /api/products`, `GET /api/products/:id`,
`GET|POST /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel`. Creating products
(`POST /products`) and changing stock (`PATCH /products/:id/stock`) stay internal to the catalog.

## Stack

| Part | Choice |
|---|---|
| Runtime | Node.js 22 (`.nvmrc`; 22.12+ or 24) |
| Packages | npm workspaces, `package-lock.json` |
| Task runner | Nx 24, package-based (targets come from each `package.json`); no Nx Cloud, no daemon |
| Language | TypeScript 6, ESM everywhere |
| Services | NestJS 12 on Express 5, zod validation through a small pipe |
| Web | React 19, Vite 8 |
| Tests | Vitest 5 everywhere; Supertest for the service APIs, Testing Library + jsdom for the web app |

## Commands

Run from the repository root after `npm ci`:

| Command | What it does |
|---|---|
| `npm test` | Every project's unit and API tests (Nx builds `packages/shared` first) |
| `npm run typecheck` | `tsc --noEmit` in every project |
| `npm run build` | Builds every project into its `dist/` |
| `npm run dev` | Starts the three services and the web app in watch mode (web on http://localhost:5173) |

One project only: `npx nx run @t2pr/orders:test` (or `cd services/orders && npm test`).

Service addresses can be changed with `PORT`, `CATALOG_URL`, `ORDERS_URL` (services) and
`GATEWAY_URL` (the web dev server's proxy).

## Testing rules

- `npm test` is the whole test suite. It needs no network, no database, no browser and no running service:
  services talk to each other through injected clients (`CatalogClient`, `UpstreamClient`) that tests
  replace with in-memory fakes.
- The install must work with `npm ci --ignore-scripts`. Do not add dependencies that need an install
  script, a native download, a database or a browser to run their tests.
- Prices are whole cents (`priceCents`), never floating-point dollars.

## Known gap: no end-to-end browser tests yet

There are no Playwright (or other browser) tests on purpose. ticket-to-pr runs its agent in a sandbox with
no network: `npm ci --ignore-scripts` installs the Playwright package, but `npx playwright install` cannot
download the browsers there, so any browser test in `npm test` would fail on every run. Pre-downloaded
browsers in the sandbox image are planned for a later stage (I2).

**Future task:** add an `e2e/` workspace with Playwright tests that start the three services and the web app
and walk through the shop (browse, add to cart, place an order, cancel it). Run them with a separate
`npm run test:e2e`, kept out of `npm test`, until the sandbox image carries the browsers; then decide whether
the agent runs them too.
