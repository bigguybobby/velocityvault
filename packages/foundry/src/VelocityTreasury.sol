// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VelocityTreasury
 * @notice Treasury contract for VelocityVault agentic strategies
 * @dev Users deposit ERC20s; agent executes strategies via bridge/router
 */
contract VelocityTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    /// @notice Authorized AI agent address
    address public agent;

    /// @notice Bridge/execution router (e.g., LI.FI) for strategy execution
    address public bridgeExecutor;

    /// @notice User balances per token
    mapping(address token => mapping(address user => uint256)) public balances;

    /// @notice Total deposits per token
    mapping(address token => uint256) public totalDeposits;

    /* ========== EVENTS ========== */

    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 newBalance);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event BridgeExecutorUpdated(address indexed oldExecutor, address indexed newExecutor);
    event StrategyExecuted(
        address indexed agent,
        address indexed executor,
        bytes bridgeData,
        bytes strategyParams
    );

    /* ========== ERRORS ========== */

    error ZeroAmount();
    error ZeroAddress();
    error UnauthorizedAgent();
    error ExecutionFailed();

    /* ========== CONSTRUCTOR ========== */

    constructor(address _agent, address _bridgeExecutor) Ownable(msg.sender) {
        if (_agent == address(0) || _bridgeExecutor == address(0)) revert ZeroAddress();
        agent = _agent;
        bridgeExecutor = _bridgeExecutor;

        emit AgentUpdated(address(0), _agent);
        emit BridgeExecutorUpdated(address(0), _bridgeExecutor);
    }

    /* ========== USER FUNCTIONS ========== */

    /**
     * @notice Deposit ERC20 tokens into the treasury
     * @param token ERC20 token address
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        balances[token][msg.sender] += amount;
        totalDeposits[token] += amount;

        emit Deposit(msg.sender, token, amount, balances[token][msg.sender]);
    }

    /* ========== AGENT FUNCTIONS ========== */

    /**
     * @notice Execute a strategy via bridge/router using pre-encoded calldata
     * @param bridgeData Calldata for bridge/router execution
     * @param strategyParams Encoded strategy params (emitted for tracking)
     */
    function executeStrategy(bytes calldata bridgeData, bytes calldata strategyParams)
        external
        onlyAgent
        nonReentrant
    {
        (bool success, ) = bridgeExecutor.call(bridgeData);
        if (!success) revert ExecutionFailed();

        emit StrategyExecuted(msg.sender, bridgeExecutor, bridgeData, strategyParams);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    function setAgent(address newAgent) external onlyOwner {
        if (newAgent == address(0)) revert ZeroAddress();
        address oldAgent = agent;
        agent = newAgent;
        emit AgentUpdated(oldAgent, newAgent);
    }

    function setBridgeExecutor(address newExecutor) external onlyOwner {
        if (newExecutor == address(0)) revert ZeroAddress();
        address oldExecutor = bridgeExecutor;
        bridgeExecutor = newExecutor;
        emit BridgeExecutorUpdated(oldExecutor, newExecutor);
    }

    /* ========== MODIFIERS ========== */

    modifier onlyAgent() {
        if (msg.sender != agent) revert UnauthorizedAgent();
        _;
    }
}
