# Wallet Environment Configuration

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Wallet Configuration
WALLET_MODE=development  # development or production
INITIAL_WALLET_AMOUNT=10000  # Only for development mode
```

## Setup Instructions

### 1. Razorpay Setup (India)
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create account and verify business
3. Get API keys from Settings > API Keys
4. Add webhook URL: `https://yourdomain.com/api/wallet/webhook/razorpay`

### 2. Stripe Setup (Global)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account and complete verification
3. Get API keys from Developers > API keys
4. Add webhook endpoint: `https://yourdomain.com/api/wallet/webhook/stripe`

### 3. Database Migration
Run the wallet schema migration:
```bash
psql -f scripts/wallet-transactions-schema.sql
```

### 4. Install Dependencies
```bash
npm install razorpay stripe
```

## Payment Flow

### Deposits
1. User initiates deposit
2. Transaction record created with `pending` status
3. Payment gateway checkout opens
4. User completes payment
5. Webhook verifies payment
6. Balance updated, transaction marked `completed`

### Withdrawals
1. User requests withdrawal
2. Funds locked immediately
3. Admin processes manually (or auto-process for verified users)
4. Bank transfer initiated
5. Transaction marked `completed`

## Security Considerations

- All payment verification happens server-side
- Webhook signatures verified for authenticity
- User balances updated atomically
- Rate limiting on wallet endpoints
- KYC required for large amounts
- Daily/monthly withdrawal limits enforced 