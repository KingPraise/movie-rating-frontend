// Run with: node test_api.js
// Make sure to install fetch polyfill first: npm install node-fetch

const API_BASE = "http://localhost:8000/api";

async function main() {
  try {
    // 1. Register a user
    console.log("=== Register ===");
    let response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "qudus",
        email: "qudus@example.com",
        password: "password123",
      }),
    });
    let registerData = await response.json();
    console.log("Register:", response.status, registerData);

    // 2. Login
    console.log("\n=== Login ===");
    response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "qudus@example.com",
        password: "password123",
      }),
    });
    let loginData = await response.json();
    console.log("Login:", response.status, loginData);

    const token = loginData.access || loginData.access_token; // depending on JWT lib
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 3. Create a movie (protected)
    // console.log("\n=== Create Movie ===");
    // response = await fetch(`${API_BASE}/movies/`, {
    //   method: "POST",
    //   headers: authHeaders,
    //   body: JSON.stringify({
    //     title: "Avenger's - END GAME",
    //     genre: "Action",
    //     release_year: 1986,
    //     description: "Classic fighter jet movie",
    //   }),
    // });
    // let movieData = await response.json();
    // console.log("Create Movie:", response.status, movieData);

    const movieId = 4;

    // 4. List movies
    console.log("\n=== List Movies ===");
    response = await fetch(`${API_BASE}/movies/?page=1&limit=10&genre=Action&search=Gun`);
    let moviesList = await response.json();
    console.log("List Movies:", response.status, moviesList);

    // 5. Get single movie
    console.log("\n=== Get Movie Details ===");
    response = await fetch(`${API_BASE}/movies/${movieId}/`);
    let singleMovie = await response.json();
    console.log("Get Movie:", response.status, singleMovie);

    // 6. Rate a movie (protected)
    console.log("\n=== Rate Movie ===");
    response = await fetch(`${API_BASE}/movies/${movieId}/ratings`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        rating: 5,
        review: "Classic!",
      }),
    });
    let ratingData = await response.json();
    console.log("Rate Movie:", response.status, ratingData);

    // 7. List ratings for a movie
    console.log("\n=== List Movie Ratings ===");
    response = await fetch(`${API_BASE}/movies/${movieId}/ratings`);
    let ratingsList = await response.json();
    console.log("Movie Ratings:", response.status, ratingsList);

    // 8. List ratings by user
    console.log("\n=== List User Ratings ===");
    const userId = registerData.id;
    response = await fetch(`${API_BASE}/users/${userId}/ratings`);
    let userRatings = await response.json();
    console.log("User Ratings:", response.status, userRatings);

    // 9. Delete movie (protected)
    // console.log("\n=== Delete Movie ===");
    // response = await fetch(`${API_BASE}/movies/${movieId}`, {
    //   method: "DELETE",
    //   headers: authHeaders,
    // });
    // console.log("Delete Movie:", response.status);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
