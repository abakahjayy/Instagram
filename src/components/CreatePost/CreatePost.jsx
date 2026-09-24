import React, { useState } from 'react';
import usePostStore from '../../store/usePostStore';

const CreatePost = () => {
    const { createPost, isLoading, error } = usePostStore();
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => setImage(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!image) return alert('Please upload an image');
        createPost({ caption }, image);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
            />
            <input type="file" onChange={handleImageChange} />
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Create Post'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default CreatePost;
