"use client";

import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: 'success' | 'error';
}

export default function Toast({ message, isVisible, onClose, type = 'success' }: ToastProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`${styles.toast} ${styles[type]}`}
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    onAnimationComplete={() => {
                        // Auto-close after delay handled by parent usually, but this event helps
                    }}
                >
                    <span className={styles.icon}>{type === 'success' ? '✅' : '❌'}</span>
                    <span className={styles.message}>{message}</span>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
