import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import { ClipLoader } from "react-spinners";

const RedirectIfLoggedIn = ({ element }: { element: JSX.Element }) => {
  const { data, isLoading, isError, isSuccess } = useMe();
  const isAuthenticated = data?.username;

  if (isLoading && !isError && !isSuccess) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader size={20} color="#000" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/me" /> : element;
};

export default RedirectIfLoggedIn;
