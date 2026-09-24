# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Instagram clone frontend: React 18 + Vite (JavaScript/JSX, no TypeScript), Chakra UI for all styling, Zustand for state. It is a pure client. All data comes from a separate Express backend (not in this repo) reached through `VITE_API_URL`. Deployed on Vercel. `vercel.json` rewrites every path to `/` so client-side routing works.

## Commands

```bash
npm run dev       # Vite dev server on port 7005 (set in vite.config.js)
npm run build     # production build to dist/
npm run preview   # serve the built app
npm run lint      # ESLint 9 flat config (eslint.config.js)
npm test          # vitest (see caveat below)
npx vitest run src/__tests__/UsernameDis.test.jsx   # single test file
```

Testing caveat: `vite.config.js` configures a `jsdom` test environment with `setupTests.js`, but `vitest`, `jsdom`, `@testing-library/react` and `@testing-library/jest-dom` are **not** in `package.json` or `node_modules`. Install them as dev dependencies before running tests. The one existing test is a placeholder.

## Environment

`.env` holds `VITE_*` variables. The one that matters is `VITE_API_URL`, the backend base URL, used by the axios instance, raw `fetch` calls and the socket.io client. Anything prefixed `VITE_` is bundled into the client, so don't put real secrets there.

## Architecture

**Backend contract.** Every call goes to REST endpoints under `/api/v1/...` (`auth`, `users`, `posts`, `comments`, `uploadFiles`). Most calls go through the shared axios instance `src/utils/api.js` (`API`), but a few components and utils call `fetch` directly with `import.meta.env.VITE_API_URL` (image fetching, create post, edit profile, suggested users). The instance attaches no auth header, so each call adds `Authorization: Bearer <token>` itself where it needs one. `src/pages/Authpage/GoogleAuth.jsx` hardcodes `http://localhost:7004` for Google OAuth.

**Auth flow.**
- `useAuthStore` (Zustand) hydrates `user` from `localStorage["user-info"]` on load.
- On mount, `App.jsx` calls `GET /api/v1/auth/dashboard` with the stored token. It then rewrites `user-info` as `{ user, token }` and calls `setAuthUser(data.user)`.
- After that, the store's `user` can be either the wrapped `{ user, token }` object or the bare user. That is why code keeps unwrapping it with `authUser.user ? authUser.user : authUser` (see `PageLayout.jsx` and `useGetFeedPosts.js`). Keep that unwrapping when you touch auth-dependent code.

**Routing.** `App.jsx` builds a `createBrowserRouter` inside the component, after the auth check finishes. Routes are `/`, `/auth`, `/:username` (profile), `/messages` and `/messages/:id`. Auth guarding is inline (`authUser ? <Page/> : <Navigate to="/auth"/>`). `components/trys/ProtectedRoute.jsx` exists but is not used. `authUser` and `onLogout` are passed down as props from `App` as well as read from the store.

**Layout.** `Layouts/PageLayouts/PageLayout.jsx` wraps every route. It shows the `SideBar` when logged in, shows the top `Navbar` when logged out (except on `/auth`), and adds a fixed portfolio badge.

**State.** There are three Zustand stores in `src/store/`:
- `useAuthStore`: the logged-in user, plus loading and error state.
- `usePostStore`: the current post list, shared by the feed and profile grids. Hooks replace it with `setPosts`.
- `userProfileStore` (exported as `useProfileStore`): the profile being viewed. Its `addPost`/`deletePost` replace `userProfile.user` with the updated user returned by the server.

Redux Toolkit, react-query, formik, styled-components and tailwind are in `package.json` but are not the active pattern. Use Zustand and Chakra.

**Data hooks.** Each backend operation has a custom hook in `src/hooks/` (`useLogin`, `useSignup`, `useGetFeedPosts`, `useGetUserPosts`, `useLikePost`, `useFollowUser`, `usePostComment`, `useEditProfile`, `useSearchUser`, and others). The pattern is: local `isLoading` state, an API call, an update to the Zustand store, and errors reported through `useShowToast()` (a Chakra toast wrapper taking `(title, description, status, duration?)`). Fetching hooks use an `AbortController` cleanup and ignore the `'canceled'` error. Put new backend interactions in a hook that follows this pattern.

**Images and videos.** Media lives in the backend's GridFS and is referenced by file id.
- A post's `postId` is the id of its file. `mediaType` (`'image'` or `'video'`, with a default of `'image'` for older posts) decides how it's rendered.
- `components/FeedPosts/PostMedia.jsx` renders every post's media, with variants `feed`, `thumb` and `full`. It builds direct URLs with `utils/media.js`: `imageUrl` uses `/posts/image/:id` and `mediaUrl` uses `/posts/media/:id`.
- Videos must use `/posts/media/:id`, because only that route supports HTTP Range requests, which are needed for seeking.
- Profile pictures still use the older blob approach: `utils/fetchImage.js`, wrapped in a hook by `utils/imageUrl.js` (`ProfileUrl`).
- Uploads are capped at 50MB for video and 10MB for images, on both client (`hooks/usePreviewing.js`, pass `{ allowVideo: true }`) and server. Every file goes into the same MongoDB, so keep the caps.

