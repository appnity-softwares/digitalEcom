import api from './api';

export const getMySubscription = async () => {
    try {
        const response = await api.get('/subscriptions/me');
        return response.data.subscription || response.data || null;
    } catch (error) {
        console.error('Failed to fetch subscription:', error);
        return null;
    }
};

export const getPlans = async () => {
    try {
        const response = await api.get('/subscriptions/plans');
        const data = response.data;
        return Array.isArray(data) ? data : (data.plans || []);
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        return [];
    }
};

export const cancelSubscription = async () => {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
};
