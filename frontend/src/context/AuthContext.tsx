'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from '@/types';
import { userService } from '@/services';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    loading: boolean;
    logout: () => void;
    setToken: (token: string) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const me = await userService.getMe();
            setUser(me);
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        // Read from localStorage on mount (client only)
        const stored = localStorage.getItem('jwt_token');
        if (stored) {
            setTokenState(stored);
            refreshUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [refreshUser]);

    const setToken = (t: string) => {
        localStorage.setItem('jwt_token', t);
        setTokenState(t);
        refreshUser();
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setTokenState(null);
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!token,
            token,
            user,
            loading,
            logout,
            setToken,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}