import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IntentSchema, type Intent, type AgentState, type ApiResponse } from '../types/index.js';
import {
  getActiveMandate,
  getAgentState,
  upsertAgentState,
  createExecutionLog,
} from '../services/supabase.js';

export async function intentRoutes(fastify: FastifyInstance) {
  /**
   * POST /intent
   * Start or stop the trading agent for a user
   */
  fastify.post<{ Body: Intent }>(
    '/intent',
    async (request: FastifyRequest<{ Body: Intent }>, reply: FastifyReply) => {
      try {
        const intent = request.body;

        // Validate intent schema
        const parsed = IntentSchema.safeParse(intent);
        if (!parsed.success) {
          return reply.status(400).send({
            success: false,
            error: `Invalid intent: ${parsed.error.message}`,
          } satisfies ApiResponse<never>);
        }

        const { userAddress, action, strategy, params } = parsed.data;

        // Verify user has an active mandate before allowing agent operations
        const mandate = await getActiveMandate(userAddress);
        if (!mandate) {
          return reply.status(403).send({
            success: false,
            error: 'No active mandate found. Please create a session first.',
          } satisfies ApiResponse<never>);
        }

        // Get current agent state
        let agentState = await getAgentState(userAddress);

        if (action === 'start') {
          // Check if agent is already running
          if (agentState?.isRunning) {
            return reply.status(400).send({
              success: false,
              error: 'Agent is already running',
            } satisfies ApiResponse<never>);
          }

          // Create or update agent state
          agentState = await upsertAgentState({
            userAddress,
            isRunning: true,
            strategy: strategy || 'momentum',
            currentPositions: agentState?.currentPositions || {},
            totalPnl: agentState?.totalPnl || '0',
          });

          // Log the action
          await createExecutionLog({
            userAddress,
            action: 'agent_started',
            status: 'executed',
          });

          fastify.log.info(
            { userAddress, strategy: agentState.strategy },
            'Agent started'
          );

          return reply.status(200).send({
            success: true,
            data: agentState,
          } satisfies ApiResponse<AgentState>);
        }

        if (action === 'stop') {
          // Check if agent is running
          if (!agentState?.isRunning) {
            return reply.status(400).send({
              success: false,
              error: 'Agent is not running',
            } satisfies ApiResponse<never>);
          }

          // Update agent state to stopped
          agentState = await upsertAgentState({
            ...agentState,
            isRunning: false,
          });

          // Log the action
          await createExecutionLog({
            userAddress,
            action: 'agent_stopped',
            status: 'executed',
          });

          fastify.log.info({ userAddress }, 'Agent stopped');

          return reply.status(200).send({
            success: true,
            data: agentState,
          } satisfies ApiResponse<AgentState>);
        }

        return reply.status(400).send({
          success: false,
          error: 'Invalid action',
        } satisfies ApiResponse<never>);
      } catch (error) {
        fastify.log.error(error, 'Failed to process intent');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * POST /intent/update-pnl
   * Update agent PnL after a trade (internal endpoint for agent)
   */
  fastify.post<{
    Body: {
      userAddress: string;
      pnl: string;
      pnlPercent: number;
      trade?: {
        pair: string;
        side: 'buy' | 'sell';
        amount: string;
        price: string;
        txHash?: string;
      };
    };
  }>(
    '/intent/update-pnl',
    async (request, reply) => {
      try {
        const { userAddress, pnl, pnlPercent, trade } = request.body;

        if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        // Update agent state with new PnL
        const agentState = await getAgentState(userAddress);
        if (agentState) {
          await upsertAgentState({
            ...agentState,
            totalPnl: pnl,
          });
        }

        // Log the trade if provided
        if (trade) {
          await createExecutionLog({
            userAddress,
            action: 'trade',
            pair: trade.pair,
            side: trade.side,
            amount: trade.amount,
            price: trade.price,
            txHash: trade.txHash,
            status: 'executed',
          });
        }

        fastify.log.info({ userAddress, pnl, pnlPercent }, 'PnL updated');

        return reply.send({
          success: true,
        } satisfies ApiResponse<never>);
      } catch (error) {
        fastify.log.error(error, 'Failed to update PnL');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );
}
