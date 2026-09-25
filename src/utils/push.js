import API from "./api";
import { detectDevice, isInstalled } from "./install";

// Device notifications (Web Push) for this app. The service worker side is
// public/push-sw.js; the backend side is FullBackendd utils/push.js.
const APP = "instagram";

export const pushSupported = () =>
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// iPhone/iPad only allow web notifications for apps added to the Home Screen.
export const needsInstallForPush = () => detectDevice().os === "ios" && !isInstalled();

const urlBase64ToUint8Array = (base64) => {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

const registration = async () => {
    if (!pushSupported()) return null;
    // No service worker in development builds; don't wait forever.
    return Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 4000))]);
};

/** 'unsupported' | 'install-first' | 'denied' | 'on' | 'off' */
export async function getPushState() {
    if (needsInstallForPush()) return "install-first";
    if (!pushSupported()) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    const reg = await registration();
    if (!reg) return "unsupported";
    const sub = await reg.pushManager.getSubscription();
    return sub && Notification.permission === "granted" ? "on" : "off";
}

async function subscribe(reg) {
    const { data } = await API.get("/api/v1/push/public-key");
    const existing = await reg.pushManager.getSubscription();
    const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
    await API.post("/api/v1/push/subscribe", { app: APP, subscription: sub.toJSON() });
    return sub;
}

/** Asks permission (must be called from a click) and subscribes this device. */
export async function enablePush() {
    if (needsInstallForPush()) throw new Error("On iPhone and iPad, add Instagram to your Home Screen first, then turn on notifications from the app.");
    if (!pushSupported()) throw new Error("This browser doesn't support notifications.");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Notifications are blocked. Allow them in your browser's site settings.");
    const reg = await registration();
    if (!reg) throw new Error("Notifications work in the installed app or the live site, not in development.");
    await subscribe(reg);
    return "on";
}

export async function disablePush() {
    const reg = await registration();
    const sub = reg && await reg.pushManager.getSubscription();
    if (sub) {
        await API.post("/api/v1/push/unsubscribe", { endpoint: sub.endpoint }).catch(() => {});
        await sub.unsubscribe();
    }
    return "off";
}

export const sendTestPush = () => API.post("/api/v1/push/test", { app: APP }).then((r) => r.data.delivered);

/** After sign-in: if this device already allowed notifications, link it to the current account. */
export async function syncPushSubscription() {
    try {
        if (!pushSupported() || Notification.permission !== "granted") return;
        const reg = await registration();
        if (reg && await reg.pushManager.getSubscription()) await subscribe(reg);
    } catch {
        // best effort
    }
}
