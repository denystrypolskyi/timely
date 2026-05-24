import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

const DefaultRedirect = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? (
    <Navigate to="/me" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default DefaultRedirect;
