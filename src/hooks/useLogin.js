import useAuthStore from "../store/useAuthStore";
import API from "../utils/api";
import useShowToast from "./useShowToast"; // Custom toast hook (if you have one)

const useLogin = () => {
    const showToast = useShowToast(); // Show toast notifications
    const loginUser = useAuthStore((state) => state.loginUser); // Zustand store action for login
    const setError = useAuthStore((state) => state.setError); // Zustand action to handle errors
    const setLoading = useAuthStore((state) => state.setLoading); // Zustand action to manage loading state
    const isLoading = useAuthStore((state) => state.isLoading); // Zustand loading state
    const error = useAuthStore((state) => state.error); // Zustand error state

    const login = async (email,password) => {
        if (!email || !password) {
            return showToast("Error", "Please fill all the fields", "error");
        }
        setLoading(true); // Set loading state to true
        try {
            // Send login request to the backend
            const response = await API.post("/api/v1/auth/login", {
                email,
                password,
            });

            // Save user info to Zustand and local storage
            const userData = response.data;
            localStorage.setItem("user-info", JSON.stringify(userData));
            loginUser(userData); // Update Zustand state
            setError(null)

            showToast("Success", "Login successful", "success");
        } catch (err) {
            const message = err.response?.data?.error || "Login failed";
            setError(message); // Update Zustand error state
            showToast("Error", message, "error");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return { login, isLoading, error };
};

export default useLogin;
