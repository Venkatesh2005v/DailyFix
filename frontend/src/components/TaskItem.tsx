"use client";

import { useState } from 'react';
import { Task } from '@/types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
    task: Task;
    onAction: (id: number) => void;    // For Complete
    onDismiss: (id: number) => void;   // For Dismiss
    onGenerate: () => void;           // For AI Reply
}

export default function TaskItem({ task, onAction, onDismiss, onGenerate }: TaskItemProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Format the date for a clean display
    const formattedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={styles.card}>
            {/* Visual Priority Indicator on the far left */}
            <div className={`${styles.priorityIndicator} ${styles[task.priority.toLowerCase()]}`} />

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <h3 className={styles.title}>{task.title}</h3>
                        <span className={styles.timestamp}>{formattedDate}</span>
                    </div>
                </div>

                <p className={styles.description}>{task.description}</p>

                <div className={styles.sourceInfo}>
                    <small>Source: {task.sourceMessage?.senderEmail || "DailyFix Intelligence"}</small>
                </div>

                {/* --- THE ACTION BAR --- */}
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.aiBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onGenerate();
                        }}
                        disabled={isProcessing}
                    >
                        Generate Reply
                    </button>

                    <button
                        className={styles.completeBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(task.id);
                        }}
                        disabled={isProcessing}
                    >
                        Complete
                    </button>

                    <button
                        className={styles.dismissBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(task.id);
                        }}
                        disabled={isProcessing}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}