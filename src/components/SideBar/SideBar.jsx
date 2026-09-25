import {Box, Flex,Link} from '@chakra-ui/react'
import { Link as RouterLink } from "react-router-dom";
import { NsoroMark, NsoroLogo } from '../../assets/constants.jsx'
import SidebarItems from "./SidebarItems";
import MoreMenu from './MoreMenu';

// Left navigation for tablets and up (phones use MobileNav).
// Width: 72px icon rail below `xl`, 240px with labels from `xl` (PageLayout sets the box).
// Height: spacing shrinks on short screens (laptops at 720px, landscape tablets) so
// every item - including the More menu - stays reachable; scrolls as a last resort.
export function SideBar({ authUser, onLogout}){
    return(
        <Box
            height={'100dvh'}
            borderRight={'1px solid'}
            borderColor={'whiteAlpha.300'}
            position={'sticky'}
            top={0}
            left={0}
            px={{ base: 2, xl: 4 }}
            overflowY='auto'
            sx={{
                "--nav-pad": "32px",
                "--nav-gap": "20px",
                "--nav-logo-gap": "40px",
                "@media (max-height: 800px)": { "--nav-pad": "20px", "--nav-gap": "10px", "--nav-logo-gap": "24px" },
                "@media (max-height: 650px)": { "--nav-pad": "12px", "--nav-gap": "4px", "--nav-logo-gap": "12px" },
                py: "var(--nav-pad)",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
            >
                <Flex direction={'column'} w={'full'} minH={'full'} alignItems={{ base: "center", xl: "stretch" }}>
                    <Link to={"/"} as={RouterLink} pl={2} display={{ base: "none", xl: "block" }} cursor='pointer' mb='var(--nav-logo-gap)'>
                        <NsoroLogo />
                    </Link>
                    <Link
                        to={"/"}
                        as={RouterLink}
                        p={2}
                        display={{ base: "block", xl: "none" }}
                        borderRadius={6}
                        _hover={{ bg: "whiteAlpha.200" }}
                        w={10}
                        cursor='pointer'
                        mb='var(--nav-logo-gap)'
                        aria-label='Home'
                    >
                        <NsoroMark size={26} />
                    </Link>

                    <Flex direction={"column"} gap='var(--nav-gap)' cursor={"pointer"} alignItems={{ base: "center", xl: "stretch" }}>
                        <SidebarItems authUser={authUser} onLogout={onLogout} />
                    </Flex>

                    {/* ☰ More (Saved, Get the app, Log out...), pinned to the bottom like Instagram */}
                    <Flex direction='column' mt='auto' pt='var(--nav-gap)' alignItems={{ base: "center", xl: "stretch" }}>
                        <MoreMenu authUser={authUser} onLogout={onLogout} />
                    </Flex>
                </Flex>
        </Box>
    )
}
