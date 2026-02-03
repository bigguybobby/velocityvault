import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '../types/index.js';
import {
  getUser,
  getAgentState,
  getLogStats,
  createPnLSnapshot,
} from '../services/supabase.js';
import {
  updateVelocityPnL,
  getVelocityPnL,
  getENSConfigFromEnv,
} from '../services/ens.js';

export async function ensRoutes(fastify: FastifyInstance) {
  /**
   * POST /ens/:address/update
   * Update ENS text records with current PnL data
   * This is called after trades to update on-chain reputation
   */
  fastify.post<{ Params: { address: string } }>(
    '/ens/:address/update',
    async (request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        // Get user and verify they have an ENS name
        const user = await getUser(address);
        if (!user || !user.ensName) {
          return reply.status(404).send({
            success: false,
            error: 'User not found or no ENS name registered',
          } satisfies ApiResponse<never>);
        }

        // Get current agent state and stats
        const [agentState, stats] = await Promise.all([
          getAgentState(address),
          getLogStats(address),
        ]);

        const pnl = agentState?.totalPnl || '0';
        const pnlValue = parseFloat(pnl);
        const initialValue = 10000; // Assume $10k starting capital for percent calc
        const pnlPercent = (pnlValue / initialValue) * 100;
        const winRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;

        // Update ENS records
        const ensConfig = getENSConfigFromEnv();
        const txHashes = await updateVelocityPnL(
          user.ensName,
          {
            pnl,
            pnlPercent,
            totalTrades: stats.total,
            winRate,
            agentStatus: agentState?.isRunning ? 'running' : 'stopped',
          },
          ensConfig
        );

        // Create PnL snapshot marking ENS as updated
        await createPnLSnapshot({
          userAddress: address,
          pnl,
          pnlPercent,
          snapshotAt: new Date().toISOString(),
          ensUpdated: true,
        });

        fastify.log.info(
          { address, ensName: user.ensName, txCount: txHashes.length },
          'ENS records updated'
        );

        return reply.send({
          success: true,
          data: {
            ensName: user.ensName,
            txHashes,
            updatedFields: {
              pnl,
              pnlPercent,
              totalTrades: stats.total,
              winRate,
              agentStatus: agentState?.isRunning ? 'running' : 'stopped',
            },
          },
        } satisfies ApiResponse<{
          ensName: string;
          txHashes: string[];
          updatedFields: Record<string, string | number | boolean>;
        }>);
      } catch (error) {
        fastify.log.error(error, 'Failed to update ENS');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /ens/:ensName
   * Read VelocityVault records from an ENS name
   */
  fastify.get<{ Params: { ensName: string } }>(
    '/ens/:ensName',
    async (request: FastifyRequest<{ Params: { ensName: string } }>, reply: FastifyReply) => {
      try {
        const { ensName } = request.params;

        if (!ensName.includes('.')) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid ENS name format',
          } satisfies ApiResponse<never>);
        }

        const ensConfig = getENSConfigFromEnv();
        const data = await getVelocityPnL(ensName, ensConfig);

        return reply.send({
          success: true,
          data: {
            ensName,
            records: data,
          },
        } satisfies ApiResponse<{
          ensName: string;
          records: typeof data;
        }>);
      } catch (error) {
        fastify.log.error(error, 'Failed to read ENS');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );
}
