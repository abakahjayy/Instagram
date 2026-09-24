import { useCallback, useEffect, useState } from "react";
import API from "../utils/api";
import { getAuthToken } from "../utils/auth";
import { getSocket } from "../utils/socket";
import useShowToast from "./useShowToast";

// The signed-in user's inbox: [{ user, lastMessage, unread }], newest first.
// Refreshes whenever a message arrives over the socket.
const useConversations = () => {
	const [conversations, setConversations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const showToast = useShowToast();
	const token = getAuthToken();

	const load = useCallback(
		async (signal) => {
			try {
				const { data } = await API.get("/api/v1/messages/conversations", {
					signal,
					headers: { Authorization: `Bearer ${token}` },
				});
				setConversations(data.conversations);
			} catch (error) {
				if (error.message === "canceled") return;
				showToast("Error", error.response?.data?.error || error.message, "error");
			} finally {
				setIsLoading(false);
			}
		},
		[token, showToast]
	);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);

		const socket = getSocket(token);
		const refresh = () => load();
		socket?.on("receiveMessage", refresh);
		return () => {
			controller.abort();
			socket?.off("receiveMessage", refresh);
		};
	}, [load, token]);

	return { conversations, isLoading };
};

export default useConversations;
