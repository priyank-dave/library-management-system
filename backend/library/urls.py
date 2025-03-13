from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    BookListCreateView,
    BookDetailView,
    GoogleLoginView,
    UserDetailView,
    BorrowBookView,
    ReturnBookView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("books/", BookListCreateView.as_view(), name="book-list"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("books/<int:book_id>/borrow/", BorrowBookView.as_view(), name="borrow-book"),
    path("books/<int:book_id>/return/", ReturnBookView.as_view(), name="return-book"),
]
