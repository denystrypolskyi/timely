import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";

const RedirectIfLoggedIn = ({ element }: { element: JSX.Element }) => {
  const { data, isLoading, isError, isSuccess } = useMe();
  const isAuthenticated = data?.username;

  if (isLoading && !isError && !isSuccess) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/me" /> : element;
};

export default RedirectIfLoggedIn;
