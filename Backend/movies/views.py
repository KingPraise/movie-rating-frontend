from django.shortcuts import render

# Create your views here.
from decimal import Decimal
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from django.db.models import Avg, Count
from .models import Movie, Rating
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from .serializers import RegisterSerializer, MovieSerializer, RatingSerializer, LoginSerializer, TokenResponseSerializer, MovieListResponseSerializer

User = get_user_model()

# Custom pagination to match acceptance contract
class ContractPagination(PageNumberPagination):
    page_size = 10
    page_query_param = "page"
    page_size_query_param = "limit"  # allow ?limit=10
    max_page_size = 100

    def get_paginated_response(self, data):
        # Build contract: { items: [...], page: x, limit: y, total: z }
        page = self.page.number if self.page else 1
        limit = self.get_page_size(self.request) or self.page_size
        total = self.page.paginator.count if self.page else 0
        return Response(
            {
                "items": data,
                "page": page,
                "limit": int(limit),
                "total": total,
            }
        )


@extend_schema(
    description="Register a new user. Returns 201 with id/username/email.",
    request=RegisterSerializer,
    responses={201: RegisterSerializer},
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # Use default create but ensure 201 and proper representation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        rep = serializer.to_representation(user)
        return Response(rep, status=status.HTTP_201_CREATED, headers=headers)

@extend_schema(
    request=LoginSerializer,
    responses={
        200: TokenResponseSerializer,
        400: OpenApiResponse(description="Email and password required."),
        401: OpenApiResponse(description="Invalid credentials."),
    },
)
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        # create JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response(
            {"access_token": access_token, "token_type": "bearer"},
            status=status.HTTP_200_OK
        )

@extend_schema_view(
    get=extend_schema(
        summary="List Movies",
        description=(
            "Retrieve a paginated list of movies. Supports optional filters:\n\n"
            "- `?genre=`: Filter by exact genre\n"
            "- `?min_year=`: Minimum release year\n"
            "- `?max_year=`: Maximum release year\n"
            "- `?search=`: Search in title or description\n"
            "- `?page=` and `?limit=`: Pagination controls\n"
        ),
        parameters=[
            OpenApiParameter("genre", str, OpenApiParameter.QUERY, description="Filter by genre (case-insensitive exact match)"),
            OpenApiParameter("min_year", int, OpenApiParameter.QUERY, description="Filter movies released after or in this year"),
            OpenApiParameter("max_year", int, OpenApiParameter.QUERY, description="Filter movies released before or in this year"),
            OpenApiParameter("search", str, OpenApiParameter.QUERY, description="Search in title and description"),
            OpenApiParameter("page", int, OpenApiParameter.QUERY, description="Page number (for pagination)"),
            OpenApiParameter("limit", int, OpenApiParameter.QUERY, description="Page size (number of results per page)"),
        ],
        responses={
            200: OpenApiResponse(
                response=MovieListResponseSerializer,
                description="A paginated list of movies matching the filter/search criteria."
            ),
        }
    ),
    post=extend_schema(
        summary="Create a Movie",
        description="Create a new movie (requires authentication). Returns the created movie object.",
        request=MovieSerializer,
        responses={
            201: OpenApiResponse(
                response=MovieSerializer,
                description="Movie created successfully."
            ),
            400: OpenApiResponse(description="Invalid data."),
            401: OpenApiResponse(description="Authentication credentials were not provided."),
        },
    ),
)
class MovieListCreateView(generics.ListCreateAPIView):
    serializer_class = MovieSerializer
    authentication_classes = [JWTAuthentication]
    pagination_class = ContractPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description", "genre"]

    def get_queryset(self):
        qs = Movie.objects.all().order_by("-id")
        genre = self.request.query_params.get("genre")
        min_year = self.request.query_params.get("min_year")
        max_year = self.request.query_params.get("max_year")

        if genre:
            qs = qs.filter(genre__iexact=genre)
        if min_year:
            try:
                qs = qs.filter(release_year__gte=int(min_year))
            except ValueError:
                pass
        if max_year:
            try:
                qs = qs.filter(release_year__lte=int(max_year))
            except ValueError:
                pass
        print(qs)
        return qs

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        # Ensure we return 201 and the created object
        return super().create(request, *args, **kwargs)


@extend_schema(
    description="Retrieve or delete a movie. "
                "GET returns details (with ratings_avg and ratings_count). "
                "DELETE removes the movie (only the creator can delete).",
    responses={
        200: MovieSerializer,
        204: OpenApiResponse(description="Deleted"),
        403: OpenApiResponse(description="Forbidden"),
        404: OpenApiResponse(description="Not found"),
    },
)
class MovieDetailView(generics.RetrieveDestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_destroy(self, instance):
        if getattr(instance, "created_by", None) != self.request.user:
            raise PermissionDenied("You are not allowed to delete this movie.")
        instance.delete()

@extend_schema(
    description="List ratings for a movie (GET) or add/update your rating (POST).",
    request=RatingSerializer,  # only applies to POST
    responses={
        200: RatingSerializer(many=True),  # GET response
        201: RatingSerializer,             # POST created
        400: OpenApiResponse(description="Invalid rating input."),
        401: OpenApiResponse(description="Authentication required for POST."),
    },
)
class MovieRatingsView(generics.ListAPIView):
    """
    GET: List ratings for a movie (paginated).
    POST: Add or update a rating for the authenticated user.
    """
    serializer_class = RatingSerializer
    pagination_class = ContractPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        pk = self.kwargs.get("pk")
        return Rating.objects.filter(movie_id=pk).order_by("-created_at")

    def post(self, request, pk):
        movie = get_object_or_404(Movie, pk=pk)
        rating_value = request.data.get("rating")
        review = request.data.get("review", "")

        if rating_value is None:
            return Response({"detail": "rating is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            rating_value = int(rating_value)
        except (TypeError, ValueError):
            return Response({"detail": "rating must be an integer between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)
        if rating_value < 1 or rating_value > 5:
            return Response({"detail": "rating must be between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            rating_obj, created = Rating.objects.update_or_create(
                user=request.user,
                movie=movie,
                defaults={"rating": rating_value, "review": review},
            )
            # Recompute movie aggregates
            movie.recalc_ratings()

        rating_data = RatingSerializer(rating_obj).data
        movie_data = MovieSerializer(movie).data
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({"rating": rating_data, "movie": movie_data}, status=status_code)


@extend_schema(
    description="List ratings by a user (paginated).",
    responses={200: RatingSerializer(many=True)},
)
class UserRatingsListView(generics.ListAPIView):
    serializer_class = RatingSerializer
    pagination_class = ContractPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return Rating.objects.filter(user_id=user_id).order_by("-created_at")
