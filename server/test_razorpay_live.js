const Razorpay = require('razorpay');
require('dotenv').config();

console.log('Testing Razorpay Connection...');
console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
// Mask secret for safety in logs
console.log('Key Secret:', process.env.RAZORPAY_KEY_SECRET ? '****' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'MISSING');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('ERROR: Credentials missing in .env');
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const options = {
    amount: 50000, // 500 INR
    currency: 'INR',
    receipt: 'receipt_test_1',
    payment_capture: 1
};

async function test() {
    try {
        const order = await razorpay.orders.create(options);
        console.log('SUCCESS: Order created');
        console.log('Order ID:', order.id);
        console.log('Order Details:', order);
    } catch (error) {
        console.error('FAILURE: Razorpay Error');
        console.error(error);
    }
}

test();
