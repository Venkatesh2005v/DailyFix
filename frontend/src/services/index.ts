import api from './api';
import { Task, Message, SyncResponse, User, DashboardStats } from '@/types';

export const userService = {
    getMe: async (): Promise<User> => {
        try {
            const response = await api.get<User>('/user/me');
            return response.data;
        } catch (error) {
            return {
                name: 'Executive User',
                email: 'executive@dailyfix.ai',
                avatarUrl: 'https://ui-avatars.com/api/?name=Executive+User&background=6366F1&color=fff',
                goal: 'Improve team productivity' // Added default goal
            };
        }
    },

    // ADD THIS NEW METHOD HERE
    updateUser: async (userData: Partial<User>): Promise<string> => {
        // This hits your @PutMapping("/api/user/update") in Spring Boot
        const response = await api.put('/user/update', userData);
        return response.data;
    }
};
export const messageService = {
    sync: async (): Promise<SyncResponse> => {
        const response = await api.post<SyncResponse>('/messages/sync');
        return response.data;
    },

    getAll: async (): Promise<Message[]> => {
        // Mocking endpoint if not provided explicitly, but assuming REST standard
        const response = await api.get<Message[]>('/messages/my-messages');
        return response.data;
    }
};

// ... existing imports

export const taskService = {
    // NEW METHOD: Connects to your backend filtering logic
    getMyTasks: async (messageId?: number | null): Promise<Task[]> => {
        const response = await api.get<Task[]>('/tasks/my-tasks', {
            params: messageId ? { messageId } : {}
        });
        return response.data;
    },

    getAll: async (): Promise<Task[]> => {
        const response = await api.get<Task[]>('/tasks');
        return response.data;
    },

    complete: async (id: number): Promise<void> => {
        await api.post(`/tasks/${id}/complete`);
    },

    dismiss: async (id: number, reason: string): Promise<void> => {
        await api.post(`/tasks/${id}/dismiss`, { reason });
    },

    create: async (title: string, description: string): Promise<Task> => {
        const response = await api.post<Task>('/tasks', { title, description });
        return response.data;
    },

    archiveCompleted: async (): Promise<void> => {
        await api.post('/tasks/archive-completed');
    }
};

export const dashboardService = {
    // Change parameter from messageId: number to email: string
    getStats: async (email: string): Promise<DashboardStats> => {
        const response = await api.get(`/dashboard/stats?email=${email}`);
        return response.data;
    }
};