# ReviewBoard

ReviewBoard is a junior-level full-stack portfolio project for reviewing engineering drawings. The MVP will let reviewers place numbered markers on seeded drawings, write comments, and resolve them.

This repository currently contains the Milestone 1 foundation:

- React, TypeScript, and Vite frontend
- Django and Django REST Framework backend
- PostgreSQL-ready environment configuration
- Development CORS configuration
- API health endpoint

## Repository layout

```text
frontend/   React application
backend/    Django API
```

## Prerequisites

- Node.js 20 or newer
- npm
- Python 3.11 or newer
- PostgreSQL

## 1. Configure PostgreSQL

Create a local database and user. The defaults below match `.env.example`:

```sql
CREATE USER reviewboard WITH PASSWORD 'reviewboard';
CREATE DATABASE reviewboard OWNER reviewboard;
```

Copy the example environment file and change values when needed:

```bash
cp .env.example .env
```

## 2. Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000`. Its health endpoint is available at `http://127.0.0.1:8000/api/health/`.

## 3. Run the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. During development Vite proxies `/api` requests to Django.

## Checks

```bash
cd frontend
npm run typecheck
npm run build

cd ../backend
source .venv/bin/activate
python manage.py check
python manage.py test
```

## Current scope

Domain models, drawing cards, review markers, and comment workflows intentionally belong to later milestones. Authentication, uploads, WebSockets, Docker, and global state libraries are outside the MVP.

