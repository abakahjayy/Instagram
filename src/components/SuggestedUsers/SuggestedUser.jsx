import { Flex,Avatar, VStack, Button, Link,Box } from "@chakra-ui/react";
import { ProfileUrl } from "../../utils/imageUrl";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/useAuthStore";
import { Link as RouterLi } from "react-router-dom";

export default function SuggestedUser({user,setUser}) {
    const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user?._id)
    const url =user?.profile_picture_id?ProfileUrl(user.profile_picture_id):'';
    const authUser = useAuthStore((state) => state.user);
    // console.log(user)
    // console.log(setUser)
        
    
	const onFollowUser = async () => {
		await handleFollowUser();
		// setUser({
		// 	...user,
		// 	followers: isFollowing
		// 		? user.followers.filter((follower) => follower.uid !== authUser.uid)
		// 		: [...user.followers, authUser._id],
		// });
        
	};

    return (
        <Flex w={'full'} alignItems={'center'} justifyContent={'space-between'}>
            <Flex w={'full'} alignItems={'center'} gap={2}>
                <Avatar src={url} size={'md'}/>
                <VStack spacing={2} alignItems={'flex-start'}>
                    <Link as={RouterLi} to={`/${user?.username}`}>
						<Box fontSize={12} fontWeight={"bold"}>
							{user?.username}
						</Box>
					</Link>
					<Box fontSize={11} color={"gray.500"}>
						{user?.followers.length} followers
					</Box>
                </VStack>
            </Flex>
            {authUser.username !== user?.username && (
                <Button bg={'transparent'}
                fontSize={14}
                fontWeight={'medium'}
                color={'blue.400'}
                cursor={'pointer'}
                size={'sm'}
                p={0}
                h={'max-content'}
                _hover={{ color: "white" }}
                isLoading={isUpdating}
                onClick={onFollowUser}>
                    {isFollowing ? "Unfollow" : "Follow"}
                </Button>
            )}
        </Flex>
    )
}
