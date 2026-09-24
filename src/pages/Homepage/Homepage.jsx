import { Box, Container, Flex } from "@chakra-ui/react";

import FeedPosts from "../../components/FeedPosts/FeedPosts";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";

export function Homepage({authUser,onLogout}){
    return <Container maxW={'container.lg'}>
        <Flex gap={20}>
            <Box flex={2} py={10}>
                <FeedPosts authUser={authUser} onLogout={onLogout}/>
            </Box>
            <Box flex={3} mr={20} display={{ base: "none", lg: "block" }} maxW={"300px"}>
                <SuggestedUsers authUser={authUser} onLogout={onLogout}/>
            </Box>
        </Flex>
        </Container>
}

