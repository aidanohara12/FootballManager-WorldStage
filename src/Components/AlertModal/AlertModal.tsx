import { type Signal, signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import styles from "./AlertModal.module.css";

interface AlertState {
    message: string;
    buttonText?: string;
    isTeamAlert?: boolean;
}

export const alertState = signal<AlertState | null>(null);

export function showAlert(message: string, buttonText = "OK") {
    alertState.value = { message, buttonText, isTeamAlert: false };
}

export function showTeamAlert(message: string) {
    alertState.value = { message, isTeamAlert: true };
}

interface AlertModalProps {
    activeTab: Signal<string>;
}

export function AlertModal({ activeTab }: AlertModalProps) {
    useSignals();
    return alertState.value ? (
        <div className={styles.overlay} onClick={() => alertState.value = null}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <p className={styles.message}>{alertState.value.message}</p>
                {alertState.value.isTeamAlert ? (
                    <button className={styles.button} onClick={() => {
                        activeTab.value = "Team";
                        alertState.value = null;
                    }}>
                        Go to Team
                    </button>
                ) : (
                    <button className={styles.button} onClick={() => alertState.value = null}>
                        {alertState.value.buttonText ?? "OK"}
                    </button>
                )}
            </div>
        </div>
    ) : null;
}

export default AlertModal;
