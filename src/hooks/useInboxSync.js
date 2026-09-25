import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../utils/api";
import { getAuthToken } from "../utils/auth";
import { getSocket } from "../utils/socket";
import useInboxStore from "../store/useInboxStore";

// Mount once while signed in (PageLayout). Keeps the unread-messages badge fresh:
// on load, on every message socket event, and whenever you move between pages
// (opening a chat marks it read on the server).
export const useInboxSync = (enabled) => {
	const setSummary = useInboxStore((state) => state.setSummary);
	const { pathname } = useLocation();
	const token = getAuthToken();

	useEffect(() => {
		if (!enabled || !token) return;
		let cancelled = false;
		let timer;
		const load = () =>
			API.get("/api/v1/messages/conversations")
				.then(({ data }) => !cancelled && setSummary(data.conversations))
				.catch(() => {});
		// small delay so a chat's "mark read" lands first
		const refresh = () => {
			clearTimeout(timer);
			timer = setTimeout(load, 400);
		};
		load();
		const socket = getSocket(token);
		const events = ["receiveMessage", "messageUpdated", "messageDeleted"];
		events.forEach((e) => socket?.on(e, refresh));
		window.addEventListener("inbox:refresh", load); // useChat marked a conversation read
		return () => {
			cancelled = true;
			clearTimeout(timer);
			events.forEach((e) => socket?.off(e, refresh));
			window.removeEventListener("inbox:refresh", load);
		};
	}, [enabled, token, pathname, setSummary]);
};
