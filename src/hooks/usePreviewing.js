import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB - matches the backend limit on /api/v1/posts

// Pass { allowVideo: true } to accept videos too (post creation); profile pictures stay image-only.
const usePreviewImg = ({ allowVideo = false } = {}) => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [mediaType, setMediaType] = useState(null);
	const [formDatas, setFormDatas] = useState(null);
	const [formDatas2, setFormDatas2] = useState(null);
	const showToast = useShowToast();

	// Video previews are object URLs (a 50MB data URL would freeze the tab) - release them.
	useEffect(() => {
		if (selectedFile?.startsWith("blob:")) return () => URL.revokeObjectURL(selectedFile);
	}, [selectedFile]);

	const clearSelection = () => {
		setSelectedFile(null);
		setMediaType(null);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		e.target.value = ""; // so picking the same file again still fires onChange
		const isImage = file?.type.startsWith("image/");
		const isVideo = allowVideo && file?.type.startsWith("video/");
		if (!isImage && !isVideo) {
			showToast("Error", allowVideo ? "Please select an image or video" : "Please select an image file", "error");
			clearSelection();
			return;
		}

		const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
		if (file.size > maxBytes) {
			showToast("Error", `${isVideo ? "Video" : "Image"} must be less than ${maxBytes / 1024 / 1024}MB`, "error");
			clearSelection();
			return;
		}

		const formDatase = new FormData();
		formDatase.append("profile_pictures", file);
		const formDatase2 = new FormData();
		formDatase2.append("file", file);
		setFormDatas(formDatase);
		setFormDatas2(formDatase2);

		if (isVideo) {
			setMediaType("video");
			setSelectedFile(URL.createObjectURL(file));
			return;
		}
		const reader = new FileReader();
		reader.onloadend = () => {
			setMediaType("image");
			setSelectedFile(reader.result);
		};
		reader.readAsDataURL(file);
	};

	return { formDatas, formDatas2, selectedFile, mediaType, handleImageChange, setSelectedFile: clearSelection };
};

export default usePreviewImg;
