import { useState } from "react";
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	Image,
	ListItem,
	OrderedList,
	Text,
	VStack,
} from "@chakra-ui/react";
import { CheckCircleIcon, DownloadIcon } from "@chakra-ui/icons";
import { FaAndroid, FaApple, FaWindows } from "react-icons/fa";
import { MdLaptopMac } from "react-icons/md";
import { detectDevice, usePwaInstall } from "../../utils/install";
import useShowToast from "../../hooks/useShowToast";

// Step-by-step install instructions per platform. The app is a PWA: it installs
// straight from the browser, gets its own icon/window, and updates itself.
const PLATFORMS = [
	{
		key: "ios",
		name: "iPhone & iPad",
		icon: FaApple,
		steps: [
			"Open this page in Safari (Chrome on iOS 16.4+ works too).",
			"Tap the Share button (the square with an arrow pointing up).",
			"Scroll down and tap “Add to Home Screen”.",
			"Tap “Add”. Instagram appears on your home screen and opens full screen.",
		],
	},
	{
		key: "android",
		name: "Android",
		icon: FaAndroid,
		steps: [
			"Open this page in Chrome (Samsung Internet and Edge work too).",
			"Tap “Install app” above - or open the ⋮ menu and tap “Install app”.",
			"Confirm. Instagram is added to your home screen and app drawer.",
		],
	},
	{
		key: "windows",
		name: "Windows",
		icon: FaWindows,
		steps: [
			"Open this page in Microsoft Edge or Google Chrome.",
			"Click “Install app” above - or click the install icon at the right of the address bar.",
			"Instagram opens in its own window and is added to the Start menu. Right-click it in the taskbar to pin it.",
		],
	},
	{
		key: "mac",
		name: "Mac",
		icon: MdLaptopMac,
		steps: [
			"Chrome or Edge: click “Install app” above, or the install icon in the address bar.",
			"Safari (macOS Sonoma or later): choose File → Add to Dock.",
			"Instagram opens in its own window from the Dock and Launchpad.",
		],
	},
];

export default function DownloadPage() {
	const device = detectDevice();
	const { canInstall, install, installed } = usePwaInstall();
	const showToast = useShowToast();
	const [justInstalled, setJustInstalled] = useState(false);
	const current = PLATFORMS.find((p) => p.key === device.os) || (device.os === "chromeos" ? PLATFORMS[2] : null);
	const others = PLATFORMS.filter((p) => p !== current);
	const firefoxDesktop = device.browser === "firefox" && !device.isMobile;

	const onInstall = async () => {
		const outcome = await install();
		if (outcome === "accepted") {
			setJustInstalled(true);
			showToast("Installing Instagram", "Find it on your home screen or in your apps.", "success");
		}
	};

	return (
		<Box maxW='640px' mx='auto' px={4} py={{ base: 6, md: 12 }}>
			<VStack spacing={4} textAlign='center' mb={8}>
				<Image src='/icons/icon-192.png' alt='Instagram app icon' w={{ base: "84px", md: "104px" }} borderRadius='22%' />
				<Heading size={{ base: "lg", md: "xl" }}>Get the Instagram app</Heading>
				<Text color='gray.400' maxW='440px'>
					Free, and it installs in seconds - no app store needed. It gets its own icon, opens full screen and updates
					itself.
				</Text>
			</VStack>

			{/* The device you're on */}
			<Box border='1px solid' borderColor='whiteAlpha.300' borderRadius='xl' p={{ base: 5, md: 6 }} mb={6}>
				{installed || justInstalled ? (
					<Flex alignItems='center' gap={3}>
						<CheckCircleIcon color='green.400' boxSize={6} />
						<Box>
							<Text fontWeight='bold'>{installed ? "You're using the app" : "Installed"}</Text>
							<Text color='gray.400' fontSize='sm'>
								{installed ? "You opened Instagram from your home screen or apps." : "Open Instagram from your home screen or apps."}
							</Text>
						</Box>
					</Flex>
				) : (
					<>
						<Flex alignItems='center' gap={2} mb={4}>
							{current && <current.icon size={22} />}
							<Text fontWeight='bold' fontSize='lg'>
								{current ? `Install on ${current.name}` : "Install on this device"}
							</Text>
							<Badge colorScheme='blue' ml='auto'>
								This device
							</Badge>
						</Flex>

						{canInstall && (
							<Button leftIcon={<DownloadIcon />} colorScheme='blue' size='lg' w='full' mb={4} onClick={onInstall}>
								Install app
							</Button>
						)}

						{firefoxDesktop ? (
							<Text color='gray.300'>
								Firefox can&apos;t install apps on computers. Open this page in Chrome or Microsoft Edge to install
								Instagram.
							</Text>
						) : current ? (
							<OrderedList spacing={2} color='gray.300' fontSize='sm'>
								{current.steps.map((s) => (
									<ListItem key={s}>{s}</ListItem>
								))}
							</OrderedList>
						) : (
							<Text color='gray.300'>Open this page in Chrome, Edge or Safari to install Instagram.</Text>
						)}
					</>
				)}
			</Box>

			{/* Everything else */}
			<Text fontWeight='bold' mb={2}>
				Other devices
			</Text>
			<Accordion allowToggle border='1px solid' borderColor='whiteAlpha.300' borderRadius='xl' overflow='hidden'>
				{others.map((p) => (
					<AccordionItem key={p.key} borderColor='whiteAlpha.200'>
						<AccordionButton py={4}>
							<Flex flex={1} alignItems='center' gap={3} textAlign='left'>
								<p.icon size={20} />
								<Text fontWeight='semibold'>{p.name}</Text>
							</Flex>
							<AccordionIcon />
						</AccordionButton>
						<AccordionPanel pb={4}>
							<OrderedList spacing={2} color='gray.300' fontSize='sm'>
								{p.steps.map((s) => (
									<ListItem key={s}>{s}</ListItem>
								))}
							</OrderedList>
						</AccordionPanel>
					</AccordionItem>
				))}
			</Accordion>

			<Text color='gray.500' fontSize='xs' textAlign='center' mt={8}>
				Tip: share this page - {window.location.origin}/download
			</Text>
		</Box>
	);
}
