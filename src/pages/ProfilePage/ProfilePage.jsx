import { Container, Flex, Link, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import ProfilePosts from "../../components/Profile/ProfilePosts";
import { Link as RouterLink } from "react-router-dom";
import { useGetUser } from "../../hooks/useGetUser";
import { useEffect, useState } from "react";
import API from "../../utils/api";
import { getAuthToken } from "../../utils/auth";
import PostGrid from "../../components/Profile/PostGrid";



export function ProfilePage ({authUser,onLogout}){
	const { username } = useParams();
	const { isLoading, userProfile } = useGetUser(username);
	// console.log(userProfile);
    
	
	const userNotFound = !isLoading && !userProfile;
    const user=authUser?.user?authUser.user:authUser
	const isOwner = !!user && user.username === username;
	const [tab, setTab] = useState("posts");
	useEffect(() => setTab("posts"), [username]);
	if (userNotFound) return <UserNotFound />;
	// console.log(user);

    return <Container maxW={'container.lg'} py={{ base: 2, md: 5 }} px={{ base: 0, sm: 4 }}>
            {/* Profile of {username } */}
            <Flex py={{ base: 4, md: 10 }} px={4} pl={{ base: 4, md: 10 }} w={"full"} maxW='935px' mx={"auto"} flexDirection={"column"}>
                {!isLoading && userProfile &&<ProfileHeader  authUser={userProfile} onLogout={onLogout} username={username} owner={user?.username} viewer={user}/>}
                {isLoading && <ProfileHeaderSkeleton />}
            </Flex>
            <Flex
				px={{ base: 0, sm: 4 }}
				w={"full"}
				mx={"auto"}
				borderTop={"1px solid"}
				borderColor={"whiteAlpha.300"}
				direction={"column"}
			>
				<ProfileTabs active={tab} onChange={setTab} isOwner={isOwner} />
				{userProfile && tab === "posts" && <ProfilePosts user={userProfile.user}/>}
				{userProfile && tab === "saved" && isOwner && <SavedPosts savedCount={user?.saved?.length || 0} />}
				{userProfile && tab === "likes" && <LikedPosts userId={userProfile.user._id} />}
			</Flex>
        </Container>;
};

function SavedPosts({ savedCount }) {
	const [posts, setPosts] = useState(null);
	// refetch when you save/unsave elsewhere (the count on the store's user changes)
	useEffect(() => {
		const controller = new AbortController();
		API.get("/api/v1/posts/saved", { signal: controller.signal, headers: { Authorization: `Bearer ${getAuthToken()}` } })
			.then(({ data }) => setPosts(data.posts))
			.catch((e) => e.message !== "canceled" && setPosts([]));
		return () => controller.abort();
	}, [savedCount]);
	return <PostGrid posts={posts} emptyText='Save posts you want to see again - only you can see what you’ve saved.' />;
}

function LikedPosts({ userId }) {
	const [posts, setPosts] = useState(null);
	useEffect(() => {
		const controller = new AbortController();
		setPosts(null);
		API.get(`/api/v1/posts/liked/${userId}`, { signal: controller.signal })
			.then(({ data }) => setPosts(data.posts))
			.catch((e) => e.message !== "canceled" && setPosts([]));
		return () => controller.abort();
	}, [userId]);
	return <PostGrid posts={posts} emptyText='No liked posts yet.' />;
}


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
