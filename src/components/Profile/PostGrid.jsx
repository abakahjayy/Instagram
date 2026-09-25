import { useState } from "react";
import { Grid, GridItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Skeleton, Text } from "@chakra-ui/react";
import PostMedia from "../FeedPosts/PostMedia";
import FeedPost from "../FeedPosts/FeedPost";

// 3-column square grid (Explore, Saved, Likes). Tapping a tile opens the full post -
// header, media, likes, comments - read-only as far as deleting goes, since these
// posts can belong to anyone.
export default function PostGrid({ posts, emptyText = "No posts yet." }) {
	const [openPost, setOpenPost] = useState(null);

	return (
		<>
			<Grid templateColumns='repeat(3, 1fr)' gap={1}>
				{posts === null && Array.from({ length: 9 }, (_, i) => <Skeleton key={i} aspectRatio={1} />)}
				{posts?.map((post) => (
					<GridItem
						key={post._id}
						aspectRatio={1}
						overflow='hidden'
						cursor='pointer'
						onClick={() => setOpenPost(post)}
						_hover={{ opacity: 0.85 }}
					>
						<PostMedia post={post} variant='thumb' />
					</GridItem>
				))}
			</Grid>
			{posts?.length === 0 && (
				<Text color='gray.400' textAlign='center' mt={10}>
					{emptyText}
				</Text>
			)}

			<Modal isOpen={!!openPost} onClose={() => setOpenPost(null)} size={{ base: "full", md: "xl" }} scrollBehavior='inside'>
				<ModalOverlay />
				<ModalContent bg='ig.bg'>
					<ModalCloseButton zIndex={2} />
					<ModalBody pt={10}>{openPost && <FeedPost post={openPost} />}</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}
