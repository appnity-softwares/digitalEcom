import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const RazorpayButton = ({
    amount,
    orderId,
    type = 'product',
    onSuccess,
    onError,
    buttonText = 'Pay Now',
    disabled = false,
    className = ''
}) => {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Create order on backend
            const endpoint = type === 'subscription'
                ? '/razorpay/subscription'
                : '/razorpay/create-order';

            const { data } = await api.post(endpoint, {
                amount,
                orderId,
                type
            });

            // Load Razorpay script if not loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }

            // Razorpay options
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'CodeStudio',
                description: type === 'subscription'
                    ? `${data.planId} Plan - ${data.billingCycle}`
                    : 'Template Purchase',
                order_id: data.orderId,
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyEndpoint = type === 'subscription'
                            ? '/razorpay/verify-subscription'
                            : '/razorpay/verify';

                        const verifyRes = await api.post(verifyEndpoint, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId,
                            planId: data.planId,
                            billingCycle: data.billingCycle
                        });

                        showToast('Payment successful!', 'success');
                        onSuccess?.(verifyRes.data);
                    } catch (err) {
                        showToast('Payment verification failed', 'error');
                        onError?.(err);
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#0055FF'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                showToast(response.error.description || 'Payment failed', 'error');
                onError?.(response.error);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error('Payment error:', err);
            showToast(err.response?.data?.message || 'Failed to initiate payment', 'error');
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={disabled || loading}
            className={`btn-primary flex items-center justify-center gap-2 ${className}`}
        >
            {loading ? (
                <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <CreditCard className="w-4 h-4" />
                    {buttonText}
                </>
            )}
        </button>
    );
};

export default RazorpayButton;
