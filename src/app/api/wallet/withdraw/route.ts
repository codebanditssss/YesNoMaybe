import { NextRequest, NextResponse } from 'next/server';
import { withAuthentication, createErrorResponse, createSuccessResponse } from '@/lib/server-utils';
import { walletService } from '@/lib/wallet-service';

// POST /api/wallet/withdraw - Request withdrawal
async function withdrawHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, method, bankDetails, upiId } = body;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return createErrorResponse('Invalid amount', 400);
    }

    if (!method || !['bank_account', 'upi'].includes(method)) {
      return createErrorResponse('Invalid withdrawal method', 400);
    }

    if (method === 'bank_account') {
      if (!bankDetails?.accountNumber || !bankDetails?.ifsc || !bankDetails?.accountHolderName) {
        return createErrorResponse('Bank details required for bank transfer', 400);
      }
    }

    if (method === 'upi' && !upiId) {
      return createErrorResponse('UPI ID required for UPI transfer', 400);
    }

    // Request withdrawal
    const result = await walletService.requestWithdrawal({
      userId: user.id,
      amount,
      method,
      bankDetails,
      upiId
    });

    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to request withdrawal', 400);
    }

    return createSuccessResponse({
      withdrawalId: result.withdrawalId,
      message: 'Withdrawal request submitted successfully. It will be processed within 1-2 business days.'
    });

  } catch (error) {
    console.error('Withdrawal API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export const POST = withAuthentication(withdrawHandler); 