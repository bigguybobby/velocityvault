import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, PortfolioState } from '../types/index.js';
import {
  getUser,
  getAgentState,
  getActiveMandate,
  getLatestPnL,
} from '../services/supabase.js';
import { getVelocityPnL, getENSConfigFromEnv } from '../services/ens.js';

export async function stateRoutes(fastify: FastifyInstance) {
  /**
   * GET /state/:address
   * Get full portfolio state for a user
   */
  fastify.get<{ Params: { address: string }; Querystring: { includeEns?: string } }>(
    '/state/:address',
    async (
      request: FastifyRequest<{
        Params: { address: string };
        Querystring: { includeEns?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { address } = request.params;
        const includeEns = request.query.includeEns === 'true';

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        // Get user data
        const user = await getUser(address);
        if (!user) {
          return reply.status(404).send({
            success: false,
            error: 'User not found',
          } satisfies ApiResponse<never>);
        }

        // Get related data in parallel
        const [agentState, mandate, latestPnL] = await Promise.all([
          getAgentState(address),
          getActiveMandate(address),
          getLatestPnL(address),
        ]);

        const portfolioState: PortfolioState = {
          user,
          agentState,
          mandate,
          currentPnl: latestPnL?.pnl || agentState?.totalPnl || '0',
          positions: agentState?.currentPositions || {},
        };

        // Optionally include ENS data if user has an ENS name
        let ensData = null;
        if (includeEns && user.ensName) {
          try {
            const ensConfig = getENSConfigFromEnv();
            ensData = await getVelocityPnL(user.ensName, ensConfig);
          } catch (error) {
            fastify.log.warn({ error, ensName: user.ensName }, 'Failed to fetch ENS data');
          }
        }

        return reply.send({
          success: true,
          data: {
            ...portfolioState,
            ensData,
          },
        } satisfies ApiResponse<PortfolioState & { ensData: typeof ensData }>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get state');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /state/:address/positions
   * Get current positions for a user
   */
  fastify.get<{ Params: { address: string } }>(
    '/state/:address/positions',
    async (request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        const agentState = await getAgentState(address);

        return reply.send({
          success: true,
          data: {
            positions: agentState?.currentPositions || {},
            totalPnl: agentState?.totalPnl || '0',
            isRunning: agentState?.isRunning || false,
          },
        } satisfies ApiResponse<{
          positions: Record<string, string>;
          totalPnl: string;
          isRunning: boolean;
        }>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get positions');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /state/:address/pnl
   * Get current PnL summary for a user
   */
  fastify.get<{ Params: { address: string } }>(
    '/state/:address/pnl',
    async (request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        const [agentState, latestPnL] = await Promise.all([
          getAgentState(address),
          getLatestPnL(address),
        ]);

        return reply.send({
          success: true,
          data: {
            currentPnl: latestPnL?.pnl || agentState?.totalPnl || '0',
            pnlPercent: latestPnL?.pnlPercent || 0,
            lastSnapshot: latestPnL?.snapshotAt || null,
            ensUpdated: latestPnL?.ensUpdated || false,
          },
        } satisfies ApiResponse<{
          currentPnl: string;
          pnlPercent: number;
          lastSnapshot: string | null;
          ensUpdated: boolean;
        }>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get PnL');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );
}
