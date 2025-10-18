from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, Http404
from django.views.generic import RedirectView
from django.views.static import serve as static_serve
from django.conf import settings
from pathlib import Path
from mimetypes import guess_type

# Serve static HTML files from /frontend with clean URLs.
BASE_DIR = Path(settings.BASE_DIR)
FRONTEND_ROOT = BASE_DIR / "frontend"

def send_file(rel_path: str):
    p = (FRONTEND_ROOT / rel_path).resolve()
    if not str(p).startswith(str(FRONTEND_ROOT)) or not p.exists() or not p.is_file():
        raise Http404("Not found")
    content_type = guess_type(p.name)[0] or "application/octet-stream"
    return HttpResponse(p.read_bytes(), content_type=content_type)

urlpatterns = [
    # Root 
    path("", RedirectView.as_view(url="/home", permanent=False)),

    # Clean, extensionless routes
    path("home",      lambda r: send_file("home/home.html")),
    path("places",    lambda r: send_file("places/places.html")),
    path("guides",    lambda r: send_file("guides/guides.html")),
    path("contact",   lambda r: send_file("contact/contact.html")),
    path("login",     lambda r: send_file("login/login.html")),
    path("register",  lambda r: send_file("register/register.html")),
    path("dashboard", lambda r: send_file("dashboard/dashboard.html")),

    # API and admin
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
]

# Fallback: serve all other assets from /frontend (CSS, JS, images, etc.)
urlpatterns += [
    re_path(r"^(?P<path>.*)$", static_serve, {"document_root": str(FRONTEND_ROOT)}),
]
