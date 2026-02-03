// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VelocityVault} from "../src/VelocityVault.sol";

contract DeployVelocityVault is Script {
    function run() external returns (VelocityVault vault) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address agent = vm.envAddress("AGENT_ADDRESS");

        vm.startBroadcast(deployerKey);
        vault = new VelocityVault(usdc, agent);
        vm.stopBroadcast();
    }
}
