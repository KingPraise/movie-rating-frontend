🎬 Backend - Movie Ratings API

Built with Django + Django REST Framework.

⚙️ Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt


Apply migrations:

python manage.py migrate


Run server:

python manage.py runserver


Backend runs at: http://127.0.0.1:8000/api/

🔑 Environment Variables

Create .env in backend/:

SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3

💾 Persistence

Default (SQLite)

By default the app uses SQLite (db.sqlite3) for local development.

No extra setup needed, works out of the box.

Switching to PostgreSQL

Install Postgres locally or use a service (e.g. Supabase, RDS).

Install dependencies:

pip install psycopg2-binary


Update .env:

DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME


Re-run migrations:

python manage.py migrate


That’s it — everything else works the same.

This makes development simple with SQLite but production-ready with Postgres.

📡 API Endpoints

POST /api/auth/register/

POST /api/auth/login/

POST /api/movies/ (protected)

GET /api/movies/

GET /api/movies/{id}/

POST /api/movies/{id}/ratings/ (protected)

GET /api/movies/{id}/ratings/

DELETE /api/movies/{id}/

🧪 Running Tests
pytest


(or python manage.py test)

📂 Database Schema

User → default Django user

Movie → title, description, genre, year, ratings_avg, ratings_count

Rating → movie (FK), user (FK), stars (1–5), review, created_at
