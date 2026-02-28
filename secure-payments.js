/**
 * BoostPrompt Secure Payment Integration
 * Uses server-side payment processing instead of direct Stripe
 */

const PAYMENT_SERVER_URL = 'https://boost-pay-nodejs-69969-85286e5e9259.herokuapp.com';

class SecurePayments {
    constructor(serverUrl = PAYMENT_SERVER_URL) {
        this.serverUrl = serverUrl;
        this.init();
    }

    init() {
        console.log('🔐 BoostPrompt Secure Payments initialized');
        console.log('🌐 Server:', this.serverUrl);
    }

    async createCheckout(productKey, options = {}) {
        const {
            returnUrl = window.location.origin + '/success.html',
            cancelUrl = window.location.href
        } = options;

        try {
            console.log(`🛒 Creating secure checkout for: ${productKey}`);
            
            // Show loading state
            this.showLoadingState();
            
            const response = await fetch(`${this.serverUrl}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: productKey,
                    return_url: returnUrl,
                    cancel_url: cancelUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.checkout_url) {
                console.log('✅ Redirecting to secure Stripe checkout');
                // Redirect to Stripe checkout
                window.location.href = data.checkout_url;
            } else {
                throw new Error('No checkout URL received from server');
            }
            
        } catch (error) {
            console.error('❌ Checkout creation failed:', error);
            this.hideLoadingState();
            this.showErrorModal(error.message);
        }
    }

    async getSessionStatus(sessionId) {
        try {
            const response = await fetch(`${this.serverUrl}/session-status?session_id=${sessionId}`);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Session status check failed:', error);
            return null;
        }
    }

    showLoadingState() {
        // Find all buy buttons and show loading
        const buttons = document.querySelectorAll('.product-btn, .cta-button, #checkout-button');
        buttons.forEach(btn => {
            if (!btn.dataset.originalText) {
                btn.dataset.originalText = btn.textContent;
            }
            btn.textContent = '🔄 Processing...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        });
    }

    hideLoadingState() {
        // Restore button states
        const buttons = document.querySelectorAll('.product-btn, .cta-button, #checkout-button');
        buttons.forEach(btn => {
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }

    showErrorModal(message) {
        // Remove existing modal
        const existingModal = document.getElementById('secure-payment-error');
        if (existingModal) {
            existingModal.remove();
        }

        // Create error modal
        const modal = document.createElement('div');
        modal.id = 'secure-payment-error';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)this.remove()">
                <div style="background:white;border-radius:16px;padding:40px;max-width:420px;width:100%;text-align:center;">
                    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                    <h3 style="color:#333;font-size:22px;margin-bottom:16px;">Payment Error</h3>
                    <p style="color:#666;font-size:16px;margin-bottom:24px;line-height:1.6;">${message}</p>
                    <button onclick="this.closest('#secure-payment-error').remove()" 
                        style="background:#FF6B35;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;margin-right:10px;">
                        Try Again
                    </button>
                    <button onclick="window.location.href='https://boostprompt.dev'" 
                        style="background:#666;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">
                        Back to Products
                    </button>
                    <p style="color:#999;font-size:12px;margin-top:16px;">
                        If this problem persists, contact support at hello@boostprompt.dev
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showSuccessMessage() {
        console.log('✅ Payment completed successfully');
        // You can add success handling here if needed
    }
}

// Initialize secure payments
const securePayments = new SecurePayments();

// Product checkout functions (replace old Stripe functions)
window.buyAIPromptsPack = function() { 
    securePayments.createCheckout('ai-prompts-pack'); 
};

window.buyAIStarterBundle = function() { 
    securePayments.createCheckout('ai-starter-bundle'); 
};

window.buyPromptEngineeringBible = function() { 
    securePayments.createCheckout('prompt-engineering-bible'); 
};

window.buyEmailTemplates = function() { 
    securePayments.createCheckout('email-templates'); 
};

window.buyGEOStarterKit = function() { 
    securePayments.createCheckout('geo-starter-kit'); 
};

window.buyAIProofSEO = function() { 
    securePayments.createCheckout('ai-proof-seo'); 
};

window.buyVoiceCommerce = function() { 
    securePayments.createCheckout('voice-commerce'); 
};

window.buyDigitalPR = function() { 
    securePayments.createCheckout('digital-pr'); 
};

// Generic checkout function
window.createSecureCheckout = function(productKey) {
    securePayments.createCheckout(productKey);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Secure Payment System loaded');
    
    // Replace any remaining direct Stripe buttons with secure calls
    const buttons = document.querySelectorAll('#checkout-button, .checkout-button');
    buttons.forEach(btn => {
        // Check if button has a product data attribute
        const product = btn.dataset.product;
        if (product) {
            btn.onclick = function() {
                securePayments.createCheckout(product);
                return false;
            };
        }
    });
    
    // Check if we're on a success page
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        console.log('✅ Checking payment status...');
        securePayments.getSessionStatus(sessionId).then(status => {
            if (status && status.status === 'complete') {
                console.log('✅ Payment confirmed:', status);
                securePayments.showSuccessMessage();
            }
        });
    }
});