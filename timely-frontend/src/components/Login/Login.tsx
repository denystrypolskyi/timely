import {useState} from "react";
import {useForm} from "react-hook-form";
import {LoginFormValues} from "../../types/auth.types";
import {useAuth} from "../../hooks/useAuth";
import {useNavigate} from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Login.module.css";

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormValues>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {login, isLoggingIn} = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data);
            navigate("/me", {replace: true});
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed";
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
                        Welcome back
                    </span>

                    <h2 className={styles.title}>
                        Log in
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

                    <div className={styles.actions}>
                        <button
                        className={styles.button}
                        type="submit"
                        disabled={isLoggingIn}
                    >
                            Log in
                        </button>

                        <button
                            type="button"
                            className={styles.link}
                            onClick={() => navigate("/register")}
                        >
                            Don't have an account?
                        </button>
                    </div>

                    <div className={styles.oauthContainer}>
                        <div className={styles.oauthDivider}>
                            <div className={styles.oauthLine} />

                            <p className={styles.oauthText}>
                                or login with
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

export default Login;
