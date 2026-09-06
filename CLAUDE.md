# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 14 (App Router) frontend for a small content management system: a public reading
site with live WebSocket updates, plus a JWT-authenticated admin dashboard for article CRUD
and user role management. This is the frontend half of a two-repo portfolio project — the
backend lives at [portfolio_backend](https://github.com/senin142/portfolio_backend) and must
be running for this app to do anything useful locally.

## Commands

```bash
npm install
npm run dev      # starts on http://localhost:3000, needs backend running (see below)
npm run build
npm run start    # serve the production build
npm run lint     # next lint (eslint-config-next / core-web-vitals)
```

There is no test suite configured in this repo.

Local setup requires the backend from `portfolio_backend` running first, and a `.env.local`
copied from `.env.example` (`NEXT_PUBLIC_API_URL`, defaults to `http://localhost:3001`).
Seeded accounts: `admin@example.com` / `editor@example.com`, password `password123` for both.

## Architecture

**Two audiences, one app.** `src/app/page.tsx` and `src/app/articles/[slug]/page.tsx` are the
public, unauthenticated reading surface. Everything under `src/app/dashboard/*`, plus
`src/app/users/page.tsx`, is the admin surface and is wrapped in `ProtectedRoute`
(`src/components/ProtectedRoute.tsx`), which redirects to `/login` when there's no user and
to `/dashboard` when the user's role isn't in the `allow` list. Role gating (`admin` vs
`editor`) is enforced client-side only, based on what the JWT claims — the real authorization
boundary is the backend.

**Auth** is a single React context (`src/lib/auth-context.tsx`, `AuthProvider`, mounted in
`src/app/layout.tsx` around the whole app). The JWT is kept in `localStorage`
(`src/lib/api.ts`, `TOKEN_KEY`) and attached as a `Bearer` header by the `api` request
wrapper — noted in the README as a known simplification for a portfolio project; a real app
would use an httpOnly cookie instead. On mount, `AuthProvider` calls `GET /auth/me` with
whatever token is stored to rehydrate `user`, clearing the token on failure.

**API access** goes through the single `api` object in `src/lib/api.ts` (`get`/`post`/`patch`/
`delete`), not raw `fetch` calls scattered around components — it centralizes the base URL,
auth header injection, and error unwrapping into `ApiError`. Types for API payloads live in
`src/lib/types.ts` and should stay in sync with the backend's DTOs by hand (no shared schema
or codegen between the two repos).

**Live updates are a separate channel from the REST API.** The public homepage
(`src/app/page.tsx`) opens its own Socket.IO connection directly to `NEXT_PUBLIC_API_URL`
(via `socket.io-client`) to receive `article.published` events and re-fetch the list — this is
independent of the `api` HTTP client and has its own connection lifecycle (opened/closed in a
`useEffect`).

**Styling** is Tailwind utility classes inline in JSX, no component library or `cva`/variant
system yet. The `slate` palette is the neutral scale used throughout; admin surfaces use
`slate-900` for primary actions. There's a custom `arabic` font stack in
`tailwind.config.ts` for bilingual content but no i18n routing/framework is wired up yet
despite the repo name (`bilingual-cms-frontend`).

**Path alias**: `@/*` maps to `src/*` (see `tsconfig.json`).
