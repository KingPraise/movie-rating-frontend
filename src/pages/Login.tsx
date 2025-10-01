import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { AxiosError } from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password);
            navigate("/movies"); // redirect after login
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            setError(axiosError.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow space-y-4"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <label className="block text-sm">Email</label>
                    <input
                        className="w-full mt-1 p-2 border rounded"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm">Password</label>
                    <input
                        className="w-full mt-1 p-2 border rounded"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                        } text-white px-4 py-2 rounded`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
