import { Avatar, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import useProfileStore from "../../store/userProfileStore";
import { ProfileUrl } from "../../utils/imageUrl";

const Caption = ({ post }) => {
	const userProfile = useProfileStore((state) => state.userProfile).user;
	return (
		<Flex gap={4}>
			<Link to={`/${userProfile.username}`}>
				<Avatar src={ProfileUrl(userProfile?.profile_picture_id)} size={"sm"} />
			</Link>
			<Flex direction={"column"}>
				<Flex gap={2} alignItems={"center"}>
					<Link to={`/${userProfile.username}`}>
						<Text fontWeight={"bold"} fontSize={12}>
							{userProfile.username}
						</Text>
					</Link>
					<Text fontSize={14}>{post?.caption}</Text>
				</Flex>
				<Text fontSize={12} color={"gray"}>
					{timeAgo(post?.created)}
				</Text>
			</Flex>
		</Flex>
	);
};

export default Caption;
