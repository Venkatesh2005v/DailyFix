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
        // 1. Get the token directly from storage as a fallback
        const token = localStorage.getItem('jwt_token');

        // 2. If we don't have a user email OR a token, then we stop. 
        // Otherwise, let the API call proceed because the Interceptor will add the Bearer token anyway.
        if (!user?.email && !token) {
            console.warn("No auth session found.");
            return;
        }

        try {
            console.log("Fetching intelligence stream...");
            const [fetchedTasks, fetchedStats] = await Promise.all([
                taskService.getMyTasks(null),
                // Pass null or empty string; your backend should extract email from the JWT sub
                dashboardService.getStats("")
            ]);

            setTasks(fetchedTasks || []);
            setStats(fetchedStats);
        } catch (error) {
            console.error("Fetch failed:", error);
        }
    }, [user?.email]);

    useEffect(() => {
        if (user?.email) loadData();
    }, [user?.email, loadData]);

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