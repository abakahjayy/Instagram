import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";
import API from "../utils/api";
const useLikePost = (post) => {
	const [isUpdating, setIsUpdating] = useState(false);

	const authUser = useAuthStore((state) => state.user);

	const [likes, setLikes] = useState(post?.likes.length);
	const [isLiked, setIsLiked] = useState(post?.likes.includes(authUser?._id));

	const showToast = useShowToast();

	const handleLikePost = async () => {
		if (isUpdating) return;
		if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");
		setIsUpdating(true);

		try {
			if(!isLiked){
				// logged-in route: the backend takes who's liking from the token
				const response =await API.patch(`/api/v1/instagram/posts/${post?._id}/like`)
				const dta = response.data
				// console.log(dta)
			}else {
				const response =await API.patch(`/api/v1/instagram/posts/${post?._id}/unlike`)
				const dta = response.data
				// console.log(dta)
			}
			setIsLiked(!isLiked);

			isLiked ? setLikes(likes - 1) : setLikes(likes + 1);
		} catch (error) {
			const message = error.response?.data?.error || error.message
			showToast("Error", message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	return { isLiked, likes, handleLikePost, isUpdating };
};

export default useLikePost;
