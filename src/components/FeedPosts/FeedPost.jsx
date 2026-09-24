import React from 'react'
import PostHeader from './PostHeader'
import PostFooter from './PostFooter'
import { Box } from '@chakra-ui/react'
import { useGetUserById } from '../../hooks/useGetUserById';
import PostMedia from './PostMedia';

export default function FeedPost({post,img,avatar,username}) {
    // console.log(post)
    const {
        isLoading,
        userProfile,
        profileImageUrl, // Return the profile image URL
        imageLoading, // Return the image loading state
        imageError, // Return any errors related to the image
        setUserProfile,
    } = useGetUserById(post.createdBy);
    // console.log(userProfile)
    return (
        <>
            <PostHeader post={post} profileImageUrl={profileImageUrl} creatorProfile={userProfile} imageLoading={imageLoading}/>
            <Box my={2} borderRadius={4} overflow={"hidden"}>
				<PostMedia post={post} variant="feed" />
			</Box>
            <PostFooter post={post} username={username} isProfilePage={false} creatorProfile={userProfile}/>
        </>
    )
}
