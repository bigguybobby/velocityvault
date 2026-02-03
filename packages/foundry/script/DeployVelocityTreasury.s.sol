// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VelocityTreasury} from "../src/VelocityTreasury.sol";

contract DeployVelocityTreasury is Script {
    function run() external returns (VelocityTreasury treasury) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address agent = vm.envAddress("AGENT_ADDRESS");
        address bridgeExecutor = vm.envAddress("BRIDGE_EXECUTOR");

        vm.startBroadcast(deployerKey);
        treasury = new VelocityTreasury(agent, bridgeExecutor);
        vm.stopBroadcast();
    }
}
