# Content CMS — Frontend

Next.js UI for a small content management system: a public reading site (with live WebSocket
updates) plus an admin dashboard for article CRUD.

This is the frontend half of a two-repo portfolio project. The backend lives at
[portfolio_backend](https://github.com/senin142/portfolio_backend).

This is original code written for a personal portfolio. It is **not** a copy of any employer's
codebase.

## What it does

- **Public site** (`/`): lists published articles, filterable by tag. When an article is
  published, a "New article published" banner arrives over WebSocket without a page refresh.
- **Article detail** (`/articles/[slug]`): the full article plus a "similar articles" section
  ranked by shared tags.
- **Sign up** (`/signup`): new accounts are created as editors and can't log in until an admin
  approves them.
- **Admin** (`/login`, `/dashboard/*`): article CRUD with tags, publish/unpublish, and one image
  per article (optional server-side resize, 10MB upload limit, with a storage usage bar).
- **Admins only**: user management at `/users` (approve signups, change roles, see last login and
  the auto-delete countdown for stale pending accounts) and an audit log at
  `/dashboard/audit-log` covering auth events and destructive or privileged actions.
- Light/dark theme toggle.

## Running it locally

Needs the [backend](https://github.com/senin142/portfolio_backend) running first.

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if the backend isn't on localhost:3001
npm install
npm run dev
```

Runs at `http://localhost:3000`.

Seeded accounts (password for both: `password123`):

- `admin@example.com` (admin)
- `editor@example.com` (editor)

## Notes

- Auth uses a short-lived (15 min) access token plus a rotating refresh token. Both are kept in
  `localStorage`; `src/lib/api.ts` refreshes once on a 401, so expiry is invisible in normal use.
  A production app would keep the tokens in httpOnly cookies instead.
- The public homepage connects to the backend's Socket.IO gateway directly over
  `NEXT_PUBLIC_API_URL` for live publish notifications.
