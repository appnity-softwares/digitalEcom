import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Trash2, X } from 'lucide-react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';

const RecentlyViewed = ({ maxItems = 6, showClear = true }) => {
    const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    if (recentlyViewed.length === 0) {
        return null;
    }

    const displayItems = recentlyViewed.slice(0, maxItems);

    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Recently Viewed
                        </h2>
                    </div>

                    {showClear && (
                        <button
                            onClick={clearRecentlyViewed}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {displayItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={item.type === 'doc' ? `/docs/${item.id}` : `/templates/${item.id}`}
                                className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/300x200'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                        ${item.price}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {recentlyViewed.length > maxItems && (
                    <div className="text-center mt-6">
                        <Link
                            to="/recently-viewed"
                            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all"
                        >
                            View All ({recentlyViewed.length})
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

// Compact version for product pages sidebar
export const RecentlyViewedCompact = ({ excludeId, maxItems = 4 }) => {
    const { recentlyViewed } = useRecentlyViewed();

    const items = recentlyViewed
        .filter(item => item.id !== excludeId)
        .slice(0, maxItems);

    if (items.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recently Viewed
            </h3>
            <div className="space-y-3">
                {items.map(item => (
                    <Link
                        key={item.id}
                        to={item.type === 'doc' ? `/docs/${item.id}` : `/templates/${item.id}`}
                        className="flex items-center gap-3 group"
                    >
                        <img
                            src={item.image || 'https://via.placeholder.com/60x40'}
                            alt={item.title}
                            className="w-12 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                {item.title}
                            </p>
                            <p className="text-xs text-gray-500">${item.price}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
