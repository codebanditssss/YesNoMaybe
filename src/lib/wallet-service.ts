import { getServiceRoleClient } from './server-utils';

export interface DepositRequest {
  userId: string;
  amount: number;
  gateway: 'razorpay' | 'stripe';
}

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  method: 'bank_account' | 'upi';
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
  };
  upiId?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'deposit_bonus' | 'referral_bonus';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gateway?: string;
  gatewayTransactionId?: string;
  description?: string;
  createdAt: Date;
}

export class WalletService {
  private supabase = getServiceRoleClient();

  /**
   * Create a deposit transaction and initiate payment
   */
  async initiateDeposit(request: DepositRequest): Promise<{
    success: boolean;
    transactionId?: string;
    paymentData?: any;
    error?: string;
  }> {
    try {
      // 1. Validate minimum deposit amount
      if (request.amount < 10) {
        return { success: false, error: 'Minimum deposit amount is ₹10' };
      }

      if (request.amount > 100000) {
        return { success: false, error: 'Maximum deposit amount is ₹1,00,000' };
      }

      // 2. Check KYC status for large amounts
      if (request.amount > 10000) {
        const { data: kycData } = await this.supabase
          .from('user_kyc')
          .select('verification_status')
          .eq('user_id', request.userId)
          .single();

        if (!kycData || kycData.verification_status !== 'verified') {
          return { 
            success: false, 
            error: 'KYC verification required for deposits above ₹10,000' 
          };
        }
      }

      // 3. Create transaction record
      const { data: transaction, error: transactionError } = await this.supabase
        .from('wallet_transactions')
        .insert({
          user_id: request.userId,
          type: 'deposit',
          amount: request.amount,
          status: 'pending',
          gateway: request.gateway,
          description: `Deposit of ₹${request.amount} via ${request.gateway}`
        })
        .select()
        .single();

      if (transactionError) {
        return { success: false, error: 'Failed to create transaction record' };
      }

      // 4. Initialize payment gateway
      let paymentData;
      if (request.gateway === 'razorpay') {
        paymentData = await this.initializeRazorpay(transaction.id, request.amount);
      } else if (request.gateway === 'stripe') {
        paymentData = await this.initializeStripe(transaction.id, request.amount);
      }

      // 5. Update transaction with gateway order ID
      if (paymentData?.orderId) {
        await this.supabase
          .from('wallet_transactions')
          .update({ gateway_order_id: paymentData.orderId })
          .eq('id', transaction.id);
      }

      return {
        success: true,
        transactionId: transaction.id,
        paymentData
      };

    } catch (error) {
      console.error('Deposit initiation error:', error);
      return { success: false, error: 'Failed to initiate deposit' };
    }
  }

