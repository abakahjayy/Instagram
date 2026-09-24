import { useEffect, useState } from "react";
import { Box, Flex, Link, Spinner, Text } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import API from "../../utils/api";
import FeedPost from "../../components/FeedPosts/FeedPost";

// /p/:postId - a single post, the target of share links.
export default function PostPage() {
	const { postId } = useParams();
	const [post, setPost] = useState(undefined);

	useEffect(() => {
		const controller = new AbortController();
		setPost(undefined);
		API.get(`/api/v1/posts/${postId}`, { signal: controller.signal })
			.then(({ data }) => setPost(data.post))
			.catch((e) => e.message !== "canceled" && setPost(null));
		return () => controller.abort();
	}, [postId]);

	if (post === undefined) {
		return (
			<Flex justifyContent='center' py={20}>
				<Spinner />
			</Flex>
		);
	}
	if (post === null) {
		return (
			<Flex direction='column' alignItems='center' py={20} gap={3}>
				<Text fontSize='xl'>Sorry, this post isn&apos;t available.</Text>
				<Link as={RouterLink} to='/' color='blue.400'>
					Go back to Instagram
				</Link>
			</Flex>
		);
	}
	return (
		<Box maxW='470px' mx='auto' py={{ base: 0, md: 8 }} px={{ base: 0, md: 2 }}>
			<FeedPost post={post} />
		</Box>
	);
}
