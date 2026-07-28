import {useState} from "react";
import {useForm} from "react-hook-form";
import {LoginFormValues} from "../../types/auth.types";
import {useAuth} from "../../hooks/useAuth";
import {useNavigate} from "react-router-dom";
import {LucideArrowDown, LucideKeyRound} from "lucide-react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Login.module.css";
import {useI18n} from "../../i18n/I18nContext";

const DEMO_CREDENTIALS: LoginFormValues = {
    username: "demo",
    password: "TimelyDemo2026!",
};

const Login = () => {
    const {t} = useI18n();
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
            const message = error instanceof Error ? error.message : t("loginFailed");
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
                        {t("welcomeBack")}
                    </span>

                    <h1 className={styles.title}>
                        {t("logIn")}
                    </h1>

                    <p className={styles.subtitle}>
                        {t("loginSubtitle")}
                    </p>
                </div>

                <aside className={styles.demoCard} aria-labelledby="demo-access-title">
                    <div className={styles.demoHeader}>
                        <span className={styles.demoIcon} aria-hidden="true">
                            <LucideKeyRound size={17}/>
                        </span>

                        <div>
                            <h2 id="demo-access-title" className={styles.demoTitle}>
                                {t("demoAccess")}
                            </h2>
                            <p className={styles.demoDescription}>
                                {t("demoDescription")}
                            </p>
                        </div>
                    </div>

                    <dl className={styles.credentials}>
                        <div className={styles.credential}>
                            <dt>{t("username")}</dt>
                            <dd>{DEMO_CREDENTIALS.username}</dd>
                        </div>
                        <div className={styles.credential}>
                            <dt>{t("password")}</dt>
                            <dd>{DEMO_CREDENTIALS.password}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className={styles.fillButton}
                        onClick={fillDemoCredentials}
                    >
                        {t("fillDemo")}
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
                            {t("username")}
                        </label>

                        <input
                            placeholder={t("username")}
                            id="username"
                            type="text"
                            className={styles.input}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            {...register("username", {
                                required: t("usernameRequired"),
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
                            {t("password")}
                        </label>

                        <input
                            placeholder={t("password")}
                            id="password"
                            type="password"
                            className={styles.input}
                            autoComplete="current-password"
                            {...register("password", {
                                required: t("passwordRequired"),
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
                            {t("logIn")}
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
