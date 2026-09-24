// Instagram for Windows: a desktop window around the live site, packaged as
// Instagram-Setup.exe by electron-builder (see package.json "build").
// The site does all the work, so a new website deploy updates the app too.
const { app, BrowserWindow, shell, session, Menu } = require("electron");
const path = require("path");

const SITE = "https://instagrammmm-z34p.onrender.com";
const START_URL = `${SITE}/?source=desktop`;
// Google sign-in leaves the site and comes back; these hosts stay in the window.
const IN_APP_HOSTS = new Set([new URL(SITE).host, "fullbackendd.onrender.com", "accounts.google.com"]);

// Google blocks sign-in from browsers that announce "Electron", so present the
// plain Chrome user agent this Electron build is based on.
app.userAgentFallback = app.userAgentFallback.replace(/\s(Electron|Instagram|instagram-desktop)\/\S+/gi, "");

// One window only: opening the app again focuses it.
if (!app.requestSingleInstanceLock()) app.quit();

let win;
function createWindow() {
	win = new BrowserWindow({
		width: 1280,
		height: 840,
		minWidth: 380,
		minHeight: 560,
		title: "Instagram",
		backgroundColor: "#000000",
		icon: path.join(__dirname, "build", "icon.png"),
		autoHideMenuBar: true,
		show: false,
		webPreferences: { contextIsolation: true, sandbox: true },
	});
	win.once("ready-to-show", () => win.show());
	win.loadURL(START_URL);

	const isInApp = (url) => {
		try {
			return IN_APP_HOSTS.has(new URL(url).host);
		} catch {
			return false;
		}
	};
	// Anything outside the app (portfolio link, shared websites) opens in the normal browser.
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (isInApp(url)) return { action: "allow" };
		shell.openExternal(url);
		return { action: "deny" };
	});
	win.webContents.on("will-navigate", (event, url) => {
		if (!isInApp(url)) {
			event.preventDefault();
			shell.openExternal(url);
		}
	});
	// The site is offline / asleep: show a friendly retry page instead of a blank window.
	win.webContents.on("did-fail-load", (_e, code, _desc, url, isMainFrame) => {
		if (!isMainFrame || code === -3) return; // -3 = navigation aborted (normal)
		win.loadURL(
			"data:text/html," +
				encodeURIComponent(`<body style="background:#000;color:#fff;font-family:Segoe UI,sans-serif;display:grid;place-items:center;height:100vh;margin:0">
<div style="text-align:center"><h2>Can't reach Instagram</h2><p style="color:#aaa">Check your internet connection.</p>
<button onclick="location.href='${START_URL}'" style="background:#0095f6;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:15px;cursor:pointer">Try again</button></div></body>`)
		);
	});
}

app.on("second-instance", () => {
	if (!win) return;
	if (win.isMinimized()) win.restore();
	win.focus();
});

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);
	// Microphone for voice messages, notifications and clipboard - only for our own site.
	session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
		const allowed = ["media", "notifications", "clipboard-sanitized-write", "clipboard-read"];
		callback(allowed.includes(permission) && wc.getURL().startsWith(SITE));
	});
	createWindow();
});

app.on("window-all-closed", () => app.quit());
