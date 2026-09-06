# Content CMS — Frontend

Next.js UI for a small content management system: a public reading site (with live WebSocket
updates) plus an admin dashboard for article CRUD.

This is the frontend half of a two-repo portfolio project. The backend lives at
[portfolio_backend](https://github.com/senin142/portfolio_backend).

This is original code written for a personal portfolio. It is **not** a copy of any employer's
codebase.

## What it does

- **Public site** (`/`) — lists published articles, filterable by tag, with a live "New article
  published" banner pushed over WebSocket whenever the admin publishes something (no page refresh
  needed).
- **Article detail** (`/articles/[slug]`) — full article plus a "similar articles" section ranked
  by shared tags.
- **Admin** (`/login`, `/dashboard/*`) — JWT-authenticated article CRUD with a tags field,
  publish/unpublish, and (for admins) user role management.

## Running it locally

Needs the [backend](https://github.com/senin142/portfolio_backend) running first.

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if the backend isn't on localhost:3001
npm install
npm run dev
```

Runs at `http://localhost:3000`.

Seeded accounts (password for both: `password123`):

- `admin@example.com` — admin
- `editor@example.com` — editor

## Notes

- Auth state lives in a small React context that stores the JWT in `localStorage` and attaches it
  to API requests — a production app would use an httpOnly cookie instead.
- The public homepage connects to the backend's Socket.IO gateway directly over
  `NEXT_PUBLIC_API_URL` for live publish notifications.
