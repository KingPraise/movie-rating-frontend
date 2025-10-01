import { useParams, Link } from "react-router-dom";

export default function MovieDetails() {
    const { id } = useParams<{ id: string }>();

    // For now use mock data or fetch later.
    return (
        <div>
            <Link to="/movies" className="text-sm text-indigo-600 underline mb-4 inline-block">
                ← Back to movies
            </Link>

            <h2 className="text-2xl font-bold mb-2">Movie #{id} Details</h2>
            <p className="text-gray-600 mb-4">This page will show the movie description, average rating, reviews and a rating form.</p>

            <div className="bg-white p-6 rounded shadow">
                <p className="text-sm text-gray-500">(Movie details + rating UI goes here)</p>
            </div>
        </div>
    );
}
