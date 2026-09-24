import { create } from "zustand";

// Activity feed ("X liked your post"...). Filled by useNotificationsSync (PageLayout),
// read by the Notifications page and the unread badges in the sidebar / mobile top bar.
const useNotificationStore = create((set) => ({
	notifications: [],
	unread: 0,
	loaded: false,
	setAll: (notifications, unread) => set({ notifications, unread, loaded: true }),
	add: (notification) =>
		set((state) => ({
			// the backend replaces like/follow rows for the same actor, so drop the old copy
			notifications: [notification, ...state.notifications.filter((n) => n._id !== notification._id)],
			unread: state.unread + 1,
		})),
	markAllRead: () =>
		set((state) => ({ unread: 0, notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
	reset: () => set({ notifications: [], unread: 0, loaded: false }),
}));

export default useNotificationStore;
