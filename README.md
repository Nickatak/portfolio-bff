# portfolio-bff

Backend-for-Frontend service for the portfolio site.

## Portfolio Stack Description

Canonical system-wide architecture decisions and rationale live in the
`portfolio-frontend` repo:

`../portfolio-frontend/docs/architecture/repository-structure.md`

## Purpose
- Owns editable content and settings
- Provides a clean API surface for the frontend
- Serves as a base for a custom dashboard UI

## API Endpoints (JSON only)

- `GET /api/portfolio-content`
- `GET /api/projects`
- `GET /projects/{project}` (lookup by `id` or `slug`)

The API serves content from the database. Initial content can be seeded from
`content/data/portfolio-content.json`.

## Database (MySQL)

The BFF uses MySQL for all environments.

Required env vars:
- `DB_NAME` (default `portfolio_bff`)
- `DB_USER` (default `portfolio`)
- `DB_PASSWORD` (default `portfolio`)
- `DB_HOST` (default `127.0.0.1` for local, `mysql` in Docker)
- `DB_PORT` (default `3306`)

Docker MySQL uses:
- `DB_ROOT_PASSWORD` (default `portfolio`)

## Kafka Consumer (appointments.created)

The BFF includes a Kafka consumer that persists appointment events into the
database for the dashboard.

Manual run (dev):
```bash
python manage.py consume_appointments --from-beginning --max-messages 1
```

Docker:
```bash
docker compose up --build consumer
```

The consumer service expects the external Docker network
`notifier_service_default` (created by `notifier_service/docker-compose.yml`).

Consumer env vars:
- `KAFKA_BOOTSTRAP_SERVERS` (default `kafka:19092`)
- `KAFKA_TOPIC_APPOINTMENTS_CREATED` (default `appointments.created`)
- `KAFKA_CONSUMER_GROUP` (default `portfolio-bff`)
- `KAFKA_AUTO_OFFSET_RESET` (default `latest`)

## Quickstart (local)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
docker compose up -d mysql
export DB_HOST=127.0.0.1
python manage.py migrate
python manage.py seed_portfolio_content --reset
python manage.py createsuperuser
python manage.py runserver
```

Admin: `http://127.0.0.1:8000/admin/`

Kafka consumer (separate process):
```bash
python manage.py consume_appointments
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```
