/**
 * EMERGENCY PAYMENT WATCHDOG v3.0
 * Monitors stripe-config.js and provides last-resort fallback
 * Loads AFTER stripe-config.js
 */

(function() {
    'use strict';

    // Wait for page to fully load, then verify payment system
    window.addEventListener('load', function() {
        setTimeout(verifyPaymentSystem, 3000);
    });

    function verifyPaymentSystem() {
        const issues = [];

        if (typeof Stripe === 'undefined') issues.push('Stripe.js not loaded');
        if (typeof buyAIPromptsPack !== 'function') issues.push('buyAIPromptsPack missing');
        if (typeof buyAIStarterBundle !== 'function') issues.push('buyAIStarterBundle missing');

        if (issues.length > 0) {
            console.warn('[BP Emergency] Issues found:', issues);
            installFallbackButtons();
        } else {
            console.log('[BP Emergency] ✅ Payment system verified OK');
        }
    }

    function installFallbackButtons() {
        console.log('[BP Emergency] Installing fallback click handlers');

        // Fallback: attach click handlers to ALL buy buttons
        document.querySelectorAll('.product-btn.buy, button[onclick*="buy"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Try Stripe one more time
                try {
                    if (typeof Stripe !== 'undefined') {
                        var s = Stripe('pk_live_51T2rWLAqx5KYvfYDe1RWou0AdmyWwxeDcrg3sR1iUKosTBM0XQzjFYtOBM25kaG8B86ps7A39xOnD4hgtHkJWObe00i8R1xuVf');
                        var onclick = btn.getAttribute('onclick') || '';
                        var priceId = onclick.includes('StarterBundle') 
                            ? 'price_1T3bCNAqx5KYvfYD3cWcXjc1' 
                            : 'price_1T3bDMAqx5KYvfYDr16bU0eS';

                        s.redirectToCheckout({
                            lineItems: [{ price: priceId, quantity: 1 }],
                            mode: 'payment',
                            successUrl: window.location.origin + '/success.html',
                            cancelUrl: window.location.origin + '/cancel.html'
                        }).then(function(result) {
                            if (result.error) {
                                alert('Payment error: ' + result.error.message + '. Please email hello@boostprompt.ai');
                            }
                        });
                    } else {
                        alert('Payment system is loading. Please refresh and try again, or email hello@boostprompt.ai');
                    }
                } catch(err) {
                    console.error('[BP Emergency] Fallback failed:', err);
                    alert('Please email hello@boostprompt.ai to complete your purchase.');
                }
            });
        });
    }

    console.log('[BP Emergency] ✅ Watchdog loaded');
})();
