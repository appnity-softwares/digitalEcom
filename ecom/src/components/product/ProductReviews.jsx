import React, { useState, useEffect, useContext } from 'react';
import { Star, ThumbsUp, User, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const ProductReviews = ({ productId, productType = 'product' }) => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const endpoint = productType === 'doc'
                ? `/reviews/doc/${productId}`
                : `/reviews/product/${productId}`;
            const res = await api.get(endpoint);
            setReviews(res.data.reviews || []);

            // Calculate average
            if (res.data.reviews?.length > 0) {
                const avg = res.data.reviews.reduce((sum, r) => sum + r.rating, 0) / res.data.reviews.length;
                setAverageRating(avg);
            }
        } catch (err) {
            console.log('Reviews not available');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Please login to submit a review', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/reviews', {
                productId: productType === 'product' ? productId : null,
                docId: productType === 'doc' ? productId : null,
                rating: newReview.rating,
                title: newReview.title,
                comment: newReview.comment
            });

            setReviews([res.data.review, ...reviews]);
            setNewReview({ rating: 5, title: '', comment: '' });
            setShowForm(false);
            showToast('Review submitted!', 'success');

            // Recalculate average
            const newAvg = [...reviews, res.data.review].reduce((sum, r) => sum + r.rating, 0) / (reviews.length + 1);
            setAverageRating(newAvg);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        if (!user) {
            showToast('Please login', 'error');
            return;
        }
        try {
            await api.post(`/reviews/${reviewId}/helpful`);
            setReviews(reviews.map(r =>
                r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
            ));
        } catch (err) {
            console.log('Helpful error');
        }
    };

    const StarRating = ({ rating, editable = false, onRatingChange }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={!editable}
                    onClick={() => editable && onRatingChange?.(star)}
                    className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <Star
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                </button>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <StarRating rating={Math.round(averageRating)} />
                        <span className="text-gray-600">
                            {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
                        </span>
                    </div>
                </div>

                {user && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-[#0055FF] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                    >
                        <h4 className="text-lg font-bold mb-4">Write Your Review</h4>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <StarRating
                                rating={newReview.rating}
                                editable
                                onRatingChange={(r) => setNewReview({ ...newReview, rating: r })}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={newReview.title}
                                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                placeholder="Summarize your experience"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Share your thoughts about this product..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-3 bg-[#0055FF] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Submit Review
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No reviews yet</p>
                    <p className="text-gray-500 text-sm">Be the first to review this product!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        {review.user?.avatar ? (
                                            <img src={review.user.avatar} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>

                            {review.title && (
                                <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                            )}
                            <p className="text-gray-600 mb-4">{review.comment}</p>

                            <button
                                onClick={() => handleHelpful(review.id)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpfulCount || 0})
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
