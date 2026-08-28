<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# JyotishVeda — AI Daivajna

A Vedic astrology, numerology, and AI-counselling platform.

**Current build status:** Authentication, profile persistence, numerology &
Kundli Milan report saving, AI Counsellor sessions (with a real RAG +
LLM-routing backend), and server-generated Kundli Milan PDF reports are all
built, wired end-to-end, and tested against a live MySQL instance. Birth
chart / numerology calculation still runs client-side in
`src/services/astroEngine.ts` (a real calculation engine, not mock data).
Still to build: consultations/payments, admin panel, knowledge graph,
runbooks, and i18n.

### AI Counsellor setup note

The AI Counsellor calls whichever LLM `ACTIVE_LLM` in `backend/.env`
points to (`mistral_local`, `mistral_cloud`, or `gemini`). If that LLM is
unreachable or misconfigured, the API returns a clear error — it never
fabricates a reply. To use it:
- **mistral_local**: run Ollama (or another Ollama-compatible server) and
  set `MISTRAL_LOCAL_URL` (e.g. `http://localhost:11434`).
- **mistral_cloud**: set `MISTRAL_CLOUD_URL` and `MISTRAL_CLOUD_API_KEY`.
- **gemini**: set `GEMINI_API_KEY`.


## Prerequisites

- Node.js v22.17.0, npm 10.9.2
- Python 3.12.8
- MySQL 8.x (or MariaDB 10.11+) running locally

## 1. Database setup

```cmd
mysql -u root -p < backend\database.sql
```

This creates the `jyotishveda` database, tables, seed reference data
(zodiac signs, houses, nakshatras), and all stored procedures.

## 2. Backend setup (Windows CMD / PowerShell)

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Edit `backend\.env` — at minimum set `MYSQL_PASSWORD` to your MySQL root
password. Leave `MISTRAL_LOCAL_URL` / `GEMINI_API_KEY` / payment keys blank
for now; those are used by later phases (AI counsellor, payments) and are
not required for auth/profiles to work.

Start the backend:

```cmd
python app.py
```

It starts on `http://localhost:5001`. Verify it's healthy:

```cmd
curl http://localhost:5001/api/health
```

## 3. Frontend setup

```cmd
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL` from `.env` (defaults to
`http://localhost:5001/api`, which matches the backend above).

Open the app, register an account, and create a profile — it's saved to
MySQL via `sp_create_profile`, not `localStorage`.

## Notes

- `backend\.env` holds real secrets — never commit it. `backend\.env.example`
  is the safe template.
- `JWT_SECRET` should be changed to a long random string before any real
  deployment.
- The MySQL connection layer uses `mysql-connector-python` only — no ORM,
  no SQLAlchemy, per the project's architecture requirements.
