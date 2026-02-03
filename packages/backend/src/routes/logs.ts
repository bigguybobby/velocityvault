import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, ActivityFeed, ExecutionLog, PnLHistory } from '../types/index.js';
import {
  getExecutionLogs,
  getPnLHistory,
  getLogStats,
} from '../services/supabase.js';

export async function logsRoutes(fastify: FastifyInstance) {
  /**
   * GET /logs/:address
   * Get activity feed (execution logs + PnL history) for a user
   */
  fastify.get<{
    Params: { address: string };
    Querystring: { limit?: string; offset?: string };
  }>(
    '/logs/:address',
    async (
      request: FastifyRequest<{
        Params: { address: string };
        Querystring: { limit?: string; offset?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { address } = request.params;
        const limit = parseInt(request.query.limit || '50', 10);
        const offset = parseInt(request.query.offset || '0', 10);

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        // Fetch all data in parallel
        const [logs, pnlHistory, stats] = await Promise.all([
          getExecutionLogs(address, limit, offset),
          getPnLHistory(address, limit),
          getLogStats(address),
        ]);

        const activityFeed: ActivityFeed = {
          logs,
          pnlHistory,
          totalTrades: stats.total,
          successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
        };

        return reply.send({
          success: true,
          data: activityFeed,
        } satisfies ApiResponse<ActivityFeed>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get logs');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /logs/:address/trades
   * Get only trade execution logs
   */
  fastify.get<{
    Params: { address: string };
    Querystring: { limit?: string; offset?: string; status?: string };
  }>(
    '/logs/:address/trades',
    async (
      request: FastifyRequest<{
        Params: { address: string };
        Querystring: { limit?: string; offset?: string; status?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { address } = request.params;
        const limit = parseInt(request.query.limit || '50', 10);
        const offset = parseInt(request.query.offset || '0', 10);

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        const logs = await getExecutionLogs(address, limit, offset);

        // Filter to only trade actions
        const trades = logs.filter(
          (log) => log.action === 'trade' || log.side !== undefined
        );

        return reply.send({
          success: true,
          data: trades,
        } satisfies ApiResponse<ExecutionLog[]>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get trades');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /logs/:address/pnl-history
   * Get PnL history snapshots
   */
  fastify.get<{
    Params: { address: string };
    Querystring: { limit?: string };
  }>(
    '/logs/:address/pnl-history',
    async (
      request: FastifyRequest<{
        Params: { address: string };
        Querystring: { limit?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { address } = request.params;
        const limit = parseInt(request.query.limit || '100', 10);

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        const pnlHistory = await getPnLHistory(address, limit);

        return reply.send({
          success: true,
          data: pnlHistory,
        } satisfies ApiResponse<PnLHistory[]>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get PnL history');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /logs/:address/stats
   * Get trading statistics
   */
  fastify.get<{ Params: { address: string } }>(
    '/logs/:address/stats',
    async (request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        const stats = await getLogStats(address);

        return reply.send({
          success: true,
          data: {
            totalTrades: stats.total,
            successfulTrades: stats.success,
            failedTrades: stats.total - stats.success,
            successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
          },
        } satisfies ApiResponse<{
          totalTrades: number;
          successfulTrades: number;
          failedTrades: number;
          successRate: number;
        }>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get stats');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );
}
