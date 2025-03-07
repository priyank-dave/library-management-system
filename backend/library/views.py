import requests
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Book
from .serializers import BookSerializer, UserSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated
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
            # Handle profile picture deletion if requested
            if (
                "profile_picture" in request.data
                and not request.data["profile_picture"]
            ):
                if user.profile_picture:
                    default_storage.delete(user.profile_picture.path)
                user.profile_picture = None

            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


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


class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]  # Require JWT for creating a book
        return [permissions.AllowAny()]


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
