import { Box, Link, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import { isInstalled } from "../../utils/install";

// "Get the app" -> /download. Hidden when already running as the installed app.
const GetAppLink = () => {
	if (isInstalled()) return null;
	return (
		<Tooltip hasArrow label={"Get the app"} placement='right' ml={1} openDelay={500} display={{ base: "block", xl: "none" }}>
			<Link
				display={"flex"}
				to={"/download"}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, xl: "full" }}
				justifyContent={{ base: "center", xl: "flex-start" }}
			>
				<FiDownload size={24} />
				<Box display={{ base: "none", xl: "block" }}>Get the app</Box>
			</Link>
		</Tooltip>
	);
};

export default GetAppLink;
