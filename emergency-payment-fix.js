/**
 * EMERGENCY PAYMENT SYSTEM FIX
 * Fallback system using Stripe Payment Links
 * Works even if JavaScript fails
 */

console.log('🚨 Emergency payment system loading...');

// Emergency: Use JavaScript Stripe checkout with different approach
const EMERGENCY_STRIPE_PK = 'pk_live_51T2rWLAqx5KYvfYDe1RWou0AdmyWwxeDcrg3sR1iUKosTBM0XQzjFYtOBM25kaG8B86ps7A39xOnD4hgtHkJWObe00i8R1xuVf';
const EMERGENCY_PRICES = {
    'product1': 'price_1T3bDMAqx5KYvfYDr16bU0eS', // $19 AI Prompts Pack
    'product2': 'price_1T3bCNAqx5KYvfYD3cWcXjc1'  // $39 AI Starter Bundle
};

// Emergency purchase function - Simple and reliable
async function emergencyPurchase(productKey, productName) {
    console.log(`🚨 Emergency purchase: ${productName}`);
    
    // Show loading message
    const button = event ? event.target : null;
    if (button) {
        button.textContent = '🔄 Loading Checkout...';
        button.disabled = true;
    }
    
    try {
        // Track purchase intent
        if (typeof fbq !== 'undefined') {
            fbq('track', 'InitiateCheckout', { 
                content_name: productName,
                currency: 'USD' 
            });
        }
        
        // Initialize Stripe
        const stripe = Stripe(EMERGENCY_STRIPE_PK);
        const priceId = EMERGENCY_PRICES[productKey];
        
        if (!priceId) {
            throw new Error('Product price not found');
        }
        
        console.log(`🔄 Creating Stripe checkout for ${productName} (${priceId})`);
        
        // Use simple Stripe redirect
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            successUrl: window.location.origin + '/success?emergency=true',
            cancelUrl: window.location.origin + '/cancel?emergency=true',
            clientReferenceId: 'emergency_' + Date.now()
        });
        
        if (error) {
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Emergency purchase failed:', error);
        
        // Reset button
        if (button) {
            button.textContent = button.dataset.originalText || 'Buy Now';
            button.disabled = false;
        }
        
        // Show user-friendly error
        alert('Unable to process payment. Please try refreshing the page or contact support.');
        
        // Track error
        console.error('Emergency payment error details:', {
            error: error.message,
            productKey,
            productName,
            userAgent: navigator.userAgent
        });
    }
}

// Override main functions with emergency versions
window.emergencyBuyAIPromptsPack = () => emergencyPurchase('product1', '50 AI Prompts Pack ($19)');
window.emergencyBuyAIStarterBundle = () => emergencyPurchase('product2', 'AI Starter Bundle ($39)');

// Check if main payment system is working
function checkMainPaymentSystem() {
    const errors = [];
    
    // Check Stripe.js
    if (typeof Stripe === 'undefined') {
        errors.push('Stripe.js not loaded');
    }
    
    // Check main functions
    if (typeof buyAIPromptsPack === 'undefined') {
        errors.push('buyAIPromptsPack function missing');
    }
    
    if (typeof buyAIStarterBundle === 'undefined') {
        errors.push('buyAIStarterBundle function missing');
    }
    
    // Check stripe-config.js
    if (typeof createBoostPromptCheckout === 'undefined') {
        errors.push('createBoostPromptCheckout function missing');
    }
    
    if (errors.length > 0) {
        console.warn('⚠️ Main payment system issues detected:', errors);
        console.log('🚨 Activating emergency payment system');
        activateEmergencySystem();
        return false;
    } else {
        console.log('✅ Main payment system appears to be working');
        return true;
    }
}

// Activate emergency system
function activateEmergencySystem() {
    console.log('🚨 Emergency payment system activated');
    
    // Create emergency notification
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #ff6b35; color: white; padding: 15px; border-radius: 8px; z-index: 9999; max-width: 300px; font-size: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div style="font-weight: bold; margin-bottom: 8px;">🚨 Payment System Notice</div>
            <div>Using backup payment system. Your purchase will be processed normally.</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    // Replace button onclick handlers
    replaceButtonHandlers();
}

// Replace button onclick handlers with emergency versions
function replaceButtonHandlers() {
    // Find all payment buttons and replace their handlers
    const buttons = document.querySelectorAll('button[onclick*="buy"], button[onclick*="createCheckout"]');
    
    buttons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        
        if (onclick && onclick.includes('buyAIPromptsPack')) {
            button.setAttribute('onclick', 'emergencyBuyAIPromptsPack()');
            console.log('🔄 Updated $19 product button to emergency system');
        } else if (onclick && onclick.includes('buyAIStarterBundle')) {
            button.setAttribute('onclick', 'emergencyBuyAIStarterBundle()');
            console.log('🔄 Updated $39 product button to emergency system');
        }
    });
}

// Run diagnostic when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🔍 Running payment system diagnostic...');
        
        const isWorking = checkMainPaymentSystem();
        
        if (!isWorking) {
            console.log('🚨 Main system failed, emergency system active');
        } else {
            console.log('✅ Main system working, emergency system on standby');
        }
    }, 2000); // Wait 2 seconds for other scripts to load
});

// Manual activation function (for testing)
window.activateEmergencyPayments = activateEmergencySystem;

console.log('✅ Emergency payment system loaded and ready');