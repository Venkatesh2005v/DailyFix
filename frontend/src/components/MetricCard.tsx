import styles from './MetricCard.module.css';

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({ label, value, trend }: MetricCardProps) {
    const isUrgent = label.toLowerCase().includes('urgent') && typeof value === 'number' && value > 0;

    return (
        <div className={`${styles.card} ${isUrgent ? styles.pulse : ''}`}>
            <span className={styles.label}>{label}</span>
            <div className={styles.valueWrapper}>
                <span className={styles.value}>{value}</span>
                {trend && <span className={`${styles.trend} ${styles[trend]}`} />}
            </div>
        </div>
    );
}
