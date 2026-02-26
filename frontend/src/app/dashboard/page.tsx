"use client";

import { useEffect, useState, useCallback } from 'react';
import DashboardGrid from '@/components/DashboardGrid';
import QuickActionsFab from '@/components/QuickActionsFab';
import UserProfile from '@/components/UserProfile';
import { Task, DashboardStats } from '@/types';
import { taskService, dashboardService, messageService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import NewTaskModal from '@/components/NewTaskModal';

export default function Dashboard() {
    const { user, loading: userLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalMails: 0,
        urgentCount: 0,
        taskCount: 0,
        urgentSummary: "Analyzing inbox intelligence...",
        normalSummary: "Reviewing task directives..."
    });

    const loadData = useCallback(async () => {
        if (!user?.email) return;
        try {
            const [fetchedTasks, fetchedStats] = await Promise.all([
                taskService.getMyTasks(null),
                dashboardService.getStats(user.email)
            ]);
            setTasks(fetchedTasks || []);
            setStats(fetchedStats);
        } catch (error) {
            console.error("Dashboard data fetch failed", error);
        }
    }, [user?.email]);

    useEffect(() => {
        if (user) loadData();
    }, [user, loadData]);

    const handleTaskAction = async (taskId?: number) => {
        if (taskId) {
            // Optimistic UI: remove immediately so animation starts
            setTasks(prev => prev.filter(t => t.id !== taskId));
            try {
                // Background sync with Spring Boot
                await taskService.complete(taskId);
                const updatedStats = await dashboardService.getStats(user?.email!);
                setStats(updatedStats);
            } catch (error) {
                loadData(); // Rollback if backend fails
            }
        } else {
            loadData();
        }
    };

    if (userLoading) return <div className={styles.loading}>Accessing Secure Stream...</div>;

    return (
        <div className={styles.dashboardWrapper}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>DAILY FIX</h1>
                        <p className={styles.userGreeting}>Welcome, {user?.name || 'Agent'}</p>
                        <div className={styles.statusBadge}>
                            <span className={styles.dot}></span>
                            SECURE CONNECTION ACTIVE
                        </div>
                    </div>
                    {user && <UserProfile user={user} />}
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.contentInner}>
                    <DashboardGrid
                        currentUserEmail={user?.email}
                        stats={stats}
                        highPriorityTasks={tasks}
                        onRefresh={handleTaskAction}
                    />
                </div>
            </main>

            <QuickActionsFab
                onRefresh={async () => {
                    await messageService.sync();
                    setTimeout(loadData, 2000);
                }}
                onNewTask={() => setIsModalOpen(true)}
                onCleanup={async () => {
                    await taskService.archiveCompleted();
                    loadData();
                }}
            />

            <NewTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={async (t, d) => {
                    await taskService.create(t, d);
                    setIsModalOpen(false);
                    loadData();
                }}
            />
        </div>
    );
}