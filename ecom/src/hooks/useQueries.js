import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { getComponentCategories, getComponents, trackComponentCopy } from '../services/componentService';
import { getTemplateCategories, getTemplates, trackTemplateDownload } from '../services/templateService';
import { getDocCategories, getDocs, trackDocLike } from '../services/docService';
import { getToolCategories, getTools, trackAPICall } from '../services/toolService';
import { getAppCategories, getApps, trackAppDownload } from '../services/appService';


// ============================================
// PRODUCTS
// ============================================

export const useProducts = (filters = {}) => {
    const { category, search, page = 1, limit = 12 } = filters;

    return useQuery({
        queryKey: ['products', { category, search, page, limit }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (search) params.append('search', search);
            params.append('page', page);
            params.append('limit', limit);

            try {
                const res = await api.get(`/products?${params.toString()}`);
                return res || { products: [] };
            } catch (error) {
                console.error('Failed to fetch products:', error);
                return { products: [] };
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
            return res;
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, productData }) => {
            const res = await api.put(`/products/${id}`, productData);
            return res;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
        },
    });
};

export const useFeaturedProducts = () => {
    return useQuery({
        queryKey: ['products', 'featured'],
        queryFn: async () => {
            const res = await api.get('/products/featured');
            return res.products || res;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
};

// ============================================
// PREMIUM DOCS
// ============================================

export const useDocs = (filters = {}) => {
    const { category, page = 1, limit = 12 } = filters;

    return useQuery({
        queryKey: ['docs', { category, page, limit }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            params.append('page', page);
            params.append('limit', limit);

            const res = await api.get(`/docs?${params.toString()}`);
            return res;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useDoc = (id) => {
    return useQuery({
        queryKey: ['doc', id],
        queryFn: async () => {
            const res = await api.get(`/docs/${id}`);
            return res;
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const useDeleteDoc = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/docs/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['docs'] });
        },
    });
};

// ============================================
// SAAS TOOLS
// ============================================

export const useSaasTools = (category = null) => {
    return useQuery({
        queryKey: ['saas-tools', category],
        queryFn: async () => {
            const url = category ? `/saas?category=${category}` : '/saas';
            const res = await api.get(url);
            return res.tools || res;
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useSaasTool = (id) => {
    return useQuery({
        queryKey: ['saas-tool', id],
        queryFn: async () => {
            const res = await api.get(`/saas/${id}`);
            return res.tool || res;
        },
        enabled: !!id,
    });
};

export const useDeleteSaasTool = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/saas/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saas-tools'] });
        },
    });
};

export const useGenerateApiKey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ toolId }) => {
            const res = await api.post('/saas/generate-key', { toolId });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-api-keys'] });
        },
    });
};

export const useMyApiKeys = () => {
    return useQuery({
        queryKey: ['my-api-keys'],
        queryFn: async () => {
            const res = await api.get('/saas/my-keys');
            return res.apiKeys || [];
        },
        staleTime: 2 * 60 * 1000,
    });
};

export const useGenerateToolApiKey = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ toolId, name }) => {
            const res = await api.post(`/saas/${toolId}/generate-key`, { name });
            return res.apiKey || res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-api-keys'] });
        },
    });
};

// ============================================
// ORDERS
// ============================================

export const useMyOrders = () => {
    return useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const res = await api.get('/orders/mine');
            return res.orders || res;
        },
        staleTime: 2 * 60 * 1000,
    });
};

export const useOrder = (id) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await api.get(`/orders/${id}`);
            return res.order || res;
        },
        enabled: !!id,
    });
};

export const useAllOrders = () => {
    return useQuery({
        queryKey: ['admin', 'orders'],
        queryFn: async () => {
            const res = await api.get('/orders');
            return res.orders || [];
        },
        staleTime: 60 * 1000,
    });
};

// ============================================
// REVIEWS
// ============================================

export const useProductReviews = (productId, productType = 'product') => {
    return useQuery({
        queryKey: ['reviews', productType, productId],
        queryFn: async () => {
            const endpoint = productType === 'doc'
                ? `/reviews/doc/${productId}`
                : `/reviews/product/${productId}`;
            const res = await api.get(endpoint);
            return res.reviews || [];
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSubmitReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reviewData) => {
            const res = await api.post('/reviews', reviewData);
            return res.review;
        },
        onSuccess: (data, variables) => {
            const type = variables.docId ? 'doc' : 'product';
            const id = variables.docId || variables.productId;
            queryClient.invalidateQueries({ queryKey: ['reviews', type, id] });
        },
    });
};

// ============================================
// WISHLIST
// ============================================

export const useWishlist = () => {
    return useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const res = await api.get('/wishlist');
            return res.wishlist?.items || [];
        },
        staleTime: 2 * 60 * 1000,
    });
};

export const useAddToWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, premiumDocId }) => {
            const res = await api.post('/wishlist', { productId, premiumDocId });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });
};

