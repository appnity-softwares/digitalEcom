import React, { createContext, useState, useEffect, useContext } from 'react';

const RecentlyViewedContext = createContext();

const MAX_RECENTLY_VIEWED = 10;
const STORAGE_KEY = 'recentlyViewed';

export const RecentlyViewedProvider = ({ children }) => {
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRecentlyViewed(JSON.parse(stored));
            } catch (e) {
                console.error('Error parsing recently viewed:', e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (recentlyViewed.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
        }
    }, [recentlyViewed]);

    const addToRecentlyViewed = (product) => {
        if (!product || !product.id) return;

        setRecentlyViewed(prev => {
            // Remove if already exists
            const filtered = prev.filter(p => p.id !== product.id);

            // Add to beginning
            const updated = [
                {
                    id: product.id || product._id,
                    title: product.title || product.name,
                    price: product.price,
                    image: product.image || product.coverImage,
                    category: product.category,
                    type: product.type || 'product',
                    viewedAt: new Date().toISOString()
                },
                ...filtered
            ];

            // Limit to max items
            return updated.slice(0, MAX_RECENTLY_VIEWED);
        });
    };

    const clearRecentlyViewed = () => {
        setRecentlyViewed([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const getRecentlyViewedByType = (type) => {
        return recentlyViewed.filter(item => item.type === type);
    };

    return (
        <RecentlyViewedContext.Provider value={{
            recentlyViewed,
            addToRecentlyViewed,
            clearRecentlyViewed,
            getRecentlyViewedByType
        }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
};

export const useRecentlyViewed = () => {
    const context = useContext(RecentlyViewedContext);
    if (!context) {
        throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
    }
    return context;
};

export default RecentlyViewedContext;
