import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginFormData } from "../../types/auth.types";
import { useMe } from "../../hooks/useMe";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isLoggingIn } = useMe();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed";
      setErrorMessage(message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://work-tracker-44f7.onrender.com/login/oauth2/code/google";
    // window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  if (isLoggingIn) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container">
      <div className="formWrapper">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <input
              placeholder="Username"
              id="username"
              type="text"
              className="input"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="error">{errors.username.message}</p>
            )}
          </div>
          <div className="form-group">
            <input
              placeholder="Password"
              id="password"
              type="password"
              className="input"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              marginBottom: "16px",
            }}
          >
            <button className="button" type="submit" disabled={isLoggingIn}>
              Login
            </button>

            <a onClick={() => navigate("/register")}>Don't have an account?</a>
          </div>
          <div className="oauth-container">
            <div className="oauth-divider">
              <div className="oauth-line left" />
              <p>or login with</p>
              <div className="oauth-line right" />
            </div>
            <img
              className="oauth-logo"
              src="/google.svg"
              alt="Login with Google"
              onClick={handleGoogleLogin}
            />
          </div>
        </form>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;
