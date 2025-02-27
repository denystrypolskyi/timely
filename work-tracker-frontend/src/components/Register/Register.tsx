import { useState } from "react";
import { useForm } from "react-hook-form";
import { RegisterFormData } from "../../types/auth.types";
import authService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const { login, isLoggingIn } = useMe();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register(data);
      const loginData = { username: data.username, password: data.password };
      await login(loginData);
      navigate("/me");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed";
      setErrorMessage(message);
    }
  };

  if (isLoggingIn) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container">
      <div className="formWrapper">
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <input
              placeholder="Username"
              id="username"
              type="text"
              className="input"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && <p>{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <input
              placeholder="Password"
              id="password"
              type="password"
              className="input"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p>{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <input
              placeholder="Confirm password"
              id="confirmPassword"
              type="password"
              className="input"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
              })}
            />
            {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button className="button" type="submit">
              Register
            </button>
            <a onClick={() => navigate("/login")}>Already have an account?</a>
          </div>
        </form>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Register;
