import API from "./axios";

// Filter parameters interface
export interface MovieFilters {
    genre?: string;
    min_year?: number;
    max_year?: number;
    search?: string;
    page?: number;
    limit?: number;
}

export async function fetchMovies(filters?: MovieFilters) {
    const res = await API.get("/movies/", {
        params: filters
    });
    return res.data;
}

export async function fetchMovieDetails(id: number) {
    const response = await API.get(`/movies/${id}/`);
    return response.data;
}

export async function createMovie(title: string, genre: string, release_year: number, description?: string) {
    const response = await API.post("/movies/", { title, genre, release_year, description });
    return response.data;
}

export async function deleteMovie(id: number) {
    const response = await API.delete(`/movies/${id}/`);
    return response.data;
}

// Rating functions
export async function rateMovie(movieId: number, rating: number, review?: string) {
    const response = await API.post(`/movies/${movieId}/ratings/`, { rating, review });
    return response.data;
}

export async function fetchMovieRatings(movieId: number, page: number = 1, limit: number = 10) {
    const response = await API.get(`/movies/${movieId}/ratings/`, {
        params: { page, limit }
    });
    return response.data;
}

export async function fetchUserRatings(userId: number, page: number = 1, limit: number = 10) {
    const response = await API.get(`/users/${userId}/ratings/`, {
        params: { page, limit }
    });
    return response.data;
}