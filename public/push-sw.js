/* Web Push handlers, loaded into the generated service worker with
   workbox importScripts (see vite.config.js). Payload from FullBackendd
   utils/push.js: { title, body, url, tag, icon, badge, app }. */

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  event.waitUntil((async () => {
    // Don't pop up a notification the user is already looking at (the app shows
    // updates itself); test notifications always show.
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const inFocus = windows.some((w) => w.focused && w.visibilityState === 'visible');
    if (inFocus && data.tag !== 'test') {
      windows.forEach((w) => w.postMessage({ type: 'push', data }));
      return;
    }
    await self.registration.showNotification(data.title || 'Nsoro', {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-192.png',
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/' },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Reuse an open window of this app if there is one.
    const same = windows.find((w) => new URL(w.url).origin === self.location.origin);
    if (same && new URL(target).origin === self.location.origin) {
      await same.focus();
      if ('navigate' in same) {
        try {
          await same.navigate(target);
        } catch {
          // some browsers only allow navigate() on controlled clients
        }
      }
      return;
    }
    await self.clients.openWindow(target);
  })());
});
