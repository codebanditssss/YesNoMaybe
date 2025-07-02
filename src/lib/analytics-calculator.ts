/**
 * Analytics Calculator Utility
 * Calculates advanced trading metrics like win streaks, badges, etc.
 */

export interface TradeForAnalytics {
  id: string
  pnl: number
  status: 'filled' | 'open' | 'cancelled'
  marketStatus: 'active' | 'resolved'
  timestamp: string | Date
  volume: number
  side: 'YES' | 'NO'
  marketCategory: string
}

export interface WinStreakResult {
  currentStreak: number
  longestStreak: number
  streakType: 'winning' | 'losing' | 'none'
  streakTrades: TradeForAnalytics[]
}

export interface BadgeEligibility {
  name: string
  description: string
  earned: boolean
  progress: number
  requirement: number
  category: 'trading' | 'achievement' | 'milestone'
  icon: string
}

export interface AdvancedMetrics {
  winStreak: WinStreakResult
  badges: BadgeEligibility[]
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  recoveryFactor: number
  consistency: number
  categoryPerformance: Record<string, { wins: number; total: number; pnl: number }>
}

export class AnalyticsCalculator {
  
  /**
   * Calculate current and longest win streaks
   */
  static calculateWinStreak(trades: TradeForAnalytics[]): WinStreakResult {
    // Filter to only resolved, filled trades and sort by timestamp
    const resolvedTrades = trades
      .filter(trade => trade.status === 'filled' && trade.marketStatus === 'resolved')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    if (resolvedTrades.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakType: 'none',
        streakTrades: []
      }
    }

    let currentStreak = 0
    let longestStreak = 0
    let currentStreakType: 'winning' | 'losing' | 'none' = 'none'
    let tempStreak = 0
    let tempStreakType: 'winning' | 'losing' | 'none' = 'none'
    let streakTrades: TradeForAnalytics[] = []

