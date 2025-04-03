from django.urls import path
from . import views

urlpatterns = [
    path('datafeed/config', views.config),
    path('datafeed/symbols', views.symbols),
    path('datafeed/history', views.history),
]