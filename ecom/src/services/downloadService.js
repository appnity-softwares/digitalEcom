import api from './api';

const downloadService = {
    // Get all user's purchased/downloaded items
    getMyDownloads: async () => {
        try {
            const response = await api.get('/orders/myorders');
            if (!response || !response.data) return [];

            // Extract all order items from orders
            const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);

            const downloads = [];
            orders.forEach(order => {
                if (order.isPaid && order.items) {
                    order.items.forEach(item => {
                        downloads.push({
                            id: item.id,
                            orderId: order.id,
                            title: item.title,
                            image: item.image,
                            price: item.price,
                            licenseType: item.licenseType,
                            licenseKey: item.licenseKey,
                            itemType: item.itemType,
                            productId: item.productId,
                            premiumDocId: item.premiumDocId,
                            purchasedAt: order.paidAt || order.createdAt,
                            downloadExpiry: order.downloadExpiry,
                        });
                    });
                }
            });

            return downloads;
        } catch (error) {
            console.error('Failed to fetch downloads:', error);
            return [];
        }
    },

    // Get signed download URL
    getDownloadUrl: async (productId) => {
        try {
            const response = await api.get(`/downloads/${productId}`);
            if (!response || !response.data) return null;
            return response.data;
        } catch (error) {
            console.error('Failed to get download URL:', error);
            throw error;
        }
    },

    // Check if user owns a product
    checkAccess: async (productId) => {
        try {
            const response = await api.get(`/downloads/check/${productId}`);
            return response.data?.hasAccess || false;
        } catch (error) {
            return false;
        }
    },

    // Check if user has subscription access
    checkSubscriptionAccess: async () => {
        try {
            const response = await api.get('/subscriptions/my');
            if (!response || !response.data) return { hasAccess: false };

            const sub = response.data.subscription || response.data;
            const isActive = sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date();

            return {
                hasAccess: isActive,
                plan: sub.planName,
                expiresAt: sub.endDate,
            };
        } catch (error) {
            return { hasAccess: false };
        }
    },
};

export default downloadService;
