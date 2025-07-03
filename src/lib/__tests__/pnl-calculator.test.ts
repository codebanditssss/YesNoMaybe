import { PnLCalculator, TradePosition } from '../pnl-calculator';

describe('PnLCalculator', () => {
  
  describe('Position P&L Calculations', () => {
    test('should calculate unrealized P&L for active position correctly', () => {
      const position: TradePosition = {
        marketId: 'market-1',
        side: 'YES',
        quantity: 100,
        avgPrice: 45,
        totalCost: 45, // (45 * 100) / 100
        marketStatus: 'active',
        currentMarketPrice: 65,
        lastTradePrice: 60
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      expect(result.unrealizedPnL).toBe(20); // (65 * 100) / 100 - 45 = 65 - 45 = 20
      expect(result.realizedPnL).toBe(0);
      expect(result.totalPnL).toBe(20);
      expect(result.pnlPercent).toBeCloseTo(44.44, 2); // (20 / 45) * 100
      expect(result.currentValue).toBe(65);
      expect(result.type).toBe('unrealized');
    });

    test('should calculate realized P&L for resolved position (WIN)', () => {
      const position: TradePosition = {
        marketId: 'market-2',
        side: 'YES',
        quantity: 200,
        avgPrice: 30,
        totalCost: 60, // (30 * 200) / 100
        marketStatus: 'resolved',
        marketOutcome: 'YES'
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      expect(result.realizedPnL).toBe(140); // 200 - 60 = 140 (full payout - cost)
      expect(result.unrealizedPnL).toBe(0);
      expect(result.totalPnL).toBe(140);
      expect(result.pnlPercent).toBeCloseTo(233.33, 2); // (140 / 60) * 100
      expect(result.currentValue).toBe(200);
      expect(result.type).toBe('realized');
    });

    test('should calculate realized P&L for resolved position (LOSS)', () => {
      const position: TradePosition = {
        marketId: 'market-3',
        side: 'YES',
        quantity: 75,
        avgPrice: 80,
        totalCost: 60, // (80 * 75) / 100
        marketStatus: 'resolved',
        marketOutcome: 'NO'
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      expect(result.realizedPnL).toBe(-60); // 0 - 60 = -60 (total loss)
      expect(result.unrealizedPnL).toBe(0);
      expect(result.totalPnL).toBe(-60);
      expect(result.pnlPercent).toBe(-100); // Complete loss
      expect(result.currentValue).toBe(0);
      expect(result.type).toBe('realized');
    });

    test('should handle NO side positions correctly', () => {
      const position: TradePosition = {
        marketId: 'market-4',
        side: 'NO',
        quantity: 50,
        avgPrice: 70,
        totalCost: 35, // (70 * 50) / 100
        marketStatus: 'active',
        currentMarketPrice: 55, // YES price, so NO price is 100-55=45
        lastTradePrice: 60
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      // For NO positions: currentValue = ((100 - currentYesPrice) * quantity) / 100
      // = ((100 - 55) * 50) / 100 = (45 * 50) / 100 = 22.5
      expect(result.currentValue).toBe(22.5);
      expect(result.unrealizedPnL).toBe(-12.5); // 22.5 - 35 = -12.5
      expect(result.pnlPercent).toBeCloseTo(-35.71, 2);
    });
  });

  describe('Portfolio P&L Calculations', () => {
    test('should calculate portfolio summary correctly', () => {
      const positions: TradePosition[] = [
        {
          marketId: 'market-1',
          side: 'YES',
          quantity: 100,
          avgPrice: 45,
          totalCost: 45,
          marketStatus: 'active',
          currentMarketPrice: 65
        },
        {
          marketId: 'market-2',
          side: 'YES',
          quantity: 200,
          avgPrice: 30,
          totalCost: 60,
          marketStatus: 'resolved',
          marketOutcome: 'YES'
        },
        {
          marketId: 'market-3',
          side: 'YES',
          quantity: 75,
          avgPrice: 80,
          totalCost: 60,
          marketStatus: 'resolved',
          marketOutcome: 'NO'
        }
      ];

      const result = PnLCalculator.calculatePortfolioPnL(positions);

      expect(result.totalInvested).toBe(165); // 45 + 60 + 60
      expect(result.totalCurrentValue).toBe(265); // 65 + 200 + 0
      expect(result.totalUnrealizedPnL).toBe(20); // From active position
      expect(result.totalRealizedPnL).toBe(80); // 140 - 60 (wins - losses)
      expect(result.totalPnL).toBe(100); // 20 + 80
      expect(result.overallPnLPercent).toBeCloseTo(60.61, 2); // (100 / 165) * 100
    });
  });

  describe('Trade P&L Calculations', () => {
    test('should calculate P&L for resolved winning trade', () => {
      const trade = {
        side: 'YES' as const,
        quantity: 100,
        filledQuantity: 100,
        price: 45,
        marketStatus: 'resolved' as const,
        marketOutcome: 'YES' as const,
        status: 'filled' as const
      };

      const result = PnLCalculator.calculateTradePnL(trade);

      expect(result.pnl).toBe(55); // 100 - 45 = 55
      expect(result.pnlPercent).toBeCloseTo(122.22, 2); // (55 / 45) * 100
      expect(result.type).toBe('realized');
    });

    test('should calculate P&L for resolved losing trade', () => {
      const trade = {
        side: 'NO' as const,
        quantity: 50,
        filledQuantity: 50,
        price: 70,
        marketStatus: 'resolved' as const,
        marketOutcome: 'YES' as const, // NO lost
        status: 'filled' as const
      };

      const result = PnLCalculator.calculateTradePnL(trade);

      expect(result.pnl).toBe(-35); // 0 - 35 = -35 (total loss)
      expect(result.pnlPercent).toBe(-100);
      expect(result.type).toBe('realized');
    });

    test('should return no P&L for active trade', () => {
      const trade = {
        side: 'YES' as const,
        quantity: 75,
        filledQuantity: 75,
        price: 60,
        marketStatus: 'active' as const,
        status: 'filled' as const
      };

      const result = PnLCalculator.calculateTradePnL(trade);

      expect(result.pnl).toBe(0);
      expect(result.pnlPercent).toBe(0);
      expect(result.type).toBe('none');
    });

    test('should return no P&L for cancelled trade', () => {
      const trade = {
        side: 'YES' as const,
        quantity: 100,
        filledQuantity: 0,
        price: 50,
        marketStatus: 'active' as const,
        status: 'cancelled' as const
      };

      const result = PnLCalculator.calculateTradePnL(trade);

      expect(result.pnl).toBe(0);
      expect(result.pnlPercent).toBe(0);
      expect(result.type).toBe('none');
    });
  });

  describe('Daily Change Calculations', () => {
    test('should calculate positive daily change', () => {
      const result = PnLCalculator.calculateDailyChange(250, 200);

      expect(result.currentValue).toBe(250);
      expect(result.previousValue).toBe(200);
      expect(result.absoluteChange).toBe(50);
      expect(result.percentChange).toBe(25);
    });

    test('should calculate negative daily change', () => {
      const result = PnLCalculator.calculateDailyChange(150, 200);

      expect(result.currentValue).toBe(150);
      expect(result.previousValue).toBe(200);
      expect(result.absoluteChange).toBe(-50);
      expect(result.percentChange).toBe(-25);
    });

    test('should handle zero previous value', () => {
      const result = PnLCalculator.calculateDailyChange(100, 0);

      expect(result.currentValue).toBe(100);
      expect(result.previousValue).toBe(0);
      expect(result.absoluteChange).toBe(100);
      expect(result.percentChange).toBe(0); // Avoid division by zero
    });
  });

  describe('Utility Functions', () => {
    test('should format P&L correctly', () => {
      expect(PnLCalculator.formatPnL(25.5)).toBe('+₹25.50');
      expect(PnLCalculator.formatPnL(-15.25)).toBe('-₹15.25');
      expect(PnLCalculator.formatPnL(0)).toBe('₹0.00');
    });

    test('should format percentages correctly', () => {
      expect(PnLCalculator.formatPercent(25.555)).toBe('+25.56%');
      expect(PnLCalculator.formatPercent(-15.123)).toBe('-15.12%');
      expect(PnLCalculator.formatPercent(0)).toBe('0.00%');
    });

    test('should calculate execution time correctly', () => {
      const orderTime = new Date('2025-01-27T10:30:00Z');
      const fillTime = new Date('2025-01-27T10:30:15Z');
      
      const execTime = PnLCalculator.calculateExecutionTime(orderTime, fillTime);
      expect(execTime).toBe(15);
    });

    test('should handle negative execution time', () => {
      const orderTime = new Date('2025-01-27T10:30:15Z');
      const fillTime = new Date('2025-01-27T10:30:00Z');
      
      const execTime = PnLCalculator.calculateExecutionTime(orderTime, fillTime);
      expect(execTime).toBe(0); // Should not return negative
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined market prices', () => {
      const position: TradePosition = {
        marketId: 'market-1',
        side: 'YES',
        quantity: 100,
        avgPrice: 45,
        totalCost: 45,
        marketStatus: 'active'
        // No currentMarketPrice or lastTradePrice
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      // Should use avgPrice as fallback
      expect(result.currentValue).toBe(45);
      expect(result.unrealizedPnL).toBe(0);
    });

    test('should handle zero quantity positions', () => {
      const position: TradePosition = {
        marketId: 'market-1',
        side: 'YES',
        quantity: 0,
        avgPrice: 45,
        totalCost: 0,
        marketStatus: 'active',
        currentMarketPrice: 65
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      expect(result.currentValue).toBe(0);
      expect(result.unrealizedPnL).toBe(0);
      expect(result.pnlPercent).toBe(0);
    });

    test('should handle very small amounts correctly', () => {
      const position: TradePosition = {
        marketId: 'market-1',
        side: 'YES',
        quantity: 1,
        avgPrice: 1,
        totalCost: 0.01,
        marketStatus: 'active',
        currentMarketPrice: 2
      };

      const result = PnLCalculator.calculatePositionPnL(position);

      expect(result.currentValue).toBe(0.02);
      expect(result.unrealizedPnL).toBe(0.01);
      expect(result.pnlPercent).toBe(100);
    });
  });
}); 