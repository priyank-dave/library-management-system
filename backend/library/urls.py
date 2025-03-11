from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    BookListCreateView,
    BookDetailView,
    GoogleLoginView,
    UserDetailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("books/", BookListCreateView.as_view(), name="book-list"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    path("user/", UserDetailView.as_view(), name="user-detail"),  # Added endpoint
    path(
        "token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),  # ✅ Refresh token endpoint
]
