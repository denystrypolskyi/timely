import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {LucideCheck, LucideShieldCheck, LucideUserPlus, LucideX} from "lucide-react";
import userService from "../../services/user.service";
import {CreateUserRequest} from "../../types/user.types";
import styles from "./CreateUserModal.module.css";

interface CreateUserModalProps {
    onClose: () => void;
}

const CreateUserModal = ({onClose}: CreateUserModalProps) => {
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
                : "Failed to create account";
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
                        <span className={styles.eyebrow}>Admin panel</span>
                        <h2 id="create-user-title" className={styles.title}>
                            Grant app access
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close account creation"
                    >
                        <LucideX size={20}/>
                    </button>
                </div>

                <div className={styles.summary}>
                    <span className={styles.summaryIcon} aria-hidden="true">
                        <LucideShieldCheck size={20}/>
                    </span>
                    <p>
                        Create login credentials for a new user. Their account will receive standard access.
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formGroup}>
                        <label htmlFor="new-username" className={styles.label}>
                            Username
                        </label>
                        <input
                            id="new-username"
                            type="text"
                            className={styles.input}
                            placeholder="e.g. alex.smith"
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            {...register("username", {
                                required: "Username is required",
                                minLength: {
                                    value: 3,
                                    message: "Use at least 3 characters",
                                },
                                maxLength: {
                                    value: 50,
                                    message: "Use no more than 50 characters",
                                },
                                pattern: {
                                    value: /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
                                    message: "Use letters, numbers, dots, dashes, or underscores",
                                },
                            })}
                        />
                        {errors.username && (
                            <p className={styles.fieldError}>{errors.username.message}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="new-password" className={styles.label}>
                            Temporary password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            className={styles.input}
                            placeholder="At least 12 characters"
                            autoComplete="new-password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 12,
                                    message: "Use at least 12 characters",
                                },
                                maxLength: {
                                    value: 72,
                                    message: "Use no more than 72 characters",
                                },
                            })}
                        />
                        <p className={styles.hint}>
                            Share this securely—the password won&apos;t be shown again.
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
                            Access granted to {createdUsername}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        <LucideUserPlus size={18} aria-hidden="true"/>
                        {isSubmitting ? "Creating account…" : "Create account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
