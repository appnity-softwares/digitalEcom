import { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch wishlist from API when user logs in
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            // Load from localStorage for guests
            const storedWishlist = localStorage.getItem('wishlistItems');
            if (storedWishlist) {
                setWishlistItems(JSON.parse(storedWishlist));
            }
        }
    }, [user]);

    // Sync to localStorage for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems, user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await api.get('/wishlist');
            const items = res.data?.wishlist?.items || res.data?.items || [];
            // Map to product format
            const products = items.map(item => ({
                id: item.product?.id || item.premiumDoc?.id,
                _id: item.product?.id || item.premiumDoc?.id,
                title: item.product?.title || item.premiumDoc?.title,
                price: item.product?.price || item.premiumDoc?.price,
                image: item.product?.image || item.premiumDoc?.coverImage,
                category: item.product?.category || item.premiumDoc?.category,
                type: item.productId ? 'product' : 'doc',
                wishlistItemId: item.id
            }));
            setWishlistItems(products);
        } catch (err) {
            console.log('Wishlist fetch error:', err);
            // Fallback to localStorage
            const stored = localStorage.getItem('wishlistItems');
            if (stored) setWishlistItems(JSON.parse(stored));
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product) => {
        const productId = product._id || product.id;
        const existItem = wishlistItems.find((x) => (x._id || x.id) === productId);
        if (existItem) return;

        // Optimistic update
        setWishlistItems([...wishlistItems, product]);

        if (user) {
            try {
                await api.post('/wishlist', {
                    productId: product.type === 'doc' ? null : productId,
                    premiumDocId: product.type === 'doc' ? productId : null
                });
            } catch (err) {
                console.log('Add to wishlist error:', err);
                // Revert on error
                setWishlistItems(wishlistItems.filter(x => (x._id || x.id) !== productId));
            }
        }
    };

    const removeFromWishlist = async (id) => {
        const item = wishlistItems.find(x => (x._id || x.id) === id);

        // Optimistic update
        setWishlistItems(wishlistItems.filter((x) => (x._id || x.id) !== id));

        if (user && item?.wishlistItemId) {
            try {
                await api.delete(`/wishlist/${item.wishlistItemId}`);
            } catch (err) {
                console.log('Remove from wishlist error:', err);
                // Revert on error
                setWishlistItems([...wishlistItems, item]);
            }
        } else if (user) {
            // Remove by product ID
            try {
                await api.delete(`/wishlist/product/${id}`);
            } catch (err) {
                console.log('Remove from wishlist error:', err);
            }
        }
    };

    const isInWishlist = (id) => {
        return wishlistItems.some((x) => (x._id || x.id) === id);
    };

    const clearWishlist = async () => {
        setWishlistItems([]);
        if (user) {
            try {
                await api.delete('/wishlist/clear');
            } catch (err) {
                console.log('Clear wishlist error:', err);
            }
        }
        localStorage.removeItem('wishlistItems');
    };

    // Sync guest wishlist to server after login
    const syncGuestWishlist = async () => {
        const storedWishlist = localStorage.getItem('wishlistItems');
        if (storedWishlist) {
            const items = JSON.parse(storedWishlist);
            for (const item of items) {
                await addToWishlist(item);
            }
            localStorage.removeItem('wishlistItems');
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
            loading,
            syncGuestWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
