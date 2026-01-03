import nodemailer from 'nodemailer';

// Create email transporter - FIXED: createTransport (not createTransporter)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Order confirmation email
export const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 15px; }
            .status { display: inline-block; padding: 5px 15px; background: #10B981; color: white; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your purchase</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>Your order has been confirmed and is being processed.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status">${order.status}</span></p>
                
                <h4>Items Ordered:</h4>
                ${order.items.map(item => `
                  <div class="item">
                    <span>${item.name} (Qty: ${item.quantity})</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
                
                <div class="total">
                  Total: $${order.total.toFixed(2)}
                </div>
              </div>
              
              <p>We'll notify you when your order ships.</p>
              <p>Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Order status update email
export const sendOrderStatusUpdateEmail = async (order, user, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      shipped: 'Your order has been shipped! Track your package below.',
      delivered: 'Your order has been delivered! We hope you enjoy your purchase.',
      cancelled: 'Your order has been cancelled as requested.'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .status-update { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
            .old-status { color: #6B7280; text-decoration: line-through; }
            .new-status { color: #10B981; font-weight: bold; font-size: 18px; }
            .order-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Status Updated</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              
              <div class="status-update">
                <p>Your order status has been updated:</p>
                <p>
                  <span class="old-status">${oldStatus}</span> 
                  → 
                  <span class="new-status">${newStatus}</span>
                </p>
                <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
              </div>
              
              <div class="order-info">
                <h3>Order Information</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Items:</strong> ${order.items.length} item(s)</p>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              <p>Thank you for choosing us!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

// Test email function
export const sendTestEmail = async (toEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Test Email from E-commerce App',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your e-commerce application.</p>
        <p>If you received this, your email configuration is working correctly!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Test email sent to ${toEmail}`);
    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};