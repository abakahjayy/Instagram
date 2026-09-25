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
	Collapse,
	Flex,
	Heading,
	Image,
	Link,
	ListItem,
	OrderedList,
	Text,
	VStack,
} from "@chakra-ui/react";
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { FaAndroid, FaApple, FaWindows } from "react-icons/fa";
import { MdLaptopMac } from "react-icons/md";
import { FiShare2 } from "react-icons/fi";
import { detectDevice, usePwaInstall } from "../../utils/install";
import useShowToast from "../../hooks/useShowToast";

// Public address of the site - links shared from here must never be localhost.
const PUBLIC_SITE = "https://instagrammmm-z34p.onrender.com";

// Two ways to get the app:
// 1. Install from the browser (PWA). No file download, so no "dangerous download"
//    warning, and it updates itself. This is the main button.
// 2. Installer files. Browsers warn about every APK from outside Google Play and
//    every .exe that isn't code-signed - nothing on the website can switch that
//    off - so these are offered second, with honest instructions.
//    Windows: EXE (GitHub Release built from desktop/). Android: the signed APK in
//    public/downloads (targets Android 16, runs on Android 5 and newer).
const EXE = {
	label: "Download installer (.exe)",
	href: "https://github.com/abakahjayy/Instagram/releases/latest/download/Nsoro-Setup.exe",
	size: "78 MB",
	file: "Nsoro-Setup.exe",
};

const APK = {
	label: "Download Android app (.apk)",
	href: "/downloads/Instagram.apk",
	size: "1.5 MB",
	file: "Nsoro.apk",
};

// Where the "Install app" command lives when the browser doesn't offer the prompt.
const MENU_STEPS = {
	android: {
		chrome: ["Tap ⋮ at the top right of Chrome.", "Tap “Add to Home screen”, then “Install”."],
		samsung: ["Tap ☰ at the bottom right.", "Tap “Add page to” → “Home screen”."],
		edge: ["Tap ⋯ at the bottom.", "Tap “Add to phone”, then “Install”."],
		other: ["Open this page in Chrome.", "Tap ⋮ → “Add to Home screen” → “Install”."],
	},
	desktop: {
		chrome: ["Click the install icon (a screen with an arrow) at the right of the address bar.", "Or: ⋮ → “Cast, save and share” → “Install page as app…”."],
		edge: ["Click the “App available” icon at the right of the address bar.", "Or: ⋯ → “Apps” → “Install this site as an app”."],
		other: ["This browser can't install apps. Open this page in Chrome or Microsoft Edge."],
	},
};

const PLATFORMS = [
	{
		// The browser install (WebAPK) is the main button: no warning, updates itself.
		// The APK is offered too, for phones and browsers that can't install from the page.
		key: "android",
		name: "Android",
		icon: FaAndroid,
		steps: [
			"Open this page in Chrome on your phone and tap “Install Nsoro”.",
			"No button? Tap ⋮ at the top right → “Add to Home screen” → “Install”.",
			"Nsoro appears in your app drawer and home screen - no download, no warnings.",
		],
		file: APK,
		fileSteps: [
			"Tap “Download Android app”. If the browser warns, tap “Download anyway”.",
			"Open Nsoro.apk from the notification or My Files → Downloads.",
			"Asked to allow installs from this source? Tap Settings → turn on “Allow from this source” → go back.",
			"Samsung says the install was blocked (Auto Blocker)? Settings → Security and privacy → Auto Blocker → turn it off, install Nsoro, then turn it back on.",
			"Play Protect warning? Tap “More details” → “Install anyway”. Then open Nsoro and tap Allow for notifications.",
		],
	},
	{
		key: "windows",
		name: "Windows",
		icon: FaWindows,
		file: EXE,
		fileSteps: [
			"Click “Download installer”. If the browser warns, choose Keep (Edge: ⋯ → Keep → Keep anyway).",
			"Run Nsoro-Setup.exe. If “Windows protected your PC” appears, click More info → Run anyway.",
			"Nsoro installs and opens, with Start menu and desktop shortcuts.",
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
			"Nsoro appears on your home screen and opens full screen.",
		],
	},
	{
		key: "mac",
		name: "Mac",
		icon: MdLaptopMac,
		steps: [
			"Chrome or Edge: click “Install Nsoro” on this page, or the install icon in the address bar.",
			"Safari (macOS Sonoma or later): choose File → Add to Dock.",
			"Nsoro opens in its own window from the Dock and Launchpad.",
		],
	},
];

function Steps({ steps }) {
	return (
		<OrderedList spacing={2} color='gray.300' fontSize='sm'>
			{steps.map((s) => (
				<ListItem key={s}>{s}</ListItem>
			))}
		</OrderedList>
	);
}

