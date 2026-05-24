import {useState} from "react";
import {useForm} from "react-hook-form";
import {RegisterFormValues} from "../../types/auth.types";
import authService from "../../services/auth.service";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Register.module.css";

const Register = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: {errors},
    } = useForm<RegisterFormValues>();
    const {login, isLoggingIn} = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await authService.register(data);
            const loginData = {username: data.username, password: data.password};
            await login(loginData);
            navigate("/me", {replace: true});
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Registration failed";
            setErrorMessage(message);
        }
    };

    if (isLoggingIn) {
        return <LoadingSpinner/>;
    }

    const handleGoogleLogin = () => {
        window.location.href = import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URL;
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <span className={styles.eyebrow}>
                        New account
                    </span>

                    <h2 className={styles.title}>
                        Create account
                    </h2>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={styles.form}
                >
                    <div className={styles.formGroup}>
                        <label
                            htmlFor="username"
                            className={styles.label}
                        >
                            Username
                        </label>

                        <input
                            placeholder="Username"
                            id="username"
                            type="text"
                            className={styles.input}
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />

                        {errors.username && (
                            <p className={styles.error}>
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label
                            htmlFor="password"
                            className={styles.label}
                        >
                            Password
                        </label>

                        <input
                            placeholder="Password"
                            id="password"
                            type="password"
                            className={styles.input}
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />

                        {errors.password && (
                            <p className={styles.error}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label
                            htmlFor="confirmPassword"
                            className={styles.label}
                        >
                            Confirm password
                        </label>

                        <input
                            placeholder="Confirm password"
                            id="confirmPassword"
                            type="password"
                            className={styles.input}
                            {...register("confirmPassword", {
                                required: "Confirm Password is required",
                                validate: (value) =>
                                    value === watch("password") ||
                                    "Passwords do not match",
                            })}
                        />

                        {errors.confirmPassword && (
                            <p className={styles.error}>
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.button}
                            type="submit"
                        >
                            Create account
                        </button>

                        <button
                            type="button"
                            className={styles.link}
                            onClick={() => navigate("/login")}
                        >
                            Already have an account?
                        </button>
                    </div>

                    <div className={styles.oauthContainer}>
                        <div className={styles.oauthDivider}>
                            <div className={styles.oauthLine} />

                            <p className={styles.oauthText}>
                                or register with
                            </p>

                            <div className={styles.oauthLine} />
                        </div>

                        <button
                            type="button"
                            className={styles.oauthButton}
                            onClick={handleGoogleLogin}
                        >
                            <img
                                className={styles.oauthLogo}
                                src="/google.svg"
                                alt=""
                            />
                            Continue with Google
                        </button>
                    </div>
                </form>

                {errorMessage && (
                    <p className={styles.serverError}>
                        {errorMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Register;
