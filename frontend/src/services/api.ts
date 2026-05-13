// services/api.ts

const BASE_URL = '/api';

async function getHeaders(): Promise<HeadersInit> {
    const token =
        typeof window !== 'undefined'
            ? localStorage.getItem('jwt_token')
            : null;

    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {

    // Handle Authentication Errors
    if (res.status === 401) {

        if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/'
        ) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/';
        }

        throw new Error('Unauthorized');
    }

    // Detect response type
    const contentType = res.headers.get('content-type');

    // Handle JSON responses safely
    if (contentType?.includes('application/json')) {

        const data = await res.json();

        // Handle backend errors
        if (!res.ok) {
            throw new Error(
                data?.message || `API Error: ${res.status}`
            );
        }

        return data;
    }

    // Handle plain text / malformed responses
    const text = await res.text();

    console.error('Non-JSON response from backend:', text);

    // Handle failed non-JSON responses
    if (!res.ok) {
        throw new Error(
            `API Error: ${res.status} - ${text}`
        );
    }

    // Graceful fallback for successful text responses
    return {
        message: text,
    };
}

export const api = {

    get: async (path: string) => {

        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'GET',
            headers: await getHeaders(),
        });

        return handleResponse(res);
    },

    post: async (path: string, body?: unknown) => {

        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: await getHeaders(),
            ...(body !== undefined && {
                body: JSON.stringify(body),
            }),
        });

        return handleResponse(res);
    },

    put: async (path: string, body?: unknown) => {

        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'PUT',
            headers: await getHeaders(),
            ...(body !== undefined && {
                body: JSON.stringify(body),
            }),
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