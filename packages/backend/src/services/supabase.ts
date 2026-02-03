import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  User,
  Mandate,
  AgentState,
  ExecutionLog,
  PnLHistory,
} from '../types/index.js';

// Database row types (snake_case matching Supabase)
interface DbUser {
  address: string;
  ens_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface DbMandate {
  id?: string;
  user_address: string;
  yellow_session_id: string;
  max_trade_size: string;
  allowed_pairs: string[];
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  expires_at: string;
  signature: string;
  created_at?: string;
}

interface DbAgentState {
  user_address: string;
  is_running: boolean;
  strategy?: 'momentum' | 'mean-reversion' | 'arbitrage' | 'custom';
  current_positions?: Record<string, string>;
  total_pnl?: string;
  last_updated?: string;
}

interface DbExecutionLog {
  id?: string;
  user_address: string;
  action: string;
  pair?: string;
  side?: 'buy' | 'sell';
  amount?: string;
  price?: string;
  tx_hash?: string;
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
  error?: string;
  timestamp?: string;
}

interface DbPnLHistory {
  id?: string;
  user_address: string;
  pnl: string;
  pnl_percent: number;
  snapshot_at: string;
  ens_updated?: boolean;
}

// Converters: DB <-> App
function toUser(db: DbUser): User {
  return {
    address: db.address,
    ensName: db.ens_name,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function toMandate(db: DbMandate): Mandate {
  return {
    id: db.id,
    userAddress: db.user_address,
    yellowSessionId: db.yellow_session_id,
    maxTradeSize: db.max_trade_size,
    allowedPairs: db.allowed_pairs,
    riskLevel: db.risk_level,
    expiresAt: db.expires_at,
    signature: db.signature,
    createdAt: db.created_at,
  };
}

function toAgentState(db: DbAgentState): AgentState {
  return {
    userAddress: db.user_address,
    isRunning: db.is_running,
    strategy: db.strategy,
    currentPositions: db.current_positions,
    totalPnl: db.total_pnl,
    lastUpdated: db.last_updated,
  };
}

function toExecutionLog(db: DbExecutionLog): ExecutionLog {
  return {
    id: db.id,
    userAddress: db.user_address,
    action: db.action,
    pair: db.pair,
    side: db.side,
    amount: db.amount,
    price: db.price,
    txHash: db.tx_hash,
    status: db.status,
    error: db.error,
    timestamp: db.timestamp,
  };
}

function toPnLHistory(db: DbPnLHistory): PnLHistory {
  return {
    id: db.id,
    userAddress: db.user_address,
    pnl: db.pnl,
    pnlPercent: db.pnl_percent,
    snapshotAt: db.snapshot_at,
    ensUpdated: db.ens_updated,
  };
}

// Database types matching Supabase schema
interface Database {
  public: {
    Tables: {
      users: { Row: DbUser; Insert: DbUser; Update: Partial<DbUser> };
      mandates: { Row: DbMandate; Insert: DbMandate; Update: Partial<DbMandate> };
      agent_state: { Row: DbAgentState; Insert: DbAgentState; Update: Partial<DbAgentState> };
      execution_logs: { Row: DbExecutionLog; Insert: DbExecutionLog; Update: Partial<DbExecutionLog> };
      pnl_history: { Row: DbPnLHistory; Insert: DbPnLHistory; Update: Partial<DbPnLHistory> };
    };
  };
}

let supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    }

    supabase = createClient<Database>(url, key);
  }
  return supabase;
}

// ============ User Operations ============

