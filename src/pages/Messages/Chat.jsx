import { useEffect, useRef, useState } from "react";
import {
	Avatar,
	Box,
	CloseButton,
	Flex,
	IconButton,
	Input,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Spinner,
	Text,
} from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import { IoSend } from "react-icons/io5";
import { BsMicFill, BsPauseFill, BsPlayFill, BsThreeDots } from "react-icons/bs";
import { Link as RouterLink, useParams } from "react-router-dom";
import useChat from "../../hooks/useChat";
import useVoiceRecorder, { MAX_VOICE_SECONDS } from "../../hooks/useVoiceRecorder";
import useShowToast from "../../hooks/useShowToast";
import { useGetUserById } from "../../hooks/useGetUserById";
import { mediaUrl } from "../../utils/media";

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const LONG_PRESS_MS = 450;

// /messages/:id - a live conversation with the user whose _id is in the URL.
export default function ChatPage() {
	const { id: otherUserId } = useParams();
	const { userProfile, profileImageUrl } = useGetUserById(otherUserId);
	const { myId, messages, isLoading, isOtherTyping, sendMessage, editMessage, unsendMessage, sendVoice, notifyTyping } = useChat(otherUserId);
	const [draft, setDraft] = useState("");
	const [editing, setEditing] = useState(null); // message being edited
	const [menuFor, setMenuFor] = useState(null);
	const bottomRef = useRef(null);
	const inputRef = useRef(null);
	const showToast = useShowToast();
	const recorder = useVoiceRecorder({ onAutoStop: ({ blob, duration }) => sendVoice(blob, duration) });

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [messages.length, isOtherTyping]);

	useEffect(() => {
		if (recorder.error) showToast("Microphone", recorder.error, "error");
	}, [recorder.error, showToast]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editing) {
			if (draft.trim() && draft.trim() !== editing.message) editMessage(editing._id, draft);
			setEditing(null);
		} else sendMessage(draft);
		setDraft("");
	};

	const startEdit = (msg) => {
		setEditing(msg);
		setDraft(msg.message);
		setTimeout(() => inputRef.current?.focus(), 0);
	};
	const cancelEdit = () => {
		setEditing(null);
		setDraft("");
	};

	const finishRecording = async () => {
		const result = await recorder.stop();
		if (result) sendVoice(result.blob, result.duration);
	};

	return (
		<Flex direction='column' h='100dvh' w='full'>
			<Flex alignItems='center' gap={3} px={4} py={3} borderBottom='1px solid' borderColor='ig.border'>
				<IconButton as={RouterLink} to='/messages' icon={<ArrowBackIcon />} aria-label='Back to messages' variant='ghost' size='sm' display={{ base: "inline-flex", md: "none" }} />
				<Avatar src={profileImageUrl || undefined} referrerPolicy='no-referrer' name={userProfile?.username} size='sm' />
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
				{messages.map((msg) => (
					<MessageRow
						key={msg._id}
						msg={msg}
						mine={msg.sender === myId}
						menuOpen={menuFor === msg._id}
						onOpenMenu={() => setMenuFor(msg._id)}
						onCloseMenu={() => setMenuFor(null)}
						onEdit={() => startEdit(msg)}
						onUnsend={() => unsendMessage(msg._id)}
						onCopy={() => navigator.clipboard?.writeText(msg.message).then(() => showToast("Copied", "", "success", 1200))}
					/>
				))}
				{isOtherTyping && (
					<Text fontSize='sm' color='gray.400' fontStyle='italic'>
						{userProfile?.username || "They"} is typing…
					</Text>
				)}
				<div ref={bottomRef} />
			</Box>

			{editing && (
				<Flex alignItems='center' px={4} py={2} gap={2} bg='whiteAlpha.100' borderTop='1px solid' borderColor='whiteAlpha.200'>
					<Box flex={1} minW={0}>
						<Text fontSize='xs' color='blue.300' fontWeight='semibold'>
							Editing message
						</Text>
						<Text fontSize='xs' color='gray.400' noOfLines={1}>
							{editing.message}
						</Text>
					</Box>
					<CloseButton size='sm' onClick={cancelEdit} aria-label='Cancel editing' />
				</Flex>
			)}

			{recorder.isRecording ? (
				<Flex alignItems='center' gap={3} px={4} py={3} pb='max(12px, env(safe-area-inset-bottom))' borderTop='1px solid' borderColor='whiteAlpha.300'>
					<IconButton aria-label='Cancel recording' icon={<DeleteIcon />} variant='ghost' borderRadius='full' onClick={recorder.cancel} />
					<Flex flex={1} alignItems='center' gap={2} bg='whiteAlpha.100' borderRadius='full' px={4} h='40px'>
						<Box w='10px' h='10px' borderRadius='full' bg='red.500' sx={{ animation: "pulse 1s ease-in-out infinite", "@keyframes pulse": { "50%": { opacity: 0.3 } } }} />
						<Text fontSize='sm' fontVariantNumeric='tabular-nums'>
							{fmt(recorder.seconds)}
						</Text>
						<Text fontSize='xs' color='gray.500' ml='auto'>
							max {fmt(MAX_VOICE_SECONDS)}
						</Text>
					</Flex>
					<IconButton aria-label='Send voice message' icon={<IoSend />} colorScheme='blue' borderRadius='full' onClick={finishRecording} />
				</Flex>
			) : (
				<Flex as='form' onSubmit={handleSubmit} gap={2} px={4} py={3} pb='max(12px, env(safe-area-inset-bottom))' borderTop='1px solid' borderColor='whiteAlpha.300'>
					<Input
						ref={inputRef}
						placeholder={editing ? "Edit message…" : "Message…"}
						value={draft}
						onChange={(e) => {
							setDraft(e.target.value);
							if (!editing) notifyTyping();
						}}
						borderRadius='full'
						autoFocus
					/>
					{draft.trim() || editing ? (
						<IconButton type='submit' icon={<IoSend />} aria-label={editing ? "Save edit" : "Send"} colorScheme='blue' borderRadius='full' isDisabled={!draft.trim()} />
					) : (
						<IconButton aria-label='Record voice message' icon={<BsMicFill />} borderRadius='full' variant='ghost' fontSize='20px' onClick={recorder.start} />
					)}
				</Flex>
			)}
		</Flex>
	);
}

