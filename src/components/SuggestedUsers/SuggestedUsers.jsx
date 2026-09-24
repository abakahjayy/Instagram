import { VStack,Flex, Text,Button, Box ,Link, SkeletonCircle,Skeleton} from "@chakra-ui/react"
import SuggestedUser from "./SuggestedUser"
import SuggestedHeader from "./SuggestedHeader"
import useAuthStore from "../../store/useAuthStore";
import useGetSuggestedUsers from "../../hooks/useGetSuggestedUsers"

export default function SuggestedUsers({authUser,onLogout}) {
    const user=authUser.user?authUser.user:authUser
    const { isLoading, suggestedUsers }=useGetSuggestedUsers(user)
    const setAuthUser= useAuthStore((state)=>state.setAuthUser)
    // suggestedUsers[0]&&console.log(suggestedUsers)

    if (isLoading) return <CommentSkeleton />;
    return (
        <VStack py={8} px={6} gap={4} >
            <SuggestedHeader user={user} onLogout={onLogout}/>
            {suggestedUsers.length !== 0 && (
				<Flex alignItems={"center"} justifyContent={"space-between"} w={"full"}>
					<Text fontSize={12} fontWeight={"bold"} color={"gray.500"}>
						Suggested for you
					</Text>
					<Text fontSize={12} fontWeight={"bold"} _hover={{ color: "gray.400" }} cursor={"pointer"}>
						See All
					</Text>
				</Flex>
			)}

			{suggestedUsers[0]&&suggestedUsers.map((user) => (
				<SuggestedUser user={user} setUser={setAuthUser} key={user._id} />
			))}

            <Box fontSize={12} color={'gray.500'} mt={5}>
                Copyright &copy; {new Date().getFullYear()} Built By{" "}
				<Link href='https://abakahjay.github.io/web_project/' target='_blank' color='blue.500' fontSize={14} alignSelf={'start'}>
                    Abakah Joshua
				</Link>
            </Box>
            <h1>Hello {user.firstName}</h1>
        </VStack>
    )
}

const CommentSkeleton = () => {
    return (
        <>
            <Flex gap={4} w={"full"} alignItems={"center"} py={8} px={6}>
                <SkeletonCircle h={10} w='10' />
                <Flex gap={1} flexDir={"column"}>
                    <Skeleton height={2} width={100} />
                    <Skeleton height={2} width={50} />
                </Flex>
            </Flex>
            <Flex gap={4} w={"full"} alignItems={"center"} py={8} px={6}>
                <SkeletonCircle h={10} w='10' />
                <Flex gap={1} flexDir={"column"}>
                    <Skeleton height={2} width={100} />
                    <Skeleton height={2} width={50} />
                </Flex>
            </Flex>
            <Flex gap={4} w={"full"} alignItems={"center"} py={8} px={6}>
                <SkeletonCircle h={10} w='10' />
                <Flex gap={1} flexDir={"column"}>
                    <Skeleton height={2} width={100} />
                    <Skeleton height={2} width={50} />
                </Flex>
            </Flex>
            <Flex gap={4} w={"full"} alignItems={"center"} py={8} px={6}>
                <SkeletonCircle h={10} w='10' />
                <Flex gap={1} flexDir={"column"}>
                    <Skeleton height={2} width={100} />
                    <Skeleton height={2} width={50} />
                </Flex>
            </Flex>
            
        </>
        
    );
};
