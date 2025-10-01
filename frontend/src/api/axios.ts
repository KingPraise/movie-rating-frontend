// src/api/axios.ts

import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

// This is the interceptor
API.interceptors.request.use(
    (config) => {
        // 1. Get the auth tokens from localStorage
        const authTokens = localStorage.getItem('authTokens');

        if (authTokens) {
            // 2. Parse the tokens and get the access token
            const tokens = JSON.parse(authTokens);
            const accessToken = tokens.access;

            // 3. Set the Authorization header for the request
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // 4. Return the modified config so the request can proceed
        return config;
    },
    (error) => {
        // Handle request errors here
        return Promise.reject(error);
    }
);

export default API;