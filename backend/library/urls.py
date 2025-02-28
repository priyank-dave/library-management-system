from django.urls import path
import library.views as views  # Import the whole module

urlpatterns = [
    path("books/", views.get_books),
    path("books/add/", views.add_book),
]
