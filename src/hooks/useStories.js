import { useCallback, useEffect, useState } from "react";
import API from "../utils/api";
import { getAuthToken } from "../utils/auth";
import useShowToast from "./useShowToast";

const auth = () => ({ Authorization: `Bearer ${getAuthToken()}` });
const MAX_STORY_BYTES = 50 * 1024 * 1024; // same cap as posts on the backend

// Stories from you + people you follow: [{ user, stories:[{_id,fileId,mediaType,seen,viewCount?}], isMine, allSeen }]
const useStories = () => {
	const [groups, setGroups] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const showToast = useShowToast();

	const refresh = useCallback(async (signal) => {
		try {
			const { data } = await API.get("/api/v1/stories/feed", { signal, headers: auth() });
			setGroups(data.groups);
		} catch (error) {
			if (error.message !== "canceled") setGroups([]);
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		refresh(controller.signal);
		return () => controller.abort();
	}, [refresh]);

	const uploadStory = async (file) => {
		if (!file) return;
		if (!/^(image|video)\//.test(file.type)) return showToast("Error", "Stories can be a photo or a video", "error");
		if (file.size > MAX_STORY_BYTES) return showToast("Error", "Story must be less than 50MB", "error");
		setIsUploading(true);
		try {
			const form = new FormData();
			form.append("file", file);
			await API.post("/api/v1/stories", form, { headers: auth() });
			showToast("Story shared", "It will disappear after 24 hours", "success");
			await refresh();
		} catch (error) {
			showToast("Error", error.response?.data?.error || error.message, "error");
		} finally {
			setIsUploading(false);
		}
	};

	// Optimistic: the ring greys out as soon as you've watched.
	const markSeen = useCallback((storyId) => {
		setGroups((prev) =>
			prev?.map((g) => {
				const stories = g.stories.map((s) => (s._id === storyId ? { ...s, seen: true } : s));
				return { ...g, stories, allSeen: stories.every((s) => s.seen) };
			})
		);
		API.post(`/api/v1/stories/${storyId}/view`, null, { headers: auth() }).catch(() => {});
	}, []);

	const deleteStory = async (storyId) => {
		try {
			await API.delete(`/api/v1/stories/${storyId}`, { headers: auth() });
			await refresh();
		} catch (error) {
			showToast("Error", error.response?.data?.error || error.message, "error");
		}
	};

	return { groups, isUploading, uploadStory, markSeen, deleteStory, refresh };
};

export const fetchStoryViewers = (storyId) =>
	API.get(`/api/v1/stories/${storyId}/viewers`, { headers: auth() }).then(({ data }) => data.viewers);

export default useStories;
