"use client";

import styles from './landing.module.css';

const BACKEND_URL = 'https://dailyfix-backend-15uv.onrender.com';

export default function LandingPage() {
    const handleLogin = () => {
        window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
    };

    return (
        <main className={styles.container}>
            <div className={styles.meshGradient} />

            <div className={styles.card}>
                <h1 className={styles.logo}>DailyFix</h1>
                <p className={styles.tagline}>AI-Powered Executive Task Force</p>

                <button className={styles.googleBtn} onClick={handleLogin}>
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className={styles.googleIcon}
                    />
                    <span className={styles.btnText}>Continue with Google</span>
                </button>
            </div>
        </main>
    );
}