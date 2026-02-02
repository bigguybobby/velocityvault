# VelocityVault - Demo Guide

**For HackMoney 2026 Submission**

## Quick Demo (2 minutes)

### What to Show

1. **Gasless Trading UI** (30 seconds)
   - Open http://localhost:3000/trade
   - Click Buy/Sell rapidly (10+ times)
   - Show: Zero wallet popups, instant execution, $0 gas

2. **Agent Monitoring** (30 seconds)
   - Terminal running agent
   - Shows: Trade detection, LI.FI routing, execution logs

3. **Smart Contracts** (30 seconds)
   - Show VelocityVault.sol code
   - Highlight: Agent permissions, security patterns

4. **Architecture** (30 seconds)
   - Explain flow: Yellow → Agent → LI.FI → Uniswap/Sui
   - Show: 6 sponsors integrated

## Full Demo (5 minutes)

### Setup (Do Once)

```bash
# Clone repo
git clone https://github.com/bigguybobby/velocityvault
cd velocityvault
yarn install

# Start local chain (Terminal 1)
yarn chain

# Deploy contracts (Terminal 2)
yarn deploy

# Start frontend (Terminal 3)
cd packages/nextjs
yarn dev

# Start agent (Terminal 4)
cd packages/agent
npm run dev
```

### Demo Script

#### 1. Introduction (30s)

**Say:**
> "VelocityVault is a gasless trading interface that uses AI agents to execute trades across 6 different protocols. Let me show you how it works."

**Show:**
- Home page (localhost:3000)
- Point out sponsor badges

#### 2. Gasless Trading (1m)

**Say:**
> "First, I'll connect my wallet. Watch - I only sign once."

**Do:**
- Click "Launch Trading Interface"
- Connect wallet
- Sign Yellow session (one signature)

**Say:**
> "Now I can trade without any wallet popups or gas fees. Watch this:"

**Do:**
- Click Buy BTC (5 times rapidly)
- Click Sell BTC (5 times rapidly)
- Click Rebalance

**Point out:**
- Trade counter increasing
- Gas fees: $0
- No wallet popups
- Instant execution

#### 3. Agent Monitoring (1m)

**Say:**
> "Behind the scenes, our AI agent is monitoring these trades."

**Show:**
- Terminal with agent logs
- Point out trade detection
- Show LI.FI routing

**Say:**
> "The agent pulls USDC from our Arc vault, routes it via LI.FI to Optimism, executes on Uniswap v4, and returns the profits."

#### 4. Smart Contracts (1m 30s)

**Say:**
> "Let's look at the smart contract architecture."

**Show:**
- VelocityVault.sol in IDE

**Highlight:**
```solidity
// User deposits USDC
function deposit(uint256 amount) external

// Agent executes trades
function agentWithdraw(
    address user,
    uint256 amount,
    address destination,
    bytes32 executionId
) external onlyAgent

// Agent returns profits
function agentDeposit(
    address user,
    uint256 amount,
    bytes32 executionId
) external onlyAgent
```

**Say:**
> "The contract has security patterns like ReentrancyGuard, SafeERC20, and agent permissions."

#### 5. Architecture (1m)

**Show:**
- README.md architecture diagram

**Explain:**
> "Here's how it all connects:
> 1. User trades in Yellow UI (gasless)
> 2. Agent monitors Yellow WebSocket
> 3. Agent withdraws from Arc vault
> 4. LI.FI routes cross-chain
> 5. Execute on Uniswap v4 or Sui
> 6. Return profits to vault
> 
> We're targeting 6 sponsor prizes:
> - Yellow: $15k for gasless UX
> - Arc: $10k for USDC treasury
> - Uniswap: $10k for agentic hooks
> - Sui: $10k for DeepBook hedging
> - LI.FI: $6k for cross-chain routing
> - ENS: $5k for agent identity"

## Video Recording Tips

### Equipment
- Screen recording: QuickTime / OBS
- Webcam: Optional but recommended
- Audio: Use good microphone

### Lighting
- Face camera or front-light only
- No backlighting

