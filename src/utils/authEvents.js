import API from "./api";

// Tells the backend about a successful sign-up / sign-in so it can email a welcome
// (once) or a "new sign-in" alert (only from a device this account hasn't used).
// The device id is random and stays in this browser; nothing identifying is sent.
const DEVICE_KEY = "ig-device-id";

const deviceId = () => {
	try {
		let id = localStorage.getItem(DEVICE_KEY);
		if (!id) {
			id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			localStorage.setItem(DEVICE_KEY, id);
		}
		return id;
	} catch {
		return "no-storage";
	}
};

// Fire-and-forget: never slows down or breaks signing in.
export const reportAuthEvent = (type) => {
	API.post("/api/v1/instagram/events", { type, deviceId: deviceId() }).catch(() => {});
};
