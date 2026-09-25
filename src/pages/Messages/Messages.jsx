import { useEffect, useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	Link,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Skeleton,
	SkeletonCircle,
	Spinner,
	Text,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FiEdit } from "react-icons/fi";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import useConversations from "../../hooks/useConversations";
import useAuthStore from "../../store/useAuthStore";
import { getAuthUserId } from "../../utils/auth";
import { avatarUrl } from "../../utils/media";
import { timeAgo } from "../../utils/timeAgo";
import API from "../../utils/api";
import { MessagesLogo } from "../../assets/constants";
import ChatPage from "./Chat";

// /messages and /messages/:id, laid out like instagram.com/direct:
// tablets and up show the inbox and the open chat side by side; phones show one
// screen at a time (inbox, or a full-screen chat).
export default function MessagesPage() {
	const { id } = useParams();
	return (
		<Flex h='100dvh' w='full'>
			<Box
				w={{ base: "full", md: "340px", lg: "400px" }}
				flexShrink={0}
				borderRight={{ md: "1px solid" }}
				borderColor={{ md: "ig.border" }}
				display={{ base: id ? "none" : "block", md: "block" }}
				overflowY='auto'
			>
				<Inbox activeId={id} />
			</Box>
			<Box flex={1} minW={0} display={{ base: id ? "block" : "none", md: "block" }}>
				{id ? <ChatPage key={id} /> : <EmptyChat />}
			</Box>
		</Flex>
	);
}

function Inbox({ activeId }) {
	const { conversations, isLoading } = useConversations();
	const authUser = useAuthStore((state) => state.user);
	const me = authUser?.user || authUser;
	const myId = getAuthUserId(authUser);
	const newMessage = useDisclosure();

	return (
		<Box px={{ base: 4, md: 5 }} py={{ base: 4, md: 8 }}>
			<Flex alignItems='center' justifyContent='space-between' mb={5}>
				<Heading size='md' noOfLines={1}>
					{me?.username}
				</Heading>
				<IconButton aria-label='New message' icon={<FiEdit size={22} />} variant='ghost' onClick={newMessage.onOpen} />
			</Flex>
			<Text fontWeight='bold' mb={3}>
				Messages
			</Text>

			{isLoading &&
				[0, 1, 2].map((i) => (
					<Flex key={i} gap={3} alignItems='center' mb={5}>
						<SkeletonCircle size='14' />
						<VStack alignItems='flex-start' gap={2}>
							<Skeleton h='10px' w='140px' />
							<Skeleton h='10px' w='200px' />
						</VStack>
					</Flex>
				))}

			{!isLoading && conversations.length === 0 && (
				<Text color='ig.secondary' fontSize='sm'>
					No messages yet. Tap the pencil to start a chat.
				</Text>
			)}

			<VStack spacing={0} align='stretch' mx={{ base: -4, md: -5 }}>
				{conversations.map(({ user, lastMessage, unread }) => (
					<Link
						as={RouterLink}
						to={`/messages/${user._id}`}
						key={user._id}
						_hover={{ textDecoration: "none", bg: "ig.hover" }}
						bg={activeId === user._id ? "ig.hover" : "transparent"}
						px={{ base: 4, md: 5 }}
						py={2}
					>
						<Flex alignItems='center' gap={3}>
							<Avatar src={avatarUrl(user)} referrerPolicy='no-referrer' name={user.username} w='56px' h='56px' />
							<Box flex={1} minW={0}>
								<Text fontWeight={unread ? "bold" : "normal"} fontSize='sm' noOfLines={1}>
									{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}
								</Text>
								<Text color={unread ? "ig.text" : "ig.secondary"} fontWeight={unread ? "semibold" : "normal"} fontSize='xs' noOfLines={1}>
									{lastMessage.sender === myId ? "You: " : ""}
									{lastMessage.type === "voice" ? "🎤 Voice message" : lastMessage.message} · {timeAgo(new Date(lastMessage.timestamp).getTime())}
								</Text>
							</Box>
							{unread > 0 && <Box w='8px' h='8px' borderRadius='full' bg='ig.link' flexShrink={0} aria-label={`${unread} unread`} />}
						</Flex>
					</Link>
				))}
			</VStack>

			<NewMessageModal isOpen={newMessage.isOpen} onClose={newMessage.onClose} />
		</Box>
	);
}

// Right pane before a chat is picked (tablets and up).
function EmptyChat() {
	const newMessage = useDisclosure();
	return (
		<Flex h='full' direction='column' alignItems='center' justifyContent='center' gap={3} textAlign='center' px={6}>
			<Flex w='96px' h='96px' borderRadius='full' border='2px solid' borderColor='ig.text' alignItems='center' justifyContent='center' sx={{ svg: { width: "48px", height: "48px" } }}>
				<MessagesLogo />
			</Flex>
			<Text fontSize='xl'>Your messages</Text>
			<Text color='ig.secondary' fontSize='sm'>
				Send a message or a voice note to a friend.
			</Text>
			<Button colorScheme='blue' size='sm' borderRadius='lg' onClick={newMessage.onOpen}>
				Send message
			</Button>
			<NewMessageModal isOpen={newMessage.isOpen} onClose={newMessage.onClose} />
		</Flex>
	);
}

// Instagram's "New message": search anyone, open the chat.
function NewMessageModal({ isOpen, onClose }) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const myId = getAuthUserId(useAuthStore((state) => state.user));

	useEffect(() => {
		const q = query.trim();
		if (!q) return setResults([]);
		const controller = new AbortController();
		const timer = setTimeout(() => {
			setLoading(true);
			API.get("/api/v1/users/search", { params: { q }, signal: controller.signal })
				.then(({ data }) => setResults(data.users.filter((u) => u._id !== myId)))
				.catch(() => {})
				.finally(() => setLoading(false));
		}, 250);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query, myId]);

	const open = (user) => {
		onClose();
		setQuery("");
		navigate(`/messages/${user._id}`);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "md" }} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent borderRadius={{ base: 0, md: "xl" }}>
				<ModalHeader textAlign='center' fontSize='md' borderBottom='1px solid' borderColor='ig.border'>
					New message
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody px={0} minH='300px'>
					<InputGroup px={4} mb={2}>
						<InputLeftElement pointerEvents='none' pl={6}>
							<SearchIcon color='ig.secondary' />
						</InputLeftElement>
						<Input placeholder='Search…' value={query} onChange={(e) => setQuery(e.target.value)} variant='filled' autoFocus />
					</InputGroup>
					{loading && (
						<Flex justifyContent='center' py={4}>
							<Spinner size='sm' />
						</Flex>
					)}
					{!loading && query.trim() && results.length === 0 && (
						<Text px={6} color='ig.secondary' fontSize='sm'>
							No account found.
						</Text>
					)}
					{results.map((u) => (
						<Flex as='button' key={u._id} w='full' textAlign='left' alignItems='center' gap={3} px={6} py={2} _hover={{ bg: "ig.hover" }} onClick={() => open(u)}>
							<Avatar size='md' src={avatarUrl(u)} name={u.username} referrerPolicy='no-referrer' />
							<Box>
								<Text fontWeight='semibold' fontSize='sm'>
									{u.username}
								</Text>
								<Text color='ig.secondary' fontSize='sm'>
									{u.firstName} {u.lastName}
								</Text>
							</Box>
						</Flex>
					))}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
