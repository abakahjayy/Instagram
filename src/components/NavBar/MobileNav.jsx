import { Box, Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { NsoroLogo, MessagesLogo, NotificationsLogo, ReelsLogo, SearchLogo } from "../../assets/constants";
import CreatePost from "../SideBar/CreatePost";
import ProfileLink from "../SideBar/ProfileLink";
import { UnreadBadge } from "../SideBar/Notifications";
import useNotificationStore from "../../store/useNotificationStore";
import useInboxStore from "../../store/useInboxStore";

// Phone layout (below the `md` breakpoint), like the Instagram app: a top bar with the
// logo + activity/messages, and a fixed bottom tab bar. PageLayout hides the sidebar there.
export const MOBILE_TOP_BAR_H = "56px";
export const MOBILE_BOTTOM_BAR_H = "56px";

const IconLink = ({ to, label, children }) => (
	<Link as={RouterLink} to={to} aria-label={label} p={2} display='flex' alignItems='center' justifyContent='center'>
		{children}
	</Link>
);

export function MobileTopBar() {
	const unread = useNotificationStore((state) => state.unread);
	const unreadMessages = useInboxStore((state) => state.unread);
	return (
		<Flex
			display={{ base: "flex", md: "none" }}
			position='sticky'
			top={0}
			zIndex={20}
			h={MOBILE_TOP_BAR_H}
			px={3}
			alignItems='center'
			justifyContent='space-between'
			bg='ig.bg'
			borderBottom='1px solid'
			borderColor='ig.border'
		>
			<Link as={RouterLink} to='/' aria-label='Home' transform='scale(0.8)' transformOrigin='left center'>
				<NsoroLogo />
			</Link>
			<Flex gap={1}>
				<IconLink to='/notifications' label='Notifications'>
					<Box position='relative'>
						<NotificationsLogo />
						<UnreadBadge count={unread} />
					</Box>
				</IconLink>
				<IconLink to='/messages' label='Messages'>
					<Box position='relative'>
						<MessagesLogo />
						<UnreadBadge count={unreadMessages} />
					</Box>
				</IconLink>
			</Flex>
		</Flex>
	);
}

export function MobileBottomNav({ authUser, onLogout }) {
	return (
		<Flex
			display={{ base: "flex", md: "none" }}
			position='fixed'
			bottom={0}
			left={0}
			right={0}
			zIndex={20}
			h={MOBILE_BOTTOM_BAR_H}
			pb='env(safe-area-inset-bottom)'
			bg='ig.bg'
			borderTop='1px solid'
			borderColor='ig.border'
			alignItems='center'
			justifyContent='space-around'
		>
			<IconLink to='/' label='Home'>
				<AiFillHome size={25} />
			</IconLink>
			<IconLink to='/search' label='Search'>
				<SearchLogo />
			</IconLink>
			<CreatePost />
			<IconLink to='/reels' label='Reels'>
				<ReelsLogo />
			</IconLink>
			<ProfileLink authUser={authUser} onLogout={onLogout} />
		</Flex>
	);
}
