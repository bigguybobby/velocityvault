"use client";

import Link from "next/link";
import type { NextPage } from "next";

const AboutPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">About VelocityVault</h1>
          <p className="text-xl text-base-content/80">
            Gasless Agentic Trading for HackMoney 2026
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">The Problem</h2>
            <div className="space-y-4 text-lg">
              <p>
                Trading DeFi today is frustrating:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>❌ <strong>Wallet popups</strong> for every action</li>
                <li>❌ <strong>Gas fees</strong> eating into profits</li>
                <li>❌ <strong>Slow confirmations</strong> - miss opportunities</li>
                <li>❌ <strong>Fragmented liquidity</strong> across chains</li>
                <li>❌ <strong>Manual execution</strong> - can't trade 24/7</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl mb-12">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Our Solution</h2>
            <div className="space-y-4 text-lg">
              <p>
                <strong>VelocityVault</strong> combines 6 cutting-edge protocols to create a gasless, autonomous trading system:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ <strong>Yellow Network:</strong> Session-based auth = sign once, trade forever</li>
                <li>✅ <strong>Arc (Circle):</strong> USDC treasury with sub-second finality</li>
                <li>✅ <strong>LI.FI:</strong> Cross-chain routing finds best prices</li>
                <li>✅ <strong>Uniswap v4:</strong> Custom hooks enable agentic logic</li>
                <li>✅ <strong>Sui DeepBook:</strong> High-frequency hedging with instant finality</li>
                <li>✅ <strong>ENS:</strong> Human-readable agent identity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-none w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1 card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Sign Once (Yellow Network)</h3>
                  <p>
                    Connect your wallet and sign one authentication message. Yellow creates a session key that handles all subsequent transactions off-chain.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-16 h-16 bg-secondary text-secondary-content rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1 card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Trade Gasless (State Channels)</h3>
                  <p>
                    Click buy/sell as many times as you want. Every trade happens instantly via Yellow's state channels - zero gas, zero delay.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-16 h-16 bg-accent text-accent-content rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1 card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Agent Executes (LI.FI + Uniswap)</h3>
                  <p>
                    Our AI agent monitors your trade intents, pulls USDC from the Arc vault, routes via LI.FI to the best chain, and executes on Uniswap v4 or Sui.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-16 h-16 bg-info text-info-content rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div className="flex-1 card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Profits Returned (Arc Settlement)</h3>
                  <p>
                    After each trade, the agent returns profits to your vault on Arc. Final settlement happens when you close your session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Technology Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-yellow-500">🟡 Yellow Network</h3>
                <p className="text-sm">
                  <strong>Prize:</strong> $15,000
                </p>
                <p>
                  Session-based state channels for gasless transactions. Sign once, trade unlimited times off-chain.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-blue-500">🔵 Arc (Circle)</h3>
                <p className="text-sm">
                  <strong>Prize:</strong> $10,000
                </p>
                <p>
                  USDC treasury on Circle's L1. Sub-second finality with USDC as gas. Perfect for high-frequency trading.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-pink-500">🦄 Uniswap v4</h3>
                <p className="text-sm">
                  <strong>Prize:</strong> $10,000
                </p>
                <p>
                  Custom hooks implement agentic trading logic. Only execute if conditions are met. Privacy-preserving swaps.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-cyan-500">🌊 Sui</h3>
                <p className="text-sm">
                  <strong>Prize:</strong> $10,000
                </p>
                <p>
                  DeepBook CLOB for high-frequency hedging. Instant finality enables limit orders at scale.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-purple-500">🌈 LI.FI</h3>
                <p className="text-sm">
                  <strong>Prize:</strong> $6,000
                </p>
                <p>
                  Cross-chain routing layer. Automatically finds best routes across 20+ chains and 100+ DEXs.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-blue-400">🏷️ ENS</h3>
                <p className="text-sm">
                  <strong>Prize:</strong> $5,000
                </p>
                <p>
                  Human-readable agent identity (agent.eth). Stores risk profile and PnL in text records.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="stat bg-base-200 rounded-lg inline-block">
              <div className="stat-value text-primary">$56,000</div>
              <div className="stat-title">Total Prize Pool Targeted</div>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="card bg-base-100 shadow-xl mb-12">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Architecture</h2>
            <div className="mockup-code text-sm">
              <pre data-prefix="$"><code>User → Yellow UI (gasless sessions)</code></pre>
              <pre data-prefix=" "><code>         ↓</code></pre>
              <pre data-prefix="$"><code>    AI Agent (monitors intents)</code></pre>
              <pre data-prefix=" "><code>         ↓</code></pre>
              <pre data-prefix="$"><code>    Arc Treasury (USDC vault)</code></pre>
              <pre data-prefix=" "><code>         ↓</code></pre>
              <pre data-prefix="$"><code>    LI.FI (cross-chain routing)</code></pre>
              <pre data-prefix=" "><code>         ↓</code></pre>
              <pre data-prefix="$"><code>    ├─→ Uniswap v4 (EVM trading)</code></pre>
              <pre data-prefix="$"><code>    └─→ Sui DeepBook (hedging)</code></pre>
              <pre data-prefix=" "><code>         ↓</code></pre>
              <pre data-prefix="$"><code>    ENS Identity (agent.eth)</code></pre>
            </div>
          </div>
        </div>

        {/* Team & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Built For</h3>
              <p>
                <strong>ETHGlobal HackMoney 2026</strong><br />
                January 30 – February 11, 2026<br />
                Async Hackathon
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Links</h3>
              <div className="space-y-2">
                <a href="https://github.com/bigguybobby/velocityvault" className="link link-primary" target="_blank" rel="noopener noreferrer">
                  📦 GitHub Repository
                </a>
                <br />
                <Link href="/trade" className="link link-primary">
                  ⚡ Try the Demo
                </Link>
                <br />
                <a href="https://ethglobal.com/events/hackmoney2026" className="link link-primary" target="_blank" rel="noopener noreferrer">
                  🏆 HackMoney 2026
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-3xl mb-4">Ready to Experience Gasless Trading?</h2>
            <p className="text-lg mb-6">
              Connect your wallet and start trading with zero gas fees and instant execution.
            </p>
            <Link href="/trade">
              <button className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-none">
                Launch Trading Interface →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
