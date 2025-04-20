import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("jwtToken", token);

      navigate("/me");
    } else {
      console.error("JWT token is missing from URL.");
    }
  }, [navigate]);

  return (
    <div>
      <h2>Redirecting...</h2>
    </div>
  );
};

export default OAuth2RedirectHandler;
