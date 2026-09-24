import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ authUser, children }) => {
    return authUser ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
