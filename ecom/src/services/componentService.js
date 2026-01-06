import api from './api';

/**
 * Component Service
 * Handles all component-related API calls
 */

// Get all categories
export const getComponentCategories = async (status = 'active') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    // api.get returns { success: true, data: [...] }
    // We return the FULL object so the component can access .data
    return await api.get(`/components/categories?${params.toString()}`);
};

// Get all components with optional filters
export const getComponents = async (filters = {}) => {
    const { category, search, featured } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured) params.append('featured', 'true');
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/components?${params.toString()}`);
    return response.data; // api.get returns { success: true, data: [...] }
};

// Get single component
export const getComponent = async (id) => {
    const response = await api.get(`/components/${id}`);
    return response.data;
};

// Track component copy
export const trackComponentCopy = async (id) => {
    const response = await api.post(`/components/${id}/copy`);
    return response.data;
};

// Admin: Create component
export const createComponent = async (componentData) => {
    const response = await api.post('/components', componentData);
    return response.data;
};

// Admin: Update component
export const updateComponent = async (id, componentData) => {
    const response = await api.put(`/components/${id}`, componentData);
    return response.data;
};

export const deleteComponent = async (id) => {
    const response = await api.delete(`/components/${id}`);
    return response.data;
};

// Admin: Create Category
export const createCategory = async (categoryData) => {
    const response = await api.post('/components/categories', categoryData);
    return response.data;
};

// Admin: Update Category
export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/components/categories/${id}`, categoryData);
    return response.data;
};

// Admin: Delete Category
export const deleteCategory = async (id) => {
    const response = await api.delete(`/components/categories/${id}`);
    return response.data;
};
