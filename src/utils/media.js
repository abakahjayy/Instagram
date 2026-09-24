const apiUrl = import.meta.env.VITE_API_URL;

// Direct URLs to GridFS files on the backend. The browser streams and caches
// these itself, so there's no need for fetchImage's blob/object-URL round trip.
export const imageUrl = (fileId) => (fileId ? `${apiUrl}/api/v1/posts/image/${fileId}` : undefined);

// /media/ supports HTTP Range requests, which <video> needs for seeking.
export const mediaUrl = (fileId) => (fileId ? `${apiUrl}/api/v1/posts/media/${fileId}` : undefined);

export const isVideoPost = (post) => post?.mediaType === "video";

// A user's avatar: their uploaded picture (GridFS) if they have one, otherwise the
// photo URL Google sign-in stored in `profile_picture`. The schema default
// './placeholder.jpg' isn't a real file, so it falls through to Chakra's initials.
export const avatarUrl = (user) => {
	if (user?.profile_picture_id) return imageUrl(user.profile_picture_id);
	if (/^https?:\/\//.test(user?.profile_picture || "")) return user.profile_picture;
	return undefined;
};
