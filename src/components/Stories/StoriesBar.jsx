import { useRef, useState } from "react";
import { Avatar, Box, Flex, Skeleton, SkeletonCircle, Spinner, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import useStories from "../../hooks/useStories";
import useAuthStore from "../../store/useAuthStore";
import { avatarUrl } from "../../utils/media";
import StoryViewer from "./StoryViewer";

const RING = "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)";

// Story ring: Instagram's gradient while unseen, grey once everything is watched.
function StoryAvatar({ user, seen, hasStories, size = "62px", children }) {
	return (
		<Box position='relative' p='3px' borderRadius='full' bg={hasStories ? (seen ? "whiteAlpha.400" : RING) : "transparent"}>
			<Box p='2px' borderRadius='full' bg='black'>
				<Avatar w={size} h={size} src={avatarUrl(user)} name={user?.username} referrerPolicy='no-referrer' />
			</Box>
			{children}
		</Box>
	);
}

// Horizontal tray at the top of the home feed, like Instagram's.
export default function StoriesBar() {
	const authUser = useAuthStore((state) => state.user);
	const me = authUser?.user || authUser;
	const { groups, isUploading, uploadStory, markSeen, deleteStory } = useStories();
	const [openIndex, setOpenIndex] = useState(null);
	const fileRef = useRef(null);

	const mine = groups?.find((g) => g.isMine);
	const others = groups?.filter((g) => !g.isMine) || [];
	const ordered = mine ? [mine, ...others] : others;

	const pickFile = () => fileRef.current?.click();
	const openGroup = (group) => setOpenIndex(ordered.indexOf(group));

	return (
		<>
			<Flex
				gap={{ base: 3, md: 4 }}
				overflowX='auto'
				px={{ base: 3, md: 1 }}
				py={3}
				mb={{ base: 1, md: 4 }}
				borderBottom={{ base: "1px solid", md: "none" }}
				borderColor='whiteAlpha.200'
				sx={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
			>
				<input
					ref={fileRef}
					type='file'
					accept='image/*,video/*'
					hidden
					onChange={(e) => {
						uploadStory(e.target.files[0]);
						e.target.value = "";
					}}
				/>

				{/* Your story: tap to watch if you have one, the + badge always adds another */}
				<Flex direction='column' alignItems='center' gap={1} flexShrink={0} w='74px'>
					<Box as='button' aria-label={mine ? "View your story" : "Add to your story"} onClick={mine ? () => openGroup(mine) : pickFile}>
						<StoryAvatar user={me} hasStories={!!mine} seen={mine?.allSeen}>
							<Box
								as='span'
								role='button'
								aria-label='Add to your story'
								onClick={(e) => {
									e.stopPropagation();
									pickFile();
								}}
								position='absolute'
								bottom='2px'
								right='2px'
								bg='blue.500'
								color='white'
								borderRadius='full'
								border='2px solid black'
								w='22px'
								h='22px'
								display='flex'
								alignItems='center'
								justifyContent='center'
							>
								{isUploading ? <Spinner size='xs' /> : <AddIcon boxSize='9px' />}
							</Box>
						</StoryAvatar>
					</Box>
					<Text fontSize='xs' color='gray.300' noOfLines={1}>
						Your story
					</Text>
				</Flex>

				{groups === null &&
					[0, 1, 2, 3].map((i) => (
						<Flex key={i} direction='column' alignItems='center' gap={1} flexShrink={0} w='74px'>
							<SkeletonCircle size='16' />
							<Skeleton h='8px' w='48px' />
						</Flex>
					))}

				{others.map((group) => (
					<Flex
						as='button'
						key={group.user._id}
						direction='column'
						alignItems='center'
						gap={1}
						flexShrink={0}
						w='74px'
						onClick={() => openGroup(group)}
						aria-label={`View ${group.user.username}'s story`}
					>
						<StoryAvatar user={group.user} hasStories seen={group.allSeen} />
						<Text fontSize='xs' color={group.allSeen ? "gray.500" : "gray.100"} noOfLines={1} maxW='74px'>
							{group.user.username}
						</Text>
					</Flex>
				))}
			</Flex>

			{openIndex !== null && ordered[openIndex] && (
				<StoryViewer
					groups={ordered}
					startGroup={openIndex}
					onClose={() => setOpenIndex(null)}
					onSeen={markSeen}
					onDelete={async (id) => {
						await deleteStory(id);
						setOpenIndex(null);
					}}
				/>
			)}
		</>
	);
}
