#!/bin/bash

echo "🚀 BoostPrompt + Stripe Integration Setup"
echo "========================================"

# Check if in right directory
if [ ! -f "index.html" ]; then
  echo "❌ Run this from the boostprompt-site directory"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for Stripe keys
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo ""
  echo "🔑 STRIPE KEYS NEEDED"
  echo "Run these commands to get your keys:"
  echo ""
  echo "  cd ~/.openclaw/workspace/scripts"
  echo "  ./secrets-vault.sh view | grep -A4 'Stripe'"
  echo ""
  echo "Then run this setup again with:"
  echo "  STRIPE_SECRET_KEY='sk_live_...' ./setup.sh"
  echo ""
  exit 1
fi

# Create Stripe products
echo "🛒 Creating Stripe products..."
node create-stripe-products.js

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. Add environment variables to Netlify:"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - PRODUCT_1_PRICE_ID (from output above)"
echo "   - PRODUCT_2_PRICE_ID (from output above)"
echo ""
echo "2. Update index.html with your publishable key and price IDs"
echo ""
echo "3. Deploy: npm run deploy:prod"
echo ""
echo "📖 Full instructions: cat STRIPE-SETUP.md"