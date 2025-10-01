import API from "./axios";

export async function fetchMovies() {
    const res = await API.get("/movies/");
    return res.data; // axios already parses JSON for you
}

export async function fetchMovieDetails(id: number) {
    const response = await API.get(`/movies/${id}/`);
    return response.data;
}

export async function createMovie(title: string, genre: string, release_year: number, description?: string) {
    const response = await API.post("/movies/", { title, genre, release_year, description });
    return response.data;
}

export async function rateMovie(movieId: number, rating: number, review?: string) {
    const response = await API.post(`/movies/${movieId}/ratings/`, { rating, review });
    return response.data;
}
