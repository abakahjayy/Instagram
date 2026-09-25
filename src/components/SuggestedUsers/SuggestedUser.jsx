import { Avatar, Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { avatarUrl } from "../../utils/media";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/useAuthStore";

// One row of "Suggested for you", styled like instagram.com's right column.
export default function SuggestedUser({ user }) {
	const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user?._id);
	const authUser = useAuthStore((state) => state.user);
	const me = authUser?.user || authUser;
	const mutuals = user?.mutuals || [];
	const subtitle = mutuals.length
		? `Followed by ${mutuals[0]}${mutuals.length > 1 ? ` + ${mutuals.length - 1} more` : ""}`
		: "Suggested for you";

	return (
		<Flex w='full' alignItems='center' gap={3}>
			<Link as={RouterLink} to={`/${user?.username}`} flexShrink={0}>
				<Avatar src={avatarUrl(user)} name={user?.username} w='44px' h='44px' referrerPolicy='no-referrer' />
			</Link>
			<Box flex={1} minW={0}>
				<Link as={RouterLink} to={`/${user?.username}`} fontWeight='semibold' fontSize='sm' noOfLines={1}>
					{user?.username}
				</Link>
				<Text fontSize='xs' color='ig.secondary' noOfLines={1}>
					{subtitle}
				</Text>
			</Box>
			{me?.username !== user?.username && (
				<Button
					variant='unstyled'
					h='auto'
					minW={0}
					fontSize='xs'
					fontWeight='semibold'
					color={isFollowing ? "ig.text" : "ig.link"}
					_hover={{ color: isFollowing ? "ig.secondary" : "white" }}
					isLoading={isUpdating}
					onClick={handleFollowUser}
				>
					{isFollowing ? "Following" : "Follow"}
				</Button>
			)}
		</Flex>
	);
}
