"""nlm-fb URLs."""
from django.urls import path

from nlm_fb.nlm_fb_expt import views


urlpatterns = [
    path('expt', views.expt),
    path('save_results/', views.save_results),
    path('validate_captcha/', views.validate_captcha),
    path('ua_data/', views.ua_data),
    path('error', views.error),
    path('data/<str:model>/', views.download_data),
]
