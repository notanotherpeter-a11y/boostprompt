const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    // Product 1: 50 AI Prompts - $19
    const product1 = await stripe.products.create({
      name: '50 Powerful AI Prompts for Small Business Owners',
      description: 'Battle-tested AI prompts to save 10+ hours per week. Works with ChatGPT, Claude, and Gemini. Includes customer service, marketing, operations, and growth prompts.',
      images: ['https://boostprompt.dev/product-1.jpg'],
      metadata: {
        category: 'ai-prompts',
        difficulty: 'beginner-friendly',
        format: 'pdf'
      }
    });

    const price1 = await stripe.prices.create({
      product: product1.id,
      unit_amount: 1900, // $19.00 in cents
      currency: 'usd',
      metadata: {
        original_price: 3900, // $39 "was" price for anchor effect
        discount_percentage: '51'
      }
    });

    // Product 2: AI Starter Bundle - $39  
    const product2 = await stripe.products.create({
      name: 'AI Starter Bundle — Everything You Need',
      description: 'Complete AI toolkit: 150+ prompts, automation templates, business frameworks, and video tutorials. Everything to master AI for business in one package.',
      images: ['https://boostprompt.dev/product-2.jpg'],
      metadata: {
        category: 'bundle',
        difficulty: 'all-levels', 
        format: 'pdf-videos'
      }
    });

    const price2 = await stripe.prices.create({
      product: product2.id,
      unit_amount: 3900, // $39.00 in cents
      currency: 'usd',
      metadata: {
        original_price: 9700, // $97 "was" price
        discount_percentage: '60'
      }
    });

    console.log('✅ Products created successfully!');
    console.log('\n📦 Product 1 (50 AI Prompts - $19):');
    console.log(`Product ID: ${product1.id}`);
    console.log(`Price ID: ${price1.id}`);
    
    console.log('\n📦 Product 2 (AI Starter Bundle - $39):');
    console.log(`Product ID: ${product2.id}`);
    console.log(`Price ID: ${price2.id}`);
    
    console.log('\n🔗 Add these to your environment:');
    console.log(`PRODUCT_1_PRICE_ID=${price1.id}`);
    console.log(`PRODUCT_2_PRICE_ID=${price2.id}`);

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
  }
}

createProducts();