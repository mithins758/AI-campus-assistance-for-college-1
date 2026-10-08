# Campus Management System (merged)

Backend + frontend running together locally.

| Part     | Folder                                          | Port | Tech                              |
| -------- | ----------------------------------------------- | ---- | --------------------------------- |
| Backend  | `backend/`                                      | 5001 | Express, PostgreSQL, Socket.io, Gemini |
| Frontend | `aegis-campus-ai-•-glassmorphic-campus-assistant/` | 3000 | React + Vite (`server.ts`)        |

The frontend proxies all `/api/*` requests to the backend when `BACKEND_URL`
is set, and falls back to its built-in mock engine otherwise.

## Prerequisites

- Node.js 18+, npm
- PostgreSQL 14+ (or any reachable Postgres)
- Optional: Gemini API key for AI chat

## 1. Install everything

```bash
npm run install:all
# or individually:
npm --prefix backend install
npm --prefix "aegis-campus-ai-•-glassmorphic-campus-assistant" install
```

## 2. Database

```bash
createdb campus_management
psql campus_management < backend/db/init.sql
```

Demo logins (password for all: `Password123!`):
`admin@campus.edu`, `smith@campus.edu`, `jane@campus.edu`,
`mithin@example.com`, `ananya@example.com`.

## 3. Environment

Backend (`backend/.env`, see `backend/.env.example`):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/campus_management
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

Port note: macOS AirPlay Receiver occupies port 5000 by default, so the
examples below use `PORT=5001` for the backend. Either turn AirPlay Receiver
off or keep 5001.

## 4. Start everything with one command

```bash
python3 run.py --force
```

This starts the database (embedded sandbox if present, else uses your
`DATABASE_URL`), the backend with health-check gating, and the frontend
proxied to it — with prefixed logs and clean Ctrl+C shutdown:

```text
[run] STACK UP  →  app: http://localhost:3000  |  api: http://localhost:5001
```

Options: `--no-db`, `--install`, `--backend-port`, `--frontend-port`
(see `python3 run.py --help`). Manual alternative is two terminals
(see below).

## 5. Manual start (two terminals)

Terminal 1 — backend:

```bash
cd backend
PORT=5001 npm run dev
```

Terminal 2 — frontend (proxied to backend):

```bash
cd "aegis-campus-ai-•-glassmorphic-campus-assistant"
BACKEND_URL=http://localhost:5001 PORT=3000 npm run dev
```

Open http://localhost:3000, click **Sign in**, and use a demo account.
Without `BACKEND_URL`, the frontend runs standalone on its mock engine.

## How the merge is wired
- Frontend `vite.config.ts`: `/api` → backend proxy for `vite dev`.
- Frontend `server.ts`: if `BACKEND_URL` is set, all `/api/*` are forwarded
  to the backend (method, headers incl. `Authorization`, body preserved);
  otherwise the built-in mock `/api/chat` + `/api/campus-status` serve.
- `src/lib/api.ts`: JWT storage, `login`/`register`/`me`, chat helper that
  sends the backend shape `{ prompt }` and reads `{ success, data: { answer } }`
  (legacy mock `{ reply }` still accepted).
- `AuthModal` + header Sign in/out wired in `App.tsx` / `HeaderNavbar.tsx`.
- `AIChatInterface` uses the shared chat helper (JWT attached automatically).
- `FacultyDirectoryModal` overlays live `GET /api/faculty/status` rows when
  signed in, with an explicit "Live backend connected" banner.

## Specs

- Backend API contract: `backend.md`
- Backend details: `backend/README.md`
