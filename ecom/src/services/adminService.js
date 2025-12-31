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


// ============ Template Management (Now using Products API) ============

export const getAdminTemplates = async (params = {}) => {
    // Force productType to 'template'
    const queryParams = new URLSearchParams({ ...params, productType: 'template' });
    const response = await api.get(`/products?${queryParams.toString()}`);
    return response;
};

export const createTemplate = async (templateData) => {
    // Ensure productType is set
    const response = await api.post('/products', { ...templateData, productType: 'template' });
    return response;
};

export const updateTemplate = async (id, templateData) => {
    const response = await api.put(`/products/${id}`, templateData);
    return response;
};

export const deleteTemplate = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response;
};


export const getTemplateCategories = async () => {
    // Return static categories compatible with Product model
    return {
        data: [
            { id: 'Templates', label: 'Templates' },
            { id: 'UI Kits', label: 'UI Kits' },
            { id: 'Boilerplates', label: 'Boilerplates' },
            { id: 'Icon Packs', label: 'Icon Packs' },
            { id: 'Code Utilities', label: 'Code Utilities' }
        ]
    };
};

// ============ Dashboard Stats ============

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/admin');
    return response;
};