**Messaging.**
- `utils/socket.js` holds one shared socket.io connection, authenticated with the JWT that `utils/auth.js` `getAuthToken()` reads from `localStorage["user-info"].token`. The store's user object doesn't reliably include the token.
- `hooks/useChat.js` loads history over REST (`GET /api/v1/messages/:me/:other`) and then sends over the socket. It shows each message immediately, then swaps in the saved copy from the server's ack. It also handles typing events and marks messages read.
- `hooks/useConversations.js` backs the inbox (`GET /api/v1/messages/conversations`).
- Pages: `pages/Messages/Messages.jsx` is the inbox and `pages/Messages/Chat.jsx` is `/messages/:userId`. The Message button on a profile links to the chat.
- `useLogout` calls `closeSocket()`.

**Notifications, search, saved.**
- `hooks/useNotifications.js` `useNotificationsSync` is mounted once by `PageLayout`. It loads `GET /api/v1/notifications` into `store/useNotificationStore.js` and adds live `notification` socket events. The sidebar and mobile top bar read their unread badge from that store, and `/notifications` marks everything read.
- `/search` searches people as you type (`GET /api/v1/users/search?q=`). With an empty query it shows an Explore grid of all posts.
- The profile tabs are Posts, Saved and Likes. Saved (`GET /posts/saved`, auth) appears only on your own profile; Likes uses `GET /posts/liked/:userId`.
- The bookmark in `PostFooter` goes through `hooks/useSavePost.js`, which mirrors `saved` onto the store's user.
- `components/Profile/PostGrid.jsx` is the shared 3-column grid plus full-post modal. It has no delete button, because saved and liked posts can belong to anyone.

**Responsive layout.** Below the `md` breakpoint, `PageLayout` hides the sidebar and renders `components/NavBar/MobileNav.jsx` instead: a top bar and a fixed bottom tab bar. The bottom bar is hidden inside an open chat, and phones log out from their own profile header. `FeedPost` handles double-tap-to-like with its own tap timer, not `onDoubleClick`, so it also works on touch.

**Stories, Reels, share links.**
- `components/Stories/StoriesBar.jsx` sits at the top of the feed and uses `hooks/useStories.js` (`/api/v1/stories`). `StoryViewer.jsx` is the full-screen player: photos last 5 s via requestAnimationFrame, videos report their own progress, tap left or right to move, and holding pauses.
- `/reels` plays video posts as a vertical scroll-snap feed. It hides the phone top bar.
- `/p/:postId` is a public single-post page. `utils/share.js` uses the native share sheet and falls back to copying the link.

**Breakpoints.** Phones (base) get MobileNav; tablets (md–lg) get a 72px icon rail; `xl` and up get the 240px sidebar with labels. Every `SideBar/*` item switches between collapsed and labelled at `xl`, not `md`, and PageLayout sets the rail width to match.

**Installable app / downloads.**
- The `/download` page detects the device and puts that device's option first.
- **Android:** a signed Trusted Web Activity APK (`com.instagrammmm.app`) at `public/downloads/Instagram.apk`, made with PWABuilder's packaging service. `public/.well-known/assetlinks.json` must match the signing key; the key lives in "Instagram App Packages" on the owner's Desktop and is never committed.
- **Windows:** `Instagram-Setup.exe` is built from `desktop/` (Electron + electron-builder NSIS; `npm run dist`) and published as a GitHub Release asset on abakahjayy/Instagram. The page links to `/releases/latest/download/Instagram-Setup.exe`. The app window loads the live site and uses a plain Chrome user agent, because Google blocks sign-in from "Electron".
- **iPhone, iPad and Mac:** installed from the browser as a PWA. The manifest is in `vite.config.js`, the icons come from `scripts/generate-icons.mjs`, and `utils/install.js` catches `beforeinstallprompt` for the "install from this browser" button.
- Links on the page use the public site address, never `window.location` (it showed localhost during local runs).
- **Building the .exe on Windows** fails when unpacking winCodeSign's macOS symlinks without admin rights. Fix it by extracting the archive into the electron-builder cache as `winCodeSign-2.6.0`, ignoring the symlink errors.
- "Get the app" links: the sidebar, the phone feed banner, the auth page and the suggested-users footer. All are hidden inside the installed app.

**Sidebar height.** `SideBar.jsx` sets its spacing with CSS variables that shrink at `max-height` 800px and 650px, and it scrolls as a last resort, so "Get the app" and Logout stay reachable on short laptop screens.

**Messages extras.**
- `useChat` handles live `messageUpdated` and `messageDeleted` socket events, plus edit (PATCH `/messages/:id/edit`), unsend (DELETE `/messages/:id`) and voice notes (POST `/messages/voice`, multipart field `audio`).
- `useVoiceRecorder` picks webm/opus or mp4 (Safari) and caps a note at 60 s.
- Your own messages have a menu that opens on hover (the "⋯" button), long-press or right-click.

**Emails.** The email on/off switch is in EditProfile (PATCH `/api/v1/instagram/settings/email`). `/admin/updates` sends an app-update email to everyone; it's only for `user.role === "admin"`, set with the backend's `scripts/makeInstagramAdmin.js`.

**Theme and PWA.** `main.jsx` sets up the Chakra theme (dark mode by default, black body background) and registers `/sw.js`. `vite.config.js` also configures `vite-plugin-pwa`, whose manifest still carries leftover "Amazon React" naming.

## Dead or legacy code

- `src/firebase/firebase.js` is imported nowhere, and `firebase` is not a declared dependency.
- `src/components/trys/` holds experiments. `PageLayout` imports `Footer.jsx` but never renders it.
- `README.md` contains an unresolved git merge conflict.
