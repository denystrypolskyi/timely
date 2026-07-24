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

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <span className={styles.eyebrow}>
                        Welcome back
                    </span>

                    <h1 className={styles.title}>
                        Log in
                    </h1>

                    <p className={styles.subtitle}>
                        Sign in to see your shifts and monthly earnings.
                    </p>
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
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
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
                            autoComplete="current-password"
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
