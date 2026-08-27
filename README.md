# ReviewBoard

ReviewBoard is a junior-level full-stack portfolio project for reviewing engineering drawings. The MVP will let reviewers place numbered markers on seeded drawings, write comments, and resolve them.

This repository currently contains the Milestone 4 read-only review workspace and backend API:

- React, TypeScript, and Vite frontend
- Django and Django REST Framework backend
- PostgreSQL-ready environment configuration
- Development CORS configuration
- API health endpoint
- Drawing and review-comment models
- REST endpoints with coordinate and status validation
- Repeatable demo-data seed command
- Responsive drawing-card dashboard
- Loading, empty, and retryable error states
- Client-side dashboard and drawing routes
- Responsive drawing viewer with percentage-positioned markers
- Synchronized marker, comment-list, and comment-detail selection

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
python manage.py seed_demo_data
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000`. Its health endpoint is available at `http://127.0.0.1:8000/api/health/`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/drawings/` | List drawings and open-comment counts |
| `GET` | `/api/drawings/{id}/` | Retrieve one drawing |
| `GET` | `/api/drawings/{id}/comments/` | List a drawing's comments |
| `POST` | `/api/drawings/{id}/comments/` | Create a numbered comment marker |
| `GET` | `/api/comments/{id}/` | Retrieve one comment |
| `PATCH` | `/api/comments/{id}/` | Update comment content or status |
| `DELETE` | `/api/comments/{id}/` | Delete one comment |

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

Creating comments, filtering comments, and changing review status intentionally belong to later milestones. Authentication, uploads, WebSockets, Docker, and global state libraries are outside the MVP.
