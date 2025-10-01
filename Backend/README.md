# 🎬 Backend - Movie Ratings API

Built with Django + Django REST Framework.

---

## ⚙️ Setup

```bash
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
```
