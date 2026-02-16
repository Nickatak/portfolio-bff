# portfolio-bff

Backend-for-Frontend service for the portfolio site.

## Portfolio Stack Description

Canonical system-wide architecture decisions and rationale live in the
`portfolio` repo:

`../portfolio/docs/architecture/repository-structure.md`

## Purpose
- Owns editable content and settings
- Provides a clean API surface for the frontend
- Serves as a base for a custom dashboard UI

## Quickstart (local)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install django
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Admin: `http://127.0.0.1:8000/admin/`

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```
