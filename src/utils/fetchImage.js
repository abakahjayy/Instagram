export const fetchImage = async (imageId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/v1/posts/image/${imageId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch image');
    }

    // Create a blob from the response
    const blob = await response.blob();

    // Create an object URL for the image to display it
    const imageURL = URL.createObjectURL(blob);
    return imageURL;
};
