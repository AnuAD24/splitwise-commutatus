# Splitwise — React + Python + PostgreSQL

Expense-splitting app (Splitwise-style) with:

- **Frontend:** React (Vite)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL

## Features

- Sign up / sign in (JWT)
- Create expenses with multiple items
- Equal or unequal splits
- Tax & tip split equally across participants
- Dashboard balances (you owe / owed to you)
- Friend detail pages
- Settle-up payments

## Project structure

```text
backend/     FastAPI API
frontend/    React app
docker-compose.yml
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (recommended for Postgres) **or** local PostgreSQL

## Quick start (local)

### 1. Clone

```bash
git clone https://github.com/AnuAD24/splitwise-commutatus.git
cd splitwise-commutatus
git checkout cursor/react-python-postgresql-281d
```

### 2. Start PostgreSQL

```bash
docker compose up -d db
```

If you use your own Postgres, create a database/user and set `DATABASE_URL` in `backend/.env`.

### 3. Backend

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
# .venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Swagger docs: http://localhost:8000/docs  

Demo users (password `password123`):

- `alice@example.com`
- `bob@example.com`
- `cara@example.com`

### 4. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173

## Run everything with Docker

```bash
docker compose up --build
```

- Web: http://localhost:5173  
- API: http://localhost:8000  

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login (form: username=email, password) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/dashboard` | Balances + recent expenses |
| GET | `/api/users` | Other users |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/{id}` | Expense detail |
| DELETE | `/api/expenses/{id}` | Delete expense you paid |
| GET | `/api/people/{id}` | Balances with a friend |
| POST | `/api/payments` | Record settlement |

## Environment

`backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://splitwise:splitwise@localhost:5432/splitwise_dev
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```
