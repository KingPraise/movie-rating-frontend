import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate("/login"); // go to login after successful registration
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed");
        }
    }

    return (
        <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow space-y-4"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <label className="block text-sm">Username</label>
                    <input
                        className="w-full mt-1 p-2 border rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

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
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    Register
                </button>
            </form>
        </div>
    );
}
