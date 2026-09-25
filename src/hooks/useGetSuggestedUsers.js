import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import API from "../utils/api";

// "Suggested for you": people you don't follow yet, most mutual connections first.
// Each gets `mutuals` - usernames of people you follow who follow them - for
// Instagram's "Followed by x + 2 more" line.
const useGetSuggestedUsers = (me) => {
	const [isLoading, setIsLoading] = useState(true);
	const [suggestedUsers, setSuggestedUsers] = useState([]);
	const authUser = useAuthStore((state) => state.user);
	const myId = me?._id;
	const followingKey = (me?.following || []).map(String).join(",");

	useEffect(() => {
		if (!myId) return;
		const controller = new AbortController();
		const following = new Set(followingKey ? followingKey.split(",") : []);
		setIsLoading(true);
		API.get(`/api/v1/users/`, { signal: controller.signal, params: { limit: 30 } })
			.then(({ data }) => {
				const people = data.users
					.filter((u) => u._id !== myId && !following.has(u._id))
					.map((u) => ({
						...u,
						mutuals: (u.followers || [])
							.filter((f) => f && following.has(String(f._id || f)))
							.map((f) => f.username)
							.filter(Boolean),
					}))
					.sort((a, b) => b.mutuals.length - a.mutuals.length)
					.slice(0, 5);
				setSuggestedUsers(people);
			})
			.catch(() => {}) // the sidebar just stays empty
			.finally(() => setIsLoading(false));
		return () => controller.abort();
	}, [myId, followingKey, authUser]);

	return { isLoading, suggestedUsers };
};

export default useGetSuggestedUsers;
