import { Avatar, Box, Button, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useFollowUser from "../../hooks/useFollowUser";
import { timeAgo } from "../../utils/timeAgo";
import { ProfileUrl } from "../../utils/imageUrl";
import useAuthStore from "../../store/useAuthStore";

const PostHeader = ({ post, creatorProfile,profileImageUrl,imageLoading }) => {
        const { handleFollowUser, isFollowing, isUpdating } = useFollowUser(post.createdBy);
        const UseAuth = useAuthStore((state) => state.user);
        let url =ProfileUrl(creatorProfile?.profile_picture_id)//||''
        let visitingAnotherProfileAndAuth = UseAuth &&creatorProfile && creatorProfile.username !== UseAuth.username
        // UseAuth &&creatorProfile && creatorProfile.username&&console.log(visitingAnotherProfileAndAuth)


        // console.log(creatorProfile)
        // setTimeout(() => {
            
        // }, 100);
        // creatorProfile&&console.log(post,creatorProfile);
        // let visitingOwnProfileAndAuth =UseAuth&& user && user.username === owner;
    
        return (
            <Flex justifyContent={"space-between"} alignItems={"center"} w={"full"} my={2}>
                <Flex alignItems={"center"} gap={2}>
                    {profileImageUrl ? (
                        <Link to={`/${creatorProfile.username}`}>
                            <Avatar src={profileImageUrl} alt='user profile pic' size={"sm"} />
                        </Link>
                    ) : (
                        <SkeletonCircle size='10' />
                    )}
    
                    <Flex fontSize={12} fontWeight={"bold"} gap='2'>
                        {creatorProfile ? (
                            <Link to={`/${creatorProfile.username}`}>{creatorProfile.username}</Link>
                        ) : (
                            <Skeleton w={"100px"} h={"10px"} />
                        )}
    
                        <Box color={"gray.500"}>• {timeAgo(post.created)}</Box>
                    </Flex>
                </Flex>
                {UseAuth &&creatorProfile && creatorProfile.username&&visitingAnotherProfileAndAuth&&(<Box cursor={"pointer"}>
                    <Button
                        size={"xs"}
                        bg={"transparent"}
                        fontSize={12}
                        color={"blue.500"}
                        fontWeight={"bold"}
                        _hover={{
                            color: "white",
                        }}
                        transition={"0.2s ease-in-out"}
                        onClick={handleFollowUser}
                        isLoading={isUpdating}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                </Box>)}
            </Flex>
        );
    };
    
    export default PostHeader;
    