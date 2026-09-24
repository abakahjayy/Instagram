import { Avatar, Box, Link, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { avatarUrl } from "../../utils/media";
// import useAuthStore from "../../store/authStore";
// let authUser;
const ProfileLink = ({authUser,onLogout}) => {
	const user=authUser.user?authUser.user:authUser
	const url = avatarUrl(user);
	// const authUser = useAuthStore((state) => state.user);

	return (
		<Tooltip
			hasArrow
			label={"Profile"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", xl: "none" }}
		>
			<Link
				display={"flex"}
				to={`/${user.username}`}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, xl: "full" }}
				justifyContent={{ base: "center", xl: "flex-start" }}
			>
				<Avatar size={"sm"} src={url} name={user.username} referrerPolicy='no-referrer' />
				<Box display={{ base: "none", xl: "block" }}>Profile</Box>
			</Link>
		</Tooltip>
	);
};

export default ProfileLink;