function FileDownload({ platform, openByDefault = false }) {
	const [open, setOpen] = useState(openByDefault);
	const f = platform.file;
	return (
		<Box>
			<Button
				variant='link'
				size='sm'
				color='gray.300'
				rightIcon={open ? <ChevronUpIcon /> : <ChevronDownIcon />}
				onClick={() => setOpen(!open)}
			>
				Prefer an installer file? ({f.file.endsWith(".apk") ? ".apk" : ".exe"})
			</Button>
			<Collapse in={open} animateOpacity>
				<Box mt={3} p={4} borderRadius='lg' bg='whiteAlpha.100'>
					<Flex gap={2} mb={3} alignItems='flex-start'>
						<InfoOutlineIcon mt='3px' color='yellow.300' />
						<Text fontSize='sm' color='gray.300'>
							Your browser will warn that this file could be harmful. It says that about every{" "}
							{platform.key === "android" ? "app from outside Google Play" : "program that isn't code-signed"} - the
							file is safe. Installing from the button above avoids the warning.
						</Text>
					</Flex>
					<Button
						as='a'
						href={f.href}
						download={f.href.startsWith("/") ? f.file : undefined}
						type={f.file.endsWith(".apk") ? "application/vnd.android.package-archive" : undefined}
						leftIcon={<DownloadIcon />}
						variant='outline'
						w='full'
						mb={3}
					>
						{f.label}
						<Text as='span' fontWeight='normal' fontSize='sm' ml={2} opacity={0.8}>
							· {f.size}
						</Text>
					</Button>
					<Steps steps={platform.fileSteps} />
				</Box>
			</Collapse>
		</Box>
	);
}

export default function DownloadPage() {
	const device = detectDevice();
	const { canInstall, install, installed } = usePwaInstall();
	const showToast = useShowToast();
	const [justInstalled, setJustInstalled] = useState(false);
	const current = PLATFORMS.find((p) => p.key === device.os) || (device.os === "chromeos" ? PLATFORMS[1] : null);
	const others = PLATFORMS.filter((p) => p !== current);
	const browserInstallable = ["android", "windows", "mac", "chromeos"].includes(device.os) && !device.isIOS;
	const menuSteps = device.os === "android"
		? MENU_STEPS.android[device.browser] || MENU_STEPS.android.other
		: MENU_STEPS.desktop[device.browser] || MENU_STEPS.desktop.other;
	const showFallbackSteps = browserInstallable && !canInstall && !(device.os === "mac" && device.browser === "safari");

	const onInstall = async () => {
		if ((await install()) === "accepted") {
			setJustInstalled(true);
			showToast("Installing Nsoro", "Find it on your home screen or in your apps.", "success");
		}
	};

	const shareDownloadPage = async () => {
		const url = `${PUBLIC_SITE}/download`;
		try {
			if (navigator.share) await navigator.share({ title: "Get the Nsoro app", url });
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
				<Image src='/icons/icon-192.png' alt='Nsoro app icon' w={{ base: "84px", md: "104px" }} borderRadius='22%' />
				<Heading size={{ base: "lg", md: "xl" }}>Get the Nsoro app</Heading>
				<Text color='gray.400' maxW='460px'>
					Free for Android, Windows, iPhone, iPad and Mac.
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
								{installed ? "You opened Nsoro from your home screen or apps." : "Open Nsoro from your home screen or apps."}
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

						{canInstall && (
							<Box mb={4}>
								<Button leftIcon={<DownloadIcon />} colorScheme='blue' size='lg' w='full' onClick={onInstall}>
									Install Nsoro
								</Button>
								<Text fontSize='xs' color='gray.400' textAlign='center' mt={2}>
									No download, no warnings · installs in seconds · updates itself
								</Text>
							</Box>
						)}

						{showFallbackSteps && (
							<Box mb={4}>
								<Text fontSize='sm' fontWeight='semibold' mb={2}>
									Install from your browser - no download, no warnings:
								</Text>
								<Steps steps={menuSteps} />
							</Box>
						)}

						{/* Android phones already see the Install button or the menu steps above */}
						{current?.steps && current.key !== "android" && <Steps steps={current.steps} />}
						{current?.file && <FileDownload platform={current} openByDefault={!browserInstallable || current.key === "android"} />}
						{!current && <Text color='gray.300'>Pick your device below.</Text>}
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
							{p.file ? (
								<>
									<Text fontSize='sm' color='gray.300' mb={3}>
										Best: open this page on that device and tap “Install Nsoro” - no download, no warnings.
									</Text>
									<FileDownload platform={p} />
								</>
							) : (
								<Steps steps={p.steps} />
							)}
						</AccordionPanel>
					</AccordionItem>
				))}
			</Accordion>

			<Flex direction='column' alignItems='center' gap={2} mt={8}>
				<Button leftIcon={<FiShare2 />} variant='ghost' size='sm' onClick={shareDownloadPage}>
					Share this page
				</Button>
				<Text color='gray.500' fontSize='xs' textAlign='center'>
					Installer files are also on{" "}
					<Link href='https://github.com/abakahjayy/Instagram/releases/latest' isExternal color='blue.300'>
						the releases page
					</Link>
					.
				</Text>
			</Flex>
		</Box>
	);
}
