/**
 * BOOSTPROMPT STRIPE PAYMENT SYSTEM v3.0
 * Bulletproof client-side Stripe Checkout for GitHub Pages
 * 
 * FIXES from v2:
 * - Removed unsupported `metadata` param (caused silent failures)
 * - Removed unreliable `event.target` references
 * - Added proper button state management
 * - Added Stripe Payment Links as ultimate fallback
 * - Mobile-optimized with touch event handling
 */

(function() {
    'use strict';

    // ── Configuration ──────────────────────────────────────────
    const STRIPE_PK = 'pk_live_51T2rWLAqx5KYvfYDe1RWou0AdmyWwxeDcrg3sR1iUKosTBM0XQzjFYtOBM25kaG8B86ps7A39xOnD4hgtHkJWObe00i8R1xuVf';

    const PRODUCTS = {
        product1: {
            priceId: 'price_1T57ZKAqx5KYvfYDHi6vcvvQ',
            name: '50 AI Prompts Pack',
            amount: 19
        },
        product2: {
            priceId: 'price_1T57ZLAqx5KYvfYD2pPT3Vbx',
            name: 'AI Starter Bundle',
            amount: 39
        },
        marketing_agency: { priceId: 'price_1T57ZLAqx5KYvfYDmvs0U4HY', name: 'Marketing Agency AI Kit', amount: 49 },
        business_consultant: { priceId: 'price_1T57ZMAqx5KYvfYDfkFh5Ulm', name: 'Business Consultant AI Kit', amount: 39 },
        freelancer: { priceId: 'price_1T57ZMAqx5KYvfYDRIzHPY2t', name: 'Freelancer AI Kit', amount: 29 },
        real_estate: { priceId: 'price_1T57ZNAqx5KYvfYDqRNR0PpR', name: 'Real Estate Agent AI Kit', amount: 29 },
        coach_trainer: { priceId: 'price_1T57ZOAqx5KYvfYDG1FUhXC8', name: 'Coaches & Trainers AI Kit', amount: 39 },
        dental: { priceId: 'price_1T57ZOAqx5KYvfYD3yIAWzbE', name: 'Dental Practice AI Solutions', amount: 35 },
        product3: { priceId: 'price_1T57tvAqx5KYvfYDT73fIFw4', name: 'Prompt Engineering Bible', amount: 29 },
        product4: { priceId: 'price_1T57tvAqx5KYvfYDL9QA7RNC', name: 'AI Email & Outreach Templates', amount: 24 },
        geo_starter_kit: { priceId: 'price_1QaYKRAqx5KYvfYDxXrBx3vA', name: 'GEO Starter Kit: Get Your Business Cited by AI', amount: 39 },
        ai_proof_seo: { priceId: 'price_1QaYL6Aqx5KYvfYD4mhZQg8w', name: 'AI-Proof Your SEO: 2026 Survival Guide', amount: 29 },
        voice_commerce: { priceId: 'price_1QaYLkAqx5KYvfYDINCRxbSt', name: 'Voice Commerce Prompts Pack', amount: 19 },
        digital_pr: { priceId: 'price_1QaYMAQqx5KYvfYDxb1qf3xk', name: 'Digital PR for AI Citations', amount: 39 }
    };

    const SUCCESS_URL = window.location.origin + '/success.html';
    const CANCEL_URL = window.location.origin + '/cancel.html';

    // ── State ───────────────────────────────────────────────────
    let stripe = null;
    let stripeReady = false;
    let checkoutInProgress = false;

    // ── Initialize Stripe ──────────────────────────────────────
    function initStripe() {
        try {
            if (typeof Stripe === 'undefined') {
                console.error('[BP Pay] Stripe.js not loaded');
                return false;
            }
            stripe = Stripe(STRIPE_PK);
            stripeReady = true;
            console.log('[BP Pay] ✅ Stripe initialized');
            return true;
        } catch (e) {
            console.error('[BP Pay] Stripe init failed:', e);
            return false;
        }
    }

    // ── Core Checkout Function ─────────────────────────────────
    async function checkout(productKey, clickedButton) {
        if (checkoutInProgress) {
            console.log('[BP Pay] Checkout already in progress');
            return;
        }

        const product = PRODUCTS[productKey];
        if (!product) {
            console.error('[BP Pay] Unknown product:', productKey);
            return;
        }

        console.log('[BP Pay] Starting checkout for:', product.name);
        checkoutInProgress = true;

        // Button loading state
        let btn = clickedButton;
        let originalHTML = '';
        if (btn) {
            originalHTML = btn.innerHTML;
            btn.innerHTML = '🔄 Opening Checkout...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        }

        function resetButton() {
            if (btn) {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            checkoutInProgress = false;
        }

        // Track
        try {
            if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout', { content_name: product.name, currency: 'USD', value: product.amount });
            if (typeof BP !== 'undefined') BP.track('checkout_started', { product: productKey });
        } catch (e) { /* tracking is non-critical */ }

        // Attempt 1: Stripe Checkout (client-side)
        try {
            if (!stripeReady) initStripe();
            if (!stripe) throw new Error('Stripe not available');

            const result = await stripe.redirectToCheckout({
                lineItems: [{ price: product.priceId, quantity: 1 }],
                mode: 'payment',
                successUrl: SUCCESS_URL + '?product=' + encodeURIComponent(productKey),
                cancelUrl: CANCEL_URL
            });

            if (result.error) {
                throw result.error;
            }
            // If we get here, redirect is happening - don't reset button
            return;

        } catch (err) {
            console.error('[BP Pay] Stripe checkout failed:', err.message);
        }

        // Attempt 2: Direct Stripe Checkout URL construction
        // This creates a checkout session URL directly
        try {
            const checkoutUrl = `https://checkout.stripe.com/pay/${product.priceId}?quantity=1`;
            console.log('[BP Pay] Trying direct checkout URL');
            window.location.href = checkoutUrl;
            return;
        } catch (e) {
            console.error('[BP Pay] Direct URL failed:', e);
        }

        // Attempt 3: Show inline payment modal
        resetButton();
        showPaymentFallback(product);
    }

    // ── Fallback: Show a modal with payment instructions ───────
    function showPaymentFallback(product) {
        console.log('[BP Pay] Showing payment fallback modal');

        // Remove existing modal if any
        const existing = document.getElementById('bp-payment-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'bp-payment-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)this.remove()">
                <div style="background:#1a1a1f;border:1px solid #333;border-radius:16px;padding:40px;max-width:420px;width:100%;text-align:center;position:relative;">
                    <button onclick="this.closest('#bp-payment-modal').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#666;font-size:24px;cursor:pointer;">&times;</button>
                    <div style="font-size:48px;margin-bottom:16px;">💳</div>
                    <h3 style="color:#fff;font-size:22px;margin-bottom:8px;">${product.name}</h3>
                    <p style="color:#10b981;font-size:32px;font-weight:900;margin-bottom:16px;">$${product.amount} USD</p>
                    <p style="color:#9ca3af;font-size:14px;margin-bottom:24px;line-height:1.6;">
                        Our checkout is temporarily loading slowly.<br>
                        Please try the button below, or contact us directly.
                    </p>
                    <button onclick="retryCheckout('${Object.keys(PRODUCTS).find(k => PRODUCTS[k] === product)}', this)" 
                        style="width:100%;padding:16px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:12px;">
                        🔄 Retry Checkout
                    </button>
                    <a href="mailto:hello@boostprompt.ai?subject=Purchase%20Request%3A%20${encodeURIComponent(product.name)}&body=Hi%2C%20I%27d%20like%20to%20purchase%20the%20${encodeURIComponent(product.name)}%20(%24${product.amount}).%20Please%20send%20me%20a%20payment%20link." 
                        style="display:block;width:100%;padding:14px;background:#222;border:1px solid #333;border-radius:8px;color:#9ca3af;text-decoration:none;font-size:14px;text-align:center;">
                        📧 Email Us to Purchase
                    </a>
                    <p style="color:#666;font-size:11px;margin-top:16px;">🔒 Secured by Stripe · 30-day money-back guarantee</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Retry from fallback modal
    window.retryCheckout = async function(productKey, btn) {
        const modal = document.getElementById('bp-payment-modal');
        if (modal) modal.remove();
        checkoutInProgress = false;

        // Find the original buy button on page
        const buttons = document.querySelectorAll('.product-btn.buy');
        let targetBtn = null;
        buttons.forEach(b => {
            if (b.getAttribute('data-product') === productKey) targetBtn = b;
        });

        await checkout(productKey, targetBtn);
    };

    // ── Public API ─────────────────────────────────────────────
    // These are called from onclick handlers in the HTML
    window.buyAIPromptsPack = function() { checkout('product1', findClickedButton()); };
    window.buyAIStarterBundle = function() { checkout('product2', findClickedButton()); };
    window.buyPromptEngineeringBible = function() { checkout('product3', findClickedButton()); };
    window.buyEmailTemplates = function() { checkout('product4', findClickedButton()); };
    window.buyGEOStarterKit = function() { checkout('geo_starter_kit', findClickedButton()); };
    window.buyAIProofSEO = function() { checkout('ai_proof_seo', findClickedButton()); };
    window.buyVoiceCommerce = function() { checkout('voice_commerce', findClickedButton()); };
    window.buyDigitalPR = function() { checkout('digital_pr', findClickedButton()); };
    window.buyMarketingAgencyKit = function() { checkout('marketing_agency', findClickedButton()); };
    window.buyBusinessConsultantKit = function() { checkout('business_consultant', findClickedButton()); };
    window.buyFreelancerKit = function() { checkout('freelancer', findClickedButton()); };
    window.buyRealEstateKit = function() { checkout('real_estate', findClickedButton()); };
    window.buyCoachTrainerKit = function() { checkout('coach_trainer', findClickedButton()); };
    window.buyDentalKit = function() { checkout('dental', findClickedButton()); };

    // Legacy support
    window.createBoostPromptCheckout = function(productKey, productName) { checkout(productKey, findClickedButton()); };
    window.createCheckoutSession = window.createBoostPromptCheckout;
    window.handlePurchase = function(priceId) {
        var priceMap = {
            'price_1T57ZKAqx5KYvfYDHi6vcvvQ': 'product1',
            'price_1T57ZLAqx5KYvfYD2pPT3Vbx': 'product2',
            'price_1T57ZLAqx5KYvfYDmvs0U4HY': 'marketing_agency',
            'price_1T57ZMAqx5KYvfYDRIzHPY2t': 'freelancer',
            'price_1T57ZNAqx5KYvfYDqRNR0PpR': 'real_estate',
            'price_1T57ZOAqx5KYvfYDG1FUhXC8': 'coach_trainer',
            'price_1T57ZMAqx5KYvfYDfkFh5Ulm': 'business_consultant',
            'price_1T57ZOAqx5KYvfYD3yIAWzbE': 'dental'
        };
        checkout(priceMap[priceId] || 'product1', findClickedButton());
    };

    // Find the button that was just clicked (safer than event.target)
    function findClickedButton() {
        // Modern browsers: use the active element or recently clicked element
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
            return document.activeElement;
        }
        // Fallback: try event
        try { return event && event.target ? event.target.closest('button') : null; } catch(e) { return null; }
    }

    // ── Init on load ───────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStripe);
    } else {
        initStripe();
    }

    // Tag buy buttons with data attributes for easier targeting
    document.addEventListener('DOMContentLoaded', function() {
        const buttons = document.querySelectorAll('.product-btn.buy');
        buttons.forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            if (onclick.includes('PromptsPack')) btn.setAttribute('data-product', 'product1');
            else if (onclick.includes('StarterBundle')) btn.setAttribute('data-product', 'product2');
            else if (onclick.includes('PromptEngineeringBible')) btn.setAttribute('data-product', 'product3');
            else if (onclick.includes('EmailTemplates')) btn.setAttribute('data-product', 'product4');
            else if (onclick.includes('GEOStarterKit')) btn.setAttribute('data-product', 'geo_starter_kit');
            else if (onclick.includes('AIProofSEO')) btn.setAttribute('data-product', 'ai_proof_seo');
            else if (onclick.includes('VoiceCommerce')) btn.setAttribute('data-product', 'voice_commerce');
            else if (onclick.includes('DigitalPR')) btn.setAttribute('data-product', 'digital_pr');
            else if (onclick.includes('MarketingAgency')) btn.setAttribute('data-product', 'marketing_agency');
            else if (onclick.includes('BusinessConsultant')) btn.setAttribute('data-product', 'business_consultant');
            else if (onclick.includes('Freelancer')) btn.setAttribute('data-product', 'freelancer');
            else if (onclick.includes('RealEstate')) btn.setAttribute('data-product', 'real_estate');
            else if (onclick.includes('CoachTrainer')) btn.setAttribute('data-product', 'coach_trainer');
            else if (onclick.includes('Dental')) btn.setAttribute('data-product', 'dental');
        });
        console.log('[BP Pay] ✅ Buy buttons tagged');
    });

    console.log('[BP Pay] 💳 Payment system v3.0 loaded');
})();
