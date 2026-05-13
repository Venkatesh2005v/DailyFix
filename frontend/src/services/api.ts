// services/api.ts

const BASE_URL = '/api';

async function getHeaders(): Promise<HeadersInit> {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('jwt_token')
        : null;

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {
    // 1. Handle Authentication Errors
    if (res.status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            localStorage.removeItem('jwt_token');
            window.location.href = '/';
        }
        throw new Error('Unauthorized');
    }

    // 2. Capture the Raw Text to prevent the "Unexpected token" crash
    const rawText = await res.text();

    // 3. Handle Server Errors (500, 404, etc.)
    if (!res.ok) {
        console.error("Backend Error Output:", rawText);
        throw new Error(`API error: ${res.status} - ${rawText}`);
    }

    // 4. Safe JSON Parsing
    try {
        return JSON.parse(rawText);
    } catch (err) {
        // If parsing fails, it means the backend sent the raw Gemini string instead of a JSON object
        console.error("CRITICAL: Backend sent raw text instead of JSON. Output:", rawText);

        // Return a mock object so the dashboard doesn't crash, but you can see the error in the UI
        return {
            totalMails: 0,
            urgentCount: 0,
            taskCount: 0,
            urgentSummary: rawText, // Put the 'G' string here so it shows in your dashboard panel
            normalSummary: "Sync failed - see console."
        };
    }
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