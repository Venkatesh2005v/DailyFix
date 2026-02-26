"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { userService } from '@/services';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const userData = await userService.getMe();
            setUser(userData);
        } catch (error) {
            // If 401, interceptor handles redirect. 
            // If other error, we just set user to null.
            console.error("Auth check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const refreshUser = async () => {
        setLoading(true); // Optional: show loading state on refresh
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