    // Calculate streaks
    for (let i = resolvedTrades.length - 1; i >= 0; i--) {
      const trade = resolvedTrades[i]
      const isWin = trade.pnl > 0

      if (i === resolvedTrades.length - 1) {
        // Start with the most recent trade
        currentStreakType = isWin ? 'winning' : 'losing'
        currentStreak = 1
        tempStreakType = currentStreakType
        tempStreak = 1
        streakTrades = [trade]
      } else {
        const expectedWin: boolean = currentStreakType === 'winning'
        
        if (isWin === expectedWin) {
          // Streak continues
          currentStreak++
          streakTrades.unshift(trade)
        } else {
          // Streak breaks - update longest if needed
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak
          }
          // Start new streak
          currentStreakType = isWin ? 'winning' : 'losing'
          currentStreak = 1
          streakTrades = [trade]
        }
        
        // Also track temporary streaks for longest calculation
        if (isWin === (tempStreakType === 'winning')) {
          tempStreak++
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          tempStreakType = isWin ? 'winning' : 'losing'
          tempStreak = 1
        }
      }
    }

    // Final check for longest streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak
    }

    return {
      currentStreak,
      longestStreak,
      streakType: currentStreakType,
      streakTrades
    }
  }

  /**
   * Calculate badge eligibility and progress
   */
  static calculateBadges(
    trades: TradeForAnalytics[], 
    winStreak: WinStreakResult,
    totalVolume: number,
    winRate: number
  ): BadgeEligibility[] {
    const resolvedTrades = trades.filter(t => t.status === 'filled' && t.marketStatus === 'resolved')
    const winningTrades = resolvedTrades.filter(t => t.pnl > 0)
    
    const badges: BadgeEligibility[] = [
      // Trading Volume Badges
      {
        name: "First Trade",
        description: "Complete your first trade",
        earned: trades.length > 0,
        progress: Math.min(trades.length, 1),
        requirement: 1,
        category: "milestone",
        icon: "Play"
      },
      {
        name: "Active Trader",
        description: "Complete 10 trades",
        earned: trades.length >= 10,
        progress: Math.min(trades.length, 10),
        requirement: 10,
        category: "trading",
        icon: "Activity"
      },
      {
        name: "Volume King",
        description: "Trade ₹10,000 total volume",
        earned: totalVolume >= 10000,
        progress: Math.min(totalVolume, 10000),
        requirement: 10000,
        category: "trading",
        icon: "TrendingUp"
      },
      
      // Win Streak Badges
      {
        name: "Hot Streak",
        description: "Win 3 trades in a row",
        earned: winStreak.longestStreak >= 3 && winStreak.streakType === 'winning',
        progress: winStreak.streakType === 'winning' ? Math.min(winStreak.currentStreak, 3) : 0,
        requirement: 3,
        category: "achievement",
        icon: "Zap"
      },
      {
        name: "Streak Master",
        description: "Win 5 trades in a row",
        earned: winStreak.longestStreak >= 5 && winStreak.streakType === 'winning',
        progress: winStreak.streakType === 'winning' ? Math.min(winStreak.currentStreak, 5) : 0,
        requirement: 5,
        category: "achievement",
        icon: "Crown"
      },
      
      // Performance Badges
      {
        name: "Profitable",
        description: "Achieve 60% win rate with 10+ trades",
        earned: winRate >= 60 && resolvedTrades.length >= 10,
        progress: resolvedTrades.length >= 10 ? Math.min(winRate, 60) : 0,
        requirement: 60,
        category: "achievement",
        icon: "Target"
      },
      {
        name: "Consistent Winner",
        description: "Win 20 trades total",
        earned: winningTrades.length >= 20,
        progress: Math.min(winningTrades.length, 20),
        requirement: 20,
        category: "achievement",
        icon: "Award"
      }
    ]

    return badges
  }

  /**
   * Calculate advanced performance metrics
   */
  static calculateAdvancedMetrics(trades: TradeForAnalytics[]): AdvancedMetrics {
    const resolvedTrades = trades.filter(t => t.status === 'filled' && t.marketStatus === 'resolved')
    
    if (resolvedTrades.length === 0) {
      return {
        winStreak: this.calculateWinStreak(trades),
        badges: this.calculateBadges(trades, { currentStreak: 0, longestStreak: 0, streakType: 'none', streakTrades: [] }, 0, 0),
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        recoveryFactor: 0,
        consistency: 0,
        categoryPerformance: {}
      }
    }

    const winStreak = this.calculateWinStreak(trades)
    const totalVolume = trades.reduce((sum, t) => sum + t.volume, 0)
    const winRate = (resolvedTrades.filter(t => t.pnl > 0).length / resolvedTrades.length) * 100
    const badges = this.calculateBadges(trades, winStreak, totalVolume, winRate)

    // Calculate profit factor
    const totalWins = resolvedTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(resolvedTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 1

    // Calculate Sharpe ratio (simplified)
    const returns = resolvedTrades.map(t => t.pnl)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0

    // Calculate max drawdown
    let runningPnL = 0
    let peak = 0
    let maxDrawdown = 0
    
    resolvedTrades.forEach(trade => {
      runningPnL += trade.pnl
      if (runningPnL > peak) peak = runningPnL
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })

    // Recovery factor
    const totalPnL = resolvedTrades.reduce((sum, t) => sum + t.pnl, 0)
    const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : 0

    // Consistency (percentage of positive trades)
    const consistency = winRate

    // Category performance
    const categoryPerformance: Record<string, { wins: number; total: number; pnl: number }> = {}
    resolvedTrades.forEach(trade => {
      const category = trade.marketCategory || 'other'
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { wins: 0, total: 0, pnl: 0 }
      }
      categoryPerformance[category].total++
      categoryPerformance[category].pnl += trade.pnl
      if (trade.pnl > 0) categoryPerformance[category].wins++
    })

    return {
      winStreak,
      badges,
      profitFactor: Math.round(profitFactor * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      recoveryFactor: Math.round(recoveryFactor * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      categoryPerformance
    }
  }

  /**
   * Format performance metrics for display
   */
  static formatMetric(value: number, type: 'currency' | 'percent' | 'number' | 'ratio'): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', { 
          style: 'currency', 
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value)
      
      case 'percent':
        return `${value.toFixed(1)}%`
      
      case 'ratio':
        return value.toFixed(2)
      
      case 'number':
      default:
        return value.toLocaleString()
    }
  }
} 