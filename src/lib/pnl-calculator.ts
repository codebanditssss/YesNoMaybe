/**
 * P&L Calculator Utility
 * Implements hybrid approach for prediction market P&L calculations
 */

export interface TradePosition {
  marketId: string;
  side: 'YES' | 'NO';
  quantity: number;
  avgPrice: number; // Average price paid per share
  totalCost: number; // Total amount invested
  marketStatus: 'active' | 'resolved';
  marketOutcome?: 'YES' | 'NO' | null; // Only for resolved markets
  currentMarketPrice?: number; // Current best sell price for this side
  lastTradePrice?: number; // Fallback price
}

export interface PnLResult {
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  pnlPercent: number;
  currentValue: number;
  type: 'unrealized' | 'realized';
}

export interface DailyChange {
  absoluteChange: number;
  percentChange: number;
  previousValue: number;
  currentValue: number;
}

export class PnLCalculator {
  
  /**
   * Calculate P&L for a single position using hybrid approach
   */
  static calculatePositionPnL(position: TradePosition): PnLResult {
    if (position.marketStatus === 'resolved') {
      return this.calculateRealizedPnL(position);
    } else {
      return this.calculateUnrealizedPnL(position);
    }
  }

  /**
   * Calculate unrealized P&L for active markets
   * Formula: (Best Market Sell Price - Avg Buy Price) × Quantity
   */
  private static calculateUnrealizedPnL(position: TradePosition): PnLResult {
    // Get current market price (best sell price for this side)
    const currentPrice = position.currentMarketPrice || position.lastTradePrice || position.avgPrice;
    
    // Calculate current value of position
    const currentValue = (currentPrice * position.quantity) / 100;
    
    // Calculate unrealized P&L
    const unrealizedPnL = currentValue - position.totalCost;
    const pnlPercent = position.totalCost > 0 ? (unrealizedPnL / position.totalCost) * 100 : 0;

    return {
      unrealizedPnL,
      realizedPnL: 0,
      totalPnL: unrealizedPnL,
      pnlPercent,
      currentValue,
      type: 'unrealized'
    };
  }

  /**
   * Calculate realized P&L for resolved markets
   * Formula: (Outcome - Cost Basis) × Quantity
   * Where Outcome = ₹1 if correct, ₹0 if wrong
   */
  private static calculateRealizedPnL(position: TradePosition): PnLResult {
    if (!position.marketOutcome) {
      // Market resolved but outcome not set yet
      return {
        unrealizedPnL: 0,
        realizedPnL: 0,
        totalPnL: 0,
        pnlPercent: 0,
        currentValue: position.totalCost,
        type: 'realized'
      };
    }

    // Determine if position was correct
    const wasCorrect = position.side === position.marketOutcome;
    const outcomeValue = wasCorrect ? 1 : 0; // ₹1 per share if correct, ₹0 if wrong
    
    // Calculate final value
    const finalValue = outcomeValue * position.quantity;
    
    // Calculate realized P&L
    const realizedPnL = finalValue - position.totalCost;
    const pnlPercent = position.totalCost > 0 ? (realizedPnL / position.totalCost) * 100 : 0;

    return {
      unrealizedPnL: 0,
      realizedPnL,
      totalPnL: realizedPnL,
      pnlPercent,
      currentValue: finalValue,
      type: 'realized'
    };
  }

