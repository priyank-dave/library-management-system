from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import (
    RegisterView,
    UserLoginView,
    AdminLoginView,
    BookListCreateView,
    BookDetailView,
    GoogleLoginView,
    UserDetailView,
    BorrowBookView,
    ReturnBookView,
    CategoryListCreateView,
    CategoryDetailView,
    NotificationListView,
    MarkNotificationAsReadView,
    PayFeeView,
)

urlpatterns = [
    path("register/user/", RegisterView.as_view(), name="user-register"),
    path("login/user/", UserLoginView.as_view(), name="user-login"),
    path("login/admin/", AdminLoginView.as_view(), name="admin-login"),
    path("books/", BookListCreateView.as_view(), name="book-list"),
    path("books/<str:isbn>/", BookDetailView.as_view(), name="book-detail"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("books/<str:isbn>/borrow/", BorrowBookView.as_view(), name="borrow-book"),
    path("books/<str:isbn>/return/", ReturnBookView.as_view(), name="return-book"),
    path("categories/", CategoryListCreateView.as_view(), name="category-list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path(
        "notifications/<int:notification_id>/read/",
        MarkNotificationAsReadView.as_view(),
        name="mark-notification-read",
    ),
    path("pay-fee/", PayFeeView.as_view(), name="pay-fee"),
]
