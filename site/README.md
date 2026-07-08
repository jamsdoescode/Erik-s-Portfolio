# Personal Site

A personal website with a minimalist gallery aesthetic and an admin panel for updating content without opening Cursor.

## Public site

- Home, about, reading list, projects, and blog
- Light gallery-wall layout inspired by minimalist editorial sites
- No stock photography from design references — image areas use neutral placeholders until you add your own

## Admin

Sign in at `/admin/login` to manage:

- Blog posts (create, edit, publish, delete)
- Site settings (intro, bio, now list, links)
- Reading list items

Default seed credentials:

- Email: `admin@example.com`
- Password: `admin1234`

Change these in `.env` before deploying.

## Quick start

```bash
cd site
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Environment

```bash
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="change-me-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin1234"
ADMIN_NAME="Admin"
```

## Deploy notes

This app uses SQLite and server routes for the admin panel, so it needs a Node hosting target (Vercel with persistent storage, Railway, Fly.io, etc.). Static export is intentionally disabled.

For production, set strong `JWT_SECRET` and `ADMIN_PASSWORD` values, then run `npm run db:seed` once on the server.

## Content seed

Initial content is imported from `content/` into SQLite by `npm run db:seed`. After that, the admin panel is the source of truth.

