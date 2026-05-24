import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
