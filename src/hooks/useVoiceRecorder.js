import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_VOICE_SECONDS = 60;

// Chrome/Firefox/Edge record Opus in WebM; Safari (iPhone/Mac) records AAC in MP4.
const pickMimeType = () => {
	if (typeof MediaRecorder === "undefined") return null;
	return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
};

// Records a voice note. start() asks for the mic; stop() resolves { blob, duration };
// cancel() throws the recording away. Auto-stops at MAX_VOICE_SECONDS (onAutoStop).
export default function useVoiceRecorder({ onAutoStop } = {}) {
	const [isRecording, setIsRecording] = useState(false);
	const [seconds, setSeconds] = useState(0);
	const [error, setError] = useState(null);
	const recorder = useRef(null);
	const chunks = useRef([]);
	const startedAt = useRef(0);
	const timer = useRef(null);
	const resolveStop = useRef(null);
	const cancelled = useRef(false);

	const cleanup = () => {
		clearInterval(timer.current);
		recorder.current?.stream.getTracks().forEach((t) => t.stop()); // turn the mic light off
		recorder.current = null;
		setIsRecording(false);
		setSeconds(0);
	};

	const stop = useCallback(() => {
		const rec = recorder.current;
		if (!rec || rec.state === "inactive") return Promise.resolve(null);
		return new Promise((resolve) => {
			resolveStop.current = resolve;
			rec.stop();
		});
	}, []);

	const start = useCallback(async () => {
		setError(null);
		const mimeType = pickMimeType();
		if (mimeType === null || !navigator.mediaDevices?.getUserMedia) {
			setError("Voice messages aren't supported in this browser.");
			return false;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
			chunks.current = [];
			cancelled.current = false;
			rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
			rec.onstop = () => {
				const duration = Math.round(((Date.now() - startedAt.current) / 1000) * 10) / 10;
				const blob = new Blob(chunks.current, { type: rec.mimeType || mimeType || "audio/webm" });
				cleanup();
				const result = cancelled.current || duration < 0.5 ? null : { blob, duration };
				resolveStop.current?.(result);
				resolveStop.current = null;
			};
			recorder.current = rec;
			startedAt.current = Date.now();
			rec.start(250);
			setIsRecording(true);
			timer.current = setInterval(async () => {
				const s = Math.floor((Date.now() - startedAt.current) / 1000);
				setSeconds(s);
				if (s >= MAX_VOICE_SECONDS) {
					const result = await stop();
					if (result) onAutoStop?.(result);
				}
			}, 250);
			return true;
		} catch (err) {
			setError(err?.name === "NotAllowedError" ? "Allow microphone access to send voice messages." : "Couldn't start recording.");
			return false;
		}
	}, [onAutoStop, stop]);

	const cancel = useCallback(() => {
		cancelled.current = true;
		stop();
	}, [stop]);

	// never leave the mic on when leaving the chat
	useEffect(() => () => {
		cancelled.current = true;
		if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
	}, []);

	return { isRecording, seconds, error, start, stop, cancel };
}
