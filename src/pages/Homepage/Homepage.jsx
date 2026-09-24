import { Box, Container, Flex } from "@chakra-ui/react";

import FeedPosts from "../../components/FeedPosts/FeedPosts";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";

export function Homepage({authUser,onLogout}){
    return <Container maxW={'container.lg'} px={{ base: 0, md: 4 }}>
        <Flex gap={{ base: 0, lg: 16 }} justifyContent='center'>
            <Box flex={2} py={{ base: 0, md: 6 }} minW={0} maxW='630px'>
                <FeedPosts authUser={authUser} onLogout={onLogout}/>
            </Box>
            <Box flex={1} display={{ base: "none", lg: "block" }} maxW={"320px"} minW='280px'>
                <SuggestedUsers authUser={authUser} onLogout={onLogout}/>
            </Box>
        </Flex>
        </Container>
}

