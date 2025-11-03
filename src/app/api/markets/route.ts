import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    // Build query with filters
    let query = supabase
      .from('markets')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('total_volume', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data: markets, error } = await query;

    if (error) {
      console.error('Error fetching markets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch markets' },
        { status: 500 }
      );
    }

    // Transform database data to match frontend Market interface
    const transformedMarkets = markets?.map(market => {
      // Calculate current market prices based on volume ratio
      const totalVolume = market.total_volume || 0;
      const yesVolume = market.total_yes_volume || 0;
      const noVolume = market.total_no_volume || 0;
      
      // Calculate probability-based prices (simplified)
      let yesPrice = 50; // Default 50/50
      let noPrice = 50;
      
      if (totalVolume > 0) {
        const yesRatio = yesVolume / totalVolume;
        yesPrice = Math.round((yesRatio * 80 + 10) * 10) / 10; // Scale to 10-90 range
        noPrice = Math.round((100 - yesPrice) * 10) / 10;
      }

      // Generate realistic mock data for fields not in database
      const mockPriceChange = (Math.random() - 0.5) * 10; // -5 to +5
      const mockVolume24h = Math.floor(Math.random() * 500000) + 50000;
      
      // Determine if market is trending (high volume or recent activity)
      const isTrending = totalVolume > 10000 || market.is_featured;
      
      // Calculate days until expiry for status
      const now = new Date();
      const expiryDate = market.resolution_date ? new Date(market.resolution_date) : null;
      const daysUntilExpiry = expiryDate 
        ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;
      
      let marketStatus: 'active' | 'closing_soon' | 'resolved' = market.status as any;
      if (market.status === 'active' && daysUntilExpiry <= 7) {
        marketStatus = 'closing_soon';
      }

      return {
        id: market.id,
        title: market.title,
        category: market.category || 'general',
        description: market.description,
        traders: market.total_traders || 0,
        volume: `₹${(totalVolume / 1000).toFixed(1)}K`,
        volume24h: mockVolume24h,
        yesPrice: yesPrice,
        noPrice: noPrice,
        priceChange: mockPriceChange,
        priceChangePercent: mockPriceChange / yesPrice * 100,
        lastUpdate: '1 min ago', // In real app, calculate from updated_at
        trending: isTrending,
        icon: getCategoryIcon(market.category || 'general'),
        status: marketStatus,
        expiryDate: market.resolution_date ? new Date(market.resolution_date) : null,
        totalLiquidity: totalVolume * 1.2, // Estimate liquidity
        marketCap: totalVolume * 1.5, // Estimate market cap
        createdAt: new Date(market.created_at),
        tags: market.tags || [],
        featured: market.is_featured || false,
        riskLevel: calculateRiskLevel(daysUntilExpiry, market.category || 'general'),
        probability: yesPrice
      };
    }) || [];

    return NextResponse.json(transformedMarkets);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get category icon (simplified)
function getCategoryIcon(category: string) {
  const iconMap: Record<string, string> = {
    'crypto': 'Bitcoin',
    'technology': 'Activity',
    'sports': 'Trophy',
    'finance': 'DollarSign',
    'politics': 'Building',
    'entertainment': 'Tv'
  };
  return iconMap[category] || 'Globe';
}

// Helper function to calculate risk level
function calculateRiskLevel(daysUntilExpiry: number, category: string): 'low' | 'medium' | 'high' {
  if (!isFinite(daysUntilExpiry) || daysUntilExpiry === Infinity) return 'low';
  if (daysUntilExpiry <= 30) return 'high';
  if (daysUntilExpiry <= 180) return 'medium';
  return 'low';
} 