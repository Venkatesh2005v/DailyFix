'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuth2CallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            // Save JWT to localStorage
            localStorage.setItem('jwt_token', token);

            // Also set a cookie so middleware.ts can read it (edge runtime)
            document.cookie = `auth_session=1; path=/; max-age=86400; SameSite=Lax`;

            // Replace history so back button doesn't return to /oauth2/callback
            router.replace('/dashboard');
        } else {
            // Auth failed — go back to login
            router.replace('/');
        }
    }, [router]);

    return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '100vh'
        }}>
            <p>Completing sign in...</p>
        </div>
    );
}