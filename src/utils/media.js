const apiUrl = import.meta.env.VITE_API_URL;

// Direct URLs to GridFS files on the backend. The browser streams and caches
// these itself, so there's no need for fetchImage's blob/object-URL round trip.
export const imageUrl = (fileId) => (fileId ? `${apiUrl}/api/v1/posts/image/${fileId}` : undefined);

// /media/ supports HTTP Range requests, which <video> needs for seeking.
export const mediaUrl = (fileId) => (fileId ? `${apiUrl}/api/v1/posts/media/${fileId}` : undefined);

export const isVideoPost = (post) => post?.mediaType === "video";
