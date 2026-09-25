import { Avatar, AvatarGroup, Box, Flex, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MessagesLogo } from "../../assets/constants";
import { UnreadBadge } from "../SideBar/Notifications";
import useInboxStore from "../../store/useInboxStore";
import { avatarUrl } from "../../utils/media";

// instagram.com's floating "Messages" pill (bottom right, tablets and up):
// unread count + the people from your latest conversations.
export default function MessagesPill() {
	const { unread, recent } = useInboxStore();
	return (
		<Flex
			as={RouterLink}
			to='/messages'
			display={{ base: "none", md: "flex" }}
			position='fixed'
			bottom={6}
			right={6}
			zIndex={900}
			alignItems='center'
			gap={3}
			pl={5}
			pr={recent.length ? 3 : 6}
			h='56px'
			borderRadius='full'
			bg='ig.surface'
			boxShadow='0 4px 12px rgba(0,0,0,0.5)'
			_hover={{ bg: "#262a30" }}
			aria-label={unread ? `Messages, ${unread} unread` : "Messages"}
		>
			<Box position='relative'>
				<MessagesLogo />
				<UnreadBadge count={unread} />
			</Box>
			<Text fontWeight='semibold' fontSize='md'>
				Messages
			</Text>
			{recent.length > 0 && (
				<AvatarGroup size='sm' max={3} spacing='-8px' ml={2}>
					{recent.map((u) => (
						<Avatar key={u._id} name={u.username} src={avatarUrl(u)} referrerPolicy='no-referrer' borderColor='ig.surface' />
					))}
				</AvatarGroup>
			)}
		</Flex>
	);
}
