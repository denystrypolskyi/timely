import {useState} from "react";
import {useForm} from "react-hook-form";
import {LoginFormValues} from "../../types/auth.types";
import {useAuth} from "../../hooks/useAuth";
import {useNavigate} from "react-router-dom";
import {LucideArrowDown, LucideKeyRound} from "lucide-react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Login.module.css";

const DEMO_CREDENTIALS: LoginFormValues = {
    username: "demo",
    password: "TimelyDemo2026!",
};

const Login = () => {
    const {
        register,
        handleSubmit,
        setValue,
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

    const fillDemoCredentials = () => {
        setValue("username", DEMO_CREDENTIALS.username, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue("password", DEMO_CREDENTIALS.password, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setErrorMessage(null);
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

                <aside className={styles.demoCard} aria-labelledby="demo-access-title">
                    <div className={styles.demoHeader}>
                        <span className={styles.demoIcon} aria-hidden="true">
                            <LucideKeyRound size={17}/>
                        </span>

                        <div>
                            <h2 id="demo-access-title" className={styles.demoTitle}>
                                Demo access
                            </h2>
                            <p className={styles.demoDescription}>
                                Registration is admin-managed. Use this account to explore the app.
                            </p>
                        </div>
                    </div>

                    <dl className={styles.credentials}>
                        <div className={styles.credential}>
                            <dt>Username</dt>
                            <dd>{DEMO_CREDENTIALS.username}</dd>
                        </div>
                        <div className={styles.credential}>
                            <dt>Password</dt>
                            <dd>{DEMO_CREDENTIALS.password}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className={styles.fillButton}
                        onClick={fillDemoCredentials}
                    >
                        Fill in demo credentials
                        <LucideArrowDown size={15} aria-hidden="true"/>
                    </button>
                </aside>

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
