import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

const DefaultRedirect = () => {
  const { data, isLoading } = useMe();

  const isAuthenticated = !!data?.username;

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <Navigate to="/me" /> : <Navigate to="/login" />;
};

export default DefaultRedirect;
