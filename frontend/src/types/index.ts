export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
    name: string;
    email: string;
    avatarUrl?: string; // Optional if not always present
    goal?: string; // Personal goal for AI context
}

// Define the Message interface first
export interface Message {
    id: number;
    senderEmail: string;
    senderDomain?: string;
    subject: string;
    content: string;
    snippet?: string;
    receivedAt: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'SILENT';
    status: 'OPEN' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
    createdAt: string;
    dueDate: string;
    // Update this to match the backend JSON structure
    sourceMessage?: Message;
    // You can keep this if the backend sends both, but usually it's one or the other
    sourceMessageId?: number;
    assignedTo?: User;    // The full User object (matches @ManyToOne in Java)
    assignedToId?: number;
}

export interface SyncResponse {
    processedCount: number;
    newTasks: number;
}

export interface DashboardStats {
    totalMails: number;
    urgentCount: number;
    taskCount: number;
    urgentSummary: string;
    normalSummary: string;
}
