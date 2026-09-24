// Share a post the way Instagram does on each platform: the native share sheet on
// phones/tablets (WhatsApp, Messages...), copy-link on desktop browsers without it.
// Returns "shared" | "copied" | "cancelled" | "failed".
export const postLink = (post) => `${window.location.origin}/p/${post._id}`;

export async function sharePost(post, author) {
	const url = postLink(post);
	const title = author ? `${author}'s post on Instagram` : "Instagram post";
	if (navigator.share) {
		try {
			await navigator.share({ title, text: post.caption || title, url });
			return "shared";
		} catch (err) {
			if (err?.name === "AbortError") return "cancelled";
		}
	}
	try {
		await navigator.clipboard.writeText(url);
		return "copied";
	} catch {
		return "failed";
	}
}
