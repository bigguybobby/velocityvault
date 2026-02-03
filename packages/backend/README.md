# VelocityVault Backend API

Fastify-based backend API for VelocityVault autonomous trading agent.

## Features

- **Session Management**: Store and manage Yellow Network trading mandates
- **Intent Processing**: Start/stop trading agent with strategy selection
- **Portfolio State**: Real-time portfolio positions and PnL tracking
- **Activity Logs**: Trade execution history and performance metrics
- **ENS Integration**: On-chain reputation via ENS text records (for ENS bounty)

## Tech Stack

- [Fastify](https://fastify.dev/) - Fast web framework
- [Viem](https://viem.sh/) - Ethereum interactions & ENS
- [Supabase](https://supabase.com/) - PostgreSQL database
- [Zod](https://zod.dev/) - Schema validation

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Configure `.env`:**
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from your Supabase project
   - `PRIVATE_KEY` for ENS updates (wallet that owns the ENS name)
   - `RPC_URL` for Ethereum mainnet or Sepolia

3. **Create Supabase tables:**
   - Go to Supabase SQL Editor
   - Run `supabase-schema.sql`

4. **Install dependencies:**
   ```bash
   yarn install
   ```

5. **Start development server:**
   ```bash
   yarn workspace @velocityvault/backend dev
   ```

## API Endpoints

### Session Management
- `POST /session` - Create new mandate
- `GET /session/:address` - Get active mandate
- `DELETE /session/:address` - Revoke mandate

### Agent Control
- `POST /intent` - Start/stop agent
- `POST /intent/update-pnl` - Update PnL after trade

### Portfolio State
- `GET /state/:address` - Full portfolio state
- `GET /state/:address/positions` - Current positions
- `GET /state/:address/pnl` - PnL summary

### Activity Logs
- `GET /logs/:address` - Activity feed
- `GET /logs/:address/trades` - Trade history
- `GET /logs/:address/pnl-history` - PnL snapshots
- `GET /logs/:address/stats` - Trading statistics

### ENS Reputation
- `POST /ens/:address/update` - Update ENS text records
- `GET /ens/:ensName` - Read VelocityVault ENS records

## ENS Text Records

VelocityVault uses custom ENS text records for on-chain agent reputation:

| Key | Description |
|-----|-------------|
| `com.velocity.pnl` | Total PnL in USD |
| `com.velocity.pnl_percent` | PnL as percentage |
| `com.velocity.total_trades` | Number of trades |
| `com.velocity.win_rate` | Success rate % |
| `com.velocity.last_updated` | Last update timestamp |
| `com.velocity.agent_status` | running/stopped/paused |

## Database Schema

See `supabase-schema.sql` for full schema. Tables:

- `users` - User addresses and ENS names
- `mandates` - Yellow Network trading mandates
- `agent_state` - Current agent state per user
- `execution_logs` - Trade execution history
- `pnl_history` - PnL snapshots for tracking

## Development

```bash
# Run with hot reload
yarn workspace @velocityvault/backend dev

# Type check
yarn workspace @velocityvault/backend typecheck

# Build for production
yarn workspace @velocityvault/backend build

# Start production server
yarn workspace @velocityvault/backend start
```

## License

MIT
