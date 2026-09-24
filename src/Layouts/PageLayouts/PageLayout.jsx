
import Navbar from "../../components/NavBar/Navbar.jsx";
import { Flex,Box,Spinner,Link } from "@chakra-ui/react";
import { FiBriefcase } from "react-icons/fi";
import {SideBar} from '../../components/SideBar/SideBar.jsx'
import { MobileBottomNav, MobileTopBar, MOBILE_BOTTOM_BAR_H } from "../../components/NavBar/MobileNav.jsx";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore.js";
import { useNotificationsSync } from "../../hooks/useNotifications.js";

const PageLayout = ({ authUser, onLogout, children }) => {
    const {isLoading } = useAuthStore()
    const { pathname } = useLocation();
    let user=authUser?authUser.user||authUser:null
	const checkingUserIsAuth = !user && isLoading;
	const canRenderSidebar = pathname !== "/auth"&&user;
    const canRenderNavbar =pathname !== "/auth"&&!user;
    // An open chat is full-screen on phones, like the Instagram app.
    const inChat = pathname.startsWith("/messages/");
    const showMobileBars = canRenderSidebar && !inChat;
    useNotificationsSync(!!canRenderSidebar);
    if (checkingUserIsAuth) return <PageLayoutSpinner />;
    return (
            <Flex flexDir={canRenderNavbar ? "column" : "row"}>
                {/* side bar on the left - tablet and up; phones get MobileTopBar/MobileBottomNav */}
                {canRenderSidebar?(
                <Box w={'240px'} flexShrink={0} display={{ base: "none", md: "block" }}>
                    <SideBar authUser={authUser} onLogout={onLogout}/>
                </Box>):null
                }
                {/* Navbar on the top */}
                {canRenderNavbar ? <Navbar authUser={authUser} onLogout={onLogout}  /> : null}

                {/* content on the right */}
                <Box flex={1} minW={0} pb={{ base: showMobileBars ? MOBILE_BOTTOM_BAR_H : 0, md: 0 }}>
                    {showMobileBars && <MobileTopBar />}
                    {children}
                </Box>
                {showMobileBars && <MobileBottomNav authUser={authUser} onLogout={onLogout} />}

                {/* Portfolio badge - this is a clone/demo project */}
                <Link
                    href="https://portfolio-8jmo.onrender.com/"
                    isExternal
                    position="fixed"
                    bottom={{ base: showMobileBars ? "68px" : 4, md: 4 }}
                    right={4}
                    zIndex={1000}
                    display={inChat ? { base: "none", md: "flex" } : "flex"}
                    alignItems="center"
                    gap={1}
                    px={3}
                    py={2}
                    borderRadius="full"
                    bg="blackAlpha.700"
                    color="white"
                    fontSize="xs"
                    backdropFilter="blur(4px)"
                    _hover={{ bg: "blackAlpha.900" }}
                >
                    <FiBriefcase size={12} /> Portfolio
                </Link>
            </Flex>
    );
};

export default PageLayout;

const PageLayoutSpinner = () => {
	return (
		<Flex flexDir='column' h='100vh' alignItems='center' justifyContent='center'>
			<Spinner size='xl' />
		</Flex>
	);
};
