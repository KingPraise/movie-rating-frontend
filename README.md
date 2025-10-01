# 🎬 Movie Ratings App

A full-stack movie rating application built with Django REST Framework (backend) and React + Vite (frontend).

---

## 🚀 Setup & Run Instructions

### Backend
See [backend/README.md](backend/README.md)

### Frontend
See [frontend/README.md](frontend/README.md)

---

## 🔑 Sample Credentials
You can log in with:

- Email: `testuser@test.com`  
- Password: `password123`

Or register a new account at `/register`.

---

## 🏗️ Design Decisions

1. **Auth with JWT (SimpleJWT)**  
   - Access + refresh tokens.  
   - Tokens stored in `localStorage`.  
   - Axios interceptor auto-attaches Authorization header.

2. **Database schema**  
   - `User` (auth)  
   - `Movie` (title, description, genre, year, ratings_avg, ratings_count)  
   - `Rating` (movie_id, user_id, stars 1–5, review, created_at)  
   - `ratings_avg` + `ratings_count` stored on `Movie` for faster queries.

3. **Libraries & why**  
   - **DRF** → rapid API development with JWT.  
   - **React + Vite + Tailwind** → fast builds, modern UI.  
   - **React Router** → routing.  
   - **React Testing Library** → frontend testing.  

4. **Scalability considerations**  
   - Backend filters + pagination (`?genre=`, `?min_year=`, `?search=`, `?page=`, `?limit=`).  
   - DB easily scalable to PostgreSQL.  
   - JWT allows stateless scaling across servers.  
   - Decoupled backend/frontend → independent deploys.  

---

## ✅ Completed Features
- Register/Login (JWT)
- Add/List/Delete movies
- Rate movies (stars + review)
- Movie details with ratings
- Search + filters (genre, year, text)
- Pagination

---

## 🧪 Running Tests

- Backend → `pytest`  
- Frontend → `npm test`
