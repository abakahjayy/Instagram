import { Box, Link, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MessagesLogo } from "../../assets/constants";
import { UnreadBadge } from "./Notifications";
import useInboxStore from "../../store/useInboxStore";

const Messages = () => {
	const unread = useInboxStore((state) => state.unread);
	return (
		<Tooltip hasArrow label={"Messages"} placement='right' ml={1} openDelay={500} display={{ base: "block", xl: "none" }}>
			<Link
				display={"flex"}
				to={"/messages"}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "ig.hover" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, xl: "full" }}
				justifyContent={{ base: "center", xl: "flex-start" }}
			>
				<Box position='relative'>
					<MessagesLogo size={25} />
					<UnreadBadge count={unread} />
				</Box>
				<Box display={{ base: "none", xl: "block" }}>Messages</Box>
			</Link>
		</Tooltip>
	);
};

export default Messages;
