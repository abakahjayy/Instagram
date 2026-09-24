import { useEffect } from "react";
import { Avatar, Box, Flex, Heading, Image, Link, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import useNotificationStore from "../../store/useNotificationStore";
import { useMarkNotificationsRead } from "../../hooks/useNotifications";
import { avatarUrl, imageUrl, mediaUrl } from "../../utils/media";
import { timeAgo } from "../../utils/timeAgo";

const describe = (n) => {
	if (n.type === "like") return "liked your post.";
	if (n.type === "follow") return "started following you.";
	return `commented: ${n.text}`;
};

// Groups like Instagram: Today / This week / Earlier.
const groupOf = (date) => {
	const age = Date.now() - new Date(date).getTime();
	if (age < 864e5) return "Today";
	if (age < 7 * 864e5) return "This week";
	return "Earlier";
};

export default function NotificationsPage() {
	const { notifications, loaded } = useNotificationStore();
	const markRead = useMarkNotificationsRead();

	// Opening the page counts as seeing everything, like Instagram's activity tab.
	useEffect(() => {
		if (loaded) markRead();
	}, [loaded, markRead]);

	const groups = ["Today", "This week", "Earlier"]
		.map((label) => ({ label, items: notifications.filter((n) => groupOf(n.createdAt) === label) }))
		.filter((g) => g.items.length);

	return (
		<Box maxW='container.sm' mx='auto' px={4} py={{ base: 4, md: 8 }}>
			<Heading size='lg' mb={6}>
				Notifications
			</Heading>

			{!loaded &&
				[0, 1, 2, 3].map((i) => (
					<Flex key={i} gap={3} alignItems='center' mb={5}>
						<SkeletonCircle size='11' />
						<Skeleton h='10px' flex={1} />
					</Flex>
				))}

			{loaded && notifications.length === 0 && (
				<Text color='gray.400'>When someone likes or comments on your posts, or follows you, you&apos;ll see it here.</Text>
			)}

			{groups.map(({ label, items }) => (
				<Box key={label} mb={6}>
					<Text fontWeight='bold' mb={3}>
						{label}
					</Text>
					<VStack align='stretch' spacing={1}>
						{items.map((n) => (
							<Flex
								key={n._id}
								alignItems='center'
								gap={3}
								p={2}
								borderRadius='md'
								bg={n.read ? "transparent" : "whiteAlpha.100"}
							>
								<Link as={RouterLink} to={`/${n.actor.username}`}>
									<Avatar size='md' src={avatarUrl(n.actor)} referrerPolicy='no-referrer' name={n.actor.username} />
								</Link>
								<Text flex={1} fontSize='sm' noOfLines={2}>
									<Link as={RouterLink} to={`/${n.actor.username}`} fontWeight='bold'>
										{n.actor.username}
									</Link>{" "}
									{describe(n)}{" "}
									<Text as='span' color='gray.500'>
										{timeAgo(new Date(n.createdAt).getTime())}
									</Text>
								</Text>
								{n.post && <PostThumb post={n.post} />}
							</Flex>
						))}
					</VStack>
				</Box>
			))}
		</Box>
	);
}

function PostThumb({ post }) {
	const style = { width: 44, height: 44, objectFit: "cover", borderRadius: 4 };
	return post.mediaType === "video" ? (
		<video src={`${mediaUrl(post.postId)}#t=0.1`} preload='metadata' muted playsInline style={style} />
	) : (
		<Image src={imageUrl(post.postId)} alt='' {...{ w: "44px", h: "44px", objectFit: "cover", borderRadius: 4 }} />
	);
}
