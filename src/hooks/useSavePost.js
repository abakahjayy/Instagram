import { useState } from "react";
import API from "../utils/api";
import { getAuthToken } from "../utils/auth";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";

// Instagram's bookmark: toggles the post in the signed-in user's `saved` list
// (PATCH /api/v1/posts/:postId/save) and mirrors it on the store's user.
const useSavePost = (post) => {
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setAuthUser);
	const user = authUser?.user || authUser;
	const showToast = useShowToast();
	const [isUpdating, setIsUpdating] = useState(false);
	const isSaved = !!user?.saved?.some((id) => String(id) === String(post?._id));

	const toggleSave = async () => {
		if (isUpdating || !post?._id) return;
		setIsUpdating(true);
		try {
			const { data } = await API.patch(`/api/v1/posts/${post._id}/save`, null, {
				headers: { Authorization: `Bearer ${getAuthToken()}` },
			});
			setAuthUser({ ...user, saved: data.savedPosts });
			showToast(data.saved ? "Saved" : "Removed from saved", "", "success", 1500);
		} catch (error) {
			showToast("Error", error.response?.data?.error || error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	return { isSaved, toggleSave, isUpdating };
};

export default useSavePost;
