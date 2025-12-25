import api from './api';

export const createOrder = async (amount, items, couponCode = null, discount = 0) => {
    const response = await api.post('/payment/create-order', {
        amount,
        receipt: `order_${Date.now()}`,
        notes: {
            items_count: items.length,
            coupon: couponCode
        }
    });
    return response.data;
};

export const verifyPayment = async (paymentData, orderData) => {
    const response = await api.post('/payment/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        order_data: orderData
    });
    return response.data;
};

export const createSubscriptionOrder = async (planName, billingCycle) => {
    const response = await api.post('/payment/subscription', {
        plan_name: planName,
        billing_cycle: billingCycle
    });
    return response.data;
};

export const verifySubscriptionPayment = async (paymentData, planName, billingCycle) => {
    const response = await api.post('/payment/subscription/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        plan_name: planName,
        billing_cycle: billingCycle
    });
    return response.data;
};

// Load Razorpay script
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Initialize Razorpay checkout
export const initializeRazorpay = async ({
    orderId,
    amount,
    keyId,
    currency = 'INR',
    name = 'CodeStudio',
    description = 'Purchase',
    prefill = {},
    onSuccess,
    onError
}) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        throw new Error('Failed to load Razorpay');
    }

    const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: name,
        description: description,
        order_id: orderId,
        prefill: {
            name: prefill.name || '',
            email: prefill.email || '',
            contact: prefill.phone || ''
        },
        theme: {
            color: '#0055FF'
        },
        handler: function (response) {
            onSuccess(response);
        },
        modal: {
            ondismiss: function () {
                onError(new Error('Payment cancelled'));
            }
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
};
