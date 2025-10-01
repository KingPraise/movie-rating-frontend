import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMovie } from "../api/movies";

export default function AddMovie() {
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [releaseYear, setReleaseYear] = useState<number>(2025);
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createMovie(title, genre, releaseYear, description);
            navigate("/movies"); // go back to movies list
        } catch (err: any) {
            setError("Failed to create movie");
            console.error(err);
        }
    }

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow">
            <h1 className="text-2xl font-bold mb-4">Add a Movie</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="number"
                    placeholder="Release Year"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full border p-2 rounded"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Save
                </button>
            </form>
        </div>
    );
}
