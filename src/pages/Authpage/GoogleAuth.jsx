import { Flex, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/useAuthStore"; // Import your Zustand store

const GoogleAuth = ({ prefix }) => {
	const [error, setError] = useState(null);
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.loginUser); // Get the login action from Zustand store

	const handleGoogleAuth = async () => {
		try {
			// FullBackendd sends the user back to redirect_uri with ?token=<jwt>, which
			// consumeGoogleLoginToken() (utils/auth.js) picks up on page load. The site root is
			// used because it's the one path the static host always serves.
			const redirectUri = `${window.location.origin}/`;
			window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
		} catch (err) {
			setError(err.message);
			showToast("Error", err.message, "error");
		}
	};

	// Assuming after redirect, you handle the response from the backend and update Zustand store
	const handleLoginResponse = (userData) => {
		// Update Zustand state with the user information
		loginUser(userData);
		localStorage.setItem("user-info", JSON.stringify(userData)); // Optionally store user info in localStorage
	};

	return (
		<Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"} onClick={handleGoogleAuth}>
			<Image src='/google.png' w={5} alt='Google logo' />
			<Text mx='2' color={"blue.500"}>
				{prefix} with Google
			</Text>
		</Flex>
	);
};

export default GoogleAuth;
