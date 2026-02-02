import { useState } from 'react'
import { useYellow } from '../contexts/YellowContext'

export default function TradingInterface() {
  const { balance, trade, isLoading, error, channelId } = useYellow()
  const [tradeAmount, setTradeAmount] = useState('10')
  const [tradeCount, setTradeCount] = useState(0)

  const handleTrade = async (action: 'buy' | 'sell') => {
    await trade(action, 'BTC', tradeAmount)
    setTradeCount((prev) => prev + 1)
  }

  return (
    <div className="trading-interface">
      <div className="trading-card">
        {/* Balance Display */}
        <div className="balance-section">
          <div className="balance-label">Your Balance</div>
          <div className="balance-amount">{balance} USDC</div>
          {channelId && (
            <div className="channel-info">
              <span className="status-dot"></span>
              Channel Active
            </div>
          )}
        </div>

        {/* Trading Controls */}
        <div className="trading-controls">
          <div className="amount-input">
            <label>Trade Amount (USDC)</label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              min="1"
              step="1"
              disabled={isLoading}
            />
          </div>

          <div className="trade-buttons">
            <button
              className="trade-button buy"
              onClick={() => handleTrade('buy')}
              disabled={isLoading || !channelId}
            >
              <span className="button-icon">📈</span>
              Buy BTC
            </button>
            
            <button
              className="trade-button sell"
              onClick={() => handleTrade('sell')}
              disabled={isLoading || !channelId}
            >
              <span className="button-icon">📉</span>
              Sell BTC
            </button>
          </div>

          <div className="quick-actions">
            <button 
              className="action-button"
              onClick={() => handleTrade('buy')}
              disabled={isLoading}
            >
              Quick Buy
            </button>
            <button 
              className="action-button"
              onClick={() => handleTrade('sell')}
              disabled={isLoading}
            >
              Quick Sell
            </button>
            <button 
              className="action-button"
              onClick={() => {
                handleTrade('sell')
                setTimeout(() => handleTrade('buy'), 100)
              }}
              disabled={isLoading}
            >
              Rebalance
            </button>
          </div>
        </div>

        {/* Demo Stats */}
        <div className="demo-stats">
          <div className="stat">
            <div className="stat-value">{tradeCount}</div>
            <div className="stat-label">Trades Executed</div>
          </div>
          <div className="stat">
            <div className="stat-value">0</div>
            <div className="stat-label">Gas Fees Paid</div>
          </div>
          <div className="stat">
            <div className="stat-value">⚡</div>
            <div className="stat-label">Instant Settlement</div>
          </div>
        </div>

        {/* Status Messages */}
        {isLoading && (
          <div className="status-message loading">
            <div className="spinner"></div>
            Processing transaction...
          </div>
        )}

        {error && (
          <div className="status-message error">
            {error}
          </div>
        )}

        {!channelId && !isLoading && (
          <div className="status-message info">
            Creating Yellow channel... Please wait.
          </div>
        )}

        {/* Info Panel */}
        <div className="info-panel">
          <h3>How It Works</h3>
          <ol>
            <li>
              <strong>Session-Based:</strong> You signed once - all trades are gasless
            </li>
            <li>
              <strong>Off-Chain Execution:</strong> Trades happen instantly via Yellow state channels
            </li>
            <li>
              <strong>AI Agent:</strong> Monitors your intents and executes via LI.FI + Uniswap
            </li>
            <li>
              <strong>On-Chain Settlement:</strong> Final balances settle when you close session
            </li>
          </ol>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="activity-feed">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {tradeCount === 0 ? (
            <div className="no-activity">
              No trades yet. Click a button to execute your first gasless trade!
            </div>
          ) : (
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <span>{tradeCount} gasless trade{tradeCount > 1 ? 's' : ''} executed</span>
              <span className="activity-time">Just now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