  /**
   * Calculate portfolio-level P&L from multiple positions
   */
  static calculatePortfolioPnL(positions: TradePosition[]): {
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    totalPnL: number;
    totalCurrentValue: number;
    totalInvested: number;
    overallPnLPercent: number;
  } {
    let totalUnrealizedPnL = 0;
    let totalRealizedPnL = 0;
    let totalCurrentValue = 0;
    let totalInvested = 0;

    positions.forEach(position => {
      const pnl = this.calculatePositionPnL(position);
      
      totalUnrealizedPnL += pnl.unrealizedPnL;
      totalRealizedPnL += pnl.realizedPnL;
      totalCurrentValue += pnl.currentValue;
      totalInvested += position.totalCost;
    });

    const totalPnL = totalUnrealizedPnL + totalRealizedPnL;
    const overallPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      totalUnrealizedPnL,
      totalRealizedPnL,
      totalPnL,
      totalCurrentValue,
      totalInvested,
      overallPnLPercent
    };
  }

  /**
   * Calculate daily change from previous day close
   * Requires storing daily snapshots at market close (11:59 PM)
   */
  static calculateDailyChange(
    currentValue: number, 
    previousDayCloseValue: number
  ): DailyChange {
    const absoluteChange = currentValue - previousDayCloseValue;
    const percentChange = previousDayCloseValue > 0 
      ? (absoluteChange / previousDayCloseValue) * 100 
      : 0;

    return {
      absoluteChange,
      percentChange,
      previousValue: previousDayCloseValue,
      currentValue
    };
  }

  /**
   * Calculate trade-level realized P&L
   * For trade history - shows P&L per individual trade
   */
  static calculateTradePnL(trade: {
    side: 'YES' | 'NO';
    quantity: number;
    filledQuantity: number;
    price: number;
    marketStatus: 'active' | 'resolved';
    marketOutcome?: 'YES' | 'NO' | null;
    status: 'open' | 'filled' | 'cancelled' | 'partial';
  }): {
    pnl: number;
    pnlPercent: number;
    type: 'none' | 'realized';
  } {
    // Only calculate P&L for filled trades in resolved markets
    if (trade.status === 'open' || trade.status === 'cancelled' || trade.marketStatus !== 'resolved') {
      return { pnl: 0, pnlPercent: 0, type: 'none' };
    }

    if (!trade.marketOutcome) {
      return { pnl: 0, pnlPercent: 0, type: 'none' };
    }

    // Calculate cost basis for filled quantity
    const filledQuantity = trade.filledQuantity || 0;
    const costBasis = (trade.price * filledQuantity) / 100;
    
    // Determine outcome value
    const wasCorrect = trade.side === trade.marketOutcome;
    const outcomeValue = wasCorrect ? filledQuantity : 0; // ₹1 per share if correct
    
    // Calculate P&L
    const pnl = outcomeValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return {
      pnl,
      pnlPercent,
      type: 'realized'
    };
  }

  /**
   * Get best current sell price for a market side
   * This is a placeholder - will integrate with orderbook data
   */
  static getCurrentMarketPrice(
    marketId: string, 
    side: 'YES' | 'NO',
    orderbook?: any,
    fallbackPrice?: number
  ): number | undefined {
    // TODO: Integrate with actual orderbook data
    // For now, return fallback price
    // 
    // Future implementation:
    // const oppositeSide = side === 'YES' ? 'NO' : 'YES';
    // const bestSellPrice = orderbook?.[marketId]?.[oppositeSide]?.[0]?.price;
    // return bestSellPrice || fallbackPrice;
    
    return fallbackPrice;
  }

  /**
   * Calculate execution time for trade history
   */
  static calculateExecutionTime(
    orderCreatedAt: string | Date,
    orderFilledAt: string | Date
  ): number {
    const createdTime = new Date(orderCreatedAt).getTime();
    const filledTime = new Date(orderFilledAt).getTime();
    
    // Return execution time in seconds
    return Math.max(0, (filledTime - createdTime) / 1000);
  }

  /**
   * Utility to format P&L for display
   */
  static formatPnL(pnl: number, showSign: boolean = true): string {
    const sign = showSign && pnl >= 0 ? '+' : '';
    return `${sign}₹${Math.abs(pnl).toFixed(2)}`;
  }

  /**
   * Utility to format percentage for display
   */
  static formatPercent(percent: number, showSign: boolean = true): string {
    const sign = showSign && percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }
} 