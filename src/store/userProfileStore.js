import { create } from "zustand";

const useProfileStore = create((set) => ({
	userProfile: null,
	isLoading: false,
    error: null,
	// Set loading state
    setLoading: (loading) => set({ isLoading: loading }),

    // Set error state
    setError: (error) => set({ error }),

	setUserProfile: (userProfile) => set({ userProfile }),
	
	// this is used to update the number of posts in the profile page
	addPost: (post) =>
		set((state) => ({
			// userProfile: { ...state.userProfile.user, posts: [post.postId, ...state.userProfile.posts]},
			userProfile: { ...state.userProfile, user: 	post},
	})),
	deletePost: (post) =>
		set((state) => ({
			userProfile: { ...state.userProfile, user: 	post},
			// userProfile: {...state.userProfile,posts: state.userProfile.posts.filter((id) => id !== postId)},
	})),
}));

export default useProfileStore;
