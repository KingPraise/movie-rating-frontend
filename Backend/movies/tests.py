from django.test import TestCase

# Create your tests here.

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Movie, Rating

User = get_user_model()


class MoviesAPITest(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register"
        self.login_url = "/api/auth/login"
        self.movies_url = "/api/movies"
        # create user
        self.user = User.objects.create_user(username="alice", email="alice@example.com", password="pass12345")

    def test_register_returns_201_and_user_fields(self):
        data = {"username": "bob", "email": "bob@example.com", "password": "strongpass"}
        resp = self.client.post(self.register_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", resp.data)
        self.assertEqual(resp.data["username"], "bob")
        self.assertEqual(resp.data["email"], "bob@example.com")

    def test_unique_email_enforced(self):
        url = reverse("register")  # adjust to your name
        data = {"username": "test1", "email": "dupe@example.com", "password": "pass1234"}
        self.client.post(url, data, format="json")

        # second attempt with same email
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("email", resp.data)


    def test_login_returns_access_token_with_email(self):
        data = {"email": "alice@example.com", "password": "pass12345"}
        resp = self.client.post(self.login_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", resp.data)
        self.assertEqual(resp.data["token_type"], "bearer")

    def test_create_movie_requires_auth_and_returns_201(self):
        # unauthenticated should be 401
        resp = self.client.post(self.movies_url, {"title": "T", "genre": "Action", "release_year": 1990}, format="json")
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))
        # authenticate
        login = self.client.post(self.login_url, {"email": "alice@example.com", "password": "pass12345"}, format="json")
        token = login.data["access_token"]
        auth_header = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        resp = self.client.post(self.movies_url, {"title": "Top Gun", "genre": "Action", "release_year": 1986}, format="json", **auth_header)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["title"], "Top Gun")
        self.assertEqual(resp.data["ratings_count"], 0)
        self.assertEqual(str(resp.data["ratings_avg"]), "0.00")

    def test_rate_movie_create_and_update_status_codes_and_movie_update(self):
        # create movie as alice
        login = self.client.post(self.login_url, {"email": "alice@example.com", "password": "pass12345"}, format="json")
        token = login.data["access_token"]
        auth_header = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        create_resp = self.client.post(self.movies_url, {"title": "Classic", "genre": "Drama", "release_year": 1980}, format="json", **auth_header)
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        movie_id = create_resp.data["id"]

        # rate movie (create)
        rate_url = f"/api/movies/{movie_id}/ratings"
        rate_resp = self.client.post(rate_url, {"rating": 5, "review": "Classic!"}, format="json", **auth_header)
        self.assertEqual(rate_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("rating", rate_resp.data)
        self.assertIn("movie", rate_resp.data)
        self.assertEqual(rate_resp.data["movie"]["ratings_count"], 1)
        self.assertEqual(str(rate_resp.data["movie"]["ratings_avg"]), "5.00")

        # update rating (same user)
        rate_resp2 = self.client.post(rate_url, {"rating": 4, "review": "Still good"}, format="json", **auth_header)
        self.assertEqual(rate_resp2.status_code, status.HTTP_200_OK)
        self.assertEqual(rate_resp2.data["movie"]["ratings_count"], 1)
        self.assertEqual(str(rate_resp2.data["movie"]["ratings_avg"]), "4.00")

    def test_list_movies_pagination_contract(self):
        # create several movies
        login = self.client.post(self.login_url, {"email": "alice@example.com", "password": "pass12345"}, format="json")
        token = login.data["access_token"]
        auth_header = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        for i in range(15):
            self.client.post(self.movies_url, {"title": f"M{i}", "genre": "Action", "release_year": 2000 + i}, format="json", **auth_header)

        list_resp = self.client.get(self.movies_url + "?page=1&limit=10&genre=Action&search=M", format="json")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertIn("items", list_resp.data)
        self.assertIn("page", list_resp.data)
        self.assertIn("limit", list_resp.data)
        self.assertIn("total", list_resp.data)
        self.assertEqual(list_resp.data["page"], 1)
        self.assertEqual(list_resp.data["limit"], 10)
        self.assertTrue(isinstance(list_resp.data["total"], int))
        self.assertLessEqual(len(list_resp.data["items"]), 10)
