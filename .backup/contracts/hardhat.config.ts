import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC || "https://arc-testnet-rpc.circle.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: Number(process.env.ARC_TESTNET_CHAIN_ID) || 999999,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      arcTestnet: "no-api-key-needed", // Arc explorer might not require API key
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: Number(process.env.ARC_TESTNET_CHAIN_ID) || 999999,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
