# Meeting Action Items Tracker

Full-stack app: paste a meeting transcript, extract action items with OpenAI, and track them.

## Quick start

### 1. Backend setup (once)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

- **DATABASE_URL** – PostgreSQL connection string, e.g.  
  `postgresql://user:password@localhost:5432/meeting_action_items`
- **OPENAI_API_KEY** – Your OpenAI API key
- **PORT** – Optional; default is `5001` (5000 is often used by macOS)

Then create the database and run migrations:

```bash
cd backend
npm install
npx prisma generate --schema=src/prisma/schema.prisma
npx prisma migrate dev --schema=src/prisma/schema.prisma --name init
```

### 2. Run the full project

From the **project root**:

```bash
npm install
npm run dev
```

This starts:

- **API** at [http://localhost:5001](http://localhost:5001)
- **Frontend** at [http://localhost:3000](http://localhost:3000) (or the next free port if 3000 is in use)

The frontend proxies `/api` to the backend, so both must be running. Open the URL Vite prints in the terminal.

### Run frontend or backend only

- **Backend first:** `npm run start:api` (from root) or `cd backend && npm start` — must be running for the app to work.
- **Frontend:** `cd frontend && npm run dev` — then open the URL shown (e.g. http://localhost:3000 or :3001).

If the app shows "Cannot reach the server", start the backend: `cd backend && npm start`.

## Project layout

- **frontend/** – Vite + React (port 3000 in dev, or next available)
- **backend/** – Node.js + Express + Prisma + OpenAI (port 5001)

See `backend/README.md` for API details and `frontend/` for the UI app.
