import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {LucideCheck, LucideShieldCheck, LucideUserPlus, LucideX} from "lucide-react";
import userService from "../../services/user.service";
import {CreateUserRequest} from "../../types/user.types";
import styles from "./CreateUserModal.module.css";
import {useI18n} from "../../i18n/I18nContext";

interface CreateUserModalProps {
    onClose: () => void;
}

const CreateUserModal = ({onClose}: CreateUserModalProps) => {
    const {t} = useI18n();
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<CreateUserRequest>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [createdUsername, setCreatedUsername] = useState<string | null>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const onSubmit = async (data: CreateUserRequest) => {
        setErrorMessage(null);
        setCreatedUsername(null);

        try {
            const createdUser = await userService.createUser(data);
            setCreatedUsername(createdUser.username);
            reset();
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : t("createFailed");
            setErrorMessage(message);
        }
    };

    return (
        <div className={styles.overlay} onMouseDown={onClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-user-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>{t("adminPanel")}</span>
                        <h2 id="create-user-title" className={styles.title}>
                            {t("grantAccess")}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={t("closeAccountCreation")}
                    >
                        <LucideX size={20}/>
                    </button>
                </div>

                <div className={styles.summary}>
                    <span className={styles.summaryIcon} aria-hidden="true">
                        <LucideShieldCheck size={20}/>
                    </span>
                    <p>
                        {t("createAccountHelp")}
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formGroup}>
                        <label htmlFor="new-username" className={styles.label}>
                            {t("username")}
                        </label>
                        <input
                            id="new-username"
                            type="text"
                            className={styles.input}
                            placeholder={t("usernameExample")}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            {...register("username", {
                                required: t("usernameRequired"),
                                minLength: {
                                    value: 3,
                                    message: t("min3"),
                                },
                                maxLength: {
                                    value: 50,
                                    message: t("max50"),
                                },
                                pattern: {
                                    value: /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
                                    message: t("usernamePattern"),
                                },
                            })}
                        />
                        {errors.username && (
                            <p className={styles.fieldError}>{errors.username.message}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="new-password" className={styles.label}>
                            {t("temporaryPassword")}
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            className={styles.input}
                            placeholder={t("passwordPlaceholder")}
                            autoComplete="new-password"
                            {...register("password", {
                                required: t("passwordRequired"),
                                minLength: {
                                    value: 12,
                                    message: t("min12"),
                                },
                                maxLength: {
                                    value: 72,
                                    message: t("max72"),
                                },
                            })}
                        />
                        <p className={styles.hint}>
                            {t("passwordShareHint")}
                        </p>
                        {errors.password && (
                            <p className={styles.fieldError}>{errors.password.message}</p>
                        )}
                    </div>

                    {errorMessage && (
                        <p className={styles.serverError} role="alert">
                            {errorMessage}
                        </p>
                    )}

                    {createdUsername && (
                        <p className={styles.success} role="status">
                            <LucideCheck size={17} aria-hidden="true"/>
                            {t("accessGranted", {username: createdUsername})}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        <LucideUserPlus size={18} aria-hidden="true"/>
                        {isSubmitting ? t("creatingAccount") : t("createAccount")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
