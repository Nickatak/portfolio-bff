from django.contrib import admin
from django.urls import path

from content import views as content_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/portfolio-content", content_views.portfolio_content, name="portfolio-content"),
    path("api/projects", content_views.projects_list, name="projects-list"),
    path("projects/<slug:project>", content_views.project_detail, name="project-detail"),
]
