import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingCart, Heart, Star, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const ProductRecommendations = ({
    productId,
    category,
    type = 'product', // 'product' or 'doc'
    maxItems = 4,
    title = "You Might Also Like"
}) => {
    // Fetch recommendations from API or fallback to category-based
    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['recommendations', productId, category],
        queryFn: async () => {
            try {
                // Try to get smart recommendations first
                const res = await api.get(`/recommendations/${productId}`);
                if (res.data.recommendations?.length > 0) {
                    return res.data.recommendations;
                }
            } catch (err) {
                // Fallback to category-based recommendations
            }

            // Get products from same category
            const endpoint = type === 'doc' ? '/docs' : '/products';
            const res = await api.get(`${endpoint}?category=${category}&limit=10`);
            const products = res.data.products || res.data.docs || res.data || [];

            // Filter out current product and randomize
            return products
                .filter(p => (p.id || p._id) !== productId)
                .sort(() => Math.random() - 0.5)
                .slice(0, maxItems);
        },
        enabled: !!productId && !!category,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    if (isLoading) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    </div>

                    <Link
                        to={type === 'doc' ? '/docs' : '/templates'}
                        className="flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all"
                    >
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.slice(0, maxItems).map((item, index) => (
                        <motion.div
                            key={item.id || item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={type === 'doc' ? `/docs/${item.id || item._id}` : `/templates/${item.id || item._id}`}
                                className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={item.image || item.coverImage || 'https://via.placeholder.com/400x250'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>

                                    {item.rating && (
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.rating}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            ${item.price}
                                        </span>
                                        <span className="text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                                            View →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// "Customers Also Bought" - for checkout/cart pages
export const AlsoBought = ({ cartItems = [], maxItems = 4 }) => {
    const categories = [...new Set(cartItems.map(item => item.category).filter(Boolean))];
    const productIds = cartItems.map(item => item.id || item._id);

    const { data: recommendations } = useQuery({
        queryKey: ['also-bought', productIds.join(',')],
        queryFn: async () => {
            if (categories.length === 0) return [];

            // Get products from same categories
            const res = await api.get(`/products?category=${categories[0]}&limit=10`);
            const products = res.data.products || res.data || [];

            // Filter out items already in cart
            return products
                .filter(p => !productIds.includes(p.id || p._id))
                .sort(() => Math.random() - 0.5)
                .slice(0, maxItems);
        },
        enabled: cartItems.length > 0,
        staleTime: 10 * 60 * 1000,
    });

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Customers Also Bought
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
                {recommendations.map((item, index) => (
                    <motion.div
                        key={item.id || item._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            to={`/templates/${item.id || item._id}`}
                            className="group flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-all"
                        >
                            <img
                                src={item.image || 'https://via.placeholder.com/80x60'}
                                alt={item.title}
                                className="w-16 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600">
                                    {item.title}
                                </p>
                                <p className="font-bold text-gray-900 dark:text-white">${item.price}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

// Trending/Popular Products section
export const TrendingProducts = ({ maxItems = 8 }) => {
    const { data: products, isLoading } = useQuery({
        queryKey: ['trending-products'],
        queryFn: async () => {
            const res = await api.get('/products/trending?limit=' + maxItems);
            return res.data.products || res.data || [];
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });

    if (isLoading || !products?.length) {
        return null;
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Trending Now
                    </h2>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {products.map((item, index) => (
                        <Link
                            key={item.id || item._id}
                            to={`/templates/${item.id || item._id}`}
                            className="flex-shrink-0 w-48 group"
                        >
                            <div className="aspect-video rounded-xl overflow-hidden mb-2">
                                <img
                                    src={item.image || 'https://via.placeholder.com/200x120'}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600">
                                {item.title}
                            </h4>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">${item.price}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductRecommendations;
