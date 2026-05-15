import { api } from './api';
export { api };
import { Task, Message, SyncResponse, User, DashboardStats } from '@/types';

export const userService = {
    getMe: async (): Promise<User> => {
        try {
            return await api.get('/user/me');
        } catch (error) {
            return {
                name: 'Executive User',
                email: 'executive@dailyfix.ai',
                avatarUrl: 'https://ui-avatars.com/api/?name=Executive+User&background=6366F1&color=fff',
                goal: 'Improve team productivity'
            };
        }
    },

    updateUser: async (userData: Partial<User>): Promise<string> => {
        return await api.put('/user/update', userData);
    }
};

export const messageService = {
    sync: async (): Promise<SyncResponse> => {
        return await api.post('/messages/sync', {});
    },

    getAll: async (): Promise<Message[]> => {
        return await api.get('/messages/my-messages');
    }
};

export const taskService = {
    getMyTasks: async (messageId?: number | null): Promise<Task[]> => {
        const query = messageId ? `?messageId=${messageId}` : '';
        return await api.get(`/tasks/my-tasks${query}`);
    },

    getAll: async (): Promise<Task[]> => {
        return await api.get('/tasks');
    },

    complete: async (id: number): Promise<void> => {
        await api.post(`/tasks/${id}/complete`, {});
    },

    dismiss: async (id: number, reason: string): Promise<void> => {
        await api.post(`/tasks/${id}/dismiss`, { reason });
    },


    archiveCompleted: async (): Promise<void> => {
        await api.post('/tasks/archive-completed', {});
    }
};

export const dashboardService = {
    getStats: async (email: string): Promise<DashboardStats> => {
        return await api.get(`/dashboard/stats?email=${email}`);
    }
};