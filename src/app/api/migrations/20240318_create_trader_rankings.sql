-- Create enum for achievement tiers
CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  tier achievement_tier NOT NULL,
  icon VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trader rankings table
CREATE TABLE IF NOT EXISTS trader_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  return_percentage DECIMAL(10,2) NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  trade_count INTEGER NOT NULL DEFAULT 0,
  winning_streak INTEGER NOT NULL DEFAULT 0,
  previous_rank INTEGER,
  skill_rating INTEGER NOT NULL DEFAULT 1000,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trader achievements junction table
CREATE TABLE IF NOT EXISTS trader_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES trader_rankings(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  date_awarded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trader_id, achievement_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trader_rankings_total_value ON trader_rankings(total_value DESC);
CREATE INDEX IF NOT EXISTS idx_trader_rankings_return ON trader_rankings(return_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_trader_rankings_timestamp ON trader_rankings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trader_rankings_name ON trader_rankings(name);

-- Create function to update trader rankings
CREATE OR REPLACE FUNCTION update_trader_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update previous rank before inserting new ranking
  UPDATE trader_rankings
  SET previous_rank = (
    SELECT position
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY total_value DESC) as position
      FROM trader_rankings
      WHERE timestamp >= NOW() - INTERVAL '1 day'
    ) r
    WHERE r.id = NEW.id
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating rankings
CREATE TRIGGER trigger_update_trader_rankings
BEFORE INSERT OR UPDATE ON trader_rankings
FOR EACH ROW
EXECUTE FUNCTION update_trader_rankings();

-- Insert some default achievements
INSERT INTO achievements (name, description, tier, icon) VALUES
('First Trade', 'Complete your first trade', 'bronze', 'shopping-bag'),
('Rising Star', 'Achieve 10% return in a day', 'silver', 'trending-up'),
('Golden Trader', 'Maintain 80% win rate for a week', 'gold', 'award'),
('Diamond Hands', 'Hold a winning position for 30 days', 'platinum', 'gem'),
('Century Club', 'Complete 100 trades', 'silver', 'hundred'),
('Perfect Week', 'Win all trades in a week', 'gold', 'target'),
('Market Maker', 'Trade volume exceeds ₹1,000,000', 'platinum', 'landmark'),
('Comeback King', 'Recover from -20% to +10%', 'gold', 'rotate-ccw'),
('Early Bird', 'First trader of the day', 'bronze', 'sunrise'),
('Night Owl', 'Most active evening trader', 'bronze', 'moon');

-- Create view for leaderboard
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
  tr.*,
  json_agg(
    json_build_object(
      'id', a.id,
      'name', a.name,
      'description', a.description,
      'tier', a.tier,
      'icon', a.icon,
      'date_awarded', ta.date_awarded
    )
  ) as achievements
FROM trader_rankings tr
LEFT JOIN trader_achievements ta ON tr.id = ta.trader_id
LEFT JOIN achievements a ON ta.achievement_id = a.id
GROUP BY tr.id;

-- Add RLS policies
ALTER TABLE trader_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_achievements ENABLE ROW LEVEL SECURITY;

-- Trader rankings policies
CREATE POLICY "Public read access to trader rankings"
  ON trader_rankings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can only update their own rankings"
  ON trader_rankings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Achievements policies
CREATE POLICY "Public read access to achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Trader achievements policies
CREATE POLICY "Public read access to trader achievements"
  ON trader_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can only manage their own achievements"
  ON trader_achievements FOR ALL
  TO authenticated
  USING (trader_id IN (
    SELECT id FROM trader_rankings WHERE user_id = auth.uid()
  )); 