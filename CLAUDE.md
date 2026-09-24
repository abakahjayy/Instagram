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

**Images.** Images are stored by the backend and referenced by id. `utils/fetchImage.js` fetches `/api/v1/posts/image/:id` as a blob and returns an object URL. `utils/imageUrl.js` (`ProfileUrl`) wraps that in a hook.

**Messaging.** `components/ChatApp/ChatAppDemo.jsx` opens a socket.io connection to `VITE_API_URL`. `/messages/:id` renders `components/Modals/messagesModal.jsx`.

**Theme and PWA.** `main.jsx` sets up the Chakra theme (dark mode by default, black body background) and registers `/sw.js`. `vite.config.js` also configures `vite-plugin-pwa`, whose manifest still carries leftover "Amazon React" naming.

## Dead or legacy code

- `src/firebase/firebase.js` is imported nowhere, and `firebase` is not a declared dependency.
- `src/components/trys/` holds experiments. `PageLayout` imports `Footer.jsx` but never renders it.
- `README.md` contains an unresolved git merge conflict.
