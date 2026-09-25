import { Box, Flex, Link, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";
import SuggestedHeader from "./SuggestedHeader";
import useGetSuggestedUsers from "../../hooks/useGetSuggestedUsers";

const FOOTER_LINKS = [
	{ label: "About", href: "https://portfolio-8jmo.onrender.com/" },
	{ label: "Get the app", to: "/download" },
	{ label: "Search", to: "/search" },
	{ label: "Reels", to: "/reels" },
	{ label: "Messages", to: "/messages" },
];

// instagram.com's right column: your account, "Suggested for you", footer links.
export default function SuggestedUsers({ authUser, onLogout }) {
	const user = authUser.user ? authUser.user : authUser;
	const { isLoading, suggestedUsers } = useGetSuggestedUsers(user);

	return (
		<VStack pt={9} px={4} spacing={4} align='stretch'>
			<SuggestedHeader user={user} onLogout={onLogout} />

			{(isLoading || suggestedUsers.length > 0) && (
				<Flex alignItems='center' justifyContent='space-between' mt={2}>
					<Text fontSize='sm' fontWeight='semibold' color='ig.secondary'>
						Suggested for you
					</Text>
					<Link as={RouterLink} to='/search' fontSize='xs' fontWeight='semibold' _hover={{ color: "ig.secondary" }}>
						See all
					</Link>
				</Flex>
			)}

			{isLoading &&
				[0, 1, 2, 3].map((i) => (
					<Flex key={i} gap={3} alignItems='center'>
						<SkeletonCircle size='11' />
						<Box flex={1}>
							<Skeleton h='10px' w='60%' mb={2} />
							<Skeleton h='8px' w='80%' />
						</Box>
					</Flex>
				))}

			{!isLoading && suggestedUsers.map((u) => <SuggestedUser key={u._id} user={u} />)}

			<Box pt={6} fontSize='xs' color='ig.secondary' lineHeight='tall'>
				{FOOTER_LINKS.map((l, i) => (
					<span key={l.label}>
						{l.to ? (
							<Link as={RouterLink} to={l.to} _hover={{ textDecoration: "underline" }}>
								{l.label}
							</Link>
						) : (
							<Link href={l.href} isExternal _hover={{ textDecoration: "underline" }}>
								{l.label}
							</Link>
						)}
						{i < FOOTER_LINKS.length - 1 && " · "}
					</span>
				))}
				<Text mt={4} textTransform='uppercase'>
					© {new Date().getFullYear()} Instagram clone by{" "}
					<Link href='https://portfolio-8jmo.onrender.com/' isExternal color='ig.text'>
						Abakah Joshua
					</Link>
				</Text>
			</Box>
		</VStack>
	);
}
