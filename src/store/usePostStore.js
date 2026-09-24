import { create } from "zustand";

const usePostStore = create((set) => ({
    posts: [],
    createPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
    deletePost: (id) => set((state) => ({ posts: state.posts.filter((post) => post.id !== id) })),
    setPosts: (posts) => set({ posts }),
    addComment: (postId, comment) =>
        set((state) => ({
            posts: state.posts.map((post) => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, comment],
                    };
                }
                return post;
            }),
        })),
}));

export default usePostStore;



// import {create} from 'zustand';
// import axios from 'axios';

// const usePostStore = create((set) => ({
//     posts: [],
//     isLoading: false,
//     error: null,
//     fetchPosts: async () => {
//         set({ isLoading: true });
//         try {
//             const response = await axios.get('http://localhost:7004/api/v1/posts');
//             set({ posts: response.data, error: null });
//         } catch (err) {
//             set({ error: err.response?.data?.error || 'Failed to fetch posts' });
//         } finally {
//             set({ isLoading: false });
//         }
//     },
//     createPost: async (postData, image) => {
//         set({ isLoading: true });
//         try {
//             const formData = new FormData();
//             formData.append('caption', postData.caption);
//             formData.append('image', image);
//             await axios.post('http://localhost:7004/api/v1/posts', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             });
//             set({ error: null });
//             // Refresh posts after successful post creation
//             setTimeout(() => set({ isLoading: false }), 2000);
//         } catch (err) {
//             set({ error: err.response?.data?.error || 'Failed to create post' });
//             set({ isLoading: false });
//         }
//     },
// }));

// export default usePostStore;
