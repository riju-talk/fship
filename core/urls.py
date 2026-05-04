from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/check-serviceability", views.check_serviceability, name="check_serviceability"),
    path("api/warehouses", views.get_warehouses, name="get_warehouses"),
    path("api/dashboard-data", views.dashboard_data, name="dashboard_data"),
    path("health", views.health, name="health"),
]

if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
