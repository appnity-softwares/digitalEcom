import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { templates as allTemplates } from '../data/templates';
import WishlistContext from '../context/WishlistContext';
import CartContext from '../context/CartContext';
import StarRating from './ui/StarRating';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

const TemplateGrid = ({ items, limit }) => {
  let templates = items || allTemplates;
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { success } = useToast();

  if (limit) {
    templates = templates.slice(0, limit);
  }

  const handleWishlistClick = (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    const id = template._id || template.id;
    if (isInWishlist(id)) {
      removeFromWishlist(id);
      success('Removed from wishlist');
    } else {
      addToWishlist(template);
      success('Added to wishlist ❤️');
    }
  };

  const handleAddToCart = (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(template);
    success(`${template.title} added to cart!`);
  };

  return (
    <section className="w-full bg-background px-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <motion.div
              key={template._id || template.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/templates/${template._id || template.id}`} className="group flex flex-col h-full bg-white dark:bg-card/10 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-sm dark:shadow-none hover:shadow-2xl hover:shadow-primary/10">

                {/* Image Container */}
                <div className="w-full aspect-[4/3] bg-secondary/20 relative overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {template.isFree && (
                      <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/10">FREE</span>
                    )}
                    {template.isBestseller && !template.isFree && (
                      <span className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/10">BESTSELLER</span>
                    )}
                    {template.isNewProduct && !template.isBestseller && !template.isFree && (
                      <span className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/10">NEW</span>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/60 backdrop-blur-sm">
                    <button
                      onClick={(e) => handleAddToCart(e, template)}
                      className="p-3 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-lg"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(e, template)}
                      className={`p-3 rounded-full hover:scale-110 transition-transform shadow-lg ${isInWishlist(template._id || template.id) ? 'bg-red-500 text-white' : 'bg-background text-foreground'}`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(template._id || template.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4 flex-1">

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-medium text-primary mb-1 block uppercase tracking-wider">{template.category}</span>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {template.title}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-foreground">
                        {template.price}$
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    {template.rating > 0 && (
                      <StarRating rating={template.rating} numReviews={template.numReviews} size="sm" />
                    )}
                    <div className="text-xs text-muted-foreground font-medium">
                      {template.numSales > 0 ? `${template.numSales} sales` : 'New Release'}
                    </div>
                  </div>

                </div>

              </Link>
            </motion.div>
          ))}
        </div>

        {limit && (
          <div className="flex justify-center mt-8">
            <Link to="/templates" className="px-8 py-3 rounded-full border border-gray-200 dark:border-white/10 hover:bg-secondary/50 text-foreground font-medium transition-all flex items-center gap-2 group">
              View All Assets
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default TemplateGrid;