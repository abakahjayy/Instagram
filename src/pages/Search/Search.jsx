import { useEffect, useState } from "react";
import { Avatar, Box, Flex, Input, InputGroup, InputLeftElement, Link, Spinner, Text, VStack } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import API from "../../utils/api";
import { avatarUrl } from "../../utils/media";
import PostGrid from "../../components/Profile/PostGrid";

// /search - people search as you type; Explore grid of recent posts while the box is empty.
export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);

	useEffect(() => {
		const q = query.trim();
		if (!q) {
			setResults([]);
			return;
		}
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			setIsSearching(true);
			try {
				const { data } = await API.get("/api/v1/users/search", { params: { q }, signal: controller.signal });
				setResults(data.users);
			} catch {
				// aborted or failed - keep the previous results
			} finally {
				setIsSearching(false);
			}
		}, 250);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query]);

	return (
		<Box maxW='container.md' mx='auto' px={{ base: 2, md: 4 }} py={{ base: 3, md: 8 }}>
			<InputGroup mb={4}>
				<InputLeftElement pointerEvents='none'>
					<SearchIcon color='gray.500' />
				</InputLeftElement>
				<Input
					placeholder='Search'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					bg='whiteAlpha.100'
					border='none'
					borderRadius='lg'
					autoFocus
				/>
			</InputGroup>

			{query.trim() ? <UserResults users={results} isSearching={isSearching} /> : <Explore />}
		</Box>
	);
}

function UserResults({ users, isSearching }) {
	if (isSearching && users.length === 0) {
		return (
			<Flex justifyContent='center' py={6}>
				<Spinner />
			</Flex>
		);
	}
	if (users.length === 0) return <Text color='gray.400'>No accounts found.</Text>;
	return (
		<VStack align='stretch' spacing={1}>
			{users.map((u) => (
				<Link
					as={RouterLink}
					to={`/${u.username}`}
					key={u._id}
					_hover={{ textDecoration: "none", bg: "whiteAlpha.100" }}
					borderRadius='md'
					p={2}
				>
					<Flex alignItems='center' gap={3}>
						<Avatar size='md' src={avatarUrl(u)} referrerPolicy='no-referrer' name={u.username} />
						<Box>
							<Text fontWeight='bold' fontSize='sm'>
								{u.username}
							</Text>
							<Text color='gray.400' fontSize='sm'>
								{u.firstName} {u.lastName} · {u.followers?.length || 0} followers
							</Text>
						</Box>
					</Flex>
				</Link>
			))}
		</VStack>
	);
}

function Explore() {
	const [posts, setPosts] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		API.get("/api/v1/posts", { signal: controller.signal })
			.then(({ data }) => setPosts(data.posts))
			.catch(() => setPosts([]));
		return () => controller.abort();
	}, []);

	return <PostGrid posts={posts} emptyText='Nothing to explore yet.' />;
}
