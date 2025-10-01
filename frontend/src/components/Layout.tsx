import { Outlet, NavLink } from "react-router-dom";

export default function Layout() {
    return (
        <div className="min-h-screen flex bg-gray-100">
            <aside className="w-64 bg-white shadow-md p-6">
                <div className="text-2xl font-bold mb-6">🎬 Movie Rating</div>

                <nav className="flex flex-col gap-2">
                    <NavLink
                        to="/movies"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                        }
                    >
                        Movies
                    </NavLink>

                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                        }
                    >
                        Login
                    </NavLink>

                    <NavLink
                        to="/register"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                        }
                    >
                        Register
                    </NavLink>
                </nav>
            </aside>

            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
