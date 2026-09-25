import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";
import useProfileStore from "../store/userProfileStore";
import API from "../utils/api";

// Saves Edit profile through the logged-in routes: the backend updates the account
// in the login token (PATCH /instagram/me, /instagram/me/photo), never one named in the URL.
const useEditProfile = () => {
	const [isUpdating, setIsUpdating] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setAuthUser);
	const { userProfile, setUserProfile } = useProfileStore();
	const showToast = useShowToast();

	// Signature kept for EditProfile.jsx: (inputs, selectedFile, formDatas, username, token)
	const editProfile = async (inputs, selectedFile, formDatas) => {
		const current = authUser?.user || authUser;
		if (isUpdating || !current) return;
		setIsUpdating(true);
		try {
			let user = current;
			const file = selectedFile && formDatas?.get("profile_pictures");
			if (file) {
				const photo = new FormData();
				photo.append("photo", file);
				user = (await API.patch("/api/v1/instagram/me/photo", photo)).data.user;
			}

			const changes = {};
			for (const key of ["firstName", "lastName", "username", "bio"]) {
				const value = inputs[key]?.trim();
				if (value && value !== current[key]) changes[key] = value;
			}
			if (Object.keys(changes).length) user = (await API.patch("/api/v1/instagram/me", changes)).data.user;

			setAuthUser({ ...current, ...user });
			try {
				const stored = JSON.parse(localStorage.getItem("user-info")) || {};
				localStorage.setItem("user-info", JSON.stringify({ ...stored, user: { ...current, ...user } }));
			} catch {
				/* storage unavailable */
			}
			showToast("Profile updated", "", "success", 2000);

			if (changes.username) {
				window.location.assign(`/${changes.username}`); // the profile address changed
			} else if (userProfile?.user?._id === current._id) {
				setUserProfile({ ...userProfile, user: { ...userProfile.user, ...user } });
			}
		} catch (error) {
			showToast("Couldn't update profile", error.response?.data?.error || error.message, "error");
			throw error;
		} finally {
			setIsUpdating(false);
		}
	};

	return { editProfile, isUpdating };
};

export default useEditProfile;
