from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    BookListCreateView,
    BookDetailView,
    GoogleLoginView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("books/", BookListCreateView.as_view(), name="book-list"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
]
