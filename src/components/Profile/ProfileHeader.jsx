import { Avatar, Box, Button, Flex, Text, VStack, useDisclosure } from "@chakra-ui/react";
import EditProfile from "./EditProfile";
import { avatarUrl } from "../../utils/media";
import useAuthStore from "../../store/useAuthStore";
import useFollowUser from "../../hooks/useFollowUser";
import useShowToast from "../../hooks/useShowToast";
import { Link as RouterLink } from "react-router-dom";

// Instagram's profile header. Phones: avatar beside the counts, name/bio below,
// full-width buttons. Tablet/desktop: big avatar on the left, everything else on the right.
export default function ProfileHeader({authUser,onLogout,username,owner}) {
      const user=authUser.user?authUser.user:authUser
      const url = avatarUrl(user);
      const UseAuth = useAuthStore((state) => state.user);
      const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user._id);
      const visitingOwnProfileAndAuth = !!UseAuth && user && user.username === owner;
      const visitingAnotherProfileAndAuth = !!UseAuth && user && user.username !== owner;
      const { isOpen, onOpen, onClose } = useDisclosure();
      const showToast = useShowToast();
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

      const shareProfile = async () => {
        const link = `${window.location.origin}/${user.username}`;
        try {
          if (navigator.share) await navigator.share({ title: `${user.username} on Nsoro`, url: link });
          else {
            await navigator.clipboard.writeText(link);
            showToast("Profile link copied", "", "success", 1500);
          }
        } catch { /* share sheet dismissed */ }
      };

      const stats = [
        { label: "posts", value: user.posts.length },
        { label: "followers", value: user.followers.length },
        { label: "following", value: user.following.length },
      ];

      const buttonProps = { size: "sm", flex: { base: 1, md: "initial" }, borderRadius: "lg", fontWeight: "semibold" };
      const buttons = (
        <Flex gap={2} w={{ base: "full", md: "auto" }}>
          {visitingOwnProfileAndAuth && (
            <>
              <Button {...buttonProps} bg='whiteAlpha.200' _hover={{ bg: "whiteAlpha.300" }} onClick={onOpen}>
                Edit profile
              </Button>
              <Button {...buttonProps} bg='whiteAlpha.200' _hover={{ bg: "whiteAlpha.300" }} onClick={shareProfile}>
                Share profile
              </Button>
              {user.role === "admin" && (
                <Button {...buttonProps} as={RouterLink} to='/admin/updates' bg='whiteAlpha.200' _hover={{ bg: "whiteAlpha.300" }}>
                  Send update
                </Button>
              )}
              {/* Phones have no sidebar, so logout lives here. */}
              <Button {...buttonProps} display={{ base: "inline-flex", md: "none" }} variant='outline' onClick={() => onLogout?.(user._id)}>
                Log out
              </Button>
            </>
          )}
          {visitingAnotherProfileAndAuth && (
            <>
              <Button
                {...buttonProps}
                bg={isFollowing ? "whiteAlpha.200" : "blue.500"}
                _hover={{ bg: isFollowing ? "whiteAlpha.300" : "blue.600" }}
                onClick={handleFollowUser}
                isLoading={isUpdating}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button {...buttonProps} as={RouterLink} to={`/messages/${user._id}`} bg='whiteAlpha.200' _hover={{ bg: "whiteAlpha.300" }}>
                Message
              </Button>
            </>
          )}
        </Flex>
      );

  return (
    <Box w='full'>
      <Flex gap={{ base: 5, md: 16 }} alignItems={{ base: "center", md: "flex-start" }}>
        <Avatar
          src={url}
          name={user.username}
          alt={`${user.username}'s profile picture`}
          referrerPolicy='no-referrer'
          w={{ base: "80px", md: "150px" }}
          h={{ base: "80px", md: "150px" }}
          flexShrink={0}
        />

        <VStack alignItems='flex-start' spacing={{ base: 2, md: 5 }} flex={1} minW={0}>
          <Flex gap={4} alignItems='center' wrap='wrap'>
            <Text fontSize={{ base: "lg", md: "xl" }} noOfLines={1}>{username}</Text>
            <Box display={{ base: "none", md: "block" }}>{buttons}</Box>
          </Flex>

          {/* counts: under the name on desktop, spread beside the avatar on phones */}
          <Flex gap={{ base: 0, md: 10 }} w={{ base: "full", md: "auto" }} justifyContent={{ base: "space-between", md: "flex-start" }}>
            {stats.map((s) => (
              <Flex key={s.label} direction={{ base: "column", md: "row" }} alignItems='center' gap={{ base: 0, md: 1 }} fontSize={{ base: "sm", md: "md" }}>
                <Text fontWeight='bold'>{s.value}</Text>
                <Text color={{ base: "gray.300", md: "inherit" }}>{s.label}</Text>
              </Flex>
            ))}
          </Flex>

          <Box display={{ base: "none", md: "block" }}>
            {fullName && <Text fontWeight='bold' fontSize='sm'>{fullName}</Text>}
            <Text fontSize='sm' whiteSpace='pre-wrap'>{user.bio}</Text>
          </Box>
        </VStack>
      </Flex>

      {/* phones: name, bio and buttons below the avatar row */}
      <Box display={{ base: "block", md: "none" }} mt={3}>
        {fullName && <Text fontWeight='bold' fontSize='sm'>{fullName}</Text>}
        <Text fontSize='sm' whiteSpace='pre-wrap' mb={3}>{user.bio}</Text>
        {buttons}
      </Box>

      {isOpen && <EditProfile isOpen={isOpen} onClose={onClose}/>}
    </Box>
  )
}
