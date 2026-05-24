import {useState} from "react";
import modalStyles from "../Modal/Modal.module.css";
import {LucideX} from "lucide-react";

interface ImportShiftsModalProps {
    onClose: () => void;
    onSubmit: (text: string) => Promise<void>;
}

const ImportShiftsModal = ({
                               onClose,
                               onSubmit,
                           }: ImportShiftsModalProps) => {
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) {
            setError("Please enter at least one shift.");
            return;
        }

        try {
            setError("");
            setIsLoading(true);

            await onSubmit(text);

            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={modalStyles.modalOverlay}>
            <div className={modalStyles.modal}>
                <div className={modalStyles.header}>
                    <h2 className={modalStyles.title}>Paste shifts</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className={modalStyles.closeButton}
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={modalStyles.form}
                >
                    <textarea
                        id="shiftImport"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={`02.05 10:00-17:00
03.05 12:00-20:30
05.05 08:15-16:15`}
                        rows={10}
                        className={modalStyles.textarea}
                    />

                    <p className={modalStyles.helpText}>
                        Format: 02.05 10:00-17:00
                    </p>

                    {error && (
                        <p className={modalStyles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={modalStyles.confirmButton}
                    >
                        {isLoading ? "Importing..." : "Import"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ImportShiftsModal;