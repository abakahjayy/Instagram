import { Box, Button, Flex, Input, InputGroup, InputRightElement, Text, useDisclosure } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { CommentLogo, NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import usePostComment from "../../hooks/usePostComment";
import useAuthStore from "../../store/useAuthStore";
import useLikePost from "../../hooks/useLikePost";
import { timeAgo } from "../../utils/timeAgo";
import CommentsModal from "../Modals/CommentsModal";
import useSavePost from "../../hooks/useSavePost";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { FiSend } from "react-icons/fi";
import { sharePost } from "../../utils/share";
import useShowToast from "../../hooks/useShowToast";

// `likeState` lets FeedPost share one useLikePost with its double-tap-to-like media.
const PostFooter = ({ post, isProfilePage, creatorProfile, likeState }) => {
	const { isCommenting, handlePostComment } = usePostComment();
	const [comment, setComment] = useState("");
	const authUser = useAuthStore((state) => state.user);
	const commentRef = useRef(null);
	const ownLikeState = useLikePost(post);
	const { handleLikePost, isLiked, likes } = likeState || ownLikeState;
	const { isSaved, toggleSave } = useSavePost(post);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const showToast = useShowToast();

	const handleShare = async () => {
		const result = await sharePost(post, creatorProfile?.username);
		if (result === "copied") showToast("Link copied", "", "success", 1500);
		if (result === "failed") showToast("Couldn't share", "Copy the address bar instead", "error");
	};

	const handleSubmitComment = async () => {
		await handlePostComment(post?._id, comment);
		setComment("");
	};

	return (
		<Box mb={{ base: 6, md: 10 }} marginTop={"auto"}>
			<Flex alignItems={"center"} gap={4} w={"full"} pt={0} mb={2} mt={{ base: 2, md: 4 }}>
				<Box as='button' aria-label={isLiked ? "Unlike" : "Like"} onClick={handleLikePost} fontSize={18}>
					{!isLiked ? <NotificationsLogo /> : <UnlikeLogo />}
				</Box>

				<Box as='button' aria-label='Comment' fontSize={18} onClick={() => commentRef.current?.focus()}>
					<CommentLogo />
				</Box>

				<Box as='button' aria-label='Share' fontSize={22} onClick={handleShare}>
					<FiSend />
				</Box>

				<Box
					as='button'
					aria-label={isSaved ? "Remove from saved" : "Save"}
					ml='auto'
					fontSize={22}
					onClick={toggleSave}
				>
					{isSaved ? <BsBookmarkFill /> : <BsBookmark />}
				</Box>
			</Flex>
			<Text fontWeight={600} fontSize={"sm"}>
				{likes} {likes === 1 ? "like" : "likes"}
			</Text>

			{isProfilePage && (
				<Text fontSize='12' color={"gray"}>
					Posted {timeAgo(post.created)}
				</Text>
			)}

			{!isProfilePage && (
				<>
					<Text fontSize='sm' fontWeight={700}>
						{creatorProfile?.username}{" "}
						<Text as='span' fontWeight={400}>
							{post?.caption}
						</Text>
					</Text>
					{post?.comments[0]&& (
						<Text fontSize='sm' color={"gray"} cursor={"pointer"} onClick={onOpen}>
							View all {post?.comments.length} comments
						</Text>
					)}
					{/* COMMENTS MODAL ONLY IN THE HOME PAGE */}
					{isOpen ? <CommentsModal isOpen={isOpen} onClose={onClose} post={post} /> : null}
				</>
			)}

			{authUser && (
				<Flex alignItems={"center"} gap={2} justifyContent={"space-between"} w={"full"}>
					<InputGroup>
						<Input
							variant={"flushed"}
							placeholder={"Add a comment..."}
							fontSize={14}
							onChange={(e) => setComment(e.target.value)}
							value={comment}
							ref={commentRef}
						/>
						<InputRightElement>
							<Button
								fontSize={14}
								color={"blue.500"}
								fontWeight={600}
								cursor={"pointer"}
								_hover={{ color: "white" }}
								bg={"transparent"}
								onClick={handleSubmitComment}
								isLoading={isCommenting}
							>
								Post
							</Button>
						</InputRightElement>
					</InputGroup>
				</Flex>
			)}
		</Box>
	);
};

export default PostFooter;
