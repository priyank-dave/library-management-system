from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Book


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = (
        "email",
        "is_staff",
        "is_superuser",
        "last_login",
    )
    list_filter = ("is_staff", "is_superuser", "is_active")
    ordering = ("-last_login",)
    search_fields = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser")}),
        ("Important Dates", {"fields": ("last_login",)}),  # Removed date_joined
    )


admin.site.register(User, CustomUserAdmin)


class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "published_date")
    search_fields = ("title", "author")
    list_filter = ("published_date",)  # Changed from string to tuple


admin.site.register(Book, BookAdmin)
