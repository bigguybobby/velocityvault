-- VelocityVault Supabase Schema
-- Run this in Supabase SQL editor to create required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ Users Table ============
CREATE TABLE IF NOT EXISTS users (
  address TEXT PRIMARY KEY,
  ens_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ENS lookups
CREATE INDEX IF NOT EXISTS idx_users_ens_name ON users(ens_name);

-- ============ Mandates Table ============
-- Stores Yellow Network trading mandates
CREATE TABLE IF NOT EXISTS mandates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address TEXT NOT NULL REFERENCES users(address),
  yellow_session_id TEXT NOT NULL,
  max_trade_size TEXT NOT NULL, -- BigInt as string
  allowed_pairs TEXT[] NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')),
  expires_at TIMESTAMPTZ NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active mandate lookups
CREATE INDEX IF NOT EXISTS idx_mandates_user_expires 
  ON mandates(user_address, expires_at DESC);

-- ============ Agent State Table ============
-- Stores current state of trading agent per user
CREATE TABLE IF NOT EXISTS agent_state (
  user_address TEXT PRIMARY KEY REFERENCES users(address),
  is_running BOOLEAN DEFAULT FALSE,
  strategy TEXT CHECK (strategy IN ('momentum', 'mean-reversion', 'arbitrage', 'custom')),
  current_positions JSONB DEFAULT '{}',
  total_pnl TEXT DEFAULT '0', -- BigInt as string
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Execution Logs Table ============
-- Stores all agent actions and trades
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address TEXT NOT NULL REFERENCES users(address),
  action TEXT NOT NULL,
  pair TEXT,
  side TEXT CHECK (side IN ('buy', 'sell')),
  amount TEXT,
  price TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  error TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for log queries
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_time 
  ON execution_logs(user_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_status 
  ON execution_logs(user_address, status);

-- ============ PnL History Table ============
-- Stores PnL snapshots for tracking and ENS updates
CREATE TABLE IF NOT EXISTS pnl_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address TEXT NOT NULL REFERENCES users(address),
  pnl TEXT NOT NULL, -- BigInt as string (can be negative)
  pnl_percent DECIMAL(10,4) NOT NULL,
  snapshot_at TIMESTAMPTZ NOT NULL,
  ens_updated BOOLEAN DEFAULT FALSE
);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_pnl_history_user_time 
  ON pnl_history(user_address, snapshot_at DESC);

-- ============ Row Level Security (RLS) ============
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pnl_history ENABLE ROW LEVEL SECURITY;

-- Policies for service role (backend API uses service key)
-- These allow full access for the service role
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON mandates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON agent_state
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON execution_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON pnl_history
  FOR ALL USING (auth.role() = 'service_role');

-- Public read access for portfolio data (for frontend)
CREATE POLICY "Public read access" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON agent_state
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON execution_logs
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON pnl_history
  FOR SELECT USING (true);

-- ============ Functions ============

-- Function to get user's total stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_address TEXT)
RETURNS TABLE (
  total_trades BIGINT,
  successful_trades BIGINT,
  failed_trades BIGINT,
  success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_trades,
    COUNT(*) FILTER (WHERE status = 'executed')::BIGINT as successful_trades,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_trades,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'executed')::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END as success_rate
  FROM execution_logs
  WHERE user_address = LOWER(p_user_address)
    AND action = 'trade';
END;
$$ LANGUAGE plpgsql;

-- ============ Triggers ============

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
