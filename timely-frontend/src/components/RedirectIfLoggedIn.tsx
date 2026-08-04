import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RedirectIfLoggedIn = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/me" replace /> : element;
};

export default RedirectIfLoggedIn;
