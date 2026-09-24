import useAuthStore from "../store/useAuthStore";
import API from "../utils/api";
import useShowToast from "./useShowToast";

const useSignup = () => {
    const showToast = useShowToast(); // Toast notifications
    const registerUser = useAuthStore((state) => state.registerUser); // Zustand action to store user
    const setError = useAuthStore((state) => state.setError); // Zustand action to handle errors
    const setLoading = useAuthStore((state) => state.setLoading); // Zustand action to manage loading state
    const isLoading = useAuthStore((state) => state.isLoading); // Zustand loading state
    const error = useAuthStore((state) => state.error); // Zustand error state

    const signup = async (email, password,firstName,lastName,username) => {
        if (!email || !password || !firstName || !lastName || !username) {
            return showToast("Error", "Please fill all the fields", "error");
        }

        setLoading(true); // Set loading state to true
        try {
            // Send signup request to the backend
            const response = await API.post("/api/v1/auth/signup", {
                email,
                password,
                firstName,
                lastName,
                username,
            });

            // Save user info to Zustand and local storage
            const userData = response.data;
            localStorage.setItem("user-info", JSON.stringify(userData));
            registerUser(userData); // Update Zustand state
            setError(null)
            showToast("Success", "Signup successful", "success");
        } catch (err) {
            const message = err.response?.data?.error || "Signup failed";
            setError(message); // Update Zustand error state
            showToast("Error", message, "error");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return { signup, isLoading, error };
};

export default useSignup;
