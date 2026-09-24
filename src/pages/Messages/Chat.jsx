import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Flex, IconButton, Input, Link, Spinner, Text } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { IoSend } from "react-icons/io5";
import { Link as RouterLink, useParams } from "react-router-dom";
import useChat from "../../hooks/useChat";
import { useGetUserById } from "../../hooks/useGetUserById";

// /messages/:id - a live conversation with the user whose _id is in the URL.
export default function ChatPage() {
	const { id: otherUserId } = useParams();
	const { userProfile, profileImageUrl } = useGetUserById(otherUserId);
	const { myId, messages, isLoading, isOtherTyping, sendMessage, notifyTyping } = useChat(otherUserId);
	const [draft, setDraft] = useState("");
	const bottomRef = useRef(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [messages, isOtherTyping]);

	const handleSubmit = (e) => {
		e.preventDefault();
		sendMessage(draft);
		setDraft("");
	};

	return (
		<Flex direction='column' h='100dvh' maxW='container.sm' mx='auto'>
			<Flex alignItems='center' gap={3} px={4} py={3} borderBottom='1px solid' borderColor='whiteAlpha.300'>
				<IconButton as={RouterLink} to='/messages' icon={<ArrowBackIcon />} aria-label='Back to messages' variant='ghost' size='sm' />
				<Avatar src={profileImageUrl || undefined} name={userProfile?.username} size='sm' />
				{userProfile ? (
					<Link as={RouterLink} to={`/${userProfile.username}`} fontWeight='bold'>
						{userProfile.username}
					</Link>
				) : (
					<Text fontWeight='bold'>…</Text>
				)}
			</Flex>

			<Box flex={1} overflowY='auto' px={4} py={4}>
				{isLoading && (
					<Flex justifyContent='center' mt={10}>
						<Spinner />
					</Flex>
				)}
				{!isLoading && messages.length === 0 && (
					<Text textAlign='center' color='gray.400' mt={10}>
						Say hi to {userProfile?.username || "them"} 👋
					</Text>
				)}
				{messages.map((msg) => {
					const mine = msg.sender === myId;
					return (
						<Flex key={msg._id} justifyContent={mine ? "flex-end" : "flex-start"} mb={2}>
							<Box
								maxW='75%'
								px={4}
								py={2}
								borderRadius='2xl'
								bg={mine ? "blue.500" : "whiteAlpha.200"}
								color='white'
								opacity={msg.pending ? 0.6 : 1}
								wordBreak='break-word'
								whiteSpace='pre-wrap'
							>
								{msg.message}
								<Text fontSize='10px' mt={1} textAlign='right' color={msg.failed ? "red.200" : "whiteAlpha.700"}>
									{msg.failed
										? "Not sent"
										: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								</Text>
							</Box>
						</Flex>
					);
				})}
				{isOtherTyping && (
					<Text fontSize='sm' color='gray.400' fontStyle='italic'>
						{userProfile?.username || "They"} is typing…
					</Text>
				)}
				<div ref={bottomRef} />
			</Box>

			<Flex as='form' onSubmit={handleSubmit} gap={2} px={4} py={3} borderTop='1px solid' borderColor='whiteAlpha.300'>
				<Input
					placeholder='Message…'
					value={draft}
					onChange={(e) => {
						setDraft(e.target.value);
						notifyTyping();
					}}
					borderRadius='full'
					autoFocus
				/>
				<IconButton type='submit' icon={<IoSend />} aria-label='Send' colorScheme='blue' borderRadius='full' isDisabled={!draft.trim()} />
			</Flex>
		</Flex>
	);
}
