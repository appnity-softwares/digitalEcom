const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return null;
};

const transporter = createTransporter();

// Send email function
const sendEmail = async ({ to, subject, html }) => {
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"CodeStudio" <${process.env.SMTP_USER || 'noreply@codestudio.dev'}>`,
                to,
                subject,
                html,
            });
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Email send error:', error);
            throw error;
        }
    } else {
        console.log('\n========== EMAIL (DEV MODE) ==========');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('========================================\n');
        return { messageId: 'dev-mode' };
    }
};

// Email templates
const emailTemplates = {
    passwordReset: (resetUrl) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 24px; font-weight: bold; color: #0055FF; margin-bottom: 30px; }
                h1 { font-size: 28px; margin: 0 0 20px; color: #1a1a1a; }
                .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0055FF 0%, #7C3AED 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="logo">CodeStudio</div>
                    <h1>Reset Your Password</h1>
                    <p>You requested to reset your password for your CodeStudio account.</p>
                    <p>Click the button below to set a new password:</p>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} CodeStudio - Developer Marketplace</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,

    welcomeEmail: (name) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 24px; font-weight: bold; color: #0055FF; margin-bottom: 30px; }
                h1 { font-size: 28px; margin: 0 0 20px; color: #1a1a1a; }
                .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0055FF 0%, #7C3AED 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
                .feature { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
                .feature:last-child { border-bottom: none; }
                .feature-icon { width: 40px; height: 40px; background: #f0f5ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="logo">CodeStudio</div>
                    <h1>Welcome, ${name}! 🎉</h1>
                    <p>Thanks for joining CodeStudio - the marketplace for developers.</p>
                    <p>Here's what you can do:</p>
                    <div style="margin: 20px 0;">
                        <div class="feature"><div class="feature-icon">📦</div><div>Browse premium templates and UI kits</div></div>
                        <div class="feature"><div class="feature-icon">📚</div><div>Access developer documentation</div></div>
                        <div class="feature"><div class="feature-icon">🔧</div><div>Use our SaaS APIs</div></div>
                        <div class="feature"><div class="feature-icon">👥</div><div>Join the developer community</div></div>
                    </div>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/templates" class="button">Explore Templates</a>
                </div>
            </div>
        </body>
        </html>
    `,

    orderConfirmation: (order) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 24px; font-weight: bold; color: #0055FF; margin-bottom: 30px; }
                h1 { font-size: 28px; margin: 0 0 10px; color: #1a1a1a; }
                .order-id { color: #666; font-size: 14px; margin-bottom: 30px; }
                .item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
                .item-title { font-weight: 500; }
                .item-price { color: #666; }
                .total { display: flex; justify-content: space-between; padding: 20px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #1a1a1a; margin-top: 10px; }
                .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0055FF 0%, #7C3AED 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
                .license { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; font-family: monospace; font-size: 14px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
                .success-badge { display: inline-block; padding: 8px 16px; background: #dcfce7; color: #166534; border-radius: 20px; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="logo">CodeStudio</div>
                    <span class="success-badge">✓ Payment Successful</span>
                    <h1>Order Confirmed!</h1>
                    <p class="order-id">Order #${order.id?.substring(0, 8) || 'N/A'}</p>
                    
                    <p>Hi ${order.user?.name || 'there'},</p>
                    <p>Thank you for your purchase! Here's your order summary:</p>
                    
                    <div style="margin: 30px 0;">
                        ${order.items?.map(item => `
                            <div class="item">
                                <div>
                                    <div class="item-title">${item.title}</div>
                                    <div style="font-size: 12px; color: #888;">${item.licenseType || 'Personal'} License</div>
                                </div>
                                <div class="item-price">$${item.price}</div>
                            </div>
                        `).join('') || ''}
                        
                        <div class="total">
                            <span>Total</span>
                            <span>$${order.totalPrice}</span>
                        </div>
                    </div>
                    
                    ${order.items?.some(item => item.licenseKey) ? `
                        <div style="margin: 30px 0;">
                            <p style="font-weight: 600; margin-bottom: 10px;">Your License Keys:</p>
                            ${order.items.filter(item => item.licenseKey).map(item => `
                                <div class="license">
                                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${item.title}</div>
                                    <div>${item.licenseKey}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">Download Your Files</a>
                    
                    <p style="color: #666; font-size: 14px;">Your download links will be available for 7 days.</p>
                    
                    <div class="footer">
                        <p>Need help? Reply to this email or visit our support center.</p>
                        <p>© ${new Date().getFullYear()} CodeStudio - Developer Marketplace</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,

    subscriptionConfirmation: (subscription) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 24px; font-weight: bold; color: #0055FF; margin-bottom: 30px; }
                h1 { font-size: 28px; margin: 0 0 20px; color: #1a1a1a; }
                .plan-badge { display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); color: white; border-radius: 20px; font-weight: bold; margin: 10px 0 30px; }
                .feature { padding: 10px 0; padding-left: 30px; position: relative; }
                .feature:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
                .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0055FF 0%, #7C3AED 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="logo">CodeStudio</div>
                    <h1>Welcome to ${subscription.planName} Plan! 🚀</h1>
                    <div class="plan-badge">${subscription.planName}</div>
                    
                    <p>Your subscription is now active. Here's what you get:</p>
                    
                    <div style="margin: 20px 0;">
                        ${subscription.features?.map(f => `<div class="feature">${f}</div>`).join('') || ''}
                    </div>
                    
                    <p style="color: #666;">
                        <strong>Billing cycle:</strong> ${subscription.billingCycle}<br>
                        <strong>Next billing date:</strong> ${new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">Go to Dashboard</a>
                </div>
            </div>
        </body>
        </html>
    `,

    subscriptionReminder: (subscription, daysLeft) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 24px; font-weight: bold; color: #0055FF; margin-bottom: 30px; }
                .warning { background: #fef3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; }
                .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0055FF 0%, #7C3AED 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="logo">CodeStudio</div>
                    <h1>Subscription Renewal Reminder ⏰</h1>
                    
                    <div class="warning">
                        <strong>Heads up!</strong> Your ${subscription.planName} subscription will renew in <strong>${daysLeft} days</strong>.
                    </div>
                    
                    <p>Your subscription will automatically renew on <strong>${new Date(subscription.endDate).toLocaleDateString()}</strong>.</p>
                    
                    <p>If you wish to cancel or modify your subscription, please do so before the renewal date to avoid charges.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/subscription" class="button">Manage Subscription</a>
                </div>
            </div>
        </body>
        </html>
    `,

    refundConfirmation: (order, refundAmount) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 24px; font-weight: bold; color: #0055FF; margin-bottom: 30px; }
                .success { background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="logo">CodeStudio</div>
                    <h1>Refund Processed ✓</h1>
                    
                    <div class="success">
                        Your refund of <strong>$${refundAmount}</strong> has been processed successfully.
                    </div>
                    
                    <p><strong>Order ID:</strong> ${order.id?.substring(0, 8)}</p>
                    <p>The amount will be credited to your original payment method within 5-7 business days.</p>
                    
                    <p style="color: #666; font-size: 14px;">If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
    `
};

module.exports = {
    sendEmail,
    emailTemplates
};
