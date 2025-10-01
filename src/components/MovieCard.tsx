import { Link } from "react-router-dom";

type Props = {
    id: number;
    title: string;
    genre: string;
    releaseYear: number;
    avgRating: number;
    ratingsCount: number;
};

export default function MovieCard({ id, title, genre, releaseYear, avgRating, ratingsCount }: Props) {
    return (
        <div className="rounded-2xl shadow-md p-6 bg-white">
            <Link to={`/movies/${id}`}>
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
            </Link>
            <p className="text-sm text-gray-500 mb-3">
                {genre} • {releaseYear}
            </p>

            <div className="flex items-center">
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                        const s = i + 1;
                        return (
                            <span key={s} className={`text-amber-400 text-xl ${s <= Math.round(avgRating) ? "" : "text-gray-300"}`}>
                                ★
                            </span>
                        );
                    })}
                </div>
                <span className="ml-3 text-sm text-gray-600">({ratingsCount})</span>
            </div>
        </div>
    );
}
