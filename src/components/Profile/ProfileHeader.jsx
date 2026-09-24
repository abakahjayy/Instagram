import { Avatar, AvatarGroup, Button, Flex, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState ,useRef} from "react";
import EditProfile from "./EditProfile";
import { ProfileUrl } from "../../utils/imageUrl";
import useAuthStore from "../../store/useAuthStore";
import useFollowUser from "../../hooks/useFollowUser";
import { Link as RouterLink } from "react-router-dom";

export default function ProfileHeader({authUser,onLogout,username,owner}) {
      const user=authUser.user?authUser.user:authUser
      const url =user.profile_picture_id?ProfileUrl(user.profile_picture_id):'';
      const UseAuth = useAuthStore((state) => state.user);
      const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user._id);
      let visitingOwnProfileAndAuth =UseAuth&& user && user.username === owner;
      // console.log('Own Profile:',visitingOwnProfileAndAuth) ;
      let visitingAnotherProfileAndAuth = UseAuth &&user && user.username !== owner;
      // console.log('Another profile',visitingAnotherProfileAndAuth );
      const { isOpen, onOpen, onClose } = useDisclosure();


  return (
      <Flex gap={{ base: 4, sm: 10 }} py={10} direction={{ base: "column", sm: "row" }}>
          <AvatarGroup size={{ base: "xl", md: "2xl" }} justifySelf={"center"} alignSelf={"flex-start"} mx={"auto"}>
              <Avatar src={url} alt='As a programmer logo' />
          </AvatarGroup>
          {/* Profile Information */}
          <VStack alignItems={"start"} gap={2} mx={"auto"} flex={1}>
          <Flex
            gap={4}
            direction={{ base: "column", sm: "row" }}
            justifyContent={{ base: "center", sm: "flex-start" }}
            alignItems={"center"}
            w={"full"}
          >
            <Text fontSize={{ base: "sm", md: "lg" }}>{username}</Text>

            {/* Display button depending on whether it is a the page owner or another user */}
            {visitingOwnProfileAndAuth && (
              <Flex gap={4} alignItems={"center"} justifyContent={"center"}>
                <Button
                  bg={"white"}
                  color={"black"}
                  _hover={{ bg: "whiteAlpha.800" }}
                  size={{ base: "xs", md: "sm" }}
                  onClick={onOpen}
                >
                  Edit Profile
                </Button>
              </Flex>
            )}
            {visitingAnotherProfileAndAuth && (
              <Flex gap={4} alignItems={"center"} justifyContent={"center"}>
                <Button
                  bg={"blue.500"}
                  color={"white"}
                  _hover={{ bg: "blue.600" }}
                  size={{ base: "xs", md: "sm" }}
                  onClick={handleFollowUser}
                  isLoading={isUpdating}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button
                  as={RouterLink}
                  to={`/messages/${user._id}`}
                  bg={"whiteAlpha.200"}
                  _hover={{ bg: "whiteAlpha.300" }}
                  size={{ base: "xs", md: "sm" }}
                >
                  Message
                </Button>
              </Flex>
            )}
          </Flex>

          <Flex alignItems={"center"} gap={{ base: 2, sm: 4 }}>
            <Text fontSize={{ base: "xs", md: "sm" }}>
              <Text as='span' fontWeight={"bold"} mr={1}>
                {user.posts.length}
              </Text>
              Posts
            </Text>
            <Text fontSize={{ base: "xs", md: "sm" }}>
              <Text as='span' fontWeight={"bold"} mr={1}>
                {user.followers.length}
              </Text>
              Followers
            </Text>
            <Text fontSize={{ base: "xs", md: "sm" }}>
              <Text as='span' fontWeight={"bold"} mr={1}>
                {user.following.length}
              </Text>
              Following
            </Text>
          </Flex>
          <Flex alignItems={"center"} gap={4}>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.lastName}{' '}{user.firstName}
            </Text>
          </Flex>
            <Text fontSize={"sm"}>
              {user.bio}
            </Text>
        </VStack>
        {isOpen && <EditProfile  isOpen={isOpen} onClose={onClose}/>}
      </Flex>
  )
}
