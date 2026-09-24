import useAuthStore from "../store/useAuthStore";
import API from "../utils/api";
import { closeSocket } from "../utils/socket";
import useShowToast from "./useShowToast"; // Custom toast hook (if you have one)

const useLogout = () => {
    const showToast = useShowToast(); // Show toast notifications
    const logoutUser = useAuthStore((state) => state.logoutUser); // Zustand store action for login
    const setError = useAuthStore((state) => state.setError); // Zustand action to handle errors
    const setLoading = useAuthStore((state) => state.setLoading); // Zustand action to manage loading state
    const isLoading = useAuthStore((state) => state.isLoading); // Zustand loading state
    const error = useAuthStore((state) => state.error); // Zustand error state

    const setAuthUser= useAuthStore((state)=> state.setAuthUser)

    const logout = async (userId) => {
        
        if (!userId) {
            return showToast("Error", "You are not authorized to logout this user", "error");
        }
        setLoading(true); // Set loading state to true
        try {
            // Send login request to the backend
            const response = await API.post(`/api/v1/auth/logout?userId=${userId}`);

            const userData = response.data;
            console.log(userData)

            // Save user info to Zustand and local storage
            closeSocket(); // the socket is authenticated as this user
            logoutUser(); // Update Zustand state
            setAuthUser(null);
            setError(null)
            const message = response?.data?.message || "Logout successful";
            showToast("Success", message, "success");
        } catch (err) {
            const message = err.response?.data?.error || "Logout failed";
            setError(message); // Update Zustand error state
            showToast("Error", message, "error");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return { logout, isLoading, error };
};

export default useLogout;
