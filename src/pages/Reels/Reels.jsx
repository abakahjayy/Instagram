import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Flex, Link, Spinner, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsVolumeMuteFill, BsVolumeUpFill } from "react-icons/bs";
import { FiSend } from "react-icons/fi";
import { CommentLogo } from "../../assets/constants";
import API from "../../utils/api";
import { avatarUrl, mediaUrl } from "../../utils/media";
import { sharePost } from "../../utils/share";
import useLikePost from "../../hooks/useLikePost";
import useShowToast from "../../hooks/useShowToast";
import { useGetUserById } from "../../hooks/useGetUserById";
import CommentsModal from "../../components/Modals/CommentsModal";
import { MOBILE_BOTTOM_BAR_H } from "../../components/NavBar/MobileNav";

// Phones: full screen minus the bottom tab bar (the top bar is hidden on /reels).
const REEL_H = { base: `calc(100dvh - ${MOBILE_BOTTOM_BAR_H})`, md: "100dvh" };

// /reels - every video post as a vertical, snap-scrolling feed.
export default function ReelsPage() {
	const [reels, setReels] = useState(null);
	const [muted, setMuted] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		API.get("/api/v1/posts", { signal: controller.signal })
			.then(({ data }) => setReels(data.posts.filter((p) => p.mediaType === "video")))
			.catch((e) => e.message !== "canceled" && setReels([]));
		return () => controller.abort();
	}, []);

	if (reels === null) {
		return (
			<Flex h={REEL_H} alignItems='center' justifyContent='center'>
				<Spinner />
			</Flex>
		);
	}
	if (reels.length === 0) {
		return (
			<Flex h={REEL_H} direction='column' alignItems='center' justifyContent='center' gap={2} px={6} textAlign='center'>
				<Text fontSize='xl' fontWeight='bold'>No reels yet</Text>
				<Text color='gray.400'>Post a video with Create and it will show up here.</Text>
			</Flex>
		);
	}

	return (
		<Box
			h={REEL_H}
			overflowY='scroll'
			sx={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
		>
			{reels.map((post) => (
				<Reel key={post._id} post={post} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
			))}
		</Box>
	);
}

function Reel({ post, muted, onToggleMute }) {
	const videoRef = useRef(null);
	const [paused, setPaused] = useState(false);
	const { userProfile } = useGetUserById(post.createdBy);
	const { handleLikePost, isLiked, likes } = useLikePost(post);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const showToast = useShowToast();

	// Play only the reel that's on screen.
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					video.currentTime = 0;
					video.play().then(() => setPaused(false)).catch(() => {});
				} else video.pause();
			},
			{ threshold: 0.7 }
		);
		observer.observe(video);
		return () => observer.disconnect();
	}, []);

	const togglePlay = () => {
		const v = videoRef.current;
		if (!v) return;
		if (v.paused) v.play().then(() => setPaused(false)).catch(() => {});
		else {
			v.pause();
			setPaused(true);
		}
	};

	const share = async () => {
		const result = await sharePost(post, userProfile?.username);
		if (result === "copied") showToast("Link copied", "", "success", 1500);
	};

	return (
		<Box position='relative' h={REEL_H} bg='black' display='flex' justifyContent='center' sx={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
			<Box position='relative' h='100%' w={{ base: "100%", md: "auto" }} sx={{ aspectRatio: { md: "9 / 16" } }} maxW='100%'>
				<video
					ref={videoRef}
					src={mediaUrl(post.postId)}
					loop
					playsInline
					muted={muted}
					preload='metadata'
					onClick={togglePlay}
					style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
				/>
				{paused && (
					<Flex position='absolute' inset={0} alignItems='center' justifyContent='center' pointerEvents='none' color='whiteAlpha.800' fontSize='64px'>
						▶
					</Flex>
				)}

				{/* right-hand actions */}
				<VStack position='absolute' right={3} bottom={{ base: 20, md: 24 }} spacing={5} color='white' filter='drop-shadow(0 1px 2px rgba(0,0,0,0.6))'>
					<ActionButton label={isLiked ? "Unlike" : "Like"} onClick={handleLikePost} count={likes}>
						{isLiked ? <AiFillHeart color='#ff3040' /> : <AiOutlineHeart />}
					</ActionButton>
					<ActionButton label='Comments' onClick={onOpen} count={post.comments?.length || 0}>
						<CommentLogo />
					</ActionButton>
					<ActionButton label='Share' onClick={share}>
						<FiSend />
					</ActionButton>
					<ActionButton label={muted ? "Unmute" : "Mute"} onClick={onToggleMute}>
						{muted ? <BsVolumeMuteFill /> : <BsVolumeUpFill />}
					</ActionButton>
				</VStack>

				{/* author + caption */}
				<Box position='absolute' left={0} right={16} bottom={0} p={4} pb={{ base: 5, md: 8 }} color='white' bgGradient='linear(to-t, blackAlpha.700, transparent)'>
					{userProfile && (
						<Link as={RouterLink} to={`/${userProfile.username}`} display='flex' alignItems='center' gap={2} mb={2} fontWeight='semibold'>
							<Avatar size='sm' src={avatarUrl(userProfile)} name={userProfile.username} referrerPolicy='no-referrer' />
							{userProfile.username}
						</Link>
					)}
					{post.caption && (
						<Text fontSize='sm' noOfLines={2}>
							{post.caption}
						</Text>
					)}
				</Box>
			</Box>
			{isOpen && <CommentsModal isOpen={isOpen} onClose={onClose} post={post} />}
		</Box>
	);
}

function ActionButton({ label, onClick, count, children }) {
	return (
		<Flex as='button' aria-label={label} onClick={onClick} direction='column' alignItems='center' gap={1} fontSize='28px'>
			{children}
			{count !== undefined && <Text fontSize='xs' fontWeight='semibold'>{count}</Text>}
		</Flex>
	);
}
