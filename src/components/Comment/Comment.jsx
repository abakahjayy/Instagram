import { Avatar, Flex, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import { useGetUserById } from "../../hooks/useGetUserById";
import { ProfileUrl } from "../../utils/imageUrl";
export default function Comment({comment}) {

  const {
    isLoading,
    userProfile,
    profileImageUrl, // Return the profile image URL
    imageLoading, // Return the image loading state
    imageError, // Return any errors related to the image
    setUserProfile,
  }= useGetUserById(comment.user)
  let url =ProfileUrl(userProfile?.profile_picture_id);
  // let url =userProfile?.profile_picture_id?ProfileUrl(userProfile?.profile_picture_id):''

  // userProfile&&console.log(userProfile)
  // console.log(comment)
  if (isLoading) return <CommentSkeleton />;
  if(userProfile)return(
    <Flex gap={4}>
    <Link to={`/${userProfile.username}`}>
      {<Avatar src={profileImageUrl} size={"sm"} />}
    </Link>
    <Flex direction={"column"}>
      <Flex gap={2} alignItems={"center"}>
        <Link to={`/${userProfile.username}`}>
          <Text fontWeight={"bold"} fontSize={12}>
            {userProfile.username}
          </Text>
        </Link>
        <Text fontSize={14}>
            {comment.text}
          </Text>
      </Flex>
      <Text fontSize={12} color={"gray"}>
        {timeAgo(comment.created)}
      </Text>
    </Flex>
  </Flex>
  )
}


const CommentSkeleton = () => {
	return (
		<Flex gap={4} w={"full"} alignItems={"center"}>
			<SkeletonCircle h={10} w='10' />
			<Flex gap={1} flexDir={"column"}>
				<Skeleton height={2} width={100} />
				<Skeleton height={2} width={50} />
			</Flex>
		</Flex>
	);
};
