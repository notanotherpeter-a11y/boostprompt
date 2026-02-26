/**
 * IMMEDIATE PAYMENT LINKS FIX
 * Uses Stripe Payment Links - works without dashboard settings
 */

console.log('🔗 Payment Links system loading...');

// Direct Stripe Payment Links (work immediately)
const PAYMENT_LINKS = {
    product1: 'https://buy.stripe.com/14AaEWgvp0NT2un3HObV600', // $19
    product2: 'https://buy.stripe.com/aFa4gy1AveEJ1qj7Y4bV601'  // $39
};

// Simple redirect function
function paymentLinkCheckout(productKey, productName) {
    try {
        // Track purchase intent
        if (typeof fbq !== 'undefined') {
            fbq('track', 'InitiateCheckout', { 
                content_name: productName,
                currency: 'USD' 
            });
        }
        
        // Show loading
        const button = event ? event.target : null;
        if (button) {
            button.textContent = '🔄 Opening Stripe...';
            button.disabled = true;
        }
        
        // Get payment link
        const paymentLink = PAYMENT_LINKS[productKey];
        
        if (paymentLink) {
            console.log('✅ Redirecting to Stripe Payment Link');
            window.location.href = paymentLink;
        } else {
            throw new Error('Payment link not found');
        }
        
    } catch (error) {
        console.error('❌ Payment failed:', error);
        alert('Payment temporarily unavailable. Please contact support.');
        
        // Reset button
        if (button) {
            button.textContent = button.dataset.originalText || 'Buy Now';
            button.disabled = false;
        }
    }
}

// Override main functions with payment links
window.paymentLinkBuy19 = () => paymentLinkCheckout('product1', '50 AI Prompts Pack ($19)');
window.paymentLinkBuy39 = () => paymentLinkCheckout('product2', 'AI Starter Bundle ($39)');

// Auto-activate if main payment system fails
setTimeout(() => {
    if (typeof buyAIPromptsPack === 'undefined' || typeof stripe === 'undefined') {
        console.log('🚨 Main payment system unavailable, activating Payment Links');
        window.buyAIPromptsPack = window.paymentLinkBuy19;
        window.buyAIStarterBundle = window.paymentLinkBuy39;
    }
}, 3000);

console.log('✅ Payment Links system ready');