export async function getUser(address: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('address', address.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? toUser(data) : null;
}

export async function upsertUser(user: User): Promise<User> {
  const { data, error } = await getSupabase()
    .from('users')
    .upsert({
      address: user.address.toLowerCase(),
      ens_name: user.ensName,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return toUser(data);
}

// ============ Mandate Operations ============

export async function getActiveMandate(userAddress: string): Promise<Mandate | null> {
  const { data, error } = await getSupabase()
    .from('mandates')
    .select('*')
    .eq('user_address', userAddress.toLowerCase())
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? toMandate(data) : null;
}

export async function createMandate(mandate: Mandate): Promise<Mandate> {
  const { data, error } = await getSupabase()
    .from('mandates')
    .insert({
      user_address: mandate.userAddress.toLowerCase(),
      yellow_session_id: mandate.yellowSessionId,
      max_trade_size: mandate.maxTradeSize,
      allowed_pairs: mandate.allowedPairs,
      risk_level: mandate.riskLevel,
      expires_at: mandate.expiresAt,
      signature: mandate.signature,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return toMandate(data);
}

export async function revokeMandate(userAddress: string): Promise<void> {
  const { error } = await getSupabase()
    .from('mandates')
    .update({ expires_at: new Date().toISOString() })
    .eq('user_address', userAddress.toLowerCase())
    .gt('expires_at', new Date().toISOString());

  if (error) throw error;
}

// ============ Agent State Operations ============

export async function getAgentState(userAddress: string): Promise<AgentState | null> {
  const { data, error } = await getSupabase()
    .from('agent_state')
    .select('*')
    .eq('user_address', userAddress.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? toAgentState(data) : null;
}

export async function upsertAgentState(state: AgentState): Promise<AgentState> {
  const { data, error } = await getSupabase()
    .from('agent_state')
    .upsert({
      user_address: state.userAddress.toLowerCase(),
      is_running: state.isRunning,
      strategy: state.strategy,
      current_positions: state.currentPositions,
      total_pnl: state.totalPnl,
      last_updated: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return toAgentState(data);
}

// ============ Execution Log Operations ============

export async function createExecutionLog(log: ExecutionLog): Promise<ExecutionLog> {
  const { data, error } = await getSupabase()
    .from('execution_logs')
    .insert({
      user_address: log.userAddress.toLowerCase(),
      action: log.action,
      pair: log.pair,
      side: log.side,
      amount: log.amount,
      price: log.price,
      tx_hash: log.txHash,
      status: log.status,
      error: log.error,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return toExecutionLog(data);
}

export async function getExecutionLogs(
  userAddress: string,
  limit = 50,
  offset = 0
): Promise<ExecutionLog[]> {
  const { data, error } = await getSupabase()
    .from('execution_logs')
    .select('*')
    .eq('user_address', userAddress.toLowerCase())
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []).map(toExecutionLog);
}

export async function getLogStats(userAddress: string): Promise<{ total: number; success: number }> {
  const { data, error } = await getSupabase()
    .from('execution_logs')
    .select('status')
    .eq('user_address', userAddress.toLowerCase());

  if (error) throw error;

  const logs = data || [];
  const total = logs.length;
  const success = logs.filter((l) => l.status === 'executed').length;

  return { total, success };
}

// ============ PnL History Operations ============

export async function createPnLSnapshot(pnl: PnLHistory): Promise<PnLHistory> {
  const { data, error } = await getSupabase()
    .from('pnl_history')
    .insert({
      user_address: pnl.userAddress.toLowerCase(),
      pnl: pnl.pnl,
      pnl_percent: pnl.pnlPercent,
      snapshot_at: pnl.snapshotAt,
      ens_updated: pnl.ensUpdated,
    })
    .select()
    .single();

  if (error) throw error;
  return toPnLHistory(data);
}

export async function getPnLHistory(
  userAddress: string,
  limit = 100
): Promise<PnLHistory[]> {
  const { data, error } = await getSupabase()
    .from('pnl_history')
    .select('*')
    .eq('user_address', userAddress.toLowerCase())
    .order('snapshot_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(toPnLHistory);
}

export async function getLatestPnL(userAddress: string): Promise<PnLHistory | null> {
  const { data, error } = await getSupabase()
    .from('pnl_history')
    .select('*')
    .eq('user_address', userAddress.toLowerCase())
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? toPnLHistory(data) : null;
}
