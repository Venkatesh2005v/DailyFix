'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
    const [dataLoading, setDataLoading] = useState(true);

    // Track previous task count to detect AI-generated additions
    const prevTaskCount = useRef<number | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalMails: 0,
        urgentCount: 0,
        taskCount: 0,
        urgentSummary: "Analyzing inbox intelligence...",
        normalSummary: "Reviewing task directives..."
    });

    // Tracks the email used for the last successful fetch
    // so we never double-fetch for the same email
    const lastFetchedEmail = useRef<string | null>(null);

    const loadData = useCallback(async (emailOverride?: string) => {
        // Use override → context email → localStorage decode (fallback)
        const email = emailOverride || user?.email || getEmailFromToken();
        if (!email) return;

        // Don't re-fetch if already loaded for this email
        // (override bypasses this check so manual refresh always works)
        if (!emailOverride && lastFetchedEmail.current === email) return;

        setDataLoading(true);
        try {
            const fetchedTasks = (await taskService.getMyTasks(null)) || [];
            const fetchedStats = await dashboardService.getStats(email);

            // Toast alert when AI generates new tasks in the background
            if (prevTaskCount.current !== null && fetchedTasks.length > prevTaskCount.current) {
                toast.success('New AI-generated task added!', {
                    icon: '🤖',
                    style: {
                        background: '#1e1b4b',
                        color: '#e0e7ff',
                        border: '1px solid #6366f1',
                    },
                });
            }
            prevTaskCount.current = fetchedTasks.length;

            setTasks(fetchedTasks);
            setStats(fetchedStats);
            lastFetchedEmail.current = email;
        } catch (error) {
            console.error('Dashboard data fetch failed:', error);
        } finally {
            setDataLoading(false);
        }
    }, [user?.email]);

    // Aggressive load: fires immediately using token,
    // then re-fires when AuthContext finishes loading user
    useEffect(() => {
        if (userLoading) return;

        const email = user?.email || getEmailFromToken();
        if (email) {
            loadData(email);
        }
    }, [userLoading, user?.email, loadData]);

    const handleTaskAction = async (taskId?: number) => {
        const email = user?.email || getEmailFromToken();
        if (taskId) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            try {
                await taskService.complete(taskId);
                if (email) {
                    const updatedStats = await dashboardService.getStats(email);
                    setStats(updatedStats);
                }
            } catch {
                loadData();
            }
        } else {
            loadData();
        }
    };

    if (userLoading && dataLoading) {
        return <div className={styles.loading}>Accessing Secure Stream...</div>;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>DAILY FIX</h1>
                        <p className={styles.userGreeting}>
                            Welcome, {user?.name || 'Agent'}
                        </p>
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
                    try {
                        await messageService.sync();
                    } catch {
                        // sync returns non-JSON sometimes — safe to ignore
                    }
                    // Wait 2s for backend to process, then force refresh
                    setTimeout(() => loadData(user?.email || getEmailFromToken() || undefined), 2000);
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

            {/* Global toast notifications */}
            <Toaster position="top-right" />
        </div>
    );
}

// Decodes email directly from JWT stored in localStorage
// so we don't have to wait for AuthContext to be ready
function getEmailFromToken(): string | null {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return null;
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.sub || decoded.email || null;
    } catch {
        return null;
    }
}