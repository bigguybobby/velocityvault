import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MandateSchema, type Mandate, type ApiResponse } from '../types/index.js';
import {
  createMandate,
  getActiveMandate,
  revokeMandate,
  upsertUser,
} from '../services/supabase.js';

interface CreateSessionBody {
  mandate: Mandate;
}

interface RevokeSessionBody {
  userAddress: string;
}

export async function sessionRoutes(fastify: FastifyInstance) {
  /**
   * POST /session
   * Store a Yellow Network mandate for a user
   */
  fastify.post<{ Body: CreateSessionBody }>(
    '/session',
    async (request: FastifyRequest<{ Body: CreateSessionBody }>, reply: FastifyReply) => {
      try {
        const { mandate } = request.body;

        // Validate mandate schema
        const parsed = MandateSchema.safeParse(mandate);
        if (!parsed.success) {
          return reply.status(400).send({
            success: false,
            error: `Invalid mandate: ${parsed.error.message}`,
          } satisfies ApiResponse<never>);
        }

        // Ensure user exists
        await upsertUser({
          address: mandate.userAddress,
        });

        // Check for existing active mandate
        const existing = await getActiveMandate(mandate.userAddress);
        if (existing) {
          // Revoke existing mandate before creating new one
          await revokeMandate(mandate.userAddress);
        }

        // Create new mandate
        const created = await createMandate(parsed.data);

        fastify.log.info(
          { userAddress: mandate.userAddress, mandateId: created.id },
          'Mandate created'
        );

        return reply.status(201).send({
          success: true,
          data: created,
        } satisfies ApiResponse<Mandate>);
      } catch (error) {
        fastify.log.error(error, 'Failed to create session');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * GET /session/:address
   * Get active mandate for a user
   */
  fastify.get<{ Params: { address: string } }>(
    '/session/:address',
    async (request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        const mandate = await getActiveMandate(address);

        if (!mandate) {
          return reply.status(404).send({
            success: false,
            error: 'No active mandate found',
          } satisfies ApiResponse<never>);
        }

        return reply.send({
          success: true,
          data: mandate,
        } satisfies ApiResponse<Mandate>);
      } catch (error) {
        fastify.log.error(error, 'Failed to get session');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );

  /**
   * DELETE /session/:address
   * Revoke active mandate for a user
   */
  fastify.delete<{ Params: { address: string } }>(
    '/session/:address',
    async (request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
      try {
        const { address } = request.params;

        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid address format',
          } satisfies ApiResponse<never>);
        }

        await revokeMandate(address);

        fastify.log.info({ userAddress: address }, 'Mandate revoked');

        return reply.send({
          success: true,
        } satisfies ApiResponse<never>);
      } catch (error) {
        fastify.log.error(error, 'Failed to revoke session');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        } satisfies ApiResponse<never>);
      }
    }
  );
}
