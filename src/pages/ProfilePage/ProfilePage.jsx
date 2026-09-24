import { Container, Flex, Link, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import ProfilePosts from "../../components/Profile/ProfilePosts";
import { Link as RouterLink } from "react-router-dom";
import { useGetUser } from "../../hooks/useGetUser";



export function ProfilePage ({authUser,onLogout}){
	const { username } = useParams();
	const { isLoading, userProfile } = useGetUser(username);
	// console.log(userProfile);
    
	
	const userNotFound = !isLoading && !userProfile;
    const user=authUser?.user?authUser.user:authUser
	if (userNotFound) return <UserNotFound />;
	// console.log(user);
	
    return <Container maxW={'container.lg'} py={5}>
            {/* Profile of {username } */}
            <Flex py={10} px={4} pl={{ base: 4, md: 10 }} w={"full"} mx={"auto"} flexDirection={"column"}>
                {!isLoading && userProfile &&<ProfileHeader  authUser={userProfile} onLogout={onLogout} username={username} owner={user?.username}/>}
                {isLoading && <ProfileHeaderSkeleton />}
            </Flex>
            <Flex
				px={{ base: 2, sm: 4 }}
				maxW={"full"}
				mx={"auto"}
				borderTop={"1px solid"}
				borderColor={"whiteAlpha.300"}
				direction={"column"}
			>
				<ProfileTabs />
				{userProfile&&<ProfilePosts user={userProfile.user}/>}
			</Flex>
        </Container>;
};


const ProfileHeaderSkeleton = () => {
	return (
		<Flex
			gap={{ base: 4, sm: 10 }}
			py={10}
			direction={{ base: "column", sm: "row" }}
			justifyContent={"center"}
			alignItems={"center"}
		>
			<SkeletonCircle size='24' />

			<VStack alignItems={{ base: "center", sm: "flex-start" }} gap={2} mx={"auto"} flex={1}>
				<Skeleton height='12px' width='150px' />
				<Skeleton height='12px' width='100px' />
			</VStack>
		</Flex>
	);
};

const UserNotFound = () => {
	return (
		<Flex flexDir='column' textAlign={"center"} mx={"auto"}>
			<Text fontSize={"2xl"}>User Not Found</Text>
			<Link as={RouterLink} to={"/"} color={"blue.500"} w={"max-content"} mx={"auto"}>
				Go home
			</Link>
		</Flex>
	);
};
