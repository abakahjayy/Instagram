import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";
import useProfileStore from "../store/userProfileStore";
import {useUpdatePic} from '../utils/uploadImage'
import API from "../utils/api";
import axios from "axios";
// import { token } from "morgan";

const useEditProfile = () => {
	const [isUpdating, setIsUpdating] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser= useAuthStore((state)=>state.setAuthUser)
	const setUserProfile = useProfileStore((state) => state.setUserProfile);
	const showToast = useShowToast();
    const apiUrl = import.meta.env.VITE_API_URL
    // console.log(authUser)
	const editProfile = async (inputs, selectedFile,formDatas,username,tokens) => {
        // console.log(formDatas.get('profile_pictures'))
		if (isUpdating || !authUser) return;
		setIsUpdating(true);
        showToast("Updating",'', "loading");
        let pictureId = "";
		try {
			if (selectedFile) {
                // Upload the image
                const data=await fetch(`${apiUrl}/api/v1/userse/${username}/editUserProfile`,{
                    method: 'PATCH',
                    body: formDatas,
                })
                const fr=await data.json()
                pictureId=fr.user.profile_picture_id
			}
            // console.log(pictureId)

			const updatedUser = {
				...authUser,
				firstName: inputs.firstName || authUser.firstName,
				lastName: inputs.lastName || authUser.lastName,
				username: inputs.username || authUser.username,
				usernames: inputs.username || authUser.username,
				bio: inputs.bio || authUser.bio,
				profile_picture_id: pictureId || authUser.profile_picture_id,
                token:tokens,
			};

            const data=await API.patch(`/api/v1/users/${username}/editUser`,{
                updatedUser,
            })
            const fr=await data.data
            console.log(fr)

            if(fr.error){
                throw new Error(fr.error);
            }
			// localStorage.setItem("user-info", JSON.stringify({user:fr.user,token:tokens}));
			// localStorage.removeItem("user-info");
			fr.user&&setAuthUser(updatedUser);
            // console.log(authUser)
			setUserProfile(fr.user);
            setTimeout(()=>{
                showToast("Success", "Profile updated successfully", "success");
            },3500)
            fr.user&&window.location.reload();
            setIsUpdating(false);
		} catch (error) {
            const message = error.response?.data?.error || error.message
            setTimeout(()=>{
                showToast("Error", message, "error");
            },3500)
            setIsUpdating(false);
		}
	};

	return { editProfile, isUpdating };
};

export default useEditProfile;
