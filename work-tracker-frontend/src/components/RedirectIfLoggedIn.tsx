import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const RedirectIfLoggedIn = ({ element }: { element: JSX.Element }) => {
  const { data, isLoading } = useMe();
  const isAuthenticated = !!data?.username;

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <Navigate to="/me" /> : element;
};

export default RedirectIfLoggedIn;
