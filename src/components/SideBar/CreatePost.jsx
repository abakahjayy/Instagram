import {
	Box,
	Button,
	CloseButton,
	Flex,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Textarea,
	Tooltip,
	useDisclosure,
} from "@chakra-ui/react";
import { CreatePostLogo } from "../../assets/constants";
import { BsCameraVideoFill, BsFillImageFill } from "react-icons/bs";
import { useRef, useState } from "react";
import usePreviewImg from "../../hooks/usePreviewing";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/useAuthStore";
import usePostStore from "../../store/usePostStore";
import useProfileStore from "../../store/userProfileStore";
import { useLocation } from "react-router-dom";
import { getAuthToken } from "../../utils/auth";

const CreatePost = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [caption, setCaption] = useState("");
	const imageRef = useRef(null);
	const {formDatas2,  handleImageChange, selectedFile, mediaType, setSelectedFile } = usePreviewImg({ allowVideo: true });
	const showToast = useShowToast();
	const { isLoading, handleCreatePost } = useCreatePost();

	const handlePostCreation = async () => {
		try {
			await handleCreatePost(formDatas2,selectedFile, caption);
			onClose();
			setCaption("");
			setSelectedFile(null);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<>
			<Tooltip
				hasArrow
				label={"Create"}
				placement='right'
				ml={1}
				openDelay={500}
				display={{ base: "block", xl: "none" }}
			>
				<Flex
					alignItems={"center"}
					gap={4}
					_hover={{ bg: "whiteAlpha.400" }}
					borderRadius={6}
					p={2}
					w={{ base: 10, xl: "full" }}
					justifyContent={{ base: "center", xl: "flex-start" }}
					onClick={onOpen}
				>
					<CreatePostLogo />
					<Box display={{ base: "none", xl: "block" }}>Create</Box>
				</Flex>
			</Tooltip>

			<Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} scrollBehavior='inside'>
				<ModalOverlay />

				<ModalContent bg={"black"} border={"1px solid gray"}>
					<ModalHeader>Create Post</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<Textarea
							placeholder='Post caption...'
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
						/>

						<Input type='file' accept='image/*,video/*' hidden ref={imageRef} onChange={handleImageChange} />

						<Flex
							as='button'
							type='button'
							onClick={() => imageRef.current.click()}
							mt={4}
							ml={1}
							gap={2}
							alignItems='center'
							fontSize='sm'
							color='gray.400'
							_hover={{ color: "white" }}
						>
							<BsFillImageFill size={16} />
							<BsCameraVideoFill size={18} />
							Add photo or video
						</Flex>
						{selectedFile && (
							<Flex mt={5} w={"full"} position={"relative"} justifyContent={"center"}>
								{mediaType === "video" ? (
									<video src={selectedFile} controls playsInline style={{ maxHeight: "60vh", width: "100%" }} />
								) : (
									<Image src={selectedFile} alt='Selected img' />
								)}
								<CloseButton
									position={"absolute"}
									top={2}
									right={2}
									onClick={() => {
										setSelectedFile(null);
									}}
								/>
							</Flex>
						)}
					</ModalBody>

					<ModalFooter>
						<Button mr={3} onClick={handlePostCreation} isLoading={isLoading}>
							Post
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreatePost;

function useCreatePost() {
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setAuthUser);
	const createPost = usePostStore((state) => state.createPost);
	const posts = usePostStore((state) => state.posts);
	
	const addPost = useProfileStore((state) => state.addPost);
	const { userProfile, setUserProfile } = useProfileStore();
	const { pathname } = useLocation();
	const apiUrl = import.meta.env.VITE_API_URL
	// console.log(authUser._id)
	const handleCreatePost = async (formDatas2,selectedFile, caption) => {
		if (isLoading) return;
		if (!selectedFile) throw new Error("Please select an image or video");
		setIsLoading(true);
		const newPost = {
			caption: caption,
			likes: [],
			comments: [],
			createdAt: Date.now(),
			createdBy: authUser._id,
		};

		try {
			formDatas2.append('caption',caption)
			// logged-in route: the author comes from the token, not the URL
			const data=await fetch(`${apiUrl}/api/v1/instagram/posts`,{
				method: 'POST',
				headers: { Authorization: `Bearer ${getAuthToken()}` },
				body: formDatas2,
			})
			const fr=await data.json()
			console.log(fr)
			if(fr.error){
				throw new Error(fr.error)
			}
			fr.newPost.postId&&setAuthUser({
				...authUser,
				posts: [...authUser.posts,fr.newPost.postId],
			});
			if (userProfile?.user?._id === authUser?._id){
				addPost(fr.user);
				createPost(fr.newPost);
			}
			console.log(posts)
			// if (pathname !== "/" && userProfile.user._id === authUser._id) addPost({ ...newPost, id: postDocRef.id });

			showToast("Success", "Post created successfully", "success");
		} catch (error) {
			const message = error.response?.data?.error || error.message
			showToast("Error", message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, handleCreatePost };
}