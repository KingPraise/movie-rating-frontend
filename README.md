# 🎬 Movie Ratings App

A full-stack movie rating application with **Django REST Framework (DRF)** backend and **React + Vite + Tailwind** frontend.  
Users can register/login, browse movies, filter/search, add movies, rate movies, and view ratings with pagination.

---

## 🚀 Tech Stack
- **Backend:** Python 3, Django, Django REST Framework, SimpleJWT
- **Frontend:** React, Vite, TypeScript, TailwindCSS, React Router
- **Auth:** JWT (access + refresh tokens)
- **Database:** SQLite (for development)

---

## ⚙️ Setup Instructions

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # (on Windows: venv\Scripts\activate)
pip install -r requirements.txt


Run migrations and start server:

python manage.py migrate
python manage.py runserver


Backend will run on http://127.0.0.1:8000.

2. Frontend (React + Vite)
cd frontend
npm install


Create .env file in frontend with API base URL:

VITE_API_BASE_URL=http://127.0.0.1:8000/api


Run dev server:

npm run dev


Frontend runs on http://localhost:5173.

🔑 Authentication

Register: POST /api/auth/register/

Login: POST /api/auth/login/ → returns JWT tokens

Token is stored in localStorage and attached to all authenticated requests.

📡 API Endpoints (Core)

POST /api/auth/register/ – user signup

POST /api/auth/login/ – obtain JWT token

GET /api/movies/ – list movies (supports ?search=, ?genre=, ?min_year=, ?max_year=, ?page=, ?limit=)

POST /api/movies/ – add movie (auth required)

GET /api/movies/{id}/ – movie details

DELETE /api/movies/{id}/ – delete movie (auth required)

POST /api/movies/{id}/ratings/ – add rating (auth required)

GET /api/movies/{id}/ratings/ – list ratings

GET /api/users/{id}/ratings/ – list all ratings by a user

🏗️ Design Decisions

JWT in localStorage

Chosen for simplicity. Secure enough for this context.

Axios interceptor attaches token automatically.

Denormalized ratings

Each Movie has ratings_avg and ratings_count.

Keeps movie list performant without extra queries.

Pagination & filters

Backend accepts query params for pagination & filtering.

Frontend UI supports genre, year range, search text, with pagination controls.

Frontend structure

src/api/ → Axios wrappers for API calls

src/pages/ → Route-level components (Movies, MovieDetail, AddMovie)

src/components/ → Reusable UI parts (MovieCard, RatingStars)

Protected routes (like Add Movie) check JWT token.

Scalability

Clear separation of concerns → easy to swap backend/frontend.

DRF can scale to PostgreSQL easily.

React pages can evolve into more features (user profile, ratings history).

✅ Completed Features

User registration & login

Add / list / delete movies

Rate movies (1–5 stars + review)

Search & filter movies (genre, year range, text search)

Pagination controls

Movie details page with ratings

🔜 Roadmap

User ratings page (/users/:id/ratings)

Component tests with React Testing Library

CI setup (GitHub Actions)
