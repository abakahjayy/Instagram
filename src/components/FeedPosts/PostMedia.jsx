import { useEffect, useRef } from "react";
import { Box, Image } from "@chakra-ui/react";
import { BsPlayFill } from "react-icons/bs";
import { imageUrl, isVideoPost, mediaUrl } from "../../utils/media";

// Renders a post's image or video.
//   variant="feed"  - full width; videos autoplay muted while on screen
//   variant="thumb" - square grid tile; videos show their first frame + play badge
//   variant="full"  - post modal; videos play with sound controls
export default function PostMedia({ post, variant = "feed" }) {
	if (!post?.postId) return null;

	if (!isVideoPost(post)) {
		const fit = variant === "thumb" ? { w: "100%", h: "100%", objectFit: "cover" } : {};
		return <Image src={imageUrl(post.postId)} alt={post.caption || "Post"} loading='lazy' {...fit} />;
	}

	if (variant === "thumb") {
		return (
			<Box position='relative' w='100%' h='100%'>
				{/* #t=0.1 makes browsers paint the first frame instead of a black box */}
				<video
					src={`${mediaUrl(post.postId)}#t=0.1`}
					preload='metadata'
					muted
					playsInline
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
				<Box position='absolute' top={2} right={2} color='white' filter='drop-shadow(0 0 2px black)'>
					<BsPlayFill size={24} />
				</Box>
			</Box>
		);
	}

	return <PostVideo src={mediaUrl(post.postId)} autoPlayInView={variant === "feed"} />;
}

function PostVideo({ src, autoPlayInView }) {
	const ref = useRef(null);

	// Instagram-style: play (muted) when mostly visible, pause when scrolled away.
	useEffect(() => {
		const video = ref.current;
		if (!autoPlayInView || !video || !("IntersectionObserver" in window)) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) video.play().catch(() => {});
				else video.pause();
			},
			{ threshold: 0.6 }
		);
		observer.observe(video);
		return () => observer.disconnect();
	}, [autoPlayInView]);

	return (
		<video
			ref={ref}
			src={src}
			controls
			playsInline
			loop={autoPlayInView}
			muted={autoPlayInView}
			autoPlay={!autoPlayInView}
			preload='metadata'
			style={{ width: "100%", maxHeight: "80vh", background: "black" }}
		/>
	);
}
