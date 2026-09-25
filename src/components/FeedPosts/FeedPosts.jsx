import { Container,Flex, Skeleton, SkeletonCircle, VStack,Box, Text } from "@chakra-ui/react"
import FeedPost from "./FeedPost"
import StoriesBar from "../Stories/StoriesBar"
import GetAppBanner from "../NavBar/GetAppBanner"
import { Link as RouterLink } from "react-router-dom"
import { Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import useGetFeedPosts from "../../hooks/useGetFeedPosts"

export default function FeedPosts({authUser}) {
    const { isLoading, posts }=useGetFeedPosts()
    // posts[0]&& console.log(posts)
    const user=authUser.user?authUser.user:authUser
    // console.log(user)
    return (
        <Container maxW={'470px'} py={0} px={0}>
            <GetAppBanner />
            <StoriesBar />

            {/* For the Loading Skeleton of Instagram */}
            {isLoading&&[0,1,2,3].map((_,idx)=>(
                <VStack key={idx} gap={4} alignItems={'flex-start'} mb={10} px={{ base: 3, md: 0 }}>
                    <Flex gap={2} alignItems={'center'}>
                        <SkeletonCircle size={10}/>
                        <VStack gap={2} alignItems={'flex-start'}>
                            <Skeleton height={'10px'} w={'200px'}/>
                            <Skeleton height={'10px'} w={'100px'}/>
                        </VStack>
                    </Flex>
                    <Skeleton w={'full'}>
                        <Box h={400}>
                            contents wrapped
                        </Box>
                    </Skeleton>

                </VStack>
            ))}
            {!isLoading&&posts[0]&&(
                <>
                    {posts.map((post)=>{
                        return <FeedPost key={post._id} post={post} img={'/img1.png'} avatar={'/img1.png'} username={'Francaaa'}/>
                    })}
                </>
            )}
            {!isLoading && posts.length === 0 && (
				<>
					<VStack py={12} px={6} spacing={3} textAlign={"center"}>
						<Text fontSize={"xl"} fontWeight={"bold"}>Welcome to Nsoro</Text>
						<Text color={"gray.400"}>Follow people to see their photos and videos here.</Text>
						<Button as={RouterLink} to='/search' colorScheme='blue' size='sm'>Find people</Button>
					</VStack>
				</>
			)}
            
        </Container>
    )
}
