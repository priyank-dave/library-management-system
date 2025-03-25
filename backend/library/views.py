import requests
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Book, Category, Notification
from .serializers import (
    BookSerializer,
    UserSerializer,
    LoginSerializer,
    CategorySerializer,
    NotificationSerializer,
)
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.storage import default_storage
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

User = get_user_model()


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            # Handle profile picture update and deletion
            if "profile_picture" in request.data:
                if not request.data["profile_picture"]:  # User wants to delete
                    if user.profile_picture:
                        user.profile_picture.delete(save=False)
                    user.profile_picture = None
                else:  # User is uploading a new one
                    if user.profile_picture:
                        user.profile_picture.delete(save=False)  # Delete old one

            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        is_librarian = data.get("is_librarian", False)  # Check if librarian signup

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            if is_librarian:
                user.is_librarian = True
                user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data

            # Ensure only regular users can log in here
            if user.is_staff or user.is_librarian:
                return Response(
                    {"error": "Admins/Librarians must log in via /admin/login"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data

            if not (user.is_staff or user.is_librarian):
                return Response(
                    {"error": "Only admins/librarians can log in here"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(views.APIView):
    def post(self, request):
        token = request.data.get("token")
        print(token)

        if not token:
            return Response(
                {"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        google_response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        )
        google_data = google_response.json()

        if "email" not in google_data:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )

        email = google_data["email"]
        first_name = google_data.get("given_name", "")  # Extract first name
        last_name = google_data.get("family_name", "")  # Extract last name

        user, created = User.objects.get_or_create(email=email)
        if created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )


class IsLibrarianOrAdmin(BasePermission):
    """Custom permission to allow only librarians or admins to modify books."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_librarian or request.user.is_staff
        )


class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    ordering_fields = ["published_date", "title"]
    ordering = ["title"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLibrarianOrAdmin()]
        return []

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        queryset = Book.objects.all()
        author_query = self.request.query_params.get("author", None)
        title_query = self.request.query_params.get("title", None)
        category_query = self.request.query_params.get("category", None)
        borrowed_by_query = self.request.query_params.get("borrowed_by", None)

        filters = Q()

        if author_query:
            filters &= Q(author__icontains=author_query)

        if title_query:
            filters &= Q(title__icontains=title_query)

        if category_query:
            filters &= Q(category__name__icontains=category_query)

        if borrowed_by_query:
            filters &= Q(borrowed_by__email=borrowed_by_query)

        if filters:
            queryset = queryset.filter(filters)

        return queryset


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = "isbn"  # Use ISBN as the lookup field

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsLibrarianOrAdmin()]
        return []

    def update(self, request, *args, **kwargs):
        book = self.get_object()
        if "pdf" in request.data and not request.data["pdf"]:
            if book.pdf:
                book.pdf.delete(save=False)
            book.pdf = None
        return super().update(request, *args, **kwargs)


class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, isbn):
        try:
            book = Book.objects.get(isbn=isbn)
            if book.borrowed_by:
                return Response(
                    {"error": "Book is already borrowed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            book.borrowed_by = request.user
            book.due_date = timezone.now() + timedelta(days=7)
            book.save()

            # Create a notification for the user
            Notification.objects.create(
                user=request.user, message=f"You have borrowed '{book.title}'."
            )

            return Response(
                {"message": "Book borrowed successfully", "due_date": book.due_date},
                status=status.HTTP_200_OK,
            )
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, isbn):
        try:
            book = Book.objects.get(isbn=isbn)
            if book.borrowed_by != request.user:
                return Response(
                    {"error": "You did not borrow this book"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Calculate overdue fee
            overdue_fee = book.calculate_overdue_fee()
            if overdue_fee > 0:
                return Response(
                    {
                        "error": f"You must pay an overdue fee of ${overdue_fee:.2f} before returning the book."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mark book as returned
            book.borrowed_by = None
            book.due_date = None
            book.save()

            # Create a notification for the user
            Notification.objects.create(
                user=request.user, message=f"You have returned '{book.title}'."
            )

            return Response(
                {"message": "Book returned successfully"}, status=status.HTTP_200_OK
            )
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND
            )


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by(
            "-timestamp"
        )


class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id, user=request.user
            )
            notification.is_read = True
            notification.save()
            return Response(
                {"message": "Notification marked as read"}, status=status.HTTP_200_OK
            )
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
            )


class PayFeeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        isbn = request.data.get("isbn")
        amount = request.data.get("amount")

        if not isbn or amount is None:
            return Response(
                {"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            book = Book.objects.get(isbn=isbn, borrowed_by=request.user)

            overdue_fee = book.calculate_overdue_fee()

            if overdue_fee > 0 and (amount is None or amount < overdue_fee):
                return Response(
                    {"error": f"Full payment required: ${overdue_fee:.2f}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mark fee as paid (Implement actual payment gateway logic)
            book.due_date = None  # Reset due date
            book.borrowed_by = None
            book.save()

            Notification.objects.create(
                user=request.user,
                message=f"Overdue fee of ${amount:.2f} paid for '{book.title}'.",
            )

            return Response(
                {"message": "Payment successful"}, status=status.HTTP_200_OK
            )

        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found or not borrowed by this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
