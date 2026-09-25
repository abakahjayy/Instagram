import { create } from "zustand";

// Inbox summary for the Messages badge (sidebar / mobile top bar) and the floating
// Messages pill: total unread messages + the most recent conversations' people.
// Filled by useInboxSync (PageLayout).
const useInboxStore = create((set) => ({
	unread: 0,
	recent: [], // [{ _id, username, profile_picture_id, profile_picture }]
	setSummary: (conversations) =>
		set({
			unread: conversations.reduce((sum, c) => sum + (c.unread || 0), 0),
			recent: conversations.slice(0, 3).map((c) => c.user),
		}),
}));

export default useInboxStore;
