from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from content.models import ContactLink, Project, SiteSetting, Skill, SocialLink, Stat

DATA_PATH = Path(__file__).resolve().parents[3] / "content" / "data" / "portfolio-content.json"

SITE_NAME_KEY = "site.name"
DISPLAY_NAME_KEY = "site.display_name"
CONTACT_EMAIL_KEY = "site.contact_email"


class Command(BaseCommand):
    help = "Seed portfolio content into the database from content/data/portfolio-content.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing content before seeding.",
        )

    def handle(self, *args, **options):
        if not DATA_PATH.exists():
            raise FileNotFoundError(f"Seed data not found: {DATA_PATH}")

        with DATA_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)

        with transaction.atomic():
            if options["reset"]:
                Project.objects.all().delete()
                Stat.objects.all().delete()
                Skill.objects.all().delete()
                SocialLink.objects.all().delete()
                ContactLink.objects.all().delete()

            site = data.get("site", {})
            SiteSetting.objects.update_or_create(key=SITE_NAME_KEY, defaults={"value": site.get("name", "Portfolio")})
            SiteSetting.objects.update_or_create(key=DISPLAY_NAME_KEY, defaults={"value": site.get("displayName", "Your Name")})
            SiteSetting.objects.update_or_create(key=CONTACT_EMAIL_KEY, defaults={"value": site.get("contactEmail", "hello@example.com")})

            for index, project in enumerate(data.get("projects", [])):
                slug = project.get("slug") or slugify(project.get("title", ""))
                Project.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": project.get("title", ""),
                        "description": project.get("description", ""),
                        "tags": project.get("tags", []),
                        "link": project.get("link", ""),
                        "github": project.get("github", ""),
                        "is_published": True,
                        "order": index,
                    },
                )

            for index, stat in enumerate(data.get("stats", [])):
                Stat.objects.update_or_create(
                    label=stat.get("label", ""),
                    defaults={
                        "number": stat.get("number", ""),
                        "icon": stat.get("icon", ""),
                        "order": index,
                    },
                )

            for index, skill_name in enumerate(data.get("skills", [])):
                Skill.objects.update_or_create(
                    name=skill_name,
                    defaults={
                        "order": index,
                    },
                )

            for index, link in enumerate(data.get("socialLinks", [])):
                SocialLink.objects.update_or_create(
                    name=link.get("name", ""),
                    defaults={
                        "url": link.get("url", ""),
                        "icon": link.get("icon", ""),
                        "order": index,
                    },
                )

            for index, link in enumerate(data.get("contactLinks", [])):
                ContactLink.objects.update_or_create(
                    title=link.get("title", ""),
                    defaults={
                        "icon": link.get("icon", ""),
                        "description": link.get("description", ""),
                        "href": link.get("href", ""),
                        "order": index,
                    },
                )

        self.stdout.write(self.style.SUCCESS("Seed data loaded successfully."))
