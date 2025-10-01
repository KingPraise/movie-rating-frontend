import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../api/movies";
import { Movie } from "../types";
import { Link } from "react-router-dom";


export default function Movies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function loadMovies() {
            try {
                const data = await fetchMovies();
                console.log("Movies API raw data:", data); // 👀 log the shape
                setMovies(data.items || []);  // if items doesn't exist, this will stay []
            } catch (err) {
                console.error("Movies fetch error:", err);
                setError("Failed to load movies");
            } finally {
                setLoading(false);
            }
        }
        loadMovies();
    }, []);


    if (loading) return <p>Loading movies...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>

            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Movies</h1>
                    <p className="text-sm text-gray-500 mt-1">Browse and rate movies.</p>
                </div>
                <Link
                    to="/movies/add"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Add Movie
                </Link>
            </header>   

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((m) => (
                    <MovieCard
                        key={m.id}
                        id={m.id}
                        title={m.title}
                        genre={m.genre}
                        releaseYear={m.release_year}
                        avgRating={Number(m.ratings_avg) || 0}
                        ratingsCount={m.ratings_count ?? 0}
                    />
                ))}
            </section>
        </div>
    );
}
