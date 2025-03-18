import requests
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Book
from .serializers import BookSerializer, UserSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.core.files.storage import default_storage


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


class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
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

    def get_permissions(self):
        if self.request.method == "POST":  # Only librarians or admins can add books
            return [IsLibrarianOrAdmin()]
        return []  # Allows unauthenticated users to view books

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  # Pass the request for `borrowed_by` field
        return context


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
            book.save()
            return Response(
                {"message": "Book borrowed successfully"}, status=status.HTTP_200_OK
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

            book.borrowed_by = None
            book.save()
            return Response(
                {"message": "Book returned successfully"}, status=status.HTTP_200_OK
            )
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND
            )
