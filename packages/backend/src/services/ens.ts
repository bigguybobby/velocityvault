import {
  createWalletClient,
  createPublicClient,
  http,
  encodeFunctionData,
  namehash,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia } from 'viem/chains';

// ENS Public Resolver ABI (only what we need)
const resolverAbi = [
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

// VelocityVault text record keys
export const ENS_KEYS = {
  PNL: 'com.velocity.pnl',
  PNL_PERCENT: 'com.velocity.pnl_percent',
  TOTAL_TRADES: 'com.velocity.total_trades',
  WIN_RATE: 'com.velocity.win_rate',
  LAST_UPDATED: 'com.velocity.last_updated',
  AGENT_STATUS: 'com.velocity.agent_status',
} as const;

interface ENSConfig {
  rpcUrl: string;
  privateKey: Hex;
  resolverAddress: Address;
  chainId?: number;
}

function getChain(chainId?: number) {
  if (chainId === 11155111) return sepolia;
  return mainnet;
}

function getClients(config: ENSConfig) {
  const chain = getChain(config.chainId);
  const account = privateKeyToAccount(config.privateKey);

  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });

  return { publicClient, walletClient, account };
}

/**
 * Get a text record from an ENS name
 */
export async function getENSText(
  ensName: string,
  key: string,
  config: ENSConfig
): Promise<string | null> {
  const { publicClient } = getClients(config);
  const node = namehash(ensName);

  try {
    const result = await publicClient.readContract({
      address: config.resolverAddress,
      abi: resolverAbi,
      functionName: 'text',
      args: [node, key],
    });
    return result || null;
  } catch (error) {
    console.error(`Failed to read ENS text record ${key} for ${ensName}:`, error);
    return null;
  }
}

/**
 * Set a text record on an ENS name
 * Note: The wallet must be the owner/manager of the ENS name
 */
export async function setENSText(
  ensName: string,
  key: string,
  value: string,
  config: ENSConfig
): Promise<Hex> {
  const { walletClient, publicClient, account } = getClients(config);
  const node = namehash(ensName);

  const hash = await walletClient.writeContract({
    address: config.resolverAddress,
    abi: resolverAbi,
    functionName: 'setText',
    args: [node, key, value],
  });

  // Wait for confirmation
  await publicClient.waitForTransactionReceipt({ hash });

  console.log(`Updated ENS text record ${key}=${value} for ${ensName}, tx: ${hash}`);
  return hash;
}

/**
 * Update all VelocityVault PnL records for an ENS name
 */
export async function updateVelocityPnL(
  ensName: string,
  data: {
    pnl: string;
    pnlPercent: number;
    totalTrades: number;
    winRate: number;
    agentStatus: 'running' | 'stopped' | 'paused';
  },
  config: ENSConfig
): Promise<Hex[]> {
  const txHashes: Hex[] = [];

  // Update each text record
  const updates: [string, string][] = [
    [ENS_KEYS.PNL, data.pnl],
    [ENS_KEYS.PNL_PERCENT, data.pnlPercent.toFixed(2)],
    [ENS_KEYS.TOTAL_TRADES, data.totalTrades.toString()],
    [ENS_KEYS.WIN_RATE, data.winRate.toFixed(2)],
    [ENS_KEYS.LAST_UPDATED, new Date().toISOString()],
    [ENS_KEYS.AGENT_STATUS, data.agentStatus],
  ];

  for (const [key, value] of updates) {
    try {
      const hash = await setENSText(ensName, key, value, config);
      txHashes.push(hash);
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      // Continue with other updates even if one fails
    }
  }

  return txHashes;
}

/**
 * Read all VelocityVault records from an ENS name
 */
export async function getVelocityPnL(
  ensName: string,
  config: ENSConfig
): Promise<{
  pnl: string | null;
  pnlPercent: string | null;
  totalTrades: string | null;
  winRate: string | null;
  lastUpdated: string | null;
  agentStatus: string | null;
}> {
  const [pnl, pnlPercent, totalTrades, winRate, lastUpdated, agentStatus] =
    await Promise.all([
      getENSText(ensName, ENS_KEYS.PNL, config),
      getENSText(ensName, ENS_KEYS.PNL_PERCENT, config),
      getENSText(ensName, ENS_KEYS.TOTAL_TRADES, config),
      getENSText(ensName, ENS_KEYS.WIN_RATE, config),
      getENSText(ensName, ENS_KEYS.LAST_UPDATED, config),
      getENSText(ensName, ENS_KEYS.AGENT_STATUS, config),
    ]);

  return { pnl, pnlPercent, totalTrades, winRate, lastUpdated, agentStatus };
}

/**
 * Get ENS config from environment variables
 */
export function getENSConfigFromEnv(): ENSConfig {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY as Hex;
  const resolverAddress = process.env.ENS_RESOLVER_ADDRESS as Address;

  if (!rpcUrl || !privateKey || !resolverAddress) {
    throw new Error('Missing ENS config: RPC_URL, PRIVATE_KEY, or ENS_RESOLVER_ADDRESS');
  }

  // Detect chain from RPC URL
  const chainId = rpcUrl.includes('sepolia') ? 11155111 : 1;

  return { rpcUrl, privateKey, resolverAddress, chainId };
}
