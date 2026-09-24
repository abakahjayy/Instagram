import { Avatar, Badge, Box, Flex, Heading, Link, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import useConversations from "../../hooks/useConversations";
import useAuthStore from "../../store/useAuthStore";
import { getAuthUserId } from "../../utils/auth";
import { avatarUrl } from "../../utils/media";
import { timeAgo } from "../../utils/timeAgo";

export default function MessagesPage() {
	const { conversations, isLoading } = useConversations();
	const myId = getAuthUserId(useAuthStore((state) => state.user));

	return (
		<Box maxW='container.sm' mx='auto' px={4} py={8}>
			<Heading size='lg' mb={6}>
				Messages
			</Heading>

			{isLoading &&
				[0, 1, 2].map((i) => (
					<Flex key={i} gap={4} alignItems='center' mb={5}>
						<SkeletonCircle size='12' />
						<VStack alignItems='flex-start' gap={2}>
							<Skeleton h='10px' w='150px' />
							<Skeleton h='10px' w='220px' />
						</VStack>
					</Flex>
				))}

			{!isLoading && conversations.length === 0 && (
				<Text color='gray.400'>
					No messages yet. Open someone&apos;s profile and tap <b>Message</b> to start a chat.
				</Text>
			)}

			<VStack spacing={1} align='stretch'>
				{conversations.map(({ user, lastMessage, unread }) => (
					<Link
						as={RouterLink}
						to={`/messages/${user._id}`}
						key={user._id}
						_hover={{ textDecoration: "none", bg: "whiteAlpha.100" }}
						borderRadius='md'
						p={3}
					>
						<Flex alignItems='center' gap={4}>
							<Avatar src={avatarUrl(user)} referrerPolicy='no-referrer' name={user.username} size='md' />
							<Box flex={1} minW={0}>
								<Text fontWeight={unread ? "bold" : "semibold"}>{user.username}</Text>
								<Text color={unread ? "whiteAlpha.900" : "gray.400"} fontSize='sm' noOfLines={1}>
									{lastMessage.sender === myId ? "You: " : ""}
									{lastMessage.type === "voice" ? "🎤 Voice message" : lastMessage.message} · {timeAgo(new Date(lastMessage.timestamp).getTime())}
								</Text>
							</Box>
							{unread > 0 && (
								<Badge colorScheme='blue' borderRadius='full' px={2}>
									{unread}
								</Badge>
							)}
						</Flex>
					</Link>
				))}
			</VStack>
		</Box>
	);
}
