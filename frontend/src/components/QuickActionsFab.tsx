"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './QuickActionsFab.module.css';

interface QuickActionsFabProps {
    onRefresh: () => void | Promise<void>;
    onCleanup: () => void | Promise<void>;
}

export default function QuickActionsFab({ onRefresh, onCleanup }: QuickActionsFabProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className={styles.container}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.menu}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    >

                        <button onClick={onCleanup} className={styles.actionBtn}>Cleanup 🧹</button>
                        <button
                            onClick={handleRefresh}
                            className={`${styles.actionBtn} ${isRefreshing ? styles.refreshing : ''}`}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? (
                                <>
                                    <span className={styles.spinner} />
                                    Syncing...
                                </>
                            ) : (
                                'Refresh AI 🔄'
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                className={`${styles.fab} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.plus}>+</span>
            </button>
        </div>
    );
}
