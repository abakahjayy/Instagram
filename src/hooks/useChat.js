import { useCallback, useEffect, useRef, useState } from "react";
import API from "../utils/api";
import { getAuthToken, getAuthUserId } from "../utils/auth";
import { getSocket } from "../utils/socket";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";

const auth = () => ({ Authorization: `Bearer ${getAuthToken()}` });

// A live one-to-one conversation with `otherUserId`: loads the history over REST,
// then sends/receives over socket.io. The backend takes the sender from the JWT.
// Also: edit + unsend your own messages, and voice notes (REST upload).
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

	const belongsHere = useCallback(
		(m) => (m.sender === otherUserId && m.recipient === myId) || (m.sender === myId && m.recipient === otherUserId),
		[myId, otherUserId]
	);

	const markRead = useCallback(() => {
		// once saved, tell the inbox list and the unread badges to refresh
		API.patch(`/api/v1/messages/conversations/${otherUserId}/read`, null, { headers: auth() })
			.then(() => window.dispatchEvent(new Event("inbox:refresh")))
			.catch(() => {});
	}, [otherUserId]);

	// History
	useEffect(() => {
		if (!myId || !otherUserId) return;
		const controller = new AbortController();
		setIsLoading(true);
		setMessages([]);
		API.get(`/api/v1/messages/${myId}/${otherUserId}`, { signal: controller.signal, headers: auth() })
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
			if (!belongsHere(message)) return; // another conversation
			setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
			if (message.sender === otherUserId) {
				setIsOtherTyping(false);
				markRead();
			}
		};
		const onUpdated = (message) => {
			if (!belongsHere(message)) return;
			setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
		};
		const onDeleted = ({ _id }) => setMessages((prev) => prev.filter((m) => m._id !== _id));
		const onTyping = ({ sender }) => {
			if (sender !== otherUserId) return;
			setIsOtherTyping(true);
			clearTimeout(typingTimer.current);
			typingTimer.current = setTimeout(() => setIsOtherTyping(false), 2500);
		};

		socket.on("receiveMessage", onMessage);
		socket.on("messageUpdated", onUpdated);
		socket.on("messageDeleted", onDeleted);
		socket.on("typing", onTyping);
		return () => {
			socket.off("receiveMessage", onMessage);
			socket.off("messageUpdated", onUpdated);
			socket.off("messageDeleted", onDeleted);
			socket.off("typing", onTyping);
			clearTimeout(typingTimer.current);
		};
	}, [token, otherUserId, belongsHere, markRead]);

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

	const editMessage = useCallback(
		async (messageId, text) => {
			const message = text.trim();
			if (!message) return;
			const before = messages.find((m) => m._id === messageId);
			setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, message, editedAt: new Date().toISOString() } : m)));
			try {
				const { data } = await API.patch(`/api/v1/messages/${messageId}/edit`, { message }, { headers: auth() });
				setMessages((prev) => prev.map((m) => (m._id === messageId ? data : m)));
			} catch (error) {
				if (before) setMessages((prev) => prev.map((m) => (m._id === messageId ? before : m)));
				showToast("Couldn't edit", error.response?.data?.error || error.message, "error");
			}
		},
		[messages, showToast]
	);

	// "Unsend": removes the message for both people.
	const unsendMessage = useCallback(
		async (messageId) => {
			const before = messages;
			setMessages((prev) => prev.filter((m) => m._id !== messageId));
			try {
				await API.delete(`/api/v1/messages/${messageId}`, { headers: auth() });
			} catch (error) {
				setMessages(before);
				showToast("Couldn't unsend", error.response?.data?.error || error.message, "error");
			}
		},
		[messages, showToast]
	);

	const sendVoice = useCallback(
		async (blob, duration) => {
			const tempId = `pending-voice-${Date.now()}`;
			setMessages((prev) => [
				...prev,
				{ _id: tempId, sender: myId, recipient: otherUserId, type: "voice", duration, timestamp: new Date().toISOString(), pending: true },
			]);
			try {
				const form = new FormData();
				form.append("recipient", otherUserId);
				form.append("duration", String(duration));
				const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
				form.append("audio", blob, `voice.${ext}`);
				const { data } = await API.post("/api/v1/messages/voice", form, { headers: auth() });
				setMessages((prev) => {
					// the socket echo may have arrived first
					const withoutTemp = prev.filter((m) => m._id !== tempId);
					return withoutTemp.some((m) => m._id === data._id) ? withoutTemp : [...withoutTemp, data];
				});
			} catch (error) {
				setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...m, pending: false, failed: true } : m)));
				showToast("Voice message not sent", error.response?.data?.error || error.message, "error");
			}
		},
		[myId, otherUserId, showToast]
	);

	// Throttled so we don't emit on every keystroke.
	const notifyTyping = useCallback(() => {
		const now = Date.now();
		if (now - lastTypingSent.current < 1500) return;
		lastTypingSent.current = now;
		getSocket(token)?.emit("typing", { recipient: otherUserId });
	}, [token, otherUserId]);

	return { myId, messages, isLoading, isOtherTyping, sendMessage, editMessage, unsendMessage, sendVoice, notifyTyping };
};

export default useChat;