### Script
1. **Opening** (5s)
   > "Hi, I'm [name]. This is VelocityVault."

2. **Problem** (10s)
   > "Trading DeFi usually means: wallet popups, gas fees, slow confirmations. We solved this."

3. **Demo** (2m 30s)
   - Show gasless trading
   - Show agent execution
   - Show contracts

4. **Tech Stack** (30s)
   - List 6 sponsors
   - Show architecture

5. **Closing** (15s)
   > "VelocityVault: Gasless trading with AI agents. Built for HackMoney 2026. Thanks!"

### Editing
- Cut long pauses
- Speed up slow parts (1.2x-1.5x)
- Add captions for key points
- Keep under 3 minutes total

## Screenshots for Submission

### 1. Home Page
- Full page showing "VelocityVault" title
- Feature cards
- Sponsor badges

### 2. Trading Interface
- Connected wallet
- Trade buttons
- Stats showing (trades, $0 gas, instant)

### 3. Agent Terminal
- Logs showing trade detection
- LI.FI routing
- Execution steps

### 4. Smart Contract
- VelocityVault.sol in IDE
- Highlight security patterns

### 5. Architecture Diagram
- Show flow from README

## Talking Points for Judges

### Yellow Network Integration
> "We use Yellow's Nitrolite SDK for session-based authentication. Users sign once and get unlimited gasless transactions via state channels."

### Arc Treasury
> "All user funds sit on Arc in our VelocityVault contract. Arc uses USDC as gas, so everything settles efficiently with sub-second finality."

### LI.FI Cross-Chain
> "When the agent needs to execute, it uses LI.FI to find the best route. We can trade on any chain without fragmented liquidity."

### Uniswap v4 Agentic Hooks
> "Our agent uses custom Uniswap v4 hooks that implement agentic logic - trades only execute if certain conditions are met."

### Sui DeepBook Hedging
> "For high-frequency hedging, we use Sui's DeepBook. Its instant finality is perfect for limit orders."

### ENS Identity
> "The agent has an ENS name (agent.eth) that stores its risk profile and PnL in text records."

## Common Questions

**Q: Is this production-ready?**
> "It's a hackathon MVP. The core architecture is solid, but needs audits and more testing for production."

**Q: How fast are the trades?**
> "Off-chain execution via Yellow is instant. On-chain settlement happens when you close your session."

**Q: What about security?**
> "We use OpenZeppelin patterns, ReentrancyGuard, SafeERC20, and agent permissions. The agent can only execute trades, not drain the vault."

**Q: Can I try it?**
> "Yes! Clone the repo, run `yarn install && yarn chain && yarn deploy && yarn start`. Takes 2 minutes."

**Q: What's next after the hackathon?**
> "We want to add: multi-sig for agent, more trading strategies, MEV protection, and launch on mainnet."

## Submission Checklist

- [ ] Video recording (max 3 minutes)
- [ ] GitHub repo (public, with commits)
- [ ] README with setup instructions
- [ ] Live demo link (optional but recommended)
- [ ] Screenshots (5-10 images)
- [ ] Deployed contracts (testnet addresses)
- [ ] Sponsor prize selections (all 6 checked)

## Post-Submission

### If Accepted as Finalist
- Prepare 5-minute pitch deck
- Record longer demo (5 minutes)
- Deploy to testnet if not already
- Prepare for Q&A

### If Not Finalist
- Still great portfolio piece
- Can continue building
- Share on Twitter/LinkedIn
- Add to resume/portfolio

## Tips for Success

1. **Keep it simple** - Don't try to explain everything
2. **Show, don't tell** - Demo is more important than words
3. **Highlight novelty** - Focus on what's unique (gasless + agentic)
4. **Be enthusiastic** - Energy matters
5. **Practice** - Record 2-3 takes, pick the best

## Resources

- **Repo:** https://github.com/bigguybobby/velocityvault
- **Demo Video:** [Upload to YouTube]
- **Deployed Contracts:** [Add addresses after deployment]
- **Live Demo:** [Optional - Deploy to Vercel]

---

**Good luck! 🚂**
