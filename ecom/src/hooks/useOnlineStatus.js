import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect online/offline status
 * @returns {object} { isOnline, isOffline, wasOffline }
 */
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Keep wasOffline true for a bit to show "Back online" message
            setTimeout(() => setWasOffline(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
        wasOffline
    };
};

/**
 * Hook for optimistic updates
 * @param {Function} apiCall - The async API call function
 * @param {Object} options - { onSuccess, onError, rollbackOnError }
 */
export const useOptimisticUpdate = (initialData = null) => {
    const [data, setData] = useState(initialData);
    const [previousData, setPreviousData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const optimisticUpdate = useCallback(async (newData, apiCall) => {
        // Store previous data for rollback
        setPreviousData(data);
        // Optimistically update the UI immediately
        setData(newData);
        setError(null);
        setIsLoading(true);

        try {
            // Make the actual API call
            const result = await apiCall();
            // Update with server response if different
            if (result) {
                setData(result);
            }
            return { success: true, data: result };
        } catch (err) {
            // Rollback on error
            setData(previousData);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [data, previousData]);

    const rollback = useCallback(() => {
        if (previousData !== null) {
            setData(previousData);
            setPreviousData(null);
        }
    }, [previousData]);

    return {
        data,
        setData,
        isLoading,
        error,
        optimisticUpdate,
        rollback
    };
};

/**
 * Hook for optimistic list operations (add, update, remove)
 */
export const useOptimisticList = (initialItems = []) => {
    const [items, setItems] = useState(initialItems);
    const [pendingChanges, setPendingChanges] = useState([]);

    const optimisticAdd = useCallback(async (newItem, apiCall) => {
        const tempId = `temp_${Date.now()}`;
        const itemWithTempId = { ...newItem, id: tempId, _pending: true };

        // Add item immediately
        setItems(prev => [...prev, itemWithTempId]);
        setPendingChanges(prev => [...prev, tempId]);

        try {
            const result = await apiCall();
            // Replace temp item with real item
            setItems(prev => prev.map(item =>
                item.id === tempId ? { ...result, _pending: false } : item
            ));
            setPendingChanges(prev => prev.filter(id => id !== tempId));
            return { success: true, data: result };
        } catch (error) {
            // Remove temp item on error
            setItems(prev => prev.filter(item => item.id !== tempId));
            setPendingChanges(prev => prev.filter(id => id !== tempId));
            return { success: false, error: error.message };
        }
    }, []);

    const optimisticUpdate = useCallback(async (itemId, updates, apiCall) => {
        const originalItems = [...items];

        // Update immediately
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, ...updates, _pending: true } : item
        ));
        setPendingChanges(prev => [...prev, itemId]);

        try {
            const result = await apiCall();
            setItems(prev => prev.map(item =>
                item.id === itemId ? { ...result, _pending: false } : item
            ));
            setPendingChanges(prev => prev.filter(id => id !== itemId));
            return { success: true, data: result };
        } catch (error) {
            // Rollback
            setItems(originalItems);
            setPendingChanges(prev => prev.filter(id => id !== itemId));
            return { success: false, error: error.message };
        }
    }, [items]);

    const optimisticRemove = useCallback(async (itemId, apiCall) => {
        const originalItems = [...items];

        // Remove immediately
        setItems(prev => prev.filter(item => item.id !== itemId));
        setPendingChanges(prev => [...prev, itemId]);

        try {
            await apiCall();
            setPendingChanges(prev => prev.filter(id => id !== itemId));
            return { success: true };
        } catch (error) {
            // Rollback - add item back
            setItems(originalItems);
            setPendingChanges(prev => prev.filter(id => id !== itemId));
            return { success: false, error: error.message };
        }
    }, [items]);

    return {
        items,
        setItems,
        pendingChanges,
        hasPendingChanges: pendingChanges.length > 0,
        optimisticAdd,
        optimisticUpdate,
        optimisticRemove
    };
};

export default useOnlineStatus;
