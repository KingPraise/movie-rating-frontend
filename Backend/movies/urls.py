from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    MovieListCreateView,
    MovieDetailView,
    MovieRatingsView,
    UserRatingsListView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),

    # Movies
    path("movies/", MovieListCreateView.as_view(), name="movie-list-create"),
    path("movies/<int:pk>/", MovieDetailView.as_view(), name="movie-detail"),
    path("movies/<int:pk>/ratings/", MovieRatingsView.as_view(), name="movie-rate"),

    # User ratings
    path("users/<int:user_id>/ratings/", UserRatingsListView.as_view(), name="user-ratings"),
]
