import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface User {
    email: string;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            setLoading(false);
            return; // Don't call API at all — no token = no request = no 401
        }

        api.get('/user/me')
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}