function MessageRow({ msg, mine, menuOpen, onOpenMenu, onCloseMenu, onEdit, onUnsend, onCopy }) {
	const pressTimer = useRef(null);
	const isVoice = msg.type === "voice";
	const canAct = mine && !msg.pending && !msg.failed;

	// Long-press on phones opens the menu (like Instagram); right-click on computers.
	const pressHandlers = canAct
		? {
				onTouchStart: () => (pressTimer.current = setTimeout(onOpenMenu, LONG_PRESS_MS)),
				onTouchEnd: () => clearTimeout(pressTimer.current),
				onTouchMove: () => clearTimeout(pressTimer.current),
				onContextMenu: (e) => {
					e.preventDefault();
					onOpenMenu();
				},
		  }
		: {};

	return (
		<Flex justifyContent={mine ? "flex-end" : "flex-start"} alignItems='center' mb={2} gap={1} role='group'>
			{canAct && (
				<Menu isOpen={menuOpen} onClose={onCloseMenu} placement='left' isLazy>
					<MenuButton
						as={IconButton}
						aria-label='Message options'
						icon={<BsThreeDots />}
						size='xs'
						variant='ghost'
						borderRadius='full'
						opacity={menuOpen ? 1 : 0}
						_groupHover={{ opacity: 1 }}
						_focusVisible={{ opacity: 1 }}
						onClick={onOpenMenu}
					/>
					<MenuList bg='gray.800' borderColor='whiteAlpha.300' minW='150px'>
						{!isVoice && <MenuItem bg='transparent' onClick={onEdit}>Edit</MenuItem>}
						{!isVoice && <MenuItem bg='transparent' onClick={onCopy}>Copy</MenuItem>}
						<MenuItem bg='transparent' color='red.300' onClick={onUnsend}>
							Unsend
						</MenuItem>
					</MenuList>
				</Menu>
			)}
			<Box
				maxW='75%'
				px={isVoice ? 3 : 4}
				py={2}
				borderRadius='2xl'
				bg={mine ? "blue.500" : "whiteAlpha.200"}
				color='white'
				opacity={msg.pending ? 0.6 : 1}
				wordBreak='break-word'
				whiteSpace='pre-wrap'
				userSelect={canAct ? "none" : "text"}
				sx={{ WebkitTouchCallout: "none" }}
				{...pressHandlers}
			>
				{isVoice ? <VoiceNote msg={msg} /> : msg.message}
				<Text fontSize='10px' mt={1} textAlign='right' color={msg.failed ? "red.200" : "whiteAlpha.700"}>
					{msg.failed
						? "Not sent"
						: `${msg.editedAt ? "Edited · " : ""}${new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
				</Text>
			</Box>
		</Flex>
	);
}

function VoiceNote({ msg }) {
	const audioRef = useRef(null);
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const duration = msg.duration || 0;

	const toggle = () => {
		const a = audioRef.current;
		if (!a) return;
		if (a.paused) a.play().catch(() => {});
		else a.pause();
	};

	return (
		<Flex alignItems='center' gap={2} minW='190px'>
			{msg.audioFileId && (
				<audio
					ref={audioRef}
					src={mediaUrl(msg.audioFileId)}
					preload='metadata'
					onPlay={() => setPlaying(true)}
					onPause={() => setPlaying(false)}
					onEnded={() => {
						setPlaying(false);
						setProgress(0);
					}}
					onTimeUpdate={(e) => setProgress(duration ? Math.min(e.target.currentTime / duration, 1) : 0)}
				/>
			)}
			<IconButton
				aria-label={playing ? "Pause voice message" : "Play voice message"}
				icon={msg.pending ? <Spinner size='xs' /> : playing ? <BsPauseFill /> : <BsPlayFill />}
				size='sm'
				borderRadius='full'
				bg='whiteAlpha.300'
				_hover={{ bg: "whiteAlpha.400" }}
				color='white'
				onClick={toggle}
				isDisabled={!msg.audioFileId}
			/>
			<Box flex={1} h='3px' bg='whiteAlpha.400' borderRadius='full' overflow='hidden'>
				<Box h='full' w={`${progress * 100}%`} bg='white' />
			</Box>
			<Text fontSize='xs' fontVariantNumeric='tabular-nums'>
				{fmt(duration)}
			</Text>
		</Flex>
	);
}
