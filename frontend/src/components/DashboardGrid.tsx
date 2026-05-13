"use client";

import { useState, useMemo } from 'react';
import { Task } from '@/types';
import { api } from '@/services/api';
import styles from './DashboardGrid.module.css';

const BACKEND_URL = 'https://dailyfix-ld2d.onrender.com';
import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from '@/components/TaskItem';

interface DashboardGridProps {
    highPriorityTasks: Task[];
    currentUserEmail?: string;
    stats: {
        totalMails: number;
        urgentCount: number;
        taskCount: number;
        urgentSummary: string;
        normalSummary: string;
    };
    onRefresh: (taskId?: number) => void;
}

export default function DashboardGrid({ highPriorityTasks, stats, onRefresh }: DashboardGridProps) {
    // --- 1. UI & Filter State ---
    const [replyTask, setReplyTask] = useState<Task | null>(null);
    const [draftReply, setDraftReply] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
    const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

    // --- 2. Intelligent Logic: Filter then Sort ---
    const processedTasks = useMemo(() => {
        let result = priorityFilter === 'ALL'
            ? [...highPriorityTasks]
            : highPriorityTasks.filter(t => t.priority === priorityFilter);

        return result.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
        });
    }, [highPriorityTasks, priorityFilter, sortOrder]);

    // --- 3. Interaction Handlers ---
    const handleTaskAction = async (taskId: number, actionType: 'COMPLETE' | 'DISMISS') => {
        if (window.confirm(`Confirm ${actionType.toLowerCase()}?`)) onRefresh(taskId);
    };

    const handleGenerate = async (task: Task) => {
        if (!window.confirm("Initialize Intelligence Draft?")) return;
        try {
            const data = await api.get(`/tasks/${task.id}/generate-reply`);
            setDraftReply((data as { reply: string }).reply);
            setReplyTask(task);
            setIsEditing(false);
        } catch (err: unknown) {
            if (err instanceof Error && err.message === 'Unauthorized') {
                window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
                return;
            }
            alert("Intelligence Service offline.");
        }
    };

    const handleSendReply = async () => {
        if (!replyTask) return;
        setIsSending(true);
        try {
            await api.post(`/tasks/${replyTask.id}/send-reply`, { replyText: draftReply });
            alert("🚀 Intelligence Transmitted!");
            setReplyTask(null);
            onRefresh(replyTask.id);
        } catch (err) {
            alert("Transmission failed.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* --- TOP METRICS (Interactive Toggles) --- */}
            <div className={styles.metricsRow}>
                <div
                    className={`${styles.metricCard} ${priorityFilter === 'ALL' ? styles.activeCard : ''}`}
                    onClick={() => setPriorityFilter('ALL')}
                >
                    <p className={styles.label}>Total Stream</p>
                    <p className={styles.value}>{stats?.totalMails ?? 0}</p>
                </div>
                <div
                    className={`${styles.metricCard} ${priorityFilter === 'MEDIUM' ? styles.activeCard : ''}`}
                    onClick={() => setPriorityFilter('MEDIUM')}
                >
                    <p className={styles.label}>Standard Tasks</p>
                    <p className={styles.value}>{stats?.taskCount ?? 0}</p>
                </div>
                <div
                    className={`${styles.metricCard} ${priorityFilter === 'HIGH' ? styles.activeCard : ''} ${styles.urgentCard}`}
                    onClick={() => setPriorityFilter('HIGH')}
                >
                    <p className={styles.label}>Urgent Directives</p>
                    <p className={`${styles.value} ${styles.urgentText}`}>{stats?.urgentCount ?? 0}</p>
                </div>
            </div>

            {/* --- INTELLIGENCE PANELS --- */}
            <div className={styles.summaryRow}>
                <div className={`${styles.summaryPanel} ${styles.intelligencePanel}`}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelIcon}>✨</span>
                        <h3>Message Intelligence</h3>
                    </div>
                    <p>{stats?.urgentSummary || "Analyzing stream for priority directives..."}</p>
                </div>

                <div className={`${styles.summaryPanel} ${styles.workloadPanel}`}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelIcon}>📊</span>
                        <h3>Workload Focus</h3>
                    </div>
                    <p>{stats?.normalSummary || "Summarizing standard operational tasks..."}</p>
                </div>
            </div>

            {/* --- CONTROL BAR: PUSHED TO SIDES --- */}
            <div className={styles.controlBar}>
                {/* Left: Priority Filter */}
                <div className={styles.filterGroup}>
                    <span className={styles.miniLabel}>Filter by Priority</span>
                    <div className={styles.pillContainer}>
                        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
                            <button
                                key={p}
                                className={`${styles.pill} ${priorityFilter === p ? styles.activePill : ''}`}
                                onClick={() => setPriorityFilter(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Custom Styled Select */}
                <div className={styles.sortGroup}>
                    <span className={styles.miniLabel}>Chronology</span>
                    <div className={styles.selectWrapper}>
                        <select
                            className={styles.customSelect}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                        >
                            <option value="NEWEST">Latest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                        <span className={styles.selectArrow}>▾</span>
                    </div>
                </div>
            </div>

            {/* --- TASK LIST --- */}
            <div className={styles.tasksSection}>
                <div className={styles.taskList}>
                    <AnimatePresence mode='popLayout'>
                        {processedTasks.map((task: Task) => (
                            <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                                <TaskItem
                                    task={task}
                                    onAction={(id) => handleTaskAction(id, 'COMPLETE')}
                                    onDismiss={(id) => handleTaskAction(id, 'DISMISS')}
                                    onGenerate={() => handleGenerate(task)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- AI MODAL --- */}
            <AnimatePresence>
                {replyTask && (
                    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className={styles.modalContent} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
                            <h3 className={styles.modalTitle}>Intelligence Draft</h3>
                            {isEditing ? (
                                <textarea className={styles.editor} value={draftReply} onChange={(e) => setDraftReply(e.target.value)} autoFocus disabled={isSending} />
                            ) : (
                                <div className={styles.previewBox}>{draftReply}</div>
                            )}
                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={() => setReplyTask(null)} disabled={isSending}>Discard</button>
                                {!isEditing && <button className={styles.editBtn} onClick={() => setIsEditing(true)} disabled={isSending}>Edit</button>}
                                <button className={styles.sendBtn} onClick={handleSendReply} disabled={isSending}>
                                    {isSending ? "Transmitting..." : "Confirm & Send"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}