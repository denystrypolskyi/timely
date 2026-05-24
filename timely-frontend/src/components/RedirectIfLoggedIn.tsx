import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const RedirectIfLoggedIn = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <Navigate to="/me" replace /> : element;
};

export default RedirectIfLoggedIn;
