import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import {Homepage} from './pages/Homepage/Homepage'
import { Authpage } from "./pages/Authpage/Authpage.jsx";
import PageLayout from "./Layouts/PageLayouts/PageLayout.jsx";
import { useEffect, useState } from "react";
import useAuthStore from "./store/useAuthStore.js";
import API from "./utils/api";
import { getAuthToken } from "./utils/auth";
import {ProfilePage} from './pages/ProfilePage/ProfilePage';
import MessagesPage from './pages/Messages/Messages';
import useLogout from "./hooks/useLogout.js";
import { Flex, Spinner } from "@chakra-ui/react";
import useShowToast from "./hooks/useShowToast.js";
import SearchPage from "./pages/Search/Search.jsx";
import NotificationsPage from "./pages/Notifications/Notifications.jsx";
import ReelsPage from "./pages/Reels/Reels.jsx";
import PostPage from "./pages/Post/PostPage.jsx";
import DownloadPage from "./pages/Download/Download.jsx";
import SendUpdatePage from "./pages/Admin/SendUpdate.jsx";


export default function App(){
    const showToast = useShowToast()
    const {logout} =useLogout()
    const authUser= useAuthStore(state=>state.user)
    const setAuthUser= useAuthStore((state)=>state.setAuthUser) 
    const {user}= useAuthStore();
    const [loading, setLoading] = useState(true);
    // Load the signed-in user once per token (login, Google redirect, page load).
    // Keyed on the token, not `user`: setAuthUser(data.user) changes `user`, and the old
    // version re-ran with a token-less user, failed, and showed a stuck "Loading" toast.
    const token = user ? getAuthToken() : null;
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        API.get("/api/v1/auth/dashboard", {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => {
                setAuthUser(data.user);
                localStorage.setItem("user-info", JSON.stringify({ user: data.user, token }));
            })
            .catch((error) => {
                if (error.message === "canceled") return;
                if (error.response?.status === 401) {
                    // expired/invalid token - start a fresh login
                    localStorage.removeItem("user-info");
                    setAuthUser(null);
                    showToast("Session expired", "Please log in again", "info");
                }
                // anything else (e.g. Render cold start): keep the stored user
            })
            .finally(() => setLoading(false));

        return ()=>{//This is a cleanup function
            controller.abort();
        }
    }, [token, setAuthUser, showToast]);


    const handleLogout = (userId) => {
        logout(userId)
    };

    if (loading) return <PageLayoutSpinner />








    const router = createBrowserRouter([
        {
            path: '/',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {authUser ? <Homepage  authUser={authUser} onLogout={handleLogout}/> : <Navigate to="/auth" />}
                </PageLayout>
            ),
        },
        {
            path: '/auth',
            element: (
                <>
                    <PageLayout>
                        {!authUser ? <Authpage onAuth={setAuthUser} /> : <Navigate to="/" />}
                    </PageLayout>
                    
                </>
            ),
        },
        {
            path: '/search',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {authUser ? <SearchPage /> : <Navigate to="/auth" />}
                </PageLayout>
            ),
        },
        {
            // public "Get the app" page - shareable, works signed out
            path: '/download',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    <DownloadPage />
                </PageLayout>
            ),
        },
        {
            path: '/admin/updates',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {authUser ? <SendUpdatePage /> : <Navigate to="/auth" />}
                </PageLayout>
            ),
        },
        {
            path: '/reels',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {authUser ? <ReelsPage /> : <Navigate to="/auth" />}
                </PageLayout>
            ),
        },
        {
            // share links - public, like instagram.com/p/...
            path: '/p/:postId',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    <PostPage />
                </PageLayout>
            ),
        },
        {
            path: '/notifications',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {authUser ? <NotificationsPage /> : <Navigate to="/auth" />}
                </PageLayout>
            ),
        },
        {
            path: '/:username',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {/* {authUser ? <ProfilePage authUser={authUser} onLogout={handleLogout} /> : <Navigate to="/auth" onLogout={handleLogout}/>} */}
                    <ProfilePage authUser={authUser}  onLogout={handleLogout} />
                </PageLayout>
            ),
        },
        {
            path: '/messages/:id',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {/* same page as /messages: inbox + open chat side by side on tablets and up */}
                    {authUser ? <MessagesPage /> : <Navigate to="/auth" />}
                </PageLayout>
            ),
        },
        {
            path: '/messages',
            element: (
                <PageLayout authUser={authUser} onLogout={handleLogout}>
                    {authUser ? <MessagesPage authUser={authUser} onLogout={handleLogout} /> : <Navigate to="/auth" onLogout={handleLogout}/>}
                </PageLayout>
            ),
        },
    ]);



    

    return <>
            {/* This is for Creating Routes and Pages */}
            <RouterProvider router={router} />
        </>
}


const PageLayoutSpinner = () => {
	return (
		<Flex flexDir='column' h='100vh' alignItems='center' justifyContent='center'>
			<Spinner size='xl' />
		</Flex>
	);
};
