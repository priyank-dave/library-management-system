from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Book, Category, Notification, FavoriteBook


class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "date_joined",
            "is_librarian",
            "last_login",
            "password",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "date_joined": {"read_only": True},
            "last_login": {"read_only": True},
        }

    def update(self, instance, validated_data):
        if "profile_picture" in validated_data:
            if instance.profile_picture:
                # Delete previous profile picture before updating
                instance.profile_picture.delete(save=False)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        profile_picture = validated_data.pop("profile_picture", None)  # Extract file

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()

        # Save profile picture separately after user is created
        if profile_picture:
            user.profile_picture = profile_picture
            user.save()

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        print(email)
        print(password)

        try:
            user = User.objects.get(email=email)
            print(user.password)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")

        if not user.check_password(password):
            raise serializers.ValidationError("Wrong Password")

        if not user.is_active:
            raise serializers.ValidationError("User is inactive")

        return user  # Return the user instance


class BookSerializer(serializers.ModelSerializer):
    borrowed_by = serializers.SerializerMethodField()
    is_borrowed = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), write_only=True
    )
    overdue_fee = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            "isbn",
            "title",
            "author",
            "published_date",
            "image",
            "pdf",
            "borrowed_by",
            "is_borrowed",
            "category",
            "category_name",
            "due_date",
            "fine_per_day",
            "overdue_fee",
        ]

    def get_borrowed_by(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.borrowed_by.email if obj.borrowed_by else None
        return None

    def get_is_borrowed(self, obj):
        return bool(obj.borrowed_by)

    def get_overdue_fee(self, obj):
        return obj.calculate_overdue_fee()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "timestamp"]


class FavoriteBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteBook
        fields = ["isbn"]
