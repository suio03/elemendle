const API_BASE = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787'

export const ENDPOINTS = {
    daily: {
        get: `${API_BASE}/api/daily`,
        increment: `${API_BASE}/api/daily/increment`
    }
} as const 