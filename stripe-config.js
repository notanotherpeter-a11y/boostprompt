/**
 * BOOSTPROMPT STRIPE CONFIGURATION
 * Central payment configuration for all pages
 */

// ✅ CORRECT STRIPE PUBLISHABLE KEY
const BOOSTPROMPT_STRIPE_PK = 'pk_live_51T2rWLAqx5KYvfYDe1RWou0AdmyWwxeDcrg3sR1iUKosTBM0XQzjFYtOBM25kaG8B86ps7A39xOnD4hgtHkJWObe00i8R1xuVf';

// 💳 STRIPE PRICE IDs (REAL PRODUCTS)
const BOOSTPROMPT_PRICES = {
    // Main Products
    'product1': 'price_1T3bDMAqx5KYvfYDr16bU0eS', // $19 AI Prompts Pack
    'product2': 'price_1T3bCNAqx5KYvfYD3cWcXjc1', // $39 AI Starter Bundle
    
    // Industry-Specific Products (from Asia's brain)
    'marketing_agency': 'price_1T3m6oAqx5KYvfYDOuvJtaXS', // $49
    'business_consultant': 'price_1T3bCNAqx5KYvfYD3cWcXjc1', // $39  
    'freelancer': 'price_1T3m6lAqx5KYvfYDSExc7fSy', // $29
    'real_estate': 'price_1T44p4Aqx5KYvfYD2ox2t4Hm', // $29
    'coach_trainer': 'price_1T3m6mAqx5KYvfYDbH0eWHgo', // $39
    'dental': 'price_1T3bCNAqx5KYvfYD3cWcXjc1' // $35 (placeholder for now)
};

// 🚀 UNIVERSAL STRIPE CHECKOUT FUNCTION
window.createBoostPromptCheckout = async function(productKey, productName) {
    try {
        // Initialize Stripe
        const stripe = Stripe(BOOSTPROMPT_STRIPE_PK);
        
        // Track purchase intent
        if (typeof fbq !== 'undefined') {
            fbq('track', 'InitiateCheckout', { 
                content_name: productName,
                currency: 'USD' 
            });
        }
        
        // Show loading state
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '🔄 Loading...';
        button.disabled = true;
        
        // Get price ID
        const priceId = BOOSTPROMPT_PRICES[productKey];
        if (!priceId) {
            throw new Error('Product not found');
        }
        
        // Direct Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{
                price: priceId,
                quantity: 1
            }],
            mode: 'payment',
            successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cancel`,
            clientReferenceId: 'bp_' + Date.now(),
            metadata: {
                source: 'boostprompt',
                product_name: productName,
                page: window.location.pathname
            }
        });
        
        if (error) {
            console.error('Stripe Error:', error);
            alert('Unable to start checkout. Please try again.');
        }
        
    } catch (error) {
        console.error('Checkout Error:', error);
        alert('Something went wrong. Please try again.');
    } finally {
        // Reset button
        const button = event.target;
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
};

// 🎯 PRODUCT-SPECIFIC FUNCTIONS
window.buyAIPromptsPack = () => createBoostPromptCheckout('product1', '50 AI Prompts Pack');
window.buyAIStarterBundle = () => createBoostPromptCheckout('product2', 'AI Starter Bundle');
window.buyMarketingAgencyKit = () => createBoostPromptCheckout('marketing_agency', 'Marketing Agency AI Kit');
window.buyBusinessConsultantKit = () => createBoostPromptCheckout('business_consultant', 'Business Consultant AI Kit');
window.buyFreelancerKit = () => createBoostPromptCheckout('freelancer', 'Freelancer AI Kit');
window.buyRealEstateKit = () => createBoostPromptCheckout('real_estate', 'Real Estate Agent AI Kit');
window.buyCoachTrainerKit = () => createBoostPromptCheckout('coach_trainer', 'Coaches & Trainers AI Kit');
window.buyDentalKit = () => createBoostPromptCheckout('dental', 'Dental Practice AI Solutions');

// Legacy support for old function names
window.createCheckoutSession = createBoostPromptCheckout;
window.handlePurchase = (priceId) => {
    // Map old price IDs to new product keys
    const priceMap = {
        'price_1T3bDMAqx5KYvfYDr16bU0eS': 'product1',
        'price_1T3bCNAqx5KYvfYD3cWcXjc1': 'product2',
        'price_1T3m6oAqx5KYvfYDOuvJtaXS': 'marketing_agency',
        'price_1T3m6lAqx5KYvfYDSExc7fSy': 'freelancer',
        'price_1T44p4Aqx5KYvfYD2ox2t4Hm': 'real_estate',
        'price_1T3m6mAqx5KYvfYDbH0eWHgo': 'coach_trainer'
    };
    
    const productKey = priceMap[priceId] || 'product1';
    createBoostPromptCheckout(productKey, 'BoostPrompt Product');
};

console.log('💳 BoostPrompt payment system loaded');
