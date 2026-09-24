import { useCallback, useEffect } from "react";
import API from "../utils/api";
import { getAuthToken } from "../utils/auth";
import { getSocket } from "../utils/socket";
import useNotificationStore from "../store/useNotificationStore";

// Mount once while signed in (PageLayout): loads the list and listens for live pushes.
export const useNotificationsSync = (enabled) => {
	const { setAll, add } = useNotificationStore();
	const token = getAuthToken();

	useEffect(() => {
		if (!enabled || !token) return;
		const controller = new AbortController();
		API.get("/api/v1/notifications", { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
			.then(({ data }) => setAll(data.notifications, data.unread))
			.catch(() => {}); // the badge just stays at 0

		const socket = getSocket(token);
		socket?.on("notification", add);
		return () => {
			controller.abort();
			socket?.off("notification", add);
		};
	}, [enabled, token, setAll, add]);
};

// Clears the unread count on the server and locally (Notifications page).
export const useMarkNotificationsRead = () => {
	const markAllRead = useNotificationStore((state) => state.markAllRead);
	return useCallback(() => {
		const token = getAuthToken();
		if (!token) return;
		markAllRead();
		API.patch("/api/v1/notifications/read", null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
	}, [markAllRead]);
};
