# frontend — Content CMS admin UI + public reading site

Persistent context for Claude Code in this repo. Read this first — it exists so a
fresh session doesn't have to re-derive the routing/auth wiring by re-reading every
file every time. Keep it accurate (see **Keeping this file updated** at the bottom).

## What this is

Next.js (App Router) UI for the Content CMS. One app, two audiences: an
unauthenticated public reading site and a JWT-gated admin dashboard. Companion
repo: `../backend` (NestJS API, `http://localhost:3001` by default). Full security
posture lives in `../RED_TEAM_REPORT.md` at the repo root — check it before
touching `lib/api.ts`, `lib/auth-context.tsx`, or the upload flow.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · `socket.io-client`.
No state management library, no data-fetching library (no React Query/SWR) — plain
`useState`/`useEffect` + the hand-rolled `api` client. No test suite exists.

## Commands

```
npm run dev     # http://localhost:3000, expects backend on :3001 (NEXT_PUBLIC_API_URL)
npm run build
npm run lint
```

## Routes

Public (no auth):
- `/` — reading site homepage, tag filter, live WebSocket banner on new publishes.
- `/articles/[slug]` — article detail + related articles (shared-tag ranking).

Admin (JWT-gated via `ProtectedRoute`):
- `/login`, `/signup`
- `/dashboard` — article list, search, publish/unpublish toggle, delete.
- `/dashboard/articles/new`, `/dashboard/articles/[id]` — create/edit form.
- `/users` — admin-only user list + role management. **Note:** this route is at
  `/users`, not `/dashboard/users` — don't assume it's nested under dashboard when
  linking to it or reading the README, which describes it more loosely.

## Architecture

**Auth state**: `lib/auth-context.tsx` (`AuthProvider`/`useAuth`) is the only
source of truth for the current user — a React context, not a global store. On
mount it calls `GET /auth/me` with whatever token is in `localStorage` and clears
it on failure. `login`/`signup` store both `accessToken` and `refreshToken` in
`localStorage` (keys `cms_token` / `cms_refresh_token`, see `lib/api.ts`) and push
to `/dashboard`.

**Route protection is client-side only** (`ProtectedRoute` redirects if
`!user` or role isn't in `allow`) — this is a UX convenience, **not** the actual
security boundary. The backend enforces auth/roles independently on every route;
never treat a `ProtectedRoute`-gated page as the reason a backend endpoint is
safe to leave unguarded, and never remove a backend guard because "the frontend
already hides the button."

**API client** (`lib/api.ts`) is the only place that talks to the backend —
components call `api.get/post/patch/delete/uploadImage/fetchImage`, never `fetch`
directly. It has one non-obvious piece of logic worth understanding before
touching it: on a `401`, it calls `refreshOnce()`, which **shares one in-flight
refresh promise** across concurrent callers (`refreshPromise` module-level
variable). This exists because refresh-token rotation revokes the old token the
instant it's used — if two components each independently raced to refresh on
mount, the second request would rotate-and-invalidate the token the first request
was still relying on. If you add a new API method, route it through `request()`
(or replicate the shared-refresh pattern exactly) rather than calling `fetch`
directly — a naive new call site reintroduces the race.

**Realtime**: the homepage (`/`) opens a `socket.io-client` connection and listens
for `article.published`. This is presentation-only — it doesn't drive any auth or
data-consistency logic, just triggers a "new article" banner / refetch.

## Conventions

- All API calls go through `lib/api.ts` — see above, this isn't optional.
- Types live in `lib/types.ts` and are hand-maintained to match backend DTOs —
  there's no generated client, no shared types package between `frontend` and
  `backend`. If a backend DTO shape changes, update `lib/types.ts` by hand in the
  same change.
- Forms follow the `ArticleForm.tsx` shape: local `useState` per field, a single
  `handleSubmit` that calls a passed-in `onSubmit` prop (so create/edit pages
  share one form component and just supply different submit handlers), inline
  error state from a caught `ApiError`.
- Image upload (`ImageUploader` inside `ArticleForm.tsx`) requires an existing
  article `id` — you can't attach an image while creating a new article in the
  same step; save first, then the uploader appears. Don't "fix" this by trying to
  upload before the article exists — the backend's `media` table has a required
  `articleId` foreign key, this is a real constraint, not a UI oversight.
- Tailwind utility classes directly in JSX; no CSS modules, no styled-components.
  Shared tokens (`--bg`, `--text`, etc.) live in `globals.css` — check there
  before hardcoding a color.
- `ApiError` (in `lib/api.ts`) carries the HTTP status — catch it specifically
  when you need status-code-based branching rather than string-matching messages.

## Known gaps (see red-team report for full detail/priority)

- JWT access + refresh tokens live in `localStorage`, not an httpOnly cookie —
  readable by any script that gets XSS execution. No known XSS vector exists
  today (verified clean in the red-team pass), but this is why one matters more
  here than it would with cookie-based auth if that ever changes.
- No client-side file-size pre-check before upload — `ImageUploader` lets you
  pick an oversized file and only learns it's too big after the request starts.
  Open, cheap fix (check `file.size` before calling `api.uploadImage`).
- No frontend page renders the backend's `GET /audit-log` — the endpoint works
  and is admin-gated, there's just no UI for it yet.

## Keeping this file updated

Update this file in the same commit/session when you:
- add, remove, or move a route (especially anything that changes the `/users`
  vs `/dashboard/users` kind of surprise noted above);
- change how tokens are stored, refreshed, or where `AuthProvider`/`ProtectedRoute`
  fit in the tree;
- add a new pattern for API calls, forms, or state management that future code
  should follow instead of what's described here;
- change `lib/types.ts` in a way that reflects a backend contract change (note it
  here only if the *shape of the sync process* changes, not for routine field
  additions).

Don't update it for routine styling tweaks, copy changes, or anything already
obvious from reading the component. If something here is wrong or stale when you
read it, fix it on the spot rather than letting the drift compound for the next
session.
