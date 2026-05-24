import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { meQueryKey } from "../hooks/useMe";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("jwtToken", token);
      queryClient.invalidateQueries({ queryKey: meQueryKey });

      navigate("/me", { replace: true });
    } else {
      console.error("JWT token is missing from URL.");
      navigate("/login", { replace: true });
    }
  }, [navigate, queryClient]);

  return <LoadingSpinner />;
};

export default OAuth2RedirectHandler;
