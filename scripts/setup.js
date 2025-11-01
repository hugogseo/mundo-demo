#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 SaaS Boilerplate Setup\n');

  // Get app name
  const appName = await question('App name (default: SaaS Boilerplate): ');
  const finalAppName = appName || 'SaaS Boilerplate';

  // Create .env file
  const envContent = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP3sSgH0cVP7JsFNUHOvkzIU61Q8mLQmRvCrNLENQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZeS668eMIUgqoi4G0V36SEbjxcHQAGAjQKc

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Stripe Products & Prices (update after creating in Stripe Dashboard)
STRIPE_PRODUCT_PRO=prod_YOUR_ID
STRIPE_PRODUCT_ENTERPRISE=prod_YOUR_ID
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_ID
STRIPE_PRICE_PRO_YEARLY=price_YOUR_ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_YOUR_ID
STRIPE_PRICE_ENTERPRISE_YEARLY=price_YOUR_ID

# App
NEXT_PUBLIC_APP_NAME=${finalAppName}
NODE_ENV=development
`;

  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
  console.log('✅ Created .env file');

  // Copy to .env.local
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
  console.log('✅ Created .env.local file');

  console.log('\n📝 Next steps:');
  console.log('1. Update Stripe keys in .env and .env.local');
  console.log('2. Run: supabase start');
  console.log('3. Run: npm run dev');
  console.log('4. Visit: http://localhost:3000\n');

  rl.close();
}

main().catch(console.error);
