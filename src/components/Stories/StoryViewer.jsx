import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Box, Button, Flex, IconButton, Image, Portal, Spinner, Text, VStack } from "@chakra-ui/react";
import { CloseIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { BsVolumeMuteFill, BsVolumeUpFill } from "react-icons/bs";
import { avatarUrl, mediaUrl } from "../../utils/media";
import { timeAgo } from "../../utils/timeAgo";
import { fetchStoryViewers } from "../../hooks/useStories";

const IMAGE_MS = 5000;
const HOLD_MS = 200; // a press longer than this pauses instead of navigating

const firstUnseen = (group) => {
	const i = group.stories.findIndex((s) => !s.seen);
	return i === -1 ? 0 : i;
};

// Full-screen story player. Phones: edge to edge. Tablets/desktop: a 9:16 card
// centred on a dark backdrop, like instagram.com.
export default function StoryViewer({ groups, startGroup, onClose, onSeen, onDelete }) {
	const [g, setG] = useState(startGroup);
	const [i, setI] = useState(() => firstUnseen(groups[startGroup]));
	const [progress, setProgress] = useState(0);
	const [paused, setPaused] = useState(false);
	const [muted, setMuted] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const [viewers, setViewers] = useState(null);
	const videoRef = useRef(null);
	const pressStart = useRef(0);

	const group = groups[g];
	const story = group?.stories[i];
	const isVideo = story?.mediaType === "video";
	const isPaused = paused || viewers !== null || !loaded;

	const next = useCallback(() => {
		if (i < group.stories.length - 1) setI(i + 1);
		else if (g < groups.length - 1) {
			setG(g + 1);
			setI(firstUnseen(groups[g + 1]));
		} else onClose();
	}, [g, i, group, groups, onClose]);

	const prev = useCallback(() => {
		if (i > 0) setI(i - 1);
		else if (g > 0) {
			setG(g - 1);
			setI(0);
		} else setProgress(0);
	}, [g, i]);

	// New story: reset and record the view (not for your own).
	useEffect(() => {
		setProgress(0);
		setLoaded(false);
		if (story && !group.isMine && !story.seen) onSeen(story._id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [story?._id]);

	// Photo timer (videos report their own progress below).
	useEffect(() => {
		if (!story || isVideo || isPaused) return;
		let last = performance.now();
		let frame;
		const tick = (now) => {
			setProgress((p) => {
				const nextP = p + (now - last) / IMAGE_MS;
				last = now;
				return Math.min(nextP, 1);
			});
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [story, isVideo, isPaused]);

	useEffect(() => {
		if (progress >= 1 && !isVideo) next();
	}, [progress, isVideo, next]);

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		if (isPaused) v.pause();
		else v.play().catch(() => {});
	}, [isPaused, story?._id]);

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") next();
			if (e.key === "ArrowLeft") prev();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [next, prev, onClose]);

	if (!story) return null;

	const onPointerDown = () => {
		pressStart.current = Date.now();
		setPaused(true);
	};
	const onPointerUp = (e) => {
		setPaused(false);
		if (Date.now() - pressStart.current > HOLD_MS) return; // it was a hold
		const { left, width } = e.currentTarget.getBoundingClientRect();
		if (e.clientX - left < width * 0.3) prev();
		else next();
	};

	const showViewers = async () => {
		setViewers([]);
		try {
			setViewers(await fetchStoryViewers(story._id));
		} catch {
			setViewers(null);
		}
	};

	return (
		<Portal>
			<Flex position='fixed' inset={0} zIndex={1500} bg='rgba(10,10,10,0.97)' alignItems='center' justifyContent='center'>
				<Box
					position='relative'
					w={{ base: "100vw", md: "min(420px, calc(90vh * 9 / 16))" }}
					h={{ base: "100dvh", md: "90vh" }}
					bg='black'
					borderRadius={{ base: 0, md: "lg" }}
					overflow='hidden'
				>
					{/* media */}
					<Flex position='absolute' inset={0} alignItems='center' justifyContent='center'>
						{!loaded && <Spinner color='white' position='absolute' />}
						{isVideo ? (
							<video
								key={story._id}
								ref={videoRef}
								src={mediaUrl(story.fileId)}
								playsInline
								muted={muted}
								autoPlay
								onLoadedData={() => setLoaded(true)}
								onTimeUpdate={(e) => e.target.duration && setProgress(e.target.currentTime / e.target.duration)}
								onEnded={next}
								style={{ width: "100%", height: "100%", objectFit: "contain" }}
							/>
						) : (
							<Image
								key={story._id}
								src={mediaUrl(story.fileId)}
								alt={`${group.user.username}'s story`}
								w='100%'
								h='100%'
								objectFit='contain'
								onLoad={() => setLoaded(true)}
								onError={() => setLoaded(true)}
								draggable={false}
							/>
						)}
					</Flex>

					{/* tap / hold layer */}
					<Box
						position='absolute'
						inset={0}
						onPointerDown={onPointerDown}
						onPointerUp={onPointerUp}
						onPointerLeave={() => setPaused(false)}
						onContextMenu={(e) => e.preventDefault()}
						style={{ touchAction: "none", userSelect: "none" }}
					/>

					{/* top: progress bars + author */}
					<Box position='absolute' top={0} left={0} right={0} p={3} pt='max(12px, env(safe-area-inset-top))' bgGradient='linear(to-b, blackAlpha.600, transparent)' pointerEvents='none'>
						<Flex gap='3px' mb={3}>
							{group.stories.map((s, idx) => (
								<Box key={s._id} flex={1} h='2px' bg='whiteAlpha.500' borderRadius='full' overflow='hidden'>
									<Box h='full' bg='white' w={`${idx < i ? 100 : idx === i ? progress * 100 : 0}%`} />
								</Box>
							))}
						</Flex>
						<Flex alignItems='center' gap={2} pointerEvents='auto'>
							<Avatar size='sm' src={avatarUrl(group.user)} name={group.user.username} referrerPolicy='no-referrer' />
							<Text color='white' fontWeight='semibold' fontSize='sm'>
								{group.user.username}
							</Text>
							<Text color='whiteAlpha.700' fontSize='sm'>
								{timeAgo(new Date(story.createdAt).getTime())}
							</Text>
							<Flex ml='auto' gap={1}>
								{isVideo && (
									<IconButton
										aria-label={muted ? "Unmute" : "Mute"}
										icon={muted ? <BsVolumeMuteFill /> : <BsVolumeUpFill />}
										variant='ghost'
										color='white'
										size='sm'
										onClick={() => setMuted(!muted)}
									/>
								)}
								<IconButton aria-label='Close' icon={<CloseIcon />} variant='ghost' color='white' size='sm' onClick={onClose} />
							</Flex>
						</Flex>
					</Box>

					{/* bottom: owner tools */}
					{group.isMine && (
						<Flex position='absolute' bottom={0} left={0} right={0} p={4} pb='max(16px, env(safe-area-inset-bottom))' justifyContent='space-between' bgGradient='linear(to-t, blackAlpha.700, transparent)'>
							<Button leftIcon={<ViewIcon />} size='sm' variant='ghost' color='white' onClick={showViewers}>
								{story.viewCount ?? 0} {story.viewCount === 1 ? "viewer" : "viewers"}
							</Button>
							<IconButton aria-label='Delete story' icon={<DeleteIcon />} size='sm' variant='ghost' color='white' onClick={() => onDelete(story._id)} />
						</Flex>
					)}

					{/* viewers sheet (pauses the story while open) */}
					{viewers !== null && (
						<Box position='absolute' left={0} right={0} bottom={0} maxH='60%' overflowY='auto' bg='gray.900' borderTopRadius='xl' p={4}>
							<Flex justifyContent='space-between' alignItems='center' mb={3}>
								<Text fontWeight='bold'>Viewers</Text>
								<IconButton aria-label='Close viewers' icon={<CloseIcon />} size='xs' variant='ghost' onClick={() => setViewers(null)} />
							</Flex>
							{viewers.length === 0 ? (
								<Text color='gray.400' fontSize='sm'>No views yet.</Text>
							) : (
								<VStack align='stretch' spacing={3}>
									{viewers.map((v) => (
										<Flex key={v._id} alignItems='center' gap={3}>
											<Avatar size='sm' src={avatarUrl(v)} name={v.username} referrerPolicy='no-referrer' />
											<Text fontSize='sm'>{v.username}</Text>
										</Flex>
									))}
								</VStack>
							)}
						</Box>
					)}
				</Box>
			</Flex>
		</Portal>
	);
}
