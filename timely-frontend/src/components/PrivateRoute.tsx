import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { data, isLoading} = useMe();
  const isAuthenticated = !!data?.username;

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
