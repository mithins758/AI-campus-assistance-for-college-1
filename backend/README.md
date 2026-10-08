# Campus Management System — Backend

Express + PostgreSQL + Socket.io + Google Gemini backend for a Campus Management System.
Beginner-friendly, modular, and demo-ready.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- A Gemini API key (for AI chat; the rest of the API runs without it)

## Installation

```bash
cd backend
npm install
```

## Database Setup

1. Create the database:

```bash
createdb campus_management
```

Or via pgAdmin: create a database named `campus_management`, then open the
Query Tool and run the contents of `db/init.sql`.

2. Run the schema + seed data:

```bash
psql campus_management < db/init.sql
```

This creates ENUM types, `users`, `locations`, `faculty_status`, `schedules`,
indexes, and demo rows.

### Demo credentials (password for all: `Password123!`)

| Role    | Email               |
| ------- | ------------------- |
| Admin   | admin@campus.edu    |
| Faculty | smith@campus.edu    |
| Faculty | jane@campus.edu     |
| Student | mithin@example.com  |
| Student | ananya@example.com  |

## Environment Setup

```bash
cp .env.example .env
```

| Variable         | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `PORT`           | HTTP port (default `5000`)                               |
| `NODE_ENV`       | `development` or `production` (controls PG SSL + errors) |
| `DATABASE_URL`   | Postgres connection string                               |
| `JWT_SECRET`     | Long random secret for signing JWTs                      |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`)                               |
| `GEMINI_API_KEY` | Google Gemini API key (optional; chat returns 503 without it) |
| `GEMINI_MODEL`   | Gemini model name (default `gemini-3.5-flash-lite`)      |
| `CLIENT_URL`     | Frontend origin allowed by CORS + Socket.io (e.g. `http://localhost:3000`) |

Never commit `.env`. Only placeholders live in `.env.example`.

## Run Development Server

```bash
npm run dev
```

## Run Production

```bash
npm start
```

## Health Check

```
GET http://localhost:5000/health
```

Response:

```json
{ "success": true, "message": "Campus Management API is running" }
```

## Authentication

Send the JWT on protected routes:

```http
Authorization: Bearer YOUR_TOKEN
```

## API Examples

### Register (student/faculty only — `admin` is rejected with 403)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Mithin S","email":"mithin@example.com","password":"StrongPassword123","role":"student","department":"BCA"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mithin@example.com","password":"StrongPassword123"}'
```

### Current user

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Locations

```bash
curl http://localhost:5000/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN"

curl http://localhost:5000/api/locations/LAB-201 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Faculty status

```bash
curl http://localhost:5000/api/faculty/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Faculty status update (faculty own-only, admin any)

```bash
curl -X PATCH http://localhost:5000/api/faculty/FACULTY_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"in-lecture","current_location_id":"LOCATION_UUID"}'
```

Valid statuses: `in-cabin`, `in-lecture`, `on-leave`, `in-meeting`.

### Schedule (always the caller's own)

```bash
curl http://localhost:5000/api/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### AI chat

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt":"Where is Professor Smith right now?"}'
```

Without `GEMINI_API_KEY` this returns a controlled `503`:

```json
{ "success": false, "message": "The AI assistant is temporarily unavailable" }
```

## Socket.io

Connect with the frontend origin in `CLIENT_URL`:

- `faculty_status_update` — broadcast after every successful status PATCH:
  ```json
  { "faculty_id": "...", "status": "in-cabin", "current_location_id": "...", "updated_at": "..." }
  ```
- `faculty_status_snapshot` — sent once to each newly connected client.

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');
socket.on('faculty_status_update', console.log);
```

## Troubleshooting

- **PostgreSQL connection refused** — is Postgres running? Is `DATABASE_URL` correct?
  Try `pg_isready` or `psql $DATABASE_URL -c "select 1"`.
- **Wrong database credentials** — check user/password/host/port/db name in `DATABASE_URL`.
- **Missing `.env`** — copy `.env.example` to `.env` and fill in values; the server
  exits at startup if `DATABASE_URL` or `JWT_SECRET` is missing.
- **Invalid JWT secret / 401s** — ensure `JWT_SECRET` is set and identical between
  restarts; old tokens break if you change it.
- **CORS errors** — set `CLIENT_URL` to your exact frontend origin
  (`http://localhost:3000` for CRA, `http://localhost:5173` for Vite).
- **Gemini API errors** — check `GEMINI_API_KEY` and `GEMINI_MODEL`;
  the endpoint returns 503 instead of crashing.
- **Port already in use** — change `PORT` or stop the other process:
  `lsof -ti:5000 | xargs kill`.
