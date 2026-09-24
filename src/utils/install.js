import { useEffect, useState } from "react";

// "Install app" support. Chrome/Edge (Windows, macOS, Android, ChromeOS) fire
// `beforeinstallprompt` once, early - so we catch it at startup (main.jsx imports
// this file) and replay it when the user taps Install on /download.
// Safari (iPhone/iPad/Mac) has no prompt API: the user installs from the Share menu,
// so /download shows step-by-step instructions instead.
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault(); // keep Chrome's mini-infobar away; we show our own button
		deferredPrompt = e;
		notify();
	});
	window.addEventListener("appinstalled", () => {
		deferredPrompt = null;
		notify();
	});
}

export const isInstalled = () =>
	typeof window !== "undefined" &&
	(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

export function detectDevice() {
	const ua = navigator.userAgent;
	// iPadOS reports itself as a Mac - tell them apart by touch support
	const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
	const os = isIOS ? "ios" : /Android/.test(ua) ? "android" : /Windows/.test(ua) ? "windows" : /Macintosh/.test(ua) ? "mac" : /CrOS/.test(ua) ? "chromeos" : "other";
	const browser = /Edg\//.test(ua)
		? "edge"
		: /SamsungBrowser/.test(ua)
		? "samsung"
		: /Firefox|FxiOS/.test(ua)
		? "firefox"
		: /CriOS|Chrome/.test(ua)
		? "chrome"
		: /Safari/.test(ua)
		? "safari"
		: "other";
	return { os, browser, isIOS, isMobile: isIOS || os === "android" };
}

export function usePwaInstall() {
	const [, force] = useState(0);
	useEffect(() => {
		const fn = () => force((n) => n + 1);
		listeners.add(fn);
		return () => listeners.delete(fn);
	}, []);

	const install = async () => {
		if (!deferredPrompt) return "unavailable";
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		deferredPrompt = null;
		notify();
		return outcome; // "accepted" | "dismissed"
	};

	return { canInstall: !!deferredPrompt, install, installed: isInstalled() };
}
