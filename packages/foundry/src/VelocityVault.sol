// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VelocityVault
 * @notice USDC treasury vault for VelocityVault agentic trading system
 * @dev Users deposit USDC, AI agent executes cross-chain strategies
 *
 * Flow:
 * 1. User deposits USDC via Yellow UI (gasless)
 * 2. Agent monitors user intents
 * 3. Agent withdraws USDC to execute trades (via LI.FI)
 * 4. Agent returns profits back to vault
 *
 * For HackMoney 2026 - Built on Arc testnet
 */
contract VelocityVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    /// @notice USDC token on Arc
    IERC20 public immutable usdc;

    /// @notice Authorized AI agent address
    address public agent;

    /// @notice User balances in vault
    mapping(address => uint256) public balances;

    /// @notice Total USDC locked in vault
    uint256 public totalDeposits;

    /* ========== EVENTS ========== */

    event Deposit(address indexed user, uint256 amount, uint256 newBalance);
    event Withdraw(address indexed user, uint256 amount, uint256 newBalance);
    event AgentWithdraw(
        address indexed user,
        uint256 amount,
        address destination,
        bytes32 indexed executionId
    );
    event AgentDeposit(
        address indexed user,
        uint256 amount,
        uint256 profit,
        bytes32 indexed executionId
    );
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    /* ========== ERRORS ========== */

    error ZeroAmount();
    error ZeroAddress();
    error InsufficientBalance();
    error UnauthorizedAgent();
    error TransferFailed();

    /* ========== CONSTRUCTOR ========== */

    /**
     * @param _usdc USDC token address on Arc
     * @param _agent Initial agent address
     */
    constructor(address _usdc, address _agent) Ownable(msg.sender) {
        if (_usdc == address(0) || _agent == address(0)) revert ZeroAddress();

        usdc = IERC20(_usdc);
        agent = _agent;

        emit AgentUpdated(address(0), _agent);
    }

    /* ========== USER FUNCTIONS ========== */

    /**
     * @notice Deposit USDC into vault
     * @param amount Amount of USDC to deposit (6 decimals)
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        balances[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposit(msg.sender, amount, balances[msg.sender]);
    }

    /**
     * @notice Withdraw USDC from vault
     * @param amount Amount of USDC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();

        balances[msg.sender] -= amount;
        totalDeposits -= amount;

        usdc.safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount, balances[msg.sender]);
    }

    /**
     * @notice Check user's balance in vault
     * @param user User address
     * @return User's USDC balance
     */
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }

    /* ========== AGENT FUNCTIONS ========== */

    /**
     * @notice Agent withdraws USDC to execute cross-chain trade
     * @param user User whose funds to use
     * @param amount Amount to withdraw for execution
     * @param destination Address to send funds (usually LI.FI contract)
     * @param executionId Unique ID for this execution (for tracking)
     */
    function agentWithdraw(
        address user,
        uint256 amount,
        address destination,
        bytes32 executionId
    ) external onlyAgent nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (destination == address(0)) revert ZeroAddress();
        if (balances[user] < amount) revert InsufficientBalance();

        balances[user] -= amount;
        totalDeposits -= amount;

        usdc.safeTransfer(destination, amount);

        emit AgentWithdraw(user, amount, destination, executionId);
    }

    /**
     * @notice Agent deposits profits back after trade execution
     * @param user User to credit profits to
     * @param amount Total amount being returned (principal + profit)
     * @param executionId Unique ID matching the withdrawal
     */
    function agentDeposit(address user, uint256 amount, bytes32 executionId) external onlyAgent nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (user == address(0)) revert ZeroAddress();

        uint256 originalBalance = balances[user];

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        balances[user] += amount;
        totalDeposits += amount;

        uint256 profit = amount > originalBalance ? amount - originalBalance : 0;

        emit AgentDeposit(user, amount, profit, executionId);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Update agent address
     * @param newAgent New agent address
     */
    function setAgent(address newAgent) external onlyOwner {
        if (newAgent == address(0)) revert ZeroAddress();

        address oldAgent = agent;
        agent = newAgent;

        emit AgentUpdated(oldAgent, newAgent);
    }

    /* ========== MODIFIERS ========== */

    modifier onlyAgent() {
        if (msg.sender != agent) revert UnauthorizedAgent();
        _;
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice Get total USDC held in vault
     * @return Total USDC balance
     */
    function getTotalDeposits() external view returns (uint256) {
        return totalDeposits;
    }

    /**
     * @notice Get actual USDC balance of contract
     * @return Actual USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
