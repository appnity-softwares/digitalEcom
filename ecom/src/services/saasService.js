import api from './api';

export const getTools = async () => {
    try {
        const response = await api.get('/saas');
        // Defensive: handle various response structures
        if (!response || !response.data) {
            console.warn('No response data from SaaS API');
            return [];
        }
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.tools)) return data.tools;
        if (Array.isArray(data.data)) return data.data;
        return [];
    } catch (error) {
        console.error('Failed to fetch tools:', error);
        return [];
    }
};

export const getToolById = async (id) => {
    try {
        const response = await api.get(`/saas/${id}`);
        if (!response || !response.data) return null;
        return response.data.tool || response.data;
    } catch (error) {
        console.error('Failed to fetch tool:', error);
        return null;
    }
};

export const getMyApiKeys = async () => {
    try {
        const response = await api.get('/saas/api-keys');
        if (!response || !response.data) return [];
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.apiKeys)) return data.apiKeys;
        if (Array.isArray(data.keys)) return data.keys;
        return [];
    } catch (error) {
        console.error('Failed to fetch API keys:', error);
        return [];
    }
};

export const generateApiKey = async (toolId, tier = 'FREE') => {
    const response = await api.post(`/saas/${toolId}/generate-key`, { tier });
    return response.data;
};

export const revokeApiKey = async (keyId) => {
    const response = await api.delete(`/saas/api-keys/${keyId}`);
    return response.data;
};
