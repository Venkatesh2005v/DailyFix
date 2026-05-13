"use client";

import { useState } from 'react';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import styles from './UserProfile.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileProps {
    user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Fallback avatar if api fails or invalid url
    const avatar = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366F1&color=fff`;

    const handleLogout = () => {
        // Clear all local auth state and return to login page
        logout();
    };

    return (
        <div className={styles.container}>
            <button className={styles.avatarBtn} onClick={() => setIsOpen(!isOpen)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={user.name} className={styles.avatar} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user.name}</p>
                            <p className={styles.userEmail}>{user.email}</p>
                        </div>
                        <div className={styles.divider} />
                        <a href="/settings" className={styles.menuItem}>Settings</a>
                        <button onClick={handleLogout} className={`${styles.menuItem} ${styles.logout}`}>Sign Out</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
