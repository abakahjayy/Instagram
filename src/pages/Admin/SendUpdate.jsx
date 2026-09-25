import { useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Input,
	Text,
	Textarea,
	useDisclosure,
} from "@chakra-ui/react";
import API from "../../utils/api";
import { getAuthToken } from "../../utils/auth";
import useAuthStore from "../../store/useAuthStore";
import useShowToast from "../../hooks/useShowToast";

// /admin/updates - email an app update / announcement to everyone who hasn't
// turned emails off. Admins only (User.role === "admin"; the backend enforces it).
export default function SendUpdatePage() {
	const authUser = useAuthStore((state) => state.user);
	const user = authUser?.user || authUser;
	const showToast = useShowToast();
	const [form, setForm] = useState({ subject: "", message: "", ctaLabel: "Open Nsoro", ctaPath: "/" });
	const [sending, setSending] = useState(null); // "test" | "all"
	const confirm = useDisclosure();
	const cancelRef = useRef(null);

	if (user?.role !== "admin") {
		return (
			<Box maxW='560px' mx='auto' px={4} py={12} textAlign='center'>
				<Heading size='md' mb={2}>Admins only</Heading>
				<Text color='gray.400'>This page is for sending app updates to everyone.</Text>
			</Box>
		);
	}

	const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
	const ready = form.subject.trim() && form.message.trim();

	const send = async (test) => {
		confirm.onClose();
		setSending(test ? "test" : "all");
		try {
			const { data } = await API.post("/api/v1/instagram/updates", { ...form, test }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
			showToast(
				test ? "Test sent" : "Update sent",
				test ? "Check your inbox." : `Emailed ${data.sent} of ${data.attempted} people${data.truncated ? " - daily cap reached, send again tomorrow for the rest" : ""}.`,
				"success",
				6000
			);
		} catch (error) {
			showToast("Couldn't send", error.response?.data?.error || error.message, "error");
		} finally {
			setSending(null);
		}
	};

	return (
		<Box maxW='560px' mx='auto' px={4} py={{ base: 6, md: 10 }}>
			<Heading size='lg' mb={1}>Send an update</Heading>
			<Text color='gray.400' mb={6} fontSize='sm'>
				Emails everyone who has email notifications on. Send yourself a test first.
			</Text>

			<FormControl mb={4}>
				<FormLabel>Subject</FormLabel>
				<Input value={form.subject} onChange={set("subject")} placeholder='New: Stories, Reels and voice messages' maxLength={120} />
			</FormControl>
			<FormControl mb={4}>
				<FormLabel>Message</FormLabel>
				<Textarea value={form.message} onChange={set("message")} rows={8} placeholder={"What's new?\n\nLeave a blank line between paragraphs."} maxLength={5000} />
			</FormControl>
			<Flex gap={3} mb={6} direction={{ base: "column", sm: "row" }}>
				<FormControl>
					<FormLabel>Button text</FormLabel>
					<Input value={form.ctaLabel} onChange={set("ctaLabel")} maxLength={40} />
				</FormControl>
				<FormControl>
					<FormLabel>Button opens</FormLabel>
					<Input value={form.ctaPath} onChange={set("ctaPath")} placeholder='/reels' />
					<FormHelperText>A page on the site, e.g. /download</FormHelperText>
				</FormControl>
			</Flex>

			<Flex gap={3} direction={{ base: "column", sm: "row" }}>
				<Button variant='outline' flex={1} isDisabled={!ready} isLoading={sending === "test"} onClick={() => send(true)}>
					Send a test to me
				</Button>
				<Button colorScheme='blue' flex={1} isDisabled={!ready} isLoading={sending === "all"} onClick={confirm.onOpen}>
					Send to everyone
				</Button>
			</Flex>

			<AlertDialog isOpen={confirm.isOpen} leastDestructiveRef={cancelRef} onClose={confirm.onClose} isCentered>
				<AlertDialogOverlay>
					<AlertDialogContent bg='gray.900' mx={4}>
						<AlertDialogHeader>Email everyone?</AlertDialogHeader>
						<AlertDialogBody>“{form.subject}” goes to every user with email notifications on. This can&apos;t be undone.</AlertDialogBody>
						<AlertDialogFooter gap={3}>
							<Button ref={cancelRef} onClick={confirm.onClose} variant='ghost'>Cancel</Button>
							<Button colorScheme='blue' onClick={() => send(false)}>Send</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
}
