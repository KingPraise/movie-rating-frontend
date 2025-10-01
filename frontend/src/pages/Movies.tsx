import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { fetchMovies, MovieFilters } from "../api/movies";
import { Movie } from "../types";
import { Link } from "react-router-dom";

// Common movie genres
const GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
];

export default function Movies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filter state
    const [search, setSearch] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [minYear, setMinYear] = useState("");
    const [maxYear, setMaxYear] = useState("");

    // Temporary filter state (for form inputs before applying)
    const [tempSearch, setTempSearch] = useState("");
    const [tempGenre, setTempGenre] = useState("");
    const [tempMinYear, setTempMinYear] = useState("");
    const [tempMaxYear, setTempMaxYear] = useState("");

    useEffect(() => {
        loadMovies();
    }, [currentPage, search, selectedGenre, minYear, maxYear]);

    async function loadMovies() {
        try {
            setLoading(true);
            setError(null);

            const filters: MovieFilters = {
                page: currentPage,
                limit: 12
            };

            if (search) filters.search = search;
            if (selectedGenre) filters.genre = selectedGenre;
            if (minYear) filters.min_year = Number(minYear);
            if (maxYear) filters.max_year = Number(maxYear);

            const data = await fetchMovies(filters);

            setMovies(data.items || data || []);
            setTotal(data.total || 0);
            setTotalPages(data.pages || 1);
        } catch (err) {
            console.error("Movies fetch error:", err);
            setError("Failed to load movies");
        } finally {
            setLoading(false);
        }
    }

    function handleApplyFilters(e: React.FormEvent) {
        e.preventDefault();

        // Apply filters and reset to page 1
        setSearch(tempSearch);
        setSelectedGenre(tempGenre);
        setMinYear(tempMinYear);
        setMaxYear(tempMaxYear);
        setCurrentPage(1);
    }

    function handleClearFilters() {
        setTempSearch("");
        setTempGenre("");
        setTempMinYear("");
        setTempMaxYear("");

        setSearch("");
        setSelectedGenre("");
        setMinYear("");
        setMaxYear("");
        setCurrentPage(1);
    }

    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (loading && movies.length === 0) {
        return <p className="text-center py-8">Loading movies...</p>;
    }

    return (
        <div>
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Movies</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {total} movie{total !== 1 ? 's' : ''} found
                    </p>
                </div>
                <Link
                    to="/movies/add"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Add Movie
                </Link>
            </header>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">Filters & Search</h2>
                <form onSubmit={handleApplyFilters} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Genre */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Genre</label>
                            <select
                                value={tempGenre}
                                onChange={(e) => setTempGenre(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                <option value="">All Genres</option>
                                {GENRES.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Year */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Min Year</label>
                            <input
                                type="number"
                                placeholder="e.g. 1990"
                                value={tempMinYear}
                                onChange={(e) => setTempMinYear(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm"
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                        </div>

                        {/* Max Year */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Year</label>
                            <input
                                type="number"
                                placeholder="e.g. 2024"
                                value={tempMaxYear}
                                onChange={(e) => setTempMaxYear(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm"
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                        >
                            Apply Filters
                        </button>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
                        >
                            Clear All
                        </button>
                    </div>
                </form>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading movies...</p>
                </div>
            )}

            {/* Movies Grid */}
            {!loading && movies.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No movies found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                </div>
            ) : (
                <>
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    const showPage =
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);

                                    if (!showPage) {
                                        // Show ellipsis
                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                            return (
                                                <span key={page} className="px-2 py-2">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-4 py-2 border rounded ${currentPage === page
                                                    ? "bg-indigo-600 text-white"
                                                    : "hover:bg-gray-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Page Info */}
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Page {currentPage} of {totalPages}
                    </p>
                </>
            )}
        </div>
    );
}