  /**
   * Complete deposit after payment gateway confirmation
   */
  async completeDeposit(transactionId: string, gatewayData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // 1. Get transaction
      const { data: transaction, error: fetchError } = await this.supabase
        .from('wallet_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError || !transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      if (transaction.status !== 'pending') {
        return { success: false, error: 'Transaction already processed' };
      }

      // 2. Verify payment with gateway
      const isPaymentValid = await this.verifyPayment(
        transaction.gateway, 
        gatewayData
      );

      if (!isPaymentValid) {
        // Mark as failed
        await this.supabase
          .from('wallet_transactions')
          .update({ 
            status: 'failed',
            gateway_transaction_id: gatewayData.paymentId 
          })
          .eq('id', transactionId);

        return { success: false, error: 'Payment verification failed' };
      }

      // 3. Update user balance and transaction atomically
      const { error: balanceError } = await this.supabase
        .from('user_balances')
        .update({
          available_balance: this.supabase.raw(`available_balance + ${transaction.amount}`),
          total_deposited: this.supabase.raw(`total_deposited + ${transaction.amount}`)
        })
        .eq('user_id', transaction.user_id);

      if (balanceError) {
        return { success: false, error: 'Failed to update balance' };
      }

      // 4. Mark transaction as completed
      await this.supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          gateway_transaction_id: gatewayData.paymentId,
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      return { success: true };

    } catch (error) {
      console.error('Deposit completion error:', error);
      return { success: false, error: 'Failed to complete deposit' };
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(request: WithdrawalRequest): Promise<{
    success: boolean;
    withdrawalId?: string;
    error?: string;
  }> {
    try {
      // 1. Validate withdrawal amount
      if (request.amount < 100) {
        return { success: false, error: 'Minimum withdrawal amount is ₹100' };
      }

      // 2. Check user balance
      const { data: balance, error: balanceError } = await this.supabase
        .from('user_balances')
        .select('available_balance')
        .eq('user_id', request.userId)
        .single();

      if (balanceError || !balance) {
        return { success: false, error: 'Failed to check balance' };
      }

      if (balance.available_balance < request.amount) {
        return { 
          success: false, 
          error: `Insufficient balance. Available: ₹${balance.available_balance}` 
        };
      }

      // 3. Check KYC status
      const { data: kycData } = await this.supabase
        .from('user_kyc')
        .select('verification_status, daily_withdrawal_limit')
        .eq('user_id', request.userId)
        .single();

      if (!kycData || kycData.verification_status !== 'verified') {
        return { success: false, error: 'KYC verification required for withdrawals' };
      }

      // 4. Check daily withdrawal limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayWithdrawals } = await this.supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('user_id', request.userId)
        .gte('created_at', todayStart.toISOString())
        .in('status', ['completed', 'processing', 'approved']);

      const todayTotal = todayWithdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
      
      if (todayTotal + request.amount > kycData.daily_withdrawal_limit) {
        return { 
          success: false, 
          error: `Daily withdrawal limit exceeded. Limit: ₹${kycData.daily_withdrawal_limit}` 
        };
      }

      // 5. Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await this.supabase
        .from('withdrawal_requests')
        .insert({
          user_id: request.userId,
          amount: request.amount,
          withdrawal_method: request.method,
          bank_account_number: request.bankDetails?.accountNumber,
          bank_ifsc: request.bankDetails?.ifsc,
          upi_id: request.upiId,
          status: 'pending'
        })
        .select()
        .single();

      if (withdrawalError) {
        return { success: false, error: 'Failed to create withdrawal request' };
      }

      // 6. Lock funds immediately
      await this.supabase
        .from('user_balances')
        .update({
          available_balance: this.supabase.raw(`available_balance - ${request.amount}`),
          locked_balance: this.supabase.raw(`locked_balance + ${request.amount}`)
        })
        .eq('user_id', request.userId);

      return {
        success: true,
        withdrawalId: withdrawal.id
      };

    } catch (error) {
      console.error('Withdrawal request error:', error);
      return { success: false, error: 'Failed to process withdrawal request' };
    }
  }

  /**
   * Get user's wallet transactions
   */
  async getTransactions(userId: string, limit = 20, offset = 0): Promise<WalletTransaction[]> {
    const { data, error } = await this.supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  // Private helper methods
  private async initializeRazorpay(transactionId: string, amount: number) {
    // Initialize Razorpay order
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `txn_${transactionId}`,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    };
  }

  private async initializeStripe(transactionId: string, amount: number) {
    // Initialize Stripe payment intent
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'inr',
      metadata: { transactionId },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    };
  }

  private async verifyPayment(gateway: string, gatewayData: any): Promise<boolean> {
    try {
      if (gateway === 'razorpay') {
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(gatewayData.orderId + '|' + gatewayData.paymentId)
          .digest('hex');
        
        return expectedSignature === gatewayData.signature;
      }

      if (gateway === 'stripe') {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const paymentIntent = await stripe.paymentIntents.retrieve(gatewayData.paymentIntentId);
        return paymentIntent.status === 'succeeded';
      }

      return false;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

export const walletService = new WalletService(); 