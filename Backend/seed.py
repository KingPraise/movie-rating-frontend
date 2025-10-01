import os
import django
import random
import argparse
from decimal import Decimal
from django.db.utils import IntegrityError

# --- Setup Django ---
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mrp.settings")  # replace with your settings module
django.setup()

from movies.models import User, Movie, Rating

# --- Constants ---
GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"]
DEFAULT_NUM_USERS = 5
DEFAULT_NUM_MOVIES = 10
DEFAULT_MAX_RATINGS_PER_USER = 5

# --- Functions ---
def create_users(num_users):
    users = []
    for i in range(1, num_users + 1):
        email = f"user{i}@example.com"
        password = "password123"
        try:
            user = User.objects.create_user(email=email, password=password)
            users.append(user)
            print(f"Created user: {email}")
        except IntegrityError:
            user = User.objects.get(email=email)
            users.append(user)
            print(f"User {email} already exists")
    return users

def create_movies(num_movies, users):
    movies = []
    for i in range(1, num_movies + 1):
        title = f"Movie {i}"
        genre = random.choice(GENRES)
        release_year = random.randint(1980, 2023)
        description = f"This is the description for {title}."
        created_by = random.choice(users)
        movie, created = Movie.objects.get_or_create(
            title=title,
            defaults={
                "genre": genre,
                "release_year": release_year,
                "description": description,
                "created_by": created_by
            }
        )
        movies.append(movie)
        print(f"{'Created' if created else 'Exists'} movie: {title} ({genre}, {release_year})")
    return movies

def create_ratings(users, movies, max_ratings_per_user):
    for user in users:
        rated_movies = random.sample(movies, k=min(max_ratings_per_user, len(movies)))
        for movie in rated_movies:
            rating_value = random.randint(1, 5)
            review = f"Review by {user.email} for {movie.title}"
            try:
                rating, created = Rating.objects.get_or_create(
                    user=user,
                    movie=movie,
                    defaults={
                        "rating": rating_value,
                        "review": review
                    }
                )
                if created:
                    movie.recalc_ratings()
                    print(f"Created rating: {movie.title} - {rating_value} by {user.email}")
                else:
                    print(f"{user.email} already rated {movie.title}")
            except IntegrityError:
                print(f"{user.email} already rated {movie.title}")

# --- Main ---
def main():
    parser = argparse.ArgumentParser(description="Seed the database with users, movies, and ratings.")
    parser.add_argument("--users", type=int, default=DEFAULT_NUM_USERS, help="Number of users to create")
    parser.add_argument("--movies", type=int, default=DEFAULT_NUM_MOVIES, help="Number of movies to create")
    args = parser.parse_args()

    print("Seeding database...")
    users = create_users(args.users)
    movies = create_movies(args.movies, users)
    create_ratings(users, movies, 5)
    print("Seeding complete!")

if __name__ == "__main__":
    main()
