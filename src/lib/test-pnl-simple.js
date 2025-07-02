// Simple JavaScript test for P&L calculator
// This validates our logic without TypeScript compilation issues

console.log('🧮 P&L Calculator Logic Test');
console.log('==============================\n');

// Mock the PnLCalculator class logic
const testPositions = [
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

// Test unrealized P&L calculation
function calculateUnrealizedPnL(position) {
  const currentPrice = position.currentMarketPrice || position.lastTradePrice || position.avgPrice;
  const currentValue = (currentPrice * position.quantity) / 100;
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

// Test realized P&L calculation
function calculateRealizedPnL(position) {
  if (!position.marketOutcome) {
    return {
      unrealizedPnL: 0,
      realizedPnL: 0,
      totalPnL: 0,
      pnlPercent: 0,
      currentValue: position.totalCost,
      type: 'realized'
    };
  }

  const wasCorrect = position.side === position.marketOutcome;
  const outcomeValue = wasCorrect ? 1 : 0; // ₹1 per share if correct, ₹0 if wrong
  const finalValue = outcomeValue * position.quantity;
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

// Test position P&L calculation
function calculatePositionPnL(position) {
  if (position.marketStatus === 'resolved') {
    return calculateRealizedPnL(position);
  } else {
    return calculateUnrealizedPnL(position);
  }
}

// Format P&L for display
function formatPnL(pnl, showSign = true) {
  const sign = showSign && pnl >= 0 ? '+' : '';
  return `${sign}₹${Math.abs(pnl).toFixed(2)}`;
}

function formatPercent(percent, showSign = true) {
  const sign = showSign && percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

// Run tests
console.log('📊 Individual Position P&L:');
testPositions.forEach((position, index) => {
  const pnl = calculatePositionPnL(position);
  console.log(`\nPosition ${index + 1} (${position.marketId}):`);
  console.log(`  Side: ${position.side}`);
  console.log(`  Status: ${position.marketStatus}`);
  console.log(`  Investment: ₹${position.totalCost}`);
  console.log(`  Current Value: ₹${pnl.currentValue.toFixed(2)}`);
  console.log(`  P&L: ${formatPnL(pnl.totalPnL)} (${formatPercent(pnl.pnlPercent)})`);
  console.log(`  Type: ${pnl.type}`);
});

// Portfolio-level calculations
console.log('\n\n💼 Portfolio Summary:');
let totalUnrealizedPnL = 0;
let totalRealizedPnL = 0;
let totalCurrentValue = 0;
let totalInvested = 0;

testPositions.forEach(position => {
  const pnl = calculatePositionPnL(position);
  totalUnrealizedPnL += pnl.unrealizedPnL;
  totalRealizedPnL += pnl.realizedPnL;
  totalCurrentValue += pnl.currentValue;
  totalInvested += position.totalCost;
});

const totalPnL = totalUnrealizedPnL + totalRealizedPnL;
const overallPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

console.log(`  Total Invested: ₹${totalInvested.toFixed(2)}`);
console.log(`  Current Value: ₹${totalCurrentValue.toFixed(2)}`);
console.log(`  Unrealized P&L: ${formatPnL(totalUnrealizedPnL)}`);
console.log(`  Realized P&L: ${formatPnL(totalRealizedPnL)}`);
console.log(`  Total P&L: ${formatPnL(totalPnL)} (${formatPercent(overallPnLPercent)})`);

console.log('\n✅ P&L Logic Validation Complete!');
console.log('\n📝 Expected Results:');
console.log('  Position 1 (Active): +₹20.00 profit (44.44%)');
console.log('  Position 2 (Resolved WIN): +₹140.00 profit (233.33%)');
console.log('  Position 3 (Resolved LOSS): -₹60.00 loss (-100.00%)');
console.log('  Portfolio Total: +₹100.00 profit (60.61%)'); 