import { Box, Link, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ReelsLogo } from "../../assets/constants";

const ReelsLink = () => (
	<Tooltip hasArrow label={"Reels"} placement='right' ml={1} openDelay={500} display={{ base: "block", xl: "none" }}>
		<Link
			display={"flex"}
			to={"/reels"}
			as={RouterLink}
			alignItems={"center"}
			gap={4}
			_hover={{ bg: "whiteAlpha.400" }}
			borderRadius={6}
			p={2}
			w={{ base: 10, xl: "full" }}
			justifyContent={{ base: "center", xl: "flex-start" }}
		>
			<ReelsLogo />
			<Box display={{ base: "none", xl: "block" }}>Reels</Box>
		</Link>
	</Tooltip>
);

export default ReelsLink;
