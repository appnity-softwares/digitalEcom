import api from './api';

/**
 * Template Service
 * Handles all template-related API calls
 */

export const getTemplateCategories = async () => {
    const response = await api.get('/templates/categories');
    return response.data;
};

export const getTemplates = async (filters = {}) => {
    const { category, search, featured, premium } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured) params.append('featured', 'true');
    if (premium) params.append('premium', 'true');

    const response = await api.get(`/templates?${params.toString()}`);
    return response.data;
};

export const getTemplate = async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
};

export const trackTemplateDownload = async (id) => {
    const response = await api.post(`/templates/${id}/download`);
    return response.data;
};
