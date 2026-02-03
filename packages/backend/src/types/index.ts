import { z } from 'zod';

// ============ User & Mandate Types ============

export const MandateSchema = z.object({
  id: z.string().uuid().optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  yellowSessionId: z.string(),
  maxTradeSize: z.string(), // BigInt as string
  allowedPairs: z.array(z.string()),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
  expiresAt: z.string().datetime(),
  signature: z.string(),
  createdAt: z.string().datetime().optional(),
});

export type Mandate = z.infer<typeof MandateSchema>;

export const UserSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  ensName: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

// ============ Agent State Types ============

export const AgentStateSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  isRunning: z.boolean(),
  strategy: z.enum(['momentum', 'mean-reversion', 'arbitrage', 'custom']).optional(),
  currentPositions: z.record(z.string(), z.string()).optional(), // token -> amount
  totalPnl: z.string().optional(), // BigInt as string
  lastUpdated: z.string().datetime().optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

// ============ Intent Types ============

export const IntentSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  action: z.enum(['start', 'stop']),
  strategy: z.enum(['momentum', 'mean-reversion', 'arbitrage', 'custom']).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
});

export type Intent = z.infer<typeof IntentSchema>;

// ============ Execution Log Types ============

export const ExecutionLogSchema = z.object({
  id: z.string().uuid().optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  action: z.string(),
  pair: z.string().optional(),
  side: z.enum(['buy', 'sell']).optional(),
  amount: z.string().optional(),
  price: z.string().optional(),
  txHash: z.string().optional(),
  status: z.enum(['pending', 'executed', 'failed', 'cancelled']),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type ExecutionLog = z.infer<typeof ExecutionLogSchema>;

// ============ PnL History Types ============

export const PnLHistorySchema = z.object({
  id: z.string().uuid().optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  pnl: z.string(), // BigInt as string (can be negative)
  pnlPercent: z.number(),
  snapshotAt: z.string().datetime(),
  ensUpdated: z.boolean().optional(),
});

export type PnLHistory = z.infer<typeof PnLHistorySchema>;

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PortfolioState {
  user: User;
  agentState: AgentState | null;
  mandate: Mandate | null;
  currentPnl: string;
  positions: Record<string, string>;
}

export interface ActivityFeed {
  logs: ExecutionLog[];
  pnlHistory: PnLHistory[];
  totalTrades: number;
  successRate: number;
}
