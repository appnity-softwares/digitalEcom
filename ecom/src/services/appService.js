import api from './api';

/**
 * App Service
 * Handles all mobile app-related API calls
 */

export const getAppCategories = async () => {
    const response = await api.get('/apps/categories');
    return response.data;
};

export const getApps = async (filters = {}) => {
    const { category, search, featured, platform } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured) params.append('featured', 'true');
    if (platform) params.append('platform', platform);

    const response = await api.get(`/apps?${params.toString()}`);
    return response.data;
};

export const getApp = async (id) => {
    const response = await api.get(`/apps/${id}`);
    return response.data;
};

export const trackAppDownload = async (id) => {
    const response = await api.post(`/apps/${id}/download`);
    return response.data;
};
