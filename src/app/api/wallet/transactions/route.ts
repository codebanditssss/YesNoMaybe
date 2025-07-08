import { NextRequest, NextResponse } from 'next/server';
import { withAuthentication, createErrorResponse, createSuccessResponse } from '@/lib/server-utils';
import { walletService } from '@/lib/wallet-service';

// GET /api/wallet/transactions - Get user's wallet transactions
async function transactionsHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get transactions
    const transactions = await walletService.getTransactions(user.id, limit, offset);

    return createSuccessResponse({
      transactions,
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit
      }
    });

  } catch (error) {
    console.error('Transactions API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export const GET = withAuthentication(transactionsHandler); 