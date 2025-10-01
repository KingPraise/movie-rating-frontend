import axios from "axios";

const API = axios.create({
    baseURL: "https://05fc0a08fb42.ngrok-free.app/api", // backend URL
});

// Automatically attach JWT token 
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // store JWT in localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
