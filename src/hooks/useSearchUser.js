import { useState } from 'react'
import useShowToast from './useShowToast';
import API from '../utils/api';

export const useSearchUser=()=> {

    const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState(null);
	const showToast = useShowToast();
	const getUserProfile = async (username) => {
        setIsLoading(true);
		setUser(null);
		try {
            const response =await API.patch(`/api/v1/users/${username}`)
            const users = response.data
            // console.log(users.user)
            setUser(users.user)

		} catch (error) {
            const message = error.response?.data?.error || error.message
			showToast("Error", message, "error");
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};
    return { user, isLoading, getUserProfile, setUser }
}
