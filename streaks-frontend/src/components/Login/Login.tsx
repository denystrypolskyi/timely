import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginFormData } from "../../types/auth.types";
import styles from "./Login.module.css";
import { useMe } from "../../hooks/useMe";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isLoggingIn } = useMe();
  const navigate = useNavigate();

  // const isLoggingIn = true;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed";
      setErrorMessage(message);
    }
  };

  return (
    <div className={styles.container}>
      {isLoggingIn ? (
        <ClipLoader size={20} color="#000" />
      ) : (
        <div className={styles.formWrapper}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <p>{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p>{errors.password.message}</p>}
            </div>

            <button type="submit">Login</button>
            <a onClick={() => navigate("/register")}>Don't have an account?</a>
          </form>

          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default Login;
