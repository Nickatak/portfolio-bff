from django.contrib import admin

from .models import Page, SiteSetting


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("slug", "title", "is_published", "updated_at")
    list_filter = ("is_published",)
    search_fields = ("slug", "title")
    ordering = ("slug",)


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "updated_at")
    search_fields = ("key",)
    ordering = ("key",)

# Register your models here.
