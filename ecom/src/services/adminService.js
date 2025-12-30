import api from './api';

/**
 * Admin Service
 * Handles all admin-related API calls
 */

// ============ User Management ============

export const getUsers = async (params = {}) => {
    const { page = 1, limit = 20, search, role } = params;
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);

    const response = await api.get(`/users?${queryParams.toString()}`);
    return response;
};

export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response;
};

export const updateUserRole = async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response;
};

export const updateUserSubscription = async (id, data) => {
    const response = await api.put(`/users/${id}/subscription`, data);
    return response;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
};

export const getUserStats = async () => {
    const response = await api.get('/users/stats');
    return response;
};

// ============ Template Management ============

export const getAdminTemplates = async (params = {}) => {
    const { category, search, featured, premium } = params;
    const queryParams = new URLSearchParams();

    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    if (featured !== undefined) queryParams.append('featured', featured);
    if (premium !== undefined) queryParams.append('premium', premium);

    const response = await api.get(`/templates?${queryParams.toString()}`);
    return response;
};

export const createTemplate = async (templateData) => {
    const response = await api.post('/templates', templateData);
    return response;
};

export const updateTemplate = async (id, templateData) => {
    const response = await api.put(`/templates/${id}`, templateData);
    return response;
};

export const deleteTemplate = async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response;
};

export const getTemplateCategories = async () => {
    const response = await api.get('/templates/categories');
    return response;
};

// ============ Dashboard Stats ============

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/admin');
    return response;
};
