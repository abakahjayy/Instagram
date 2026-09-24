import { Box, Link, Tooltip } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { Link as RouterLink } from "react-router-dom";
import { MessagesLogo } from "../../assets/constants";

const Messages = () => {
    return (
        <Tooltip
            hasArrow
            label={"Home"}
            placement='right'
            ml={1}
            openDelay={500}
            display={{ base: "block", md: "none" }}
        >
            <Link
                display={"flex"}
                to={"/messages"}
                as={RouterLink}
                alignItems={"center"}
                gap={4}
                _hover={{ bg: "whiteAlpha.400" }}
                borderRadius={6}
                p={2}
                w={{ base: 10, md: "full" }}
                justifyContent={{ base: "center", md: "flex-start" }}
            >
                <MessagesLogo size={25}/>
                <Box display={{ base: "none", md: "block" }}>Messages</Box>
            </Link>
        </Tooltip>
    );
};

export default Messages;
