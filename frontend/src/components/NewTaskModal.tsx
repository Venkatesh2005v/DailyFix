"use client";

import { useState } from 'react';
import styles from './NewTaskModal.module.css';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (title: string, description: string) => void;
}

export default function NewTaskModal({ isOpen, onClose, onConfirm }: NewTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (title.trim()) {
            onConfirm(title, description);
            setTitle('');
            setDescription('');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Create Executive Task</h2>

                <label className={styles.label}>Directive Title</label>
                <input
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q4 Strategy Review"
                    autoFocus
                />

                <label className={styles.label}>Details (Optional)</label>
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add context..."
                />

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.confirmBtn} onClick={handleSubmit}>Initialize</button>
                </div>
            </div>
        </div>
    );
}
