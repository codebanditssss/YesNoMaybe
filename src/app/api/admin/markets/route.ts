import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabase';

interface AdminMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'resolved' | 'cancelled' | 'pending';
  created_at: string;
  resolution_date: string | null;
  actual_outcome: string | null;
  is_featured: boolean;
  created_by: string | null;
  total_volume: number;
  total_traders: number;
  total_yes_volume: number;
  total_no_volume: number;
  tags: string[];
}

async function adminMarketsHandler(user: any, supabase: any, request: NextRequest): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const categoryFilter = searchParams.get('category') || 'all';

    const offset = (page - 1) * limit;

    // Build the base query for markets
    let marketQuery = supabaseAdmin
      .from('markets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (search) {
      marketQuery = marketQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      marketQuery = marketQuery.eq('status', statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      marketQuery = marketQuery.eq('category', categoryFilter);
    }

    const { data: markets, error: marketsError, count: totalCount } = await marketQuery;

    if (marketsError) {
      console.error('Error fetching markets:', marketsError);
      return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
    }

    // Transform the data to match AdminMarket interface
    const adminMarkets: AdminMarket[] = (markets || []).map(market => ({
      id: market.id,
      title: market.title,
      description: market.description || '',
      category: market.category || 'general',
      status: market.status || 'pending',
      created_at: market.created_at,
      resolution_date: market.resolution_date,
      actual_outcome: market.actual_outcome,
      is_featured: market.is_featured || false,
      created_by: market.created_by,
      total_volume: (market.total_yes_volume || 0) + (market.total_no_volume || 0),
      total_traders: market.total_traders || 0,
      total_yes_volume: market.total_yes_volume || 0,
      total_no_volume: market.total_no_volume || 0,
      tags: market.tags || []
    }));

    return NextResponse.json({
      markets: adminMarkets,
      total: totalCount || 0,
      page,
      limit,
      totalPages: Math.ceil((totalCount || 0) / limit)
    });

  } catch (error) {
    console.error('Admin markets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch markets' }, 
      { status: 500 }
    );
  }
}

// POST handler for creating new markets
async function createMarketHandler(user: any, supabase: any, request: NextRequest): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { title, description, category, resolution_date, tags, is_featured } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Create the market
    const { data: newMarket, error: createError } = await supabaseAdmin
      .from('markets')
      .insert({
        title: title.trim(),
        description: description.trim(),
        category: category || 'general',
        status: 'active',
        resolution_date: resolution_date || null,
        tags: tags || [],
        is_featured: is_featured || false,
        created_by: user.id,
        total_yes_volume: 0,
        total_no_volume: 0,
        total_traders: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating market:', createError);
      return NextResponse.json({ error: 'Failed to create market' }, { status: 500 });
    }

    // Log the admin action
    console.log(`Admin ${user.email} created market: ${title} (${newMarket.id})`);

    return NextResponse.json({ 
      success: true, 
      market: newMarket,
      message: 'Market created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Create market API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create market' }, 
      { status: 500 }
    );
  }
}

export const GET = withAdminAuthentication(adminMarketsHandler);
export const POST = withAdminAuthentication(createMarketHandler); 