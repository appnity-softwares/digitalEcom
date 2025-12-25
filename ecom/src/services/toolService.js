import api from './api';

/**
 * Tool Service
 * Handles all API tool-related API calls
 */

export const getToolCategories = async () => {
    const response = await api.get('/apitools/categories');
    return response.data;
};

export const getTools = async (filters = {}) => {
    const { category, search, featured, method } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured) params.append('featured', 'true');
    if (method) params.append('method', method);

    const response = await api.get(`/apitools?${params.toString()}`);
    return response.data;
};

export const getTool = async (id) => {
    const response = await api.get(`/apitools/${id}`);
    return response.data;
};

export const trackAPICall = async (id) => {
    const response = await api.post(`/apitools/${id}/call`);
    return response.data;
};
