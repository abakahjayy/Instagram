import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL

const API = axios.create({
    baseURL: apiUrl,
    // withCredentials: true,
});

// Every request carries the login token, so the backend acts as the signed-in user
// (the /api/v1/instagram routes ignore any user id sent in the body). Reads
// localStorage directly rather than importing utils/auth, which imports this file.
API.interceptors.request.use((config) => {
    let token = null;
    try {
        token = JSON.parse(localStorage.getItem("user-info"))?.token;
    } catch {
        /* no stored login */
    }
    if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default API;
