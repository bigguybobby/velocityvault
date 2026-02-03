// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {VelocityVault} from "../src/VelocityVault.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract VelocityVaultTest is Test {
    MockUSDC private usdc;
    VelocityVault private vault;

    address private owner;
    address private agent;
    address private user;
    address private destination;

    uint256 private constant START_BALANCE = 1_000_000e6;

    function setUp() external {
        owner = address(this);
        agent = makeAddr("agent");
        user = makeAddr("user");
        destination = makeAddr("destination");

        usdc = new MockUSDC();
        usdc.mint(user, START_BALANCE);

        vault = new VelocityVault(address(usdc), agent);

        vm.prank(user);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(agent);
        usdc.approve(address(vault), type(uint256).max);
    }

    function testDeposit() external {
        uint256 amount = 100_000e6;

        vm.prank(user);
        vault.deposit(amount);

        assertEq(vault.balances(user), amount);
        assertEq(vault.totalDeposits(), amount);
        assertEq(usdc.balanceOf(address(vault)), amount);
    }

    function testWithdraw() external {
        uint256 amount = 50_000e6;

        vm.prank(user);
        vault.deposit(amount);

        vm.prank(user);
        vault.withdraw(amount);

        assertEq(vault.balances(user), 0);
        assertEq(vault.totalDeposits(), 0);
        assertEq(usdc.balanceOf(user), START_BALANCE);
    }

    function testAgentWithdraw() external {
        uint256 amount = 75_000e6;

        vm.prank(user);
        vault.deposit(amount);

        vm.prank(agent);
        vault.agentWithdraw(user, amount, destination, bytes32("exec-1"));

        assertEq(vault.balances(user), 0);
        assertEq(vault.totalDeposits(), 0);
        assertEq(usdc.balanceOf(destination), amount);
    }

    function testAgentDeposit() external {
        uint256 amount = 120_000e6;

        vm.prank(user);
        vault.deposit(100_000e6);

        usdc.mint(agent, amount);

        vm.prank(agent);
        vault.agentDeposit(user, amount, bytes32("exec-2"));

        assertEq(vault.balances(user), 220_000e6);
        assertEq(vault.totalDeposits(), 220_000e6);
        assertEq(usdc.balanceOf(address(vault)), 220_000e6);
    }

    function testOnlyOwnerCanSetAgent() external {
        address newAgent = makeAddr("newAgent");

        vm.prank(user);
        vm.expectRevert();
        vault.setAgent(newAgent);

        vault.setAgent(newAgent);
        assertEq(vault.agent(), newAgent);
    }

    function testOnlyAgentCanWithdraw() external {
        vm.prank(user);
        vault.deposit(10_000e6);

        vm.prank(user);
        vm.expectRevert();
        vault.agentWithdraw(user, 10_000e6, destination, bytes32("exec-3"));
    }
}
