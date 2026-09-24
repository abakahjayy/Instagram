import { useEffect } from 'react';
import usePostStore from '../store/usePostStore';

const usePosts = () => {
    const { posts, fetchPosts, isLoading, error } = usePostStore();

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return { posts, isLoading, error };
};

export default usePosts;
