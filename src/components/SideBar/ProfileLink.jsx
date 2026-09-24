import { Avatar, Box, Link, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ProfileUrl } from "../../utils/imageUrl";
// import useAuthStore from "../../store/authStore";
// let authUser;
const ProfileLink = ({authUser,onLogout}) => {
	const user=authUser.user?authUser.user:authUser
	const url =user.profile_picture_id?ProfileUrl(user.profile_picture_id):'';
	// const authUser = useAuthStore((state) => state.user);

	return (
		<Tooltip
			hasArrow
			label={"Profile"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
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
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
			>
				<Avatar size={"sm"} src={url||''} />
				<Box display={{ base: "none", md: "block" }}>Profile</Box>
			</Link>
		</Tooltip>
	);
};

export default ProfileLink;
