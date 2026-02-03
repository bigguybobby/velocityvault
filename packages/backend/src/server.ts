import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { sessionRoutes } from './routes/session.js';
import { intentRoutes } from './routes/intent.js';
import { stateRoutes } from './routes/state.js';
import { logsRoutes } from './routes/logs.js';
import { ensRoutes } from './routes/ens.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
  },
});

// CORS configuration
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '0.0.1',
}));

// API info
fastify.get('/', async () => ({
  name: 'VelocityVault API',
  version: '0.0.1',
  description: 'Backend API for VelocityVault autonomous trading agent',
  endpoints: {
    '/health': 'Health check',
    '/session': 'Yellow Network mandate management',
    '/intent': 'Agent start/stop controls',
    '/state/:address': 'Portfolio state',
    '/logs/:address': 'Activity feed',
    '/ens/:address/update': 'Update ENS reputation records',
    '/ens/:ensName': 'Read ENS VelocityVault records',
  },
}));

// Register routes
await fastify.register(sessionRoutes);
await fastify.register(intentRoutes);
await fastify.register(stateRoutes);
await fastify.register(logsRoutes);
await fastify.register(ensRoutes);

// Start server
const port = parseInt(process.env.PORT || '3001', 10);
const host = process.env.HOST || '0.0.0.0';

try {
  await fastify.listen({ port, host });
  fastify.log.info(`🚀 VelocityVault API running at http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down...`);
    await fastify.close();
    process.exit(0);
  });
});
