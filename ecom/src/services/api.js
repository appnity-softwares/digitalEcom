// Use relative path to leverage Vite proxy
const BASE_URL = '/api';



const api = {
    // Helper to get token based on current route
    getToken: () => {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        if (isAdminRoute) {
            return localStorage.getItem('adminToken') || localStorage.getItem('token');
        } else {
            return localStorage.getItem('userToken') || localStorage.getItem('token');
        }
    },

    // Standard Fetch wrapper
    request: async (endpoint, options = {}) => {
        const token = api.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        try {
            const res = await fetch(`${BASE_URL}${endpoint}`, config);
            const data = await res.json();

            if (!res.ok) {
                // Handle 401 Unauthorized
                if (res.status === 401) {
                    // Clear all tokens on unauthorized
                    localStorage.removeItem('token');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('userToken');
                }
                throw new Error(data.message || 'API Error');
            }
            return data;
        } catch (error) {
            console.error("API Request Failed:", endpoint, error);
            throw error;
        }
    },

    get: (endpoint) => api.request(endpoint, { method: 'GET' }),

    post: (endpoint, body) => api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),

    put: (endpoint, body) => api.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),

    delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),
};

export default api;
