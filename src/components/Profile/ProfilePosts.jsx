import { Box, Flex, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import ProfilePost from "./ProfilePost";
import { FiCamera } from "react-icons/fi";
import useGetUserPosts from "../../hooks/useGetUserPosts";


const ProfilePosts = ({ user }) => {
	const { isLoading, posts } = useGetUserPosts()
	// let isLoading= !true;
	// posts[0]&&console.log(posts)
	const noPostsFound =!posts[0]&& !isLoading && posts?.length === 0;
	if (noPostsFound) return <NoPostsFound />;

	return (
		<Grid
			templateColumns={"repeat(3, 1fr)"}
			gap={1}
			columnGap={1}
		>
			{isLoading &&
				[0, 1, 2].map((_, idx) => (
					<VStack key={idx} alignItems={"flex-start"} gap={4}>
						<Skeleton w={"full"}>
							<Box h='300px'>contents wrapped</Box>
						</Skeleton>
					</VStack>
				))}

			{!isLoading &&posts[0] &&(
				<>
					{posts?.map((post) => (
						<ProfilePost post={post} key={post._id} />
					))}
				</>
			)}
		</Grid>
	);
};

export default ProfilePosts;

const NoPostsFound = () => {
	return (
		<Flex flexDir='column' alignItems='center' textAlign={"center"} mx={"auto"} mt={{ base: 10, md: 16 }} px={6} gap={3}>
			<Flex w='62px' h='62px' borderRadius='full' border='2px solid' borderColor='whiteAlpha.800' alignItems='center' justifyContent='center'>
				<FiCamera size={28} />
			</Flex>
			<Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight='extrabold'>
				No posts yet
			</Text>
		</Flex>
	);
};
