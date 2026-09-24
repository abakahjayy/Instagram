import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import useProfileStore from "../store/userProfileStore";
import useShowToast from "./useShowToast";
import API from "../utils/api";
const useFollowUser = (userId) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setAuthUser);
	const { userProfile, setUserProfile } = useProfileStore();
	const showToast = useShowToast();
    const user=authUser.user?authUser.user:authUser
    // authUser._id&&console.log(authUser?._id)
    // console.log(userId)
    
	const handleFollowUser = async () => {
        setIsUpdating(true);
		try {
            
            // console.log(authUser)
            // console.log('userId:',userId)
            if (isFollowing) {
                // unfollow
                const datas=await API.patch(`/api/v1/users/${user._id}/unfollow`,{userId})
                const frs=await datas.data
                console.log(frs)
                if(frs.error){
                    throw new Error(fr.error)
                }
                // console.log(frs)
				setAuthUser({
                    ...user,
					following: user.following.filter((uid) => uid !== userId),
				});
				if (userProfile)
					setUserProfile({
                        ...userProfile,
                        user: frs.following//userProfile.followers.filter((uid) => uid !== authUser.uid),
                    });
                setIsFollowing(false);

            } else {
                // follow
                const data=await API.patch(`/api/v1/users/${user._id}/follow`,{userId})
                const fr=await data.data
                if(fr.error){
                    throw new Error(fr.error)
                }
                setAuthUser({
                    ...authUser,
                    following: [...user.following, userId],
                });
                if (userProfile)
                    setUserProfile({
                        ...userProfile,
                        user: fr.following//followers: [...userProfile.followers, authUser.uid],
                    });
                setIsFollowing(true);
			}
		} catch (error) {
			const message = error.response?.data?.error || error.message
            console.log(error)
			showToast("Error", message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	useEffect(() => {
		if (authUser) {
			const isFollowing =user.following? user.following.includes(userId):authUser.user.following.includes(userId);
			setIsFollowing(isFollowing);
            // console.log(userProfile)
            // console.log(authUser)
		}
	}, [authUser, userId]);

	return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
