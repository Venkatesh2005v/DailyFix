"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services';
import Toast from '@/components/Toast';
import styles from './page.module.css';

export default function SettingsPage() {
    const { user, refreshUser, loading } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [goal, setGoal] = useState('');
    const [saving, setSaving] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setGoal(user.goal || '');
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userService.updateUser({ name, goal });
            await refreshUser();
            setToast({ show: true, message: 'Settings Saved Successfully!', type: 'success' });


            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        } catch (error) {
            console.error("Update failed", error);
            setToast({ show: true, message: 'Failed to save settings.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading Profile...</div>;
    }

    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <Link href="/dashboard" className={styles.backBtn}>
                    ← Back to Mission Control
                </Link>
            </nav>

            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Executive Profile</h1>
                    <p className={styles.subtitle}>Manage your identity and AI context parameters.</p>
                </header>

                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            disabled
                            title="Email cannot be changed."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>AI Context: Personal Goal</label>
                        <textarea
                            className={styles.textarea}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Describe your current focus or primary objective (e.g., 'Launch the Q4 marketing campaign by Friday'). The AI will prioritize tasks based on this goal."
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" disabled={saving} className={styles.saveBtn}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <Toast
                message={toast.message}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
                type={toast.type}
            />
        </main>
    );
}
