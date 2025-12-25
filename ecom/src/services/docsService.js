import api from './api';

export const getDocs = async () => {
    try {
        const response = await api.get('/docs');
        // Defensive: handle various response structures
        if (!response || !response.data) {
            console.warn('No response data from docs API');
            return [];
        }
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.docs)) return data.docs;
        if (Array.isArray(data.data)) return data.data;
        return [];
    } catch (error) {
        console.error('Failed to fetch docs:', error);
        return [];
    }
};

export const getDocById = async (id) => {
    try {
        const response = await api.get(`/docs/${id}`);
        if (!response || !response.data) return null;
        return response.data.doc || response.data;
    } catch (error) {
        console.error('Failed to fetch doc:', error);
        return null;
    }
};

export const getDocBySlug = async (slug) => {
    try {
        const response = await api.get(`/docs/slug/${slug}`);
        if (!response || !response.data) return null;
        return response.data.doc || response.data;
    } catch (error) {
        console.error('Failed to fetch doc by slug:', error);
        return null;
    }
};

export const purchaseDoc = async (docId) => {
    const response = await api.post(`/docs/${docId}/purchase`);
    return response.data;
};
