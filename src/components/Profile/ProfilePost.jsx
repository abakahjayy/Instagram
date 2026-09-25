import {
	Avatar,
	Button,
	Divider,
	Flex,
	GridItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Text,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Comment from "../Comment/Comment";
import Caption from "../Comment/Caption";
import PostFooter from "../FeedPosts/PostFooter";
import PostMedia from "../FeedPosts/PostMedia";
import { avatarUrl } from "../../utils/media";
import useProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/useAuthStore";
import useShowToast from "../../hooks/useShowToast";
import usePostStore from "../../store/usePostStore";
import API from "../../utils/api";
import { useState } from "react";

export default function ProfilePost({post}) {
  const { isOpen, onOpen, onClose } = useDisclosure();//This is use for the modal setup
  const {userProfile} = useProfileStore()
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const deletePost = useProfileStore((state) => state.deletePost);
  const creatorAvatar = avatarUrl(userProfile?.user);
  // console.log(post)

  const handleDeletePost = async () => {
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		if (isDeleting) return;
    setIsDeleting(true);
		try {
			// logged-in route: only the author can delete
			const response =await API.delete(`/api/v1/instagram/posts/${post._id}`)
      let posts = response.data
      console.log(posts)
			deletePost(posts.user);
			showToast("Success", "Post deleted successfully", "success");
      
		} catch (error) {
			const message = error.response?.data?.error || error.message
				if(error.message==='canceled')return
        showToast("Error", message, "error");
		} finally {
			setIsDeleting(false);
      onClose()
		}
	};

  return (
    <>
        <GridItem
          cursor={"pointer"}
          borderRadius={4}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"whiteAlpha.300"}
          position={"relative"}
          aspectRatio={1 / 1}
          onClick={onOpen}
        >
          <Flex
            opacity={0}
            _hover={{opacity:1}}
            position={"absolute"}
            top={0}
            right={0}
            bottom={0}
            left={0}
            bg={'blackAlpha.700'}
            transition={'all 0.3s ease'}
            zIndex={1}
            justifyContent={'center'}
          >
            <Flex alignItems={'center'} justifyContent={'center'} gap={50}>
              {/* likes */}
              <Flex>
                <AiFillHeart size={20} />
                <Text fontWeight={"bold"} ml={2}>
                  {post?.likes.length}
                </Text>
              </Flex>
              {/* Comments */}
              <Flex>
                <FaComment size={20} />
                <Text fontWeight={"bold"} ml={2}>
                  {post?.comments.length}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <PostMedia post={post} variant="thumb" />
        </GridItem>


        {/* Adding the Modal here */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered={true} size={{ base: "full", md: "5xl" }} scrollBehavior='inside'>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody bg={"ig.bg"} pb={5}>
            <Flex
              gap='4'
              direction={{ base: "column", md: "row" }}
              w={{ base: "full", md: "full" }}
              mx={"auto"}
              maxH={{ base: "none", md: "90vh" }}
              minH={"50vh"}
              pt={{ base: 8, md: 0 }}
            >
              {/* Image */}
              <Flex
                borderRadius={4}
                overflow={"hidden"}
                border={"1px solid"}
                borderColor={"whiteAlpha.300"}
                flex={1.5}
                justifyContent={"center"}
                alignItems={"center"}
              >
                {/* only mounted while the modal is open, so the video stops when it closes */}
                <PostMedia post={post} variant="full" />
              </Flex>

              {/* Second Half Of the Modal */}
              <Flex flex={1} flexDir={"column"} px={{ base: 1, md: 10 }}>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Flex alignItems={"center"} gap={4}>
                    <Avatar src={creatorAvatar} referrerPolicy='no-referrer' size={"sm"} name={userProfile?.user?.username} />
                    <Text fontWeight={"bold"} fontSize={12}>
                      {userProfile?.user?.username}
                    </Text>
                  </Flex>

                  {authUser?._id === userProfile?.user?._id && (
                    <Button
                      size={"sm"}
                      bg={"transparent"}
                      _hover={{ bg: "whiteAlpha.300", color: "red.600" }}
                      borderRadius={4}
                      p={1}
                      onClick={handleDeletePost}
                      isLoading={isDeleting}
                    >
                      <MdDelete size={20} cursor='pointer' />
                    </Button>
                  )}
                </Flex>
                <Divider my={4} bg={"gray.500"} />

                <VStack w='full' alignItems={"start"} maxH={"350px"}
                overflowY={"auto"}
                >
                  {/* CAPTION */}
                  {post.caption &&
                    <Caption post={post}/>
                  }

                  {/* COMMENTS */}
                  {post.comments[0]&&post.comments.map((comment) => (
                    <Comment key={comment?._id} comment={comment} />
                  ))}
                </VStack>
                <Divider my={4} bg={"gray.800"} />
                <PostFooter isProfilePage={true} post={post} />
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
