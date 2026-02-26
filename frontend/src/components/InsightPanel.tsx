"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './InsightPanel.module.css';

interface InsightPanelProps {
    reasoning: string;
}

export default function InsightPanel({ reasoning }: InsightPanelProps) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => {
                if (index < reasoning.length) {
                    index++;
                    return reasoning.slice(0, index);
                }
                clearInterval(interval);
                return prev;
            });
        }, 30); // Typewriter speed

        return () => clearInterval(interval);
    }, [reasoning]);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.icon}>✨</span>
                <h3>AI Insight Reasoning</h3>
            </div>
            <div className={styles.content}>
                <p>{displayedText}<span className={styles.cursor}>|</span></p>
            </div>
        </div>
    );
}
