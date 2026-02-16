from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from django.http import Http404, JsonResponse
from django.utils.text import slugify
from django.views.decorators.http import require_GET

DATA_PATH = Path(__file__).resolve().parent / "data" / "portfolio-content.json"


def _load_content() -> dict[str, Any]:
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


@require_GET
def portfolio_content(request):
    data = _load_content()
    return JsonResponse(data)


@require_GET
def project_detail(request, project: str):
    data = _load_content()
    projects = data.get("projects", [])

    for item in projects:
        project_id = str(item.get("id", ""))
        slug = str(item.get("slug") or slugify(item.get("title", "")))
        if project == project_id or project == slug:
            return JsonResponse(item)

    raise Http404("Project not found")
