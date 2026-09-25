import API from "./api.js";
import useAuthStore from "../store/useAuthStore.js";

export const loginUser = async (email, password) => {
    const { data } = await API.post("/api/v1/auth/login", { email, password });
    console.log(data);
    return data;
};

export const registerUser = async (email, password,firstName,lastName,username) => {
    const { data } = await API.post("/api/v1/auth/signup", { email, password,firstName,lastName,username });
    console.log(data);
    return data;
};

// Google sign-in (see GoogleAuth.jsx) lands back on the site with ?token=<jwt>.
// Store it the same way a password login does, then strip it from the URL.
// Must run before the app renders so App.jsx's dashboard fetch sees the token.
export const consumeGoogleLoginToken = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;
    params.delete("token");
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
    localStorage.setItem("user-info", JSON.stringify({ token }));
    useAuthStore.getState().loginUser({ token });
    // Google sign-in: welcome email for a brand-new account, else new-device alert
    import("./authEvents").then(({ reportAuthEvent }) => reportAuthEvent("login"));
};

// localStorage "user-info" is { message, token, userId } right after login and
// { user, token } once App.jsx has loaded the dashboard - the token is there in both.
export const getAuthToken = () => {
    try {
        return JSON.parse(localStorage.getItem("user-info"))?.token || null;
    } catch {
        return null;
    }
};

// The store's user can be wrapped ({ user, token }), bare, or the login response ({ userId }).
export const getAuthUserId = (authUser) => {
    const user = authUser?.user || authUser;
    return user?._id || user?.userId || null;
};

export const logoutUser = async (userId) => {
    await API.post(`/api/v1/auth/logout?userId=${userId}`);
};
