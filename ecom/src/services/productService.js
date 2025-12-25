import api from './api';

const productService = {
    getAll: async (keyword = '') => {
        try {
            const response = await api.get(`/products?keyword=${keyword}`);
            // Defensive: handle various response structures
            if (!response || !response.data) {
                console.warn('No response data from products API');
                return [];
            }
            const data = response.data;
            // Handle: array directly, {products: []}, {data: []}, or just return empty
            if (Array.isArray(data)) return data;
            if (Array.isArray(data.products)) return data.products;
            if (Array.isArray(data.data)) return data.data;
            return [];
        } catch (error) {
            console.error('Product service error:', error);
            return []; // Return empty array on error
        }
    },

    getFeatured: async () => {
        try {
            const response = await api.get('/products/featured');
            if (!response || !response.data) return [];
            const data = response.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data.products)) return data.products;
            if (Array.isArray(data.data)) return data.data;
            return [];
        } catch (error) {
            console.error('Featured products error:', error);
            return [];
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            if (!response || !response.data) return null;
            return response.data.product || response.data;
        } catch (error) {
            console.error('Get product by ID error:', error);
            return null;
        }
    },

    create: (data) => api.post('/products', data), // Admin
    update: (id, data) => api.put(`/products/${id}`, data), // Admin
    delete: (id) => api.delete(`/products/${id}`), // Admin
};

export default productService;
