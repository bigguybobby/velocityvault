// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VelocityTreasury} from "../src/VelocityTreasury.sol";
import {VelocityVault} from "../src/VelocityVault.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        
        // Use deployer as agent initially (can be updated later)
        address agent = deployer;
        
        // Use a placeholder bridge executor (LI.FI Diamond on mainnet, can update)
        address bridgeExecutor = address(0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE);
        
        // Mock USDC address (on testnet we'll use a placeholder - deploy real mock if needed)
        address usdc = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48); // mainnet USDC placeholder
        
        console.log("Deployer:", deployer);
        console.log("Agent:", agent);
        
        vm.startBroadcast(deployerKey);
        
        // Deploy Treasury
        VelocityTreasury treasury = new VelocityTreasury(agent, bridgeExecutor);
        console.log("VelocityTreasury deployed at:", address(treasury));
        
        // Deploy Vault
        VelocityVault vault = new VelocityVault(usdc, agent);
        console.log("VelocityVault deployed at:", address(vault));
        
        vm.stopBroadcast();
    }
}
