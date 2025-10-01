import API from "./axios";

export async function login(email: string, password: string) {
    const response = await API.post("/auth/login/", { email, password });
    const { access_token } = response.data;

    // Save token to localStorage
    localStorage.setItem("token", access_token);

    return response.data;
}

export async function register(username: string, email: string, password: string) {
    const response = await API.post("/auth/register/", { username, email, password });
    return response.data;
}

export function logout() {
    localStorage.removeItem("token");
}
