// EMERGENCY PAYMENT FIX FOR GITHUB PAGES HOSTING
// Direct Stripe Payment Links - Works immediately with static hosting

// Replace the broken createCheckoutSession function with this:
async function createCheckoutSession(priceId) {
  try {
    // Track purchase intent
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase_intent', {
        'product_name': priceId === 'price_1T3bDMAqx5KYvfYDr16bU0eS' ? 'AI Prompts Pack' : 'AI Starter Bundle',
        'value': priceId === 'price_1T3bDMAqx5KYvfYDr16bU0eS' ? 19 : 39,
        'currency': 'USD'
      });
    }

    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '🔄 Loading...';
    button.disabled = true;

    // TEMPORARY: Direct Stripe Payment Links
    // TODO: Replace these URLs with actual Stripe Payment Links from dashboard
    const paymentLinks = {
      'price_1T3bDMAqx5KYvfYDr16bU0eS': 'https://buy.stripe.com/REPLACE_WITH_19_LINK',
      'price_1T3bCNAqx5KYvfYD3cWcXjc1': 'https://buy.stripe.com/REPLACE_WITH_39_LINK',
      'price_1T3m6lAqx5KYvfYDSExc7fSy': 'https://buy.stripe.com/REPLACE_WITH_29_FREELANCER_LINK',
      'price_1T3m6oAqx5KYvfYDOuvJtaXS': 'https://buy.stripe.com/REPLACE_WITH_49_AGENCY_LINK',
      'price_1T44p4Aqx5KYvfYD2ox2t4Hm': 'https://buy.stripe.com/REPLACE_WITH_29_REALESTATE_LINK',
      'price_1T3m6mAqx5KYvfYDbH0eWHgo': 'https://buy.stripe.com/REPLACE_WITH_39_COACH_LINK'
    };

    if (paymentLinks[priceId] && !paymentLinks[priceId].includes('REPLACE_WITH')) {
      // Redirect to Stripe Payment Link
      window.location.href = paymentLinks[priceId];
    } else {
      // Fallback: Contact form
      const productNames = {
        'price_1T3bDMAqx5KYvfYDr16bU0eS': '$19 AI Prompts Pack',
        'price_1T3bCNAqx5KYvfYD3cWcXjc1': '$39 AI Starter Bundle',
        'price_1T3m6lAqx5KYvfYDSExc7fSy': '$29 Freelancer Kit',
        'price_1T3m6oAqx5KYvfYDOuvJtaXS': '$49 Agency Kit',
        'price_1T44p4Aqx5KYvfYD2ox2t4Hm': '$29 Real Estate Kit',
        'price_1T3m6mAqx5KYvfYDbH0eWHgo': '$39 Coach Kit'
      };
      
      const productName = productNames[priceId] || 'BoostPrompt Product';
      const subject = encodeURIComponent('Purchase Request: ' + productName);
      const body = encodeURIComponent(`Hi! I'd like to purchase the ${productName}. Please send me the payment link!`);
      
      // Redirect to email contact
      window.location.href = `mailto:notanotherpeter@gmail.com?subject=${subject}&body=${body}`;
    }

  } catch (error) {
    console.error('Payment error:', error);
    
    // Restore button state
    if (typeof button !== 'undefined') {
      button.textContent = originalText;
      button.disabled = false;
    }
    
    alert('Payment system is being updated. Please contact us at notanotherpeter@gmail.com or try again in a few minutes.');
  }
}

// Instructions for Gene:
// 1. Go to Stripe Dashboard → Payment Links
// 2. Create Payment Links for each product price
// 3. Replace the 'REPLACE_WITH_XX_LINK' URLs above with actual Stripe buy.stripe.com links
// 4. Deploy this file to fix all payment buttons immediately