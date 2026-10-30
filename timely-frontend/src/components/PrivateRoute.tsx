import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import AuthCheckError from "./AuthCheckError";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isCheckingAuth, isAuthError, retryAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  if (isAuthError) {
    return <AuthCheckError retry={() => void retryAuth()} />;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
