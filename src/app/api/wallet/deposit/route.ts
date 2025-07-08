import { NextRequest, NextResponse } from 'next/server';
import { withAuthentication, createErrorResponse, createSuccessResponse } from '@/lib/server-utils';
import { walletService } from '@/lib/wallet-service';

// POST /api/wallet/deposit - Initiate deposit
async function depositHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, gateway } = body;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return createErrorResponse('Invalid amount', 400);
    }

    if (!gateway || !['razorpay', 'stripe'].includes(gateway)) {
      return createErrorResponse('Invalid payment gateway', 400);
    }

    // Initiate deposit
    const result = await walletService.initiateDeposit({
      userId: user.id,
      amount,
      gateway
    });

    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to initiate deposit', 400);
    }

    return createSuccessResponse({
      transactionId: result.transactionId,
      paymentData: result.paymentData
    });

  } catch (error) {
    console.error('Deposit API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/wallet/deposit - Complete deposit after payment
async function completeDepositHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, paymentData } = body;

    if (!transactionId || !paymentData) {
      return createErrorResponse('Missing transaction ID or payment data', 400);
    }

    // Complete deposit
    const result = await walletService.completeDeposit(transactionId, paymentData);

    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to complete deposit', 400);
    }

    return createSuccessResponse({ message: 'Deposit completed successfully' });

  } catch (error) {
    console.error('Complete deposit API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export const POST = withAuthentication(depositHandler);
export const PUT = withAuthentication(completeDepositHandler); 