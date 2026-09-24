import { useRef, useState } from 'react'
import PostHeader from './PostHeader'
import PostFooter from './PostFooter'
import { Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { AiFillHeart } from 'react-icons/ai'
import { useGetUserById } from '../../hooks/useGetUserById';
import useLikePost from '../../hooks/useLikePost';
import PostMedia from './PostMedia';

const heartPop = keyframes`
  0% { transform: scale(0); opacity: 0; }
  15% { transform: scale(1.2); opacity: 1; }
  30% { transform: scale(0.95); }
  45%, 80% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
`;

export default function FeedPost({post}) {
    const {
        userProfile,
        profileImageUrl, // Return the profile image URL
        imageLoading, // Return the image loading state
    } = useGetUserById(post.createdBy);
    const likeState = useLikePost(post);
    const [showHeart, setShowHeart] = useState(0);
    const lastTap = useRef(0);

    // Double-tap (touch) or double-click to like, like Instagram. Never unlikes.
    const handleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (!likeState.isLiked) likeState.handleLikePost();
            setShowHeart((n) => n + 1);
            lastTap.current = 0;
        } else {
            lastTap.current = now;
        }
    };

    return (
        <>
            <PostHeader post={post} profileImageUrl={profileImageUrl} creatorProfile={userProfile} imageLoading={imageLoading}/>
            <Box my={2} borderRadius={4} overflow={"hidden"} position='relative' onClick={handleTap} userSelect='none'>
				<PostMedia post={post} variant="feed" />
				{showHeart > 0 && (
					<Box
						key={showHeart}
						position='absolute'
						inset={0}
						display='flex'
						alignItems='center'
						justifyContent='center'
						pointerEvents='none'
						color='white'
						filter='drop-shadow(0 0 8px rgba(0,0,0,0.5))'
						animation={`${heartPop} 1s ease-out forwards`}
					>
						<AiFillHeart size={96} />
					</Box>
				)}
			</Box>
            <PostFooter post={post} isProfilePage={false} creatorProfile={userProfile} likeState={likeState}/>
        </>
    )
}
