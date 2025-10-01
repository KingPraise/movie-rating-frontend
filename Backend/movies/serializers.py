from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Movie, Rating
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample, extend_schema_field
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Register Example",
            value={
                "username": "johndoe",
                "email": "johndoe@example.com",
                "password": "strongpassword123",
            },
        )
    ]
)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"username": {"read_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def to_representation(self, instance):
        # Return only id, username, email in response (no password)
        return {"id": instance.id, "username": instance.username, "email": instance.email}

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise AuthenticationFailed("Invalid credentials")
        return user

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Movie Example",
            value={
                "id": 1,
                "title": "Inception",
                "genre": "Sci-Fi",
                "release_year": 2010,
                "description": "A mind-bending thriller",
                "created_by": 1,
                "average_rating": 4.5,
                "ratings_count": 12,
            },
        )
    ]
)
class MovieSerializer(serializers.ModelSerializer):
    ratings_avg = serializers.DecimalField(max_digits=4, decimal_places=2, read_only=True)
    ratings_count = serializers.IntegerField(read_only=True)
    created_by = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "genre",
            "release_year",
            "description",
            "created_by",
            "ratings_avg",
            "ratings_count",
            "created_at",
        )
        read_only_fields = ("id", "created_by", "ratings_avg", "ratings_count", "created_at")

    @extend_schema_field(serializers.IntegerField)
    def get_created_by(self, obj):
        # Return user id for created_by
        return getattr(obj.created_by, "id", None)

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Rating Example",
            value={
                "id": 1,
                "user": "johndoe",
                "movie": 1,
                "rating": 5,
                "review": "Amazing movie!",
                "created_at": "2025-09-30T12:00:00Z",
                "updated_at": "2025-09-30T12:30:00Z",
            },
        )
    ]
)
class RatingSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Rating
        fields = ("id", "user", "movie", "rating", "review", "created_at", "updated_at")
        read_only_fields = ("id", "user", "movie", "created_at", "updated_at")

    @extend_schema_field(serializers.CharField)
    def get_user(self, obj):
        # present username in response
        return getattr(obj.user, "username", None)

    @extend_schema_field(serializers.IntegerField)
    def validate_rating(self, value):
        if not (1 <= int(value) <= 5):
            raise serializers.ValidationError("Rating must be an integer between 1 and 5.")
        return value

class TokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    token_type = serializers.CharField()

class MovieListResponseSerializer(serializers.Serializer):
    items = MovieSerializer(many=True)
    page = serializers.IntegerField()
    limit = serializers.IntegerField()
    total = serializers.IntegerField()