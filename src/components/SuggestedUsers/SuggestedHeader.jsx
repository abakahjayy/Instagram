import { Avatar, Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { avatarUrl } from "../../utils/media";

// Your account at the top of the right column, with Instagram's "Switch".
export default function SuggestedHeader({ user, onLogout }) {
	const navigate = useNavigate();
	const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
	return (
		<Flex w='full' alignItems='center' gap={3}>
			<Link as={RouterLink} to={`/${user.username}`} flexShrink={0}>
				<Avatar src={avatarUrl(user)} name={user.username} w='44px' h='44px' referrerPolicy='no-referrer' />
			</Link>
			<Box flex={1} minW={0}>
				<Link as={RouterLink} to={`/${user.username}`} fontWeight='semibold' fontSize='sm' noOfLines={1}>
					{user.username}
				</Link>
				<Text fontSize='sm' color='ig.secondary' noOfLines={1}>
					{fullName}
				</Text>
			</Box>
			<Button
				variant='unstyled'
				h='auto'
				minW={0}
				fontSize='xs'
				fontWeight='semibold'
				color='ig.link'
				_hover={{ color: "white" }}
				onClick={() => {
					onLogout(user._id);
					navigate("/auth");
				}}
			>
				Switch
			</Button>
		</Flex>
	);
}
