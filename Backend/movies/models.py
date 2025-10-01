from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.db import models
from django.db.models import Avg, Count
from django.contrib.auth.models import AbstractUser, BaseUserManager


User = settings.AUTH_USER_MODEL  # usually "auth.User"

class CustomUserManager(BaseUserManager):
    """Manager where email is the unique identifier for auth instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email.split("@")[0])  # fallback username
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)  # enforce uniqueness at DB level
    username = models.CharField(max_length=150, blank=True)  # still required for AbstractUser
    
    USERNAME_FIELD = "email"  # login with email
    REQUIRED_FIELDS = []      # removes username requirement when creating superuser

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Movie(models.Model):
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    release_year = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="movies")
    created_at = models.DateTimeField(auto_now_add=True)

    # denormalized aggregate fields (kept consistent by application logic)
    ratings_count = models.PositiveIntegerField(default=0)
    ratings_avg = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.00"))

    def __str__(self):
        return self.title

    def recalc_ratings(self):
        """Recompute ratings_count and ratings_avg from related Rating rows."""
        agg = self.ratings.aggregate(avg=Avg("rating"), count=Count("id"))
        avg = agg["avg"] or 0
        count = agg["count"] or 0
        # Round avg to 2 decimal places using Decimal
        avg_decimal = (Decimal(avg).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                       if count else Decimal("0.00"))
        self.ratings_avg = avg_decimal
        self.ratings_count = count
        self.save(update_fields=["ratings_avg", "ratings_count"])


class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="ratings")
    rating = models.PositiveSmallIntegerField()  # 1-5 validated at serializer level
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "movie")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movie.title} - {self.rating} by {self.user}"
