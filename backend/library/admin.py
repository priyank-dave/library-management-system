from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Book


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "is_staff", "is_superuser", "is_librarian", "last_login")
    list_filter = ("is_staff", "is_superuser", "is_librarian", "is_active")
    ordering = ("-last_login",)
    search_fields = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Permissions",
            {"fields": ("is_staff", "is_superuser", "is_librarian", "is_active")},
        ),
        ("Important Dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (None, {"fields": ("email", "password1", "password2")}),
        (
            "Permissions",
            {"fields": ("is_staff", "is_superuser", "is_librarian", "is_active")},
        ),
    )


# Prevent registering the User model multiple times
if not admin.site.is_registered(User):
    admin.site.register(User, CustomUserAdmin)


# Book Admin
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "published_date")
    search_fields = ("title", "author")
    list_filter = ("published_date",)


admin.site.register(Book, BookAdmin)
