import { Box, Flex, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsBookmark } from "react-icons/bs";
import { FiDownload, FiSend, FiUser } from "react-icons/fi";
import { isInstalled } from "../../utils/install";

// Instagram's ☰ "More" menu at the bottom of the left rail.
export default function MoreMenu({ authUser, onLogout }) {
	const user = authUser?.user || authUser;
	const navigate = useNavigate();

	return (
		<Menu placement='top-start' isLazy>
			<Tooltip hasArrow label='More' placement='right' ml={1} openDelay={500} display={{ base: "block", xl: "none" }}>
				<MenuButton
					as={Flex}
					role='button'
					aria-label='More'
					alignItems='center'
					gap={4}
					_hover={{ bg: "ig.hover" }}
					borderRadius={6}
					p={2}
					w={{ base: 10, xl: "full" }}
					cursor='pointer'
				>
					<Flex alignItems='center' gap={4} justifyContent={{ base: "center", xl: "flex-start" }}>
						<RxHamburgerMenu size={25} />
						<Box display={{ base: "none", xl: "block" }}>More</Box>
					</Flex>
				</MenuButton>
			</Tooltip>
			<MenuList minW='250px' py={2} borderRadius='xl' boxShadow='dark-lg'>
				<MenuItem icon={<BsBookmark size={18} />} as={RouterLink} to={`/${user?.username}?tab=saved`}>
					Saved
				</MenuItem>
				{!isInstalled() && (
					<MenuItem icon={<FiDownload size={18} />} as={RouterLink} to='/download'>
						Get the app
					</MenuItem>
				)}
				{user?.role === "admin" && (
					<MenuItem icon={<FiSend size={18} />} as={RouterLink} to='/admin/updates'>
						Send an update
					</MenuItem>
				)}
				<MenuItem icon={<FiUser size={18} />} as='a' href='https://portfolio-8jmo.onrender.com/' target='_blank' rel='noreferrer'>
					About the developer
				</MenuItem>
				<MenuDivider borderColor='ig.border' />
				<MenuItem
					onClick={() => {
						onLogout(user?._id);
						navigate("/auth");
					}}
				>
					Switch accounts
				</MenuItem>
				<MenuItem onClick={() => onLogout(user?._id)}>Log out</MenuItem>
			</MenuList>
		</Menu>
	);
}
