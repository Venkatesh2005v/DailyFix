import styles from './SummaryPanel.module.css';

interface SummaryPanelProps {
    title: string;
    content: string;
    icon?: string;
    variant?: 'indigo' | 'slate';
}

export default function SummaryPanel({ title, content, icon, variant = 'slate' }: SummaryPanelProps) {
    return (
        <div className={`${styles.panel} ${styles[variant]}`}>
            <h3 className={styles.title}>
                {icon && <span className={styles.icon}>{icon}</span>}
                {title}
            </h3>
            <div className={styles.content}>
                {content || "Analyzing stream..."}
            </div>
        </div>
    );
}
