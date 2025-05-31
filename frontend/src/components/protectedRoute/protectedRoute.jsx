import { Navigate, useLocation } from 'react-router-dom';
import apiAuth from '../../api/apiAuth';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = apiAuth.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
