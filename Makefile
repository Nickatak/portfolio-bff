SHELL := /bin/bash

VENV_DIR ?= .venv
PYTHON := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip
PORTFOLIO_BFF_PORT ?= 8001

.PHONY: help venv install dev migrate seed superuser \
	db-up db-down \
	docker-build docker-up docker-down docker-logs

help:
	@echo "portfolio-bff"
	@echo "============="
	@echo ""
	@echo "Local (no Docker):"
	@echo "  make venv           Create virtualenv in $(VENV_DIR)"
	@echo "  make install        Install Python deps into $(VENV_DIR)"
	@echo "  make migrate        Run Django migrations"
	@echo "  make seed           Seed portfolio content"
	@echo "  make superuser      Create Django superuser"
	@echo "  make dev            Run Django dev server"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build   Build images"
	@echo "  make docker-up      Run services"
	@echo "  make docker-down    Stop services"
	@echo "  make docker-logs    Follow logs"
	@echo ""
	@echo "MySQL (Docker only):"
	@echo "  make db-up          Start MySQL container"
	@echo "  make db-down        Stop MySQL container"

venv:
	@python3 -m venv $(VENV_DIR)

install: venv
	@$(PIP) install -r requirements.txt

migrate:
	@$(PYTHON) manage.py migrate

seed:
	@$(PYTHON) manage.py seed_portfolio_content --reset

superuser:
	@$(PYTHON) manage.py createsuperuser

dev:
	@$(PYTHON) manage.py runserver 0.0.0.0:$(PORTFOLIO_BFF_PORT)

docker-build:
	@docker compose build

docker-up:
	@docker compose up --build

docker-down:
	@docker compose down --remove-orphans

docker-logs:
	@docker compose logs -f --tail=200

db-up:
	@docker compose up -d mysql

db-down:
	@docker compose stop mysql
