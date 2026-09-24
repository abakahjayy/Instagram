import API from "../utils/api";
import useShowToast from "./useShowToast"; // Custom toast hook (if you have one)
import { useEffect, useState } from "react";
import { avatarUrl } from "../utils/media";

export const useGetUserById = (userId) => {
  const showToast = useShowToast(); // Show toast notifications
  const [isLoading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // To store the profile image URL
  const [imageLoading] = useState(false); // To track image loading status
  const [imageError] = useState(null); // To track image errors

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

        // Direct URL (uploaded picture, else Google photo) - the browser loads and caches it.
        // The old per-avatar blob fetch never resolved for users without an upload.
        setProfileImageUrl(avatarUrl(user) || null);
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
