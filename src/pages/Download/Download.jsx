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
	Link,
	ListItem,
	OrderedList,
	Text,
	VStack,
} from "@chakra-ui/react";
import { CheckCircleIcon, DownloadIcon } from "@chakra-ui/icons";
import { FaAndroid, FaApple, FaWindows } from "react-icons/fa";
import { MdLaptopMac } from "react-icons/md";
import { FiShare2 } from "react-icons/fi";
import { detectDevice, usePwaInstall } from "../../utils/install";
import useShowToast from "../../hooks/useShowToast";

// Public address of the site - links shared from here must never be localhost.
const PUBLIC_SITE = "https://instagrammmm-z34p.onrender.com";

// Native downloads. The APK is served by the site (public/downloads); the Windows
// installer is too big for the site, so it's a GitHub Release asset - the
// /releases/latest/download/ URL always points at the newest version.
// Rebuild: Android via PWABuilder (see "Instagram App Packages" on the Desktop),
// Windows via `npm run dist` in desktop/.
const APK_URL = "/downloads/Instagram.apk";
const APK_SIZE = "1.5 MB";
const EXE_URL = "https://github.com/abakahjayy/Instagram/releases/latest/download/Instagram-Setup.exe";
const EXE_SIZE = "78 MB";

const PLATFORMS = [
	{
		key: "android",
		name: "Android",
		icon: FaAndroid,
		download: { label: "Download for Android (APK)", href: APK_URL, size: APK_SIZE, file: "Instagram.apk" },
		steps: [
			"Tap “Download for Android” and open Instagram.apk when it finishes.",
			"If asked, allow your browser to “Install unknown apps” (Settings opens for you), then go back.",
			"Tap Install. Instagram appears in your app drawer and home screen.",
		],
	},
	{
		key: "windows",
		name: "Windows",
		icon: FaWindows,
		download: { label: "Download for Windows (.exe)", href: EXE_URL, size: EXE_SIZE, file: "Instagram-Setup.exe" },
		steps: [
			"Click “Download for Windows” and run Instagram-Setup.exe.",
			"If Windows shows “Windows protected your PC”, click More info → Run anyway (the installer isn't code-signed yet).",
			"Instagram installs and opens. It's in the Start menu and on your desktop.",
		],
	},
	{
		key: "ios",
		name: "iPhone & iPad",
		icon: FaApple,
		steps: [
			"Open this page in Safari (Chrome on iOS 16.4+ works too).",
			"Tap the Share button (the square with an arrow pointing up).",
			"Scroll down and tap “Add to Home Screen”, then tap “Add”.",
			"Instagram appears on your home screen and opens full screen.",
		],
	},
	{
		key: "mac",
		name: "Mac",
		icon: MdLaptopMac,
		steps: [
			"Chrome or Edge: click “Install app” on this page, or the install icon in the address bar.",
			"Safari (macOS Sonoma or later): choose File → Add to Dock.",
			"Instagram opens in its own window from the Dock and Launchpad.",
		],
	},
];

function DownloadButton({ download, primary = true }) {
	return (
		<Button
			as='a'
			href={download.href}
			download={download.href.startsWith("/") ? download.file : undefined}
			leftIcon={<DownloadIcon />}
			colorScheme={primary ? "blue" : "gray"}
			size={primary ? "lg" : "md"}
			w='full'
		>
			{download.label}
			<Text as='span' fontWeight='normal' fontSize='sm' ml={2} opacity={0.8}>
				· {download.size}
			</Text>
		</Button>
	);
}

function Steps({ steps }) {
	return (
		<OrderedList spacing={2} color='gray.300' fontSize='sm'>
			{steps.map((s) => (
				<ListItem key={s}>{s}</ListItem>
			))}
		</OrderedList>
	);
}

export default function DownloadPage() {
	const device = detectDevice();
	const { canInstall, install, installed } = usePwaInstall();
	const showToast = useShowToast();
	const [justInstalled, setJustInstalled] = useState(false);
	const current = PLATFORMS.find((p) => p.key === device.os) || (device.os === "chromeos" ? PLATFORMS[1] : null);
	const others = PLATFORMS.filter((p) => p !== current);

	const onInstall = async () => {
		if ((await install()) === "accepted") {
			setJustInstalled(true);
			showToast("Installing Instagram", "Find it on your home screen or in your apps.", "success");
		}
	};

	const shareDownloadPage = async () => {
		const url = `${PUBLIC_SITE}/download`;
		try {
			if (navigator.share) await navigator.share({ title: "Get the Instagram app", url });
			else {
				await navigator.clipboard.writeText(url);
				showToast("Link copied", url, "success", 2500);
			}
		} catch {
			/* share sheet dismissed */
		}
	};

	return (
		<Box maxW='640px' mx='auto' px={4} py={{ base: 6, md: 12 }}>
			<VStack spacing={4} textAlign='center' mb={8}>
				<Image src='/icons/icon-192.png' alt='Instagram app icon' w={{ base: "84px", md: "104px" }} borderRadius='22%' />
				<Heading size={{ base: "lg", md: "xl" }}>Get the Instagram app</Heading>
				<Text color='gray.400' maxW='460px'>
					Free for Android, Windows, iPhone, iPad and Mac. Download the app, or install it straight from your browser.
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
								{current ? `Get it on ${current.name}` : "Get it on this device"}
							</Text>
							<Badge colorScheme='blue' ml='auto'>
								This device
							</Badge>
						</Flex>

						<VStack spacing={3} mb={4} align='stretch'>
							{current?.download && <DownloadButton download={current.download} />}
							{/* Browser install: the main option on Mac/iPhone-less desktops, an alternative elsewhere */}
							{canInstall && (
								<Button leftIcon={<DownloadIcon />} variant={current?.download ? "outline" : "solid"} colorScheme='blue' size={current?.download ? "md" : "lg"} onClick={onInstall}>
									{current?.download ? "Or install from this browser" : "Install app"}
								</Button>
							)}
						</VStack>

						{current ? <Steps steps={current.steps} /> : <Text color='gray.300'>Pick your device below.</Text>}
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
							{p.download && (
								<Box mb={3}>
									<DownloadButton download={p.download} primary={false} />
								</Box>
							)}
							<Steps steps={p.steps} />
						</AccordionPanel>
					</AccordionItem>
				))}
			</Accordion>

			<Flex direction='column' alignItems='center' gap={2} mt={8}>
				<Button leftIcon={<FiShare2 />} variant='ghost' size='sm' onClick={shareDownloadPage}>
					Share this page
				</Button>
				<Text color='gray.500' fontSize='xs' textAlign='center'>
					All versions are also on{" "}
					<Link href='https://github.com/abakahjayy/Instagram/releases/latest' isExternal color='blue.300'>
						the releases page
					</Link>
					.
				</Text>
			</Flex>
		</Box>
	);
}
