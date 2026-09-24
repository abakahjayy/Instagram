import { create } from "zustand";

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem("user-info")), 
    isLoading: false,
    error: null,

    // Login action
    loginUser: (user) => set({ user }),

    // Logout action
    logoutUser: () => {
        localStorage.removeItem("user-info"); // Clear local storage
        set({ user: null });
    },

    // Register action
    registerUser: (user) => set({ user }),

    // Set loading state
    setLoading: (loading) => set({ isLoading: loading }),

    // Set error state
    setError: (error) => set({ error }),

    setAuthUser: (user) => set({ user }),
}));

export default useAuthStore;
