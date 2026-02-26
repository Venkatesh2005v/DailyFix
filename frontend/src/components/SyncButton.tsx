"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { messageService } from '@/services';
import styles from './SyncButton.module.css';

export default function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await messageService.sync();
        } catch (error) {
            console.error("Sync failed", error);
        } finally {
            // Keep animation running for a bit to feel "premium"
            setTimeout(() => setIsSyncing(false), 2000);
        }
    };

    return (
        <div className={styles.container}>
            {isSyncing && (
                <motion.div
                    className={styles.aura}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
            <button
                className={styles.button}
                onClick={handleSync}
                disabled={isSyncing}
            >
                {isSyncing ? 'SYNCING...' : 'SYNC GMAIL'}
            </button>
        </div>
    );
}
