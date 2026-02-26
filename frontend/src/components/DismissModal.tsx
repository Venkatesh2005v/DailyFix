"use client";

import { useState } from 'react';
import styles from './DismissModal.module.css';

interface DismissModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export default function DismissModal({ isOpen, onClose, onConfirm }: DismissModalProps) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Dismiss Task</h2>
                <p>Please provide a reason for the AI log.</p>
                <textarea
                    className={styles.textarea}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Already completed manually..."
                />
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.confirmBtn} onClick={() => onConfirm(reason)}>Dismiss</button>
                </div>
            </div>
        </div>
    );
}
