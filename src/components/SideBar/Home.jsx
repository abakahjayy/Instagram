import { Box, Link, Tooltip } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
	return (
		<Tooltip
			hasArrow
			label={"Home"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", xl: "none" }}
		>
			<Link
				display={"flex"}
				to={"/"}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, xl: "full" }}
				justifyContent={{ base: "center", xl: "flex-start" }}
			>
				<AiFillHome size={25} />
				<Box display={{ base: "none", xl: "block" }}>Home</Box>
			</Link>
		</Tooltip>
	);
};

export default Home;
