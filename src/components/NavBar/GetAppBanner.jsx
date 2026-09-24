import { useState } from "react";
import { Button, CloseButton, Flex, Image, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { isInstalled } from "../../utils/install";

const KEY = "get-app-banner-dismissed";
const wasDismissed = () => {
	try {
		return localStorage.getItem(KEY) === "1";
	} catch {
		return false;
	}
};

// Slim "Get the app" strip at the top of the phone feed, like instagram.com on mobile.
// Phones only, never inside the installed app, and stays closed once dismissed.
export default function GetAppBanner() {
	const [hidden, setHidden] = useState(() => isInstalled() || wasDismissed());
	if (hidden) return null;

	const dismiss = () => {
		setHidden(true);
		try {
			localStorage.setItem(KEY, "1");
		} catch {
			/* private mode - just hide for this visit */
		}
	};

	return (
		<Flex display={{ base: "flex", md: "none" }} alignItems='center' gap={3} px={3} py={2} bg='whiteAlpha.100' borderBottom='1px solid' borderColor='whiteAlpha.200'>
			<CloseButton size='sm' onClick={dismiss} aria-label='Dismiss' />
			<Image src='/icons/icon-192.png' alt='' w='36px' h='36px' borderRadius='22%' />
			<Flex direction='column' flex={1} minW={0}>
				<Text fontSize='sm' fontWeight='semibold' noOfLines={1}>
					Instagram
				</Text>
				<Text fontSize='xs' color='gray.400' noOfLines={1}>
					Get the app - it&apos;s free
				</Text>
			</Flex>
			<Button as={RouterLink} to='/download' size='sm' colorScheme='blue' borderRadius='lg'>
				Get
			</Button>
		</Flex>
	);
}
