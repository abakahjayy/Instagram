import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/useAuthStore";
import usePostStore from "../store/usePostStore";
import API from "../utils/api";
import useProfileStore from "../store/userProfileStore";

const usePostComment = () => {
	const [isCommenting, setIsCommenting] = useState(false);
	const showToast = useShowToast();
	const authUser = useAuthStore((state) => state.user);
	const addPost = useProfileStore((state) => state.addPost);
	const setUserProfile = useProfileStore((state) => state.setUserProfile);
	const userProfile = useProfileStore((state) => state.userProfile);
	const addComment = usePostStore((state) => state.addComment);
	const {posts} = usePostStore();
    // console.log(userProfile)
	const handlePostComment = async (postId, comment) => {
		if (isCommenting) return;
		if (!authUser) return showToast("Error", "You must be logged in to comment", "error");
		setIsCommenting(true);
		const newComment = {
			comment,
			createdAt: Date.now(),
			createdBy: authUser._id,
			postId,
		};

		try {
			const response =await API.post(`/api/v1/comments/${postId}`,{
                text:comment,
                userId: authUser._id,
            })
            const comments = response.data
            // console.log(comments?.newComment?._id)
			addComment(postId, comments?.newComment);
            // console.log(posts)
            // addPost(authUser)
		} catch (error) {
			const message = error.response?.data?.error || error.message
			showToast("Error", message, "error");
		} finally {
			setIsCommenting(false);
		}
	};

	return { isCommenting, handlePostComment };
};

export default usePostComment;
