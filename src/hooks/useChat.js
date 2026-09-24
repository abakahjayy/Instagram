import { useCallback, useEffect, useRef, useState } from "react";
import API from "../utils/api";
import { getAuthToken, getAuthUserId } from "../utils/auth";
import { getSocket } from "../utils/socket";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";

// A live one-to-one conversation with `otherUserId`: loads the history over REST,
// then sends/receives over socket.io. The backend takes the sender from the JWT.
const useChat = (otherUserId) => {
	const authUser = useAuthStore((state) => state.user);
	const myId = getAuthUserId(authUser);
	const token = getAuthToken();
	const showToast = useShowToast();
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isOtherTyping, setIsOtherTyping] = useState(false);
	const typingTimer = useRef(null);
	const lastTypingSent = useRef(0);

	const markRead = useCallback(() => {
		API.patch(`/api/v1/messages/conversations/${otherUserId}/read`, null, {
			headers: { Authorization: `Bearer ${token}` },
		}).catch(() => {});
	}, [otherUserId, token]);

	// History
	useEffect(() => {
		if (!myId || !otherUserId) return;
		const controller = new AbortController();
		setIsLoading(true);
		setMessages([]);
		API.get(`/api/v1/messages/${myId}/${otherUserId}`, {
			signal: controller.signal,
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(({ data }) => {
				setMessages(data);
				markRead();
			})
			.catch((error) => {
				if (error.message === "canceled") return;
				showToast("Error", error.response?.data?.error || error.message, "error");
			})
			.finally(() => setIsLoading(false));
		return () => controller.abort();
	}, [myId, otherUserId, token, markRead, showToast]);

	// Live updates
	useEffect(() => {
		const socket = getSocket(token);
		if (!socket || !otherUserId) return;

		const onMessage = (message) => {
			const fromOther = message.sender === otherUserId;
			const fromMeToOther = message.sender === myId && message.recipient === otherUserId;
			if (!fromOther && !fromMeToOther) return; // belongs to another conversation
			setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
			if (fromOther) {
				setIsOtherTyping(false);
				markRead();
			}
		};
		const onTyping = ({ sender }) => {
			if (sender !== otherUserId) return;
			setIsOtherTyping(true);
			clearTimeout(typingTimer.current);
			typingTimer.current = setTimeout(() => setIsOtherTyping(false), 2500);
		};

		socket.on("receiveMessage", onMessage);
		socket.on("typing", onTyping);
		return () => {
			socket.off("receiveMessage", onMessage);
			socket.off("typing", onTyping);
			clearTimeout(typingTimer.current);
		};
	}, [token, myId, otherUserId, markRead]);

	const sendMessage = useCallback(
		(text) => {
			const message = text.trim();
			const socket = getSocket(token);
			if (!message || !socket) return;

			// Show it straight away, then swap in the saved copy from the server's ack.
			const tempId = `pending-${Date.now()}`;
			setMessages((prev) => [
				...prev,
				{ _id: tempId, sender: myId, recipient: otherUserId, message, timestamp: new Date().toISOString(), pending: true },
			]);
			socket.timeout(10000).emit("sendMessage", { recipient: otherUserId, message }, (timeoutErr, reply) => {
				const error = timeoutErr ? "Message not sent - check your connection" : reply?.error;
				setMessages((prev) =>
					prev.map((m) => {
						if (m._id !== tempId) return m;
						return error ? { ...m, pending: false, failed: true } : reply.message;
					})
				);
				if (error) showToast("Error", error, "error");
			});
		},
		[token, myId, otherUserId, showToast]
	);

	// Throttled so we don't emit on every keystroke.
	const notifyTyping = useCallback(() => {
		const now = Date.now();
		if (now - lastTypingSent.current < 1500) return;
		lastTypingSent.current = now;
		getSocket(token)?.emit("typing", { recipient: otherUserId });
	}, [token, otherUserId]);

	return { myId, messages, isLoading, isOtherTyping, sendMessage, notifyTyping };
};

export default useChat;
