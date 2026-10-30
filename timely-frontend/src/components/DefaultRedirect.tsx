import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";
import AuthCheckError from "./AuthCheckError";

const DefaultRedirect = () => {
  const { isAuthenticated, isCheckingAuth, isAuthError, retryAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  if (isAuthError) {
    return <AuthCheckError retry={() => void retryAuth()} />;
  }

  return isAuthenticated ? (
    <Navigate to="/me" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default DefaultRedirect;
