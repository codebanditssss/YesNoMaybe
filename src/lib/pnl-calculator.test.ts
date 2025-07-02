/**
 * P&L Calculator Test/Demo
 * Run this to validate calculations before integration
 */

import { PnLCalculator, TradePosition } from './pnl-calculator';

// Demo positions for testing
const testPositions: TradePosition[] = [
  // Active market - YES position (profitable)
  {
    marketId: 'market-1',
    side: 'YES',
    quantity: 100,
    avgPrice: 45, // Bought at ₹45
    totalCost: 45, // (45 * 100) / 100 = ₹45
    marketStatus: 'active',
    currentMarketPrice: 65, // Current price ₹65 (profit!)
    lastTradePrice: 60
  },

  // Active market - NO position (losing)
  {
    marketId: 'market-2', 
    side: 'NO',
    quantity: 50,
    avgPrice: 70, // Bought NO at ₹70
    totalCost: 35, // (70 * 50) / 100 = ₹35
    marketStatus: 'active',
    currentMarketPrice: 55, // Current price ₹55 (loss)
    lastTradePrice: 60
  },

  // Resolved market - WIN (YES was correct)
  {
    marketId: 'market-3',
    side: 'YES',
    quantity: 200,
    avgPrice: 30, // Bought YES at ₹30
    totalCost: 60, // (30 * 200) / 100 = ₹60
    marketStatus: 'resolved',
    marketOutcome: 'YES' // WON!
  },

  // Resolved market - LOSS (YES was wrong)
  {
    marketId: 'market-4',
    side: 'YES', 
    quantity: 75,
    avgPrice: 80, // Bought YES at ₹80
    totalCost: 60, // (80 * 75) / 100 = ₹60
    marketStatus: 'resolved',
    marketOutcome: 'NO' // LOST
  }
];

// Demo individual trades for trade history P&L
const testTrades = [
  {
    side: 'YES' as const,
    quantity: 100,
    filledQuantity: 100,
    price: 45,
    marketStatus: 'resolved' as const,
    marketOutcome: 'YES' as const,
    status: 'filled' as const
  },
  {
    side: 'NO' as const,
    quantity: 50,
    filledQuantity: 50, 
    price: 70,
    marketStatus: 'resolved' as const,
    marketOutcome: 'YES' as const, // NO lost
    status: 'filled' as const
  },
  {
    side: 'YES' as const,
    quantity: 75,
    filledQuantity: 75,
    price: 60,
    marketStatus: 'active' as const, // Still active - no P&L yet
    status: 'filled' as const
  }
];

function runPnLTests() {
  console.log('🧮 P&L Calculator Demo/Test Results');
  console.log('=====================================\n');

  // Test 1: Individual Position Calculations
  console.log('📊 Individual Position P&L:');
  testPositions.forEach((position, index) => {
    const pnl = PnLCalculator.calculatePositionPnL(position);
    console.log(`\nPosition ${index + 1} (${position.marketId}):`);
    console.log(`  Side: ${position.side}`);
    console.log(`  Status: ${position.marketStatus}`);
    console.log(`  Investment: ₹${position.totalCost}`);
    console.log(`  Current Value: ₹${pnl.currentValue.toFixed(2)}`);
    console.log(`  P&L: ${PnLCalculator.formatPnL(pnl.totalPnL)} (${PnLCalculator.formatPercent(pnl.pnlPercent)})`);
    console.log(`  Type: ${pnl.type}`);
  });

  // Test 2: Portfolio-Level Calculations
  console.log('\n\n💼 Portfolio Summary:');
  const portfolioPnL = PnLCalculator.calculatePortfolioPnL(testPositions);
  console.log(`  Total Invested: ₹${portfolioPnL.totalInvested.toFixed(2)}`);
  console.log(`  Current Value: ₹${portfolioPnL.totalCurrentValue.toFixed(2)}`);
  console.log(`  Unrealized P&L: ${PnLCalculator.formatPnL(portfolioPnL.totalUnrealizedPnL)}`);
  console.log(`  Realized P&L: ${PnLCalculator.formatPnL(portfolioPnL.totalRealizedPnL)}`);
  console.log(`  Total P&L: ${PnLCalculator.formatPnL(portfolioPnL.totalPnL)} (${PnLCalculator.formatPercent(portfolioPnL.overallPnLPercent)})`);

  // Test 3: Trade History P&L
  console.log('\n\n📈 Trade History P&L:');
  testTrades.forEach((trade, index) => {
    const tradePnL = PnLCalculator.calculateTradePnL(trade);
    console.log(`\nTrade ${index + 1}:`);
    console.log(`  ${trade.side} ${trade.filledQuantity} @ ₹${trade.price}`);
    console.log(`  Market: ${trade.marketStatus} ${trade.marketOutcome ? `(outcome: ${trade.marketOutcome})` : ''}`);
    console.log(`  P&L: ${tradePnL.type === 'none' ? 'N/A (active/cancelled)' : PnLCalculator.formatPnL(tradePnL.pnl) + ` (${PnLCalculator.formatPercent(tradePnL.pnlPercent)})`}`);
  });

  // Test 4: Daily Change Calculation
  console.log('\n\n📅 Daily Change Example:');
  const currentValue = portfolioPnL.totalCurrentValue;
  const yesterdayValue = 180; // Example previous day close
  const dailyChange = PnLCalculator.calculateDailyChange(currentValue, yesterdayValue);
  console.log(`  Yesterday Close: ₹${dailyChange.previousValue.toFixed(2)}`);
  console.log(`  Current Value: ₹${dailyChange.currentValue.toFixed(2)}`);
  console.log(`  Daily Change: ${PnLCalculator.formatPnL(dailyChange.absoluteChange)} (${PnLCalculator.formatPercent(dailyChange.percentChange)})`);

  // Test 5: Execution Time Calculation
  console.log('\n\n⏱️ Execution Time Example:');
  const orderTime = new Date('2025-01-27T10:30:00Z');
  const fillTime = new Date('2025-01-27T10:30:15Z');
  const execTime = PnLCalculator.calculateExecutionTime(orderTime, fillTime);
  console.log(`  Order Time: ${orderTime.toISOString()}`);
  console.log(`  Fill Time: ${fillTime.toISOString()}`);
  console.log(`  Execution Time: ${execTime} seconds`);

  console.log('\n✅ All P&L calculations completed!');
  console.log('\nNext step: Integrate into Portfolio.tsx, useTradeHistory.ts, and trade-history/route.ts');
}

// Export for testing
export { runPnLTests };

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runPnLTests();
} 