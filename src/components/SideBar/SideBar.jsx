import {Box, Flex,Link,Tooltip,Spinner} from '@chakra-ui/react'
import { Link as RouterLink } from "react-router-dom";
import {InstagramMobileLogo,InstagramLogo} from '../../assets/constants.jsx'
import { BiLogOut } from "react-icons/bi";
import SidebarItems from "./SidebarItems";
import useLogout from '../../hooks/useLogout.js';
import GetAppLink from './GetAppLink';

// Left navigation for tablets and up (phones use MobileNav).
// Width: 72px icon rail below `xl`, 240px with labels from `xl` (PageLayout sets the box).
// Height: spacing shrinks on short screens (laptops at 720px, landscape tablets) so
// every item - including Get the app and Logout - stays reachable; scrolls as a last resort.
export function SideBar({ authUser, onLogout}){
    const user=authUser?authUser.user||authUser:''
    const {isLoading}=useLogout()
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
                        <InstagramLogo/>
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
                        <InstagramMobileLogo />
                    </Link>

                    <Flex direction={"column"} gap='var(--nav-gap)' cursor={"pointer"} alignItems={{ base: "center", xl: "stretch" }}>
                        <SidebarItems authUser={authUser} onLogout={onLogout} />
                    </Flex>

                    {/* Get the app + Logout, pinned to the bottom */}
                    <Flex direction='column' gap='var(--nav-gap)' mt='auto' pt='var(--nav-gap)' alignItems={{ base: "center", xl: "stretch" }}>
                        <GetAppLink />
                        <Tooltip hasArrow label={"Logout"} placement='right' ml={1} openDelay={500} display={{ base: "block", xl: "none" }}>
                            <Flex
                                as='button'
                                onClick={()=>{onLogout(user._id)}}
                                alignItems={"center"}
                                gap={4}
                                _hover={{ bg: "whiteAlpha.400" }}
                                borderRadius={6}
                                p={2}
                                w={{ base: 10, xl: "full" }}
                                justifyContent={{ base: "center", xl: "flex-start" }}
                                aria-label='Logout'
                            >
                                {isLoading ? <Spinner size='sm' /> : <BiLogOut size={25} />}
                                <Box display={{ base: "none", xl: "block" }}>Logout</Box>
                            </Flex>
                        </Tooltip>
                    </Flex>
                </Flex>
        </Box>
    )
}
