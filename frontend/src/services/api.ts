// services/api.ts

const BASE_URL = '/api'; // Vercel proxy handles routing to Render — no env var needed

async function getHeaders(): Promise<HeadersInit> {
    // Guard for SSR — localStorage only exists in browser
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('jwt_token')
        : null;

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {
    if (res.status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            localStorage.removeItem('jwt_token');
            window.location.href = '/';
        }
        throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export const api = {
    get: async (path: string) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: await getHeaders(),
        });
        return handleResponse(res);
    },

    post: async (path: string, body: unknown) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse(res);
    },

    put: async (path: string, body: unknown) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse(res);
    },

    delete: async (path: string) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });
        return handleResponse(res);
    },
};