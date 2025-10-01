import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchMovieDetails, fetchMovieRatings, rateMovie, deleteMovie } from "../api/movies";

interface MovieDetail {
    id: number;
    title: string;
    genre: string;
    release_year: number;
    description?: string;
    ratings_avg: number;
    ratings_count: number;
    created_by?: number;
}

interface Rating {
    id: number;
    rating: number;
    review?: string;
    user: {
        id: number;
        username: string;
    };
    created_at: string;
}



export default function MovieDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rating form state
    const [userRating, setUserRating] = useState<number>(5);
    const [userReview, setUserReview] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadMovieData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadMovieData() {
        if (!id) return;

        try {
            setLoading(true);
            const [movieData, ratingsData] = await Promise.all([
                fetchMovieDetails(Number(id)),
                fetchMovieRatings(Number(id))
            ]);

            setMovie(movieData);
            setRatings(ratingsData.items || ratingsData || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load movie details");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitRating(e: React.FormEvent) {
        e.preventDefault();
        if (!id) return;

        try {
            setSubmitting(true);
            await rateMovie(Number(id), userRating, userReview);
            setUserReview("");
            setUserRating(5);
            // Reload movie data to get updated ratings
            await loadMovieData();
        } catch (err) {
            console.error(err);
            alert("Failed to submit rating. Make sure you're logged in.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteMovie() {
        if (!id || !movie) return;

        const confirmed = window.confirm(`Are you sure you want to delete "${movie.title}"?`);
        if (!confirmed) return;

        try {
            await deleteMovie(Number(id));
            navigate("/movies");
        } catch (err) {
            console.error(err);
            alert("Failed to delete movie. You may not have permission.");
        }
    }

    if (loading) return <p className="text-center py-8">Loading movie details...</p>;
    if (error || !movie) return <p className="text-red-500 text-center py-8">{error || "Movie not found"}</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/movies" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
                ← Back to movies
            </Link>

            {/* Movie Info */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                                {movie.genre}
                            </span>
                            <span>{movie.release_year}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleDeleteMovie}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                    >
                        Delete Movie
                    </button>
                </div>

                {movie.description && (
                    <p className="text-gray-700 mb-4">{movie.description}</p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-500">
                            {movie.ratings_avg ? Number(movie.ratings_avg).toFixed(1) : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-700">
                            {movie.ratings_count || 0}
                        </div>
                        <div className="text-xs text-gray-500">Total Ratings</div>
                    </div>
                </div>
            </div>

            {/* Add Rating Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">Rate This Movie</h2>
                <form onSubmit={handleSubmitRating} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Your Rating: {userRating}/5
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={userRating}
                            onChange={(e) => setUserRating(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 - Poor</span>
                            <span>5 - Excellent</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={userReview}
                            onChange={(e) => setUserReview(e.target.value)}
                            placeholder="Share your thoughts about this movie..."
                            className="w-full border rounded p-3 h-24 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {submitting ? "Submitting..." : "Submit Rating"}
                    </button>
                </form>
            </div>

            {/* Ratings List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">
                    User Reviews ({ratings.length})
                </h2>

                {ratings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No reviews yet. Be the first to rate this movie!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {ratings.map((rating) => (
                            <div key={rating.id} className="border-b pb-4 last:border-b-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="font-semibold">
                                            {rating.user?.username || "Anonymous"}
                                        </span>
                                        <span className="text-yellow-500 ml-3">
                                            {"★".repeat(rating.rating)}
                                            {"☆".repeat(5 - rating.rating)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(rating.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {rating.review && (
                                    <p className="text-gray-700 text-sm">{rating.review}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}