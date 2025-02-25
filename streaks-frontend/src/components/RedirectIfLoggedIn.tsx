import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import { ClipLoader } from "react-spinners";

const RedirectIfLoggedIn = ({ element }: { element: JSX.Element }) => {
  const { data, isLoading } = useMe();
  const isAuthenticated = !!data?.username;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader size={20} color="#fff" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/me" replace /> : element;
};


export default RedirectIfLoggedIn;
