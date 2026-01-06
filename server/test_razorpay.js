require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function testOrder() {
    console.log('Testing Razorpay Order Creation...');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID);

    try {
        const order = await razorpay.orders.create({
            amount: 50000,
            currency: 'INR',
            receipt: 'test_receipt_1',
            notes: { type: 'test' }
        });
        console.log('Success! Order ID:', order.id);
    } catch (error) {
        console.error('FAILED:', error);
    }
}

testOrder();

