import { Container,Flex, Skeleton, SkeletonCircle, VStack,Box, Text } from "@chakra-ui/react"
import FeedPost from "./FeedPost"
import { useEffect, useState } from "react"
import useGetFeedPosts from "../../hooks/useGetFeedPosts"

export default function FeedPosts({authUser}) {
    const { isLoading, posts }=useGetFeedPosts()
    // posts[0]&& console.log(posts)
    const user=authUser.user?authUser.user:authUser
    // console.log(user)
    return (
        <Container maxW={'container.sm'} py={10} px={2}>

            {/* For the Loading Skeleton of Instagram */}
            {isLoading&&[0,1,2,3].map((_,idx)=>(
                <VStack key={idx} gap={4} alignItems={'flex-start'} mb={10}>
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
					<Text fontSize={"md"} color={"red.400"}>
						Yo Guy. Looks like you don&apos;t have any friends.
					</Text>
					<Text color={"red.400"}>Stop coding and go make some!!</Text>
				</>
			)}
            
        </Container>
    )
}
