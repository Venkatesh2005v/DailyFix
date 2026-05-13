"use client";

import { useEffect, useState } from 'react';
import styles from './landing.module.css';

const BACKEND_URL = 'https://dailyfix-backend-15uv.onrender.com';
const HEALTH_URL = `${BACKEND_URL}/api/health`;
const RETRY_INTERVAL_MS = 3000;

export default function LandingPage() {
    const [isBackendReady, setIsBackendReady] = useState(false);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;
        let isMounted = true;

        const checkHealth = async () => {
            try {
                const res = await fetch(HEALTH_URL, { method: 'GET' });
                if (res.ok && isMounted) {
                    setIsBackendReady(true);
                    // Stop retrying once healthy
                    if (intervalId !== null) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                }
            } catch {
                // Backend still sleeping — retry will fire automatically
            }
        };

        // Immediate first attempt
        checkHealth();

        // Retry every 3 seconds until success
        intervalId = setInterval(checkHealth, RETRY_INTERVAL_MS);

        return () => {
            isMounted = false;
            if (intervalId !== null) clearInterval(intervalId);
        };
    }, []);

    const handleLogin = () => {
        window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
    };

    return (
        <main className={styles.container}>
            <div className={styles.meshGradient} />

            <div className={styles.card}>
                <h1 className={styles.logo}>DailyFix</h1>
                <p className={styles.tagline}>AI-Powered Executive Task Force</p>

                <button
                    className={styles.googleBtn}
                    onClick={handleLogin}
                    disabled={!isBackendReady}
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className={styles.googleIcon}
                    />
                    <span className={styles.btnText}>Continue with Google</span>
                </button>

                {!isBackendReady && (
                    <div className={styles.warmupRow}>
                        <span className={styles.warmupDot} />
                        <span className={styles.warmupText}>Waking up the engine...</span>
                    </div>
                )}
            </div>
        </main>
    );
}