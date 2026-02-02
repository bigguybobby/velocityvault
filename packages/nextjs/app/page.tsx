"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-4xl w-full">
        <div className="text-center">
          <div className="text-8xl mb-6">⚡</div>
          <h1 className="text-6xl font-bold mb-4">VelocityVault</h1>
          <p className="text-2xl text-base-content/80 mb-12">
            Gasless Agentic Trading on Arc
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="card-title">Instant Execution</h2>
              <p>Trade at web2 speed with Yellow Network state channels</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-4">💨</div>
              <h2 className="card-title">Zero Gas Fees</h2>
              <p>All trades happen off-chain. Only pay when settling</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="card-title">AI Agent</h2>
              <p>Autonomous execution via LI.FI and Uniswap v4</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-3xl mb-4">Ready to Trade?</h2>
            <p className="text-lg mb-6">
              {connectedAddress 
                ? "Your wallet is connected. Start trading with zero gas fees!"
                : "Connect your wallet to experience gasless trading"}
            </p>
            <Link href="/trade">
              <button className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-none">
                Launch Trading Interface →
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  <span className="text-2xl mr-2">1️⃣</span>
                  Session-Based Auth
                </h3>
                <p>
                  Sign once with your wallet. Yellow Network creates a session key for gasless transactions.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  <span className="text-2xl mr-2">2️⃣</span>
                  Off-Chain Trading
                </h3>
                <p>
                  Your trades execute instantly via state channels. No waiting for blockchain confirmations.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  <span className="text-2xl mr-2">3️⃣</span>
                  Agent Execution
                </h3>
                <p>
                  AI agent monitors your intents and executes via LI.FI cross-chain routing to Uniswap v4 or Sui.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  <span className="text-2xl mr-2">4️⃣</span>
                  On-Chain Settlement
                </h3>
                <p>
                  When you're done trading, final balances settle on Arc with USDC-native gas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Powered By</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="badge badge-lg badge-primary">Yellow Network</div>
            <div className="badge badge-lg badge-secondary">Arc (Circle)</div>
            <div className="badge badge-lg badge-accent">LI.FI</div>
            <div className="badge badge-lg">Uniswap v4</div>
            <div className="badge badge-lg">Sui DeepBook</div>
            <div className="badge badge-lg">ENS</div>
          </div>
        </div>

        <div className="divider my-12"></div>

        <div className="text-center text-base-content/60">
          <p className="mb-2">Built for ETHGlobal HackMoney 2026</p>
          <p className="text-sm">Targeting $56k across 6 sponsor prizes</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
