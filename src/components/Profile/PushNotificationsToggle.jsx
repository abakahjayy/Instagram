import { useEffect, useState } from "react";
import { Box, Button, FormControl, FormLabel, Switch, Text } from "@chakra-ui/react";
import useShowToast from "../../hooks/useShowToast";
import { disablePush, enablePush, getPushState, sendTestPush } from "../../utils/push";

const HINTS = {
	unsupported: "This browser can't show notifications.",
	"install-first": "On iPhone/iPad, add Instagram to your Home Screen first (Get the app), then turn this on in the app.",
	denied: "Notifications are blocked for this site. Allow them in your browser's site settings.",
};

// "Push notifications" switch in Edit profile: alerts on this device for
// messages, likes, comments and follows, even when the app is closed.
export default function PushNotificationsToggle() {
	const showToast = useShowToast();
	const [state, setState] = useState("loading");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		getPushState().then(setState).catch(() => setState("unsupported"));
	}, []);

	const toggle = async (on) => {
		setBusy(true);
		try {
			setState(on ? await enablePush() : await disablePush());
			if (on) showToast("Notifications on", "You'll get alerts on this device.", "success", 2000);
		} catch (err) {
			showToast("Couldn't turn on notifications", err.message, "warning");
			setState(await getPushState().catch(() => "off"));
		} finally {
			setBusy(false);
		}
	};

	const test = async () => {
		setBusy(true);
		try {
			const delivered = await sendTestPush();
			showToast(delivered ? "Test sent" : "No devices", delivered ? "Check your notifications." : "Turn notifications on first.", delivered ? "success" : "warning", 2500);
		} catch {
			showToast("Error", "Couldn't send a test notification.", "error");
		} finally {
			setBusy(false);
		}
	};

	return (
		<FormControl display='flex' alignItems='center' justifyContent='space-between' gap={4}>
			<Box>
				<FormLabel htmlFor='push-notifications' fontSize={"sm"} mb={0}>Push notifications</FormLabel>
				<Text fontSize='xs' color='gray.500'>
					{HINTS[state] || "Messages, likes, comments and follows on this device, even when the app is closed"}
				</Text>
				{state === "on" && (
					<Button size='xs' variant='link' colorScheme='blue' mt={1} onClick={test} isDisabled={busy}>Send a test notification</Button>
				)}
			</Box>
			<Switch
				id='push-notifications'
				colorScheme='blue'
				isChecked={state === "on"}
				isDisabled={busy || !["on", "off"].includes(state)}
				onChange={(e) => toggle(e.target.checked)}
			/>
		</FormControl>
	);
}