export const useRemoveFromWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (itemId) => {
            await api.delete(`/wishlist/${itemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });
};

// ============================================
// INVOICES
// ============================================

export const useInvoices = () => {
    return useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            return res.invoices || [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

// ============================================
// SUBSCRIPTIONS
// ============================================

export const useCurrentSubscription = () => {
    return useQuery({
        queryKey: ['current-subscription'],
        queryFn: async () => {
            const res = await api.get('/subscriptions/current');
            return res.subscription;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// ============================================
// SEARCH
// ============================================

export const useSearchSuggestions = (query) => {
    return useQuery({
        queryKey: ['search-suggestions', query],
        queryFn: async () => {
            const res = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
            return res.suggestions || [];
        },
        enabled: query.length >= 2,
        staleTime: 30 * 1000, // 30 seconds
    });
};

export const usePopularSearches = () => {
    return useQuery({
        queryKey: ['popular-searches'],
        queryFn: async () => {
            const res = await api.get('/search/popular');
            return res.popularSearches || [];
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

// ============================================
// USERS (ADMIN)
// ============================================

export const useAllUsers = () => {
    return useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.users || [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserStats = () => {
    return useQuery({
        queryKey: ['admin', 'user-stats'],
        queryFn: async () => {
            const res = await api.get('/users/stats');
            return res.stats || {};
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }) => {
            await api.put(`/users/${userId}/role`, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

export const useUpdateUserSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, planName }) => {
            await api.put(`/users/${userId}/subscription`, { planName });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

// ============================================
// ADMIN DASHBOARD
// ============================================

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['admin', 'dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res;
        },
        staleTime: 5 * 1000, // 5 seconds
    });
};

export const useRevenueChart = (period = '30d') => {
    return useQuery({
        queryKey: ['admin', 'revenue-chart', period],
        queryFn: async () => {
            const res = await api.get(`/dashboard/revenue?period=${period}`);
            return res;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useTopProducts = () => {
    return useQuery({
        queryKey: ['admin', 'top-products'],
        queryFn: async () => {
            const res = await api.get('/dashboard/top-products');
            return res;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserGrowth = () => {
    return useQuery({
        queryKey: ['admin', 'user-growth'],
        queryFn: async () => {
            const res = await api.get('/dashboard/user-growth');
            return res;
        },
        staleTime: 5 * 1000,
    });
};

// ============================================
// COUPONS
// ============================================

export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: async ({ code, orderTotal }) => {
            const res = await api.post('/coupons/validate', { code, orderTotal });
            return res;
        },
    });
};

// ============================================
// CLOUDFLARE R2 UPLOADS
// ============================================

export const useUploadToR2 = () => {
    return useMutation({
        mutationFn: async ({ file, onProgress, signal }) => {
            const { uploadFile } = await import('../services/r2UploadService');
            return await uploadFile(file, onProgress, signal);
        },
    });
};

export const useSignedUrl = (key) => {
    return useQuery({
        queryKey: ['signed-url', key],
        queryFn: async () => {
            const { getSignedUrl } = await import('../services/r2UploadService');
            const data = await getSignedUrl(key);
            return data.url;
        },
        enabled: !!key,
        staleTime: 50 * 60 * 1000, // 50 minutes (URLs expire in 60)
        cacheTime: 55 * 60 * 1000, // Keep in cache for 55 minutes
    });
};

export const useDeleteR2File = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (key) => {
            const { deleteFile } = await import('../services/r2UploadService');
            return await deleteFile(key);
        },
        onSuccess: () => {
            // Invalidate signed URLs cache
            queryClient.invalidateQueries({ queryKey: ['signed-url'] });
        },
    });
};

// ============================================
// UTILITY HOOKS
// ============================================

export const usePrefetchProduct = () => {
    const queryClient = useQueryClient();

    return (productId) => {
        queryClient.prefetchQuery({
            queryKey: ['product', productId],
            queryFn: async () => {
                const res = await api.get(`/products/${productId}`);
                return res.product || res;
            },
        });
    };
};

// ============================================
// COMPONENTS (Dynamic Component Library)
// ============================================

// Get component categories
export const useComponentCategories = () => {

    return useQuery({
        queryKey: ['componentCategories'],
        queryFn: getComponentCategories,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

// Get components with filters
export const useComponents = (filters = {}) => {
    return useQuery({
        queryKey: ['components', filters],
        queryFn: () => getComponents(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Track component copy
export const useTrackComponentCopy = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: trackComponentCopy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
        }
    });
};

// ============================================
// TEMPLATES
// ============================================

export const useTemplateCategories = () => {
    return useQuery({
        queryKey: ['templateCategories'],
        queryFn: getTemplateCategories,
        staleTime: 30 * 60 * 1000,
    });
};

export const useTemplates = (filters = {}) => {
    return useQuery({
        queryKey: ['templates', filters],
        queryFn: () => getTemplates(filters),
        staleTime: 10 * 60 * 1000,
    });
};

export const useTrackTemplateDownload = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: trackTemplateDownload,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        }
    });
};

// ============================================
// DOCUMENTATION (Dynamic System)
// ============================================

export const useDocumentationCategories = () => {
    return useQuery({
        queryKey: ['documentationCategories'],
        queryFn: getDocCategories,
        staleTime: 30 * 60 * 1000,
    });
};

export const useDocumentation = (filters = {}) => {
    return useQuery({
        queryKey: ['documentation', filters],
        queryFn: () => getDocs(filters),
        staleTime: 10 * 60 * 1000,
    });
};

export const useTrackDocumentationLike = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: trackDocLike,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documentation'] });
        }
    });
};

// ============================================
// API TOOLS
// ============================================

export const useToolCategories = () => {
    return useQuery({
        queryKey: ['toolCategories'],
        queryFn: getToolCategories,
        staleTime: 30 * 60 * 1000,
    });
};

export const useTools = (filters = {}) => {
    return useQuery({
        queryKey: ['tools', filters],
        queryFn: () => getTools(filters),
        staleTime: 10 * 60 * 1000,
    });
};

export const useTrackAPICall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: trackAPICall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
        }
    });
};

// ============================================
// MOBILE APPS
// ============================================

export const useAppCategories = () => {
    return useQuery({
        queryKey: ['appCategories'],
        queryFn: getAppCategories,
        staleTime: 30 * 60 * 1000,
    });
};

export const useApps = (filters = {}) => {
    return useQuery({
        queryKey: ['apps', filters],
        queryFn: () => getApps(filters),
        staleTime: 10 * 60 * 1000,
    });
};

export const useTrackAppDownload = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: trackAppDownload,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apps'] });
        }
    });
};
