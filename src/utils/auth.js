import API from "./api.js";

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
