import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Trash2, ArrowRight, Package, CreditCard } from 'lucide-react';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { success, error } = useToast();

    const total = cartItems.reduce((acc, item) => {
        const price = Number(item.price.replace(/[^0-9.-]+/g, ""));
        return acc + price;
    }, 0);

    const checkoutHandler = async () => {
        if (!user) {
            navigate('/login?redirect=cart');
        } else {
            const orderItems = cartItems.map(item => ({
                product: item._id || item.id,
                title: item.title,
                image: item.image,
                price: item.price,
                qty: 1
            }));

            try {
                await orderService.create({
                    orderItems,
                    paymentMethod: 'Credit Card',
                    totalPrice: total
                });

                success('Order placed successfully! 🎉');
                clearCart();
                navigate('/profile');
            } catch (err) {
                console.error(err);
                error('Order failed. Please try again.');
            }
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-3">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-8">Looks like you haven't added any templates yet.</p>
                    <Link
                        to="/templates"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                    >
                        Browse Templates <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-6 py-24">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-10"
                >
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground">Your Cart</h1>
                    <span className="ml-auto text-muted-foreground">{cartItems.length} items</span>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Items List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex-grow flex flex-col gap-4"
                    >
                        <AnimatePresence>
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item._id || item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card-hover p-5 rounded-2xl flex items-center gap-6 group"
                                >
                                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary/30 shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-lg font-bold text-foreground truncate">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Package className="w-3 h-3" />
                                            {item.category}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xl font-bold text-primary">{item.price}</span>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id || item.id)}
                                        className="p-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all shrink-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full lg:w-[380px] shrink-0"
                    >
                        <div className="glass-card rounded-3xl p-8 sticky top-24">
                            <h2 className="text-2xl font-display font-bold text-foreground mb-8">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold text-foreground">${total}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-semibold text-foreground">$0</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="text-green-500 font-medium">-$0</span>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 mb-6" />

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xl font-bold text-foreground">Total</span>
                                <span className="text-3xl font-display font-bold text-primary">${total}</span>
                            </div>

                            <button
                                onClick={checkoutHandler}
                                className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
                            >
                                <CreditCard className="w-5 h-5" />
                                Proceed to Checkout
                            </button>

                            <p className="text-xs text-muted-foreground text-center mt-4">
                                Secure checkout powered by Stripe
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
