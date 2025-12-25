import api from './api';

/**
 * Doc Service
 * Handles all documentation-related API calls
 */

export const getDocCategories = async () => {
    const response = await api.get('/docs/categories');
    return response.data;
};

export const getDocs = async (filters = {}) => {
    const { category, search, featured, difficulty } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured) params.append('featured', 'true');
    if (difficulty) params.append('difficulty', difficulty);

    const response = await api.get(`/docs?${params.toString()}`);
    return response.data;
};

export const getDoc = async (id) => {
    const response = await api.get(`/docs/${id}`);
    return response.data;
};

export const trackDocLike = async (id) => {
    const response = await api.post(`/docs/${id}/like`);
    return response.data;
};
