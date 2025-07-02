import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabase';

async function adminUserHandler(
  user: any, 
  supabase: any, 
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { userId } = params;
    
    if (request.method === 'PATCH') {
      const body = await request.json();
      const { action } = body;

      if (!action) {
        return NextResponse.json({ error: 'Action is required' }, { status: 400 });
      }

      // Prevent admins from modifying themselves
      if (userId === user.id) {
        return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 403 });
      }

      // Verify the target user exists
      const { data: targetUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();

      if (userError || !targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      switch (action) {
        case 'suspend':
          // In a real app, you'd have a status field in the database
          // For now, we'll use the verification status as a proxy
          const { error: suspendError } = await supabaseAdmin
            .from('profiles')
            .update({ is_verified: false })
            .eq('id', userId);

          if (suspendError) {
            return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
          }

          // Log the admin action
          console.log(`Admin ${user.email} suspended user ${targetUser.email} (${userId})`);
          
          return NextResponse.json({ 
            success: true, 
            message: `User ${targetUser.email} has been suspended` 
          });

        case 'activate':
          const { error: activateError } = await supabaseAdmin
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', userId);

          if (activateError) {
            return NextResponse.json({ error: 'Failed to activate user' }, { status: 500 });
          }

          console.log(`Admin ${user.email} activated user ${targetUser.email} (${userId})`);
          
          return NextResponse.json({ 
            success: true, 
            message: `User ${targetUser.email} has been activated` 
          });

        case 'edit':
          // For edit actions, you'd typically return user details for a modal/form
          const { data: userDetails, error: detailsError } = await supabaseAdmin
            .from('profiles')
            .select(`
              *,
              user_balances (*)
            `)
            .eq('id', userId)
            .single();

          if (detailsError) {
            return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
          }

          return NextResponse.json({ user: userDetails });

        case 'ban':
          // In a real implementation, you'd have a proper status field
          const { error: banError } = await supabaseAdmin
            .from('profiles')
            .update({ is_verified: false })
            .eq('id', userId);

          if (banError) {
            return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
          }

          console.log(`Admin ${user.email} banned user ${targetUser.email} (${userId})`);
          
          return NextResponse.json({ 
            success: true, 
            message: `User ${targetUser.email} has been banned` 
          });

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    if (request.method === 'GET') {
      // Get detailed user information
      const { data: userDetails, error: detailsError } = await supabaseAdmin
        .from('profiles')
        .select(`
          *,
          user_balances (*)
        `)
        .eq('id', userId)
        .single();

      if (detailsError || !userDetails) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Get user's trading history summary
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('id, status, created_at, filled_quantity, price, side')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: trades, error: tradesError } = await supabaseAdmin
        .from('trades')
        .select('id, created_at, quantity, price')
        .or(`yes_user_id.eq.${userId},no_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        user: userDetails,
        recentOrders: orders || [],
        recentTrades: trades || []
      });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

  } catch (error) {
    console.error('Admin user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

export const GET = withAdminAuthentication(adminUserHandler);
export const PATCH = withAdminAuthentication(adminUserHandler); 