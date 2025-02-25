import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./Register.module.css";
import { RegisterFormData } from "../../types/auth.types";
import authService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const { login } = useMe();
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

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p>{errors.username.message as React.ReactNode}</p>
            )}
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p>{errors.password.message as React.ReactNode}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
              })}
            />
            {errors.confirmPassword && (
              <p>{errors.confirmPassword.message as React.ReactNode}</p>
            )}
          </div>

          <button type="submit">Register</button>
          <a onClick={() => navigate("/login")}>Already have an account?</a>
        </form>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Register;
