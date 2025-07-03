import { createClient } from './supabase';

interface TraderStats {
  userId: string;
  totalValue: number;
  returnPercentage: number;
  winRate: number;
  tradeCount: number;
  winningStreak: number;
  longestHoldingPeriod: number;
  maxDrawdown: number;
  recoveryFromDrawdown: number;
  dailyTradeTime: string;
  tradingVolume: number;
}

export class AchievementService {
  private supabase = createClient();

  async checkAndAwardAchievements(stats: TraderStats) {
    try {
      // Get all achievements
      const { data: achievements, error: achievementsError } = await this.supabase
        .from('achievements')
        .select('*');

      if (achievementsError) throw achievementsError;

      // Get trader's current achievements
      const { data: currentAchievements, error: currentError } = await this.supabase
        .from('trader_achievements')
        .select('achievement_id')
        .eq('trader_id', stats.userId);

      if (currentError) throw currentError;

      const earnedAchievementIds = new Set(currentAchievements.map(a => a.achievement_id));
      const newAchievements = [];

      // Check each achievement condition
      for (const achievement of achievements) {
        if (earnedAchievementIds.has(achievement.id)) continue;

        const earned = await this.checkAchievementCondition(achievement, stats);
        if (earned) {
          newAchievements.push({
            trader_id: stats.userId,
            achievement_id: achievement.id,
            date_awarded: new Date().toISOString()
          });
        }
      }

      // Award new achievements
      if (newAchievements.length > 0) {
        const { error: insertError } = await this.supabase
          .from('trader_achievements')
          .insert(newAchievements);

        if (insertError) throw insertError;
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  private async checkAchievementCondition(achievement: any, stats: TraderStats): Promise<boolean> {
    switch (achievement.name) {
      case 'First Trade':
        return stats.tradeCount === 1;

      case 'Rising Star':
        return stats.returnPercentage >= 10;

      case 'Golden Trader':
        return stats.winRate >= 80 && stats.tradeCount >= 10;

      case 'Diamond Hands':
        return stats.longestHoldingPeriod >= 30;

      case 'Century Club':
        return stats.tradeCount >= 100;

      case 'Perfect Week':
        return stats.winningStreak >= 5;

      case 'Market Maker':
        return stats.tradingVolume >= 1000000;

      case 'Comeback King':
        return stats.maxDrawdown <= -20 && stats.recoveryFromDrawdown >= 10;

      case 'Early Bird':
        return this.isEarlyBirdTrader(stats.dailyTradeTime);

      case 'Night Owl':
        return this.isNightOwlTrader(stats.dailyTradeTime);

      default:
        return false;
    }
  }

  private isEarlyBirdTrader(tradeTime: string): boolean {
    const hour = parseInt(tradeTime.split(':')[0]);
    return hour >= 6 && hour <= 8;
  }

  private isNightOwlTrader(tradeTime: string): boolean {
    const hour = parseInt(tradeTime.split(':')[0]);
    return hour >= 20 || hour <= 2;
  }

  async calculateSkillRating(traderId: string): Promise<number> {
    try {
      // Get trader's history
      const { data: history, error: historyError } = await this.supabase
        .from('trade_history')
        .select('*')
        .eq('trader_id', traderId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (historyError) throw historyError;

      if (!history || history.length === 0) return 1000; // Default rating

      // Calculate skill rating based on:
      // 1. Win rate consistency
      // 2. Risk management (position sizing)
      // 3. Profit factor
      // 4. Average holding time
      // 5. Success in different market conditions

      let rating = 1000;
      const winRate = history.filter(trade => trade.pnl > 0).length / history.length;
      const avgPositionSize = history.reduce((acc, trade) => acc + trade.position_size, 0) / history.length;
      const profitFactor = this.calculateProfitFactor(history);
      
      // Adjust rating based on factors
      rating += winRate * 200; // Up to 200 points for win rate
      rating += Math.min(avgPositionSize / 10000, 100); // Up to 100 points for position sizing
      rating += profitFactor * 100; // Up to 300 points for profit factor
      
      // Normalize rating between 0 and 2000
      rating = Math.max(0, Math.min(2000, rating));

      return Math.round(rating);
    } catch (error) {
      console.error('Error calculating skill rating:', error);
      return 1000; // Default rating on error
    }
  }

  private calculateProfitFactor(trades: any[]): number {
    const profits = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const losses = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    return losses === 0 ? profits : profits / losses;
  }
} 