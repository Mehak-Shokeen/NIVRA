import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

    const {
        isAuthenticated,
        loading
    } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                Loading Nivra...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;