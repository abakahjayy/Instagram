import API from "../utils/api";
import useShowToast from "./useShowToast"; // Custom toast hook (if you have one)
import { useEffect, useState } from "react";
import { fetchImage } from "../utils/fetchImage"; // Adjust the path to your fetchImage file

export const useGetUserById = (userId) => {
  const showToast = useShowToast(); // Show toast notifications
  const [isLoading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // To store the profile image URL
  const [imageLoading, setImageLoading] = useState(false); // To track image loading status
  const [imageError, setImageError] = useState(null); // To track image errors

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      setLoading(true); // Set loading state to true
      setUserProfile(null);
      setProfileImageUrl(null); // Reset the profile image URL
      try {
        const response = await API.get(`/api/v1/users/${userId}`, {
          signal: controller.signal,
        });
        const users = response.data;
        const user = users.user;
        setUserProfile(user);

        // Fetch the profile image URL if the user has a profile_picture_id
        if (user.profile_picture_id) {
          setImageLoading(true);
          try {
            const imageURL = await fetchImage(user.profile_picture_id);
            setProfileImageUrl(imageURL);
          } catch (err) {
            console.error("Failed to fetch profile image:", err);
            setImageError(err);
          } finally {
            setImageLoading(false);
          }
        }
      } catch (err) {
        const message = err.response?.data?.error || err.message || "User not found";
        if (err.message === "canceled") {
          return;
        }
        showToast("Error", message, "error");
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    fetchUser();

    return () => {
      // This is a cleanup function
      controller.abort();
    };
  }, [userId, showToast]);

  return {
    isLoading,
    userProfile,
    profileImageUrl, // Return the profile image URL
    imageLoading, // Return the image loading state
    imageError, // Return any errors related to the image
    setUserProfile,
  };
};
