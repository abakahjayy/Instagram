import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL;

// One shared connection for the whole app. The backend verifies the JWT on
// connect and takes our identity from it, so the token must be sent here.
let socket = null;
let socketToken = null;

export const getSocket = (token) => {
    if (!token) return null;
    if (socket && socketToken === token) return socket;
    socket?.disconnect();
    socket = io(apiUrl, { auth: { token } });
    socketToken = token;
    return socket;
};

export const closeSocket = () => {
    socket?.disconnect();
    socket = null;
    socketToken = null;
};
