import { Box, Link, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { NotificationsLogo } from "../../assets/constants";
import useNotificationStore from "../../store/useNotificationStore";

// Red dot/count over an icon, like Instagram's activity badge.
export const UnreadBadge = ({ count }) =>
	count > 0 ? (
		<Box
			position='absolute'
			top='-4px'
			right='-6px'
			bg='red.500'
			color='white'
			fontSize='10px'
			fontWeight='bold'
			borderRadius='full'
			minW='16px'
			h='16px'
			px='4px'
			display='flex'
			alignItems='center'
			justifyContent='center'
		>
			{count > 99 ? "99+" : count}
		</Box>
	) : null;

const Notifications = () => {
	const unread = useNotificationStore((state) => state.unread);
	return (
		<Tooltip hasArrow label={"Notifications"} placement='right' ml={1} openDelay={500} display={{ base: "block", md: "none" }}>
			<Link
				display={"flex"}
				to={"/notifications"}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
			>
				<Box position='relative'>
					<NotificationsLogo />
					<UnreadBadge count={unread} />
				</Box>
				<Box display={{ base: "none", md: "block" }}>Notifications</Box>
			</Link>
		</Tooltip>
	);
};

export default Notifications;
