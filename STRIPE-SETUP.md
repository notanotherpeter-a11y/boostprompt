# Stripe Integration Setup

## Step 1: Get Your Keys

1. **Unlock vault and get keys:**
```bash
cd ~/.openclaw/workspace/scripts
./secrets-vault.sh view | grep -A4 "Stripe"
```

2. **Copy both keys** (pk_live_... and sk_live_...)

## Step 2: Add Keys to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your **boostprompt-dev** site
3. Go to **Site settings → Environment variables**
4. Add these variables:
   - `STRIPE_PUBLISHABLE_KEY` = pk_live_...
   - `STRIPE_SECRET_KEY` = sk_live_...

## Step 3: Create Products in Stripe

```bash
cd ~/.openclaw/workspace/boostprompt-site
npm init -y
npm install stripe
STRIPE_SECRET_KEY="sk_live_..." node create-stripe-products.js
```

This will output Price IDs like:
- `PRODUCT_1_PRICE_ID=price_xyz123`  
- `PRODUCT_2_PRICE_ID=price_abc456`

## Step 4: Update Website

Add the Price IDs to Netlify environment variables:
- `PRODUCT_1_PRICE_ID` = price_xyz123
- `PRODUCT_2_PRICE_ID` = price_abc456

## Step 5: Update Frontend Code

Replace the placeholder publishable key in `index.html`:

```javascript
// Find this line:
const stripe = Stripe('pk_live_51T2WL...');

// Replace with your actual key:
const stripe = Stripe('pk_live_YOUR_ACTUAL_KEY');
```

Also replace price IDs:
```javascript
// Replace these:
onclick="createCheckoutSession('price_PRODUCT1_ID')"
onclick="createCheckoutSession('price_PRODUCT2_ID')"

// With your actual IDs:
onclick="createCheckoutSession('price_xyz123')"
onclick="createCheckoutSession('price_abc456')"
```

## Step 6: Deploy

```bash
cd ~/.openclaw/workspace/boostprompt-site
netlify deploy --prod
```

## Testing

Use Stripe test cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

## Done! 🎉

Your BoostPrompt site now accepts payments directly through Stripe instead of Gumroad.