import { useState, useEffect, useRef } from 'react';
import { userService } from '@/services';
import { User } from '@/types';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // 1. Add a ref to track if a fetch is already in progress or completed
    const hasFetched = useRef(false);

    useEffect(() => {
        // 2. Only fetch if we haven't already attempted it
        if (hasFetched.current) return;

        const fetchUser = async () => {
            hasFetched.current = true; // Mark as started
            try {
                const userData = await userService.getMe();
                setUser(userData);
            } catch (err: any) {
                // If 401, the Axios interceptor handles the redirect
                console.error("Auth check failed:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // Empty dependency array is correct here

    return { user, loading };
}