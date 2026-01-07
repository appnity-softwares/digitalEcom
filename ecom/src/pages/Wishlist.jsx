import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WishlistContext from '../context/WishlistContext';
import CartContext from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Heart, ShoppingCart, X, ArrowRight, Sparkles } from 'lucide-react';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const { success } = useToast();

    const handleAddToCart = (item) => {
        addToCart(item);
        success(`${item.title} added to cart!`);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-3">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-8">Save items you love to revisit later.</p>
                    <Link
                        to="/templates"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                    >
                        Explore Templates <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-6 py-24">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-10"
                >
                    <div className="p-3 bg-pink-500/10 rounded-xl">
                        <Heart className="w-6 h-6 text-pink-500" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground">Your Wishlist</h1>
                    <span className="ml-auto text-muted-foreground">{wishlistItems.length} items saved</span>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {wishlistItems.map((item, index) => (
                            <motion.div
                                key={item._id || item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card-hover rounded-2xl overflow-hidden group relative"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromWishlist(item._id || item.id)}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    title="Remove from wishlist"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <Link to={`/templates/${item._id || item.id}`} className="block">
                                    {/* Image */}
                                    <div className="aspect-[4/3] overflow-hidden bg-secondary/30">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    {item.category || 'Template'}
                                                </p>
                                            </div>
                                            <span className="text-xl font-bold text-primary shrink-0">{item.price}</span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Add to Cart Button */}
                                <div className="px-5 pb-5">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] border border-gray-200 dark:border-white/5"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
