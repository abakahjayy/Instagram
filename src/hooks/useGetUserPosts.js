import { useEffect, useState } from "react";
import usePostStore from "../store/usePostStore";
import useShowToast from "./useShowToast";
import useProfileStore from "../store/userProfileStore";
import API from "../utils/api";

const useGetUserPosts = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { posts, setPosts } = usePostStore();
	const showToast = useShowToast();
	const userProfile = useProfileStore((state) => state.userProfile);

	useEffect(() => {
        const controller = new AbortController();
		const getPosts = async () => {
			if (!userProfile) return;
			setIsLoading(true);
			setPosts([]);
			try {
				const response =await API.get(`/api/v1/posts/user/${userProfile.user._id}`,{
                    signal: controller.signal,
                })
                let posts = response.data.posts
                // console.log(posts)
				setPosts(posts);
			} catch (error) {
				const message = error.response?.data?.error || error.message
				if(error.message==='canceled')return
                showToast("Error", message, "error");
				setPosts([]);
			} finally {
				setIsLoading(false);
			}
		};
		getPosts();
        return ()=>{//This is a cleanup function
            controller.abort();
        }
	}, [userProfile]);

	return { isLoading, posts };
};

export default useGetUserPosts;
