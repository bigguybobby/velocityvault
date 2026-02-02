import { useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { useYellow } from '../contexts/YellowContext'

interface Props {
  onConnect: () => void
}

export default function WalletConnect({ onConnect }: Props) {
  const { connect, isLoading, error } = useYellow()
  const [walletError, setWalletError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setWalletError(null)

      // Check for MetaMask
      if (!window.ethereum) {
        setWalletError('Please install MetaMask to continue')
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (!accounts || accounts.length === 0) {
        setWalletError('No accounts found')
        return
      }

      // Create wallet client
      const walletClient = createWalletClient({
        account: accounts[0],
        chain: sepolia,
        transport: custom(window.ethereum),
      })

      // Connect to Yellow Network
      await connect(walletClient)
      onConnect()

    } catch (err: any) {
      console.error('Wallet connection error:', err)
      setWalletError(err.message || 'Failed to connect wallet')
    }
  }

  return (
    <div className="wallet-connect">
      <div className="connect-card">
        <div className="icon">⚡</div>
        
        <h2>Welcome to VelocityVault</h2>
        <p className="description">
          Experience gasless trading powered by Yellow Network.
          <br />
          Trade instantly without waiting for blockchain confirmations.
        </p>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🚀</span>
            <span>Instant Execution</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💨</span>
            <span>Zero Gas Fees</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span>Secure on Arc</span>
          </div>
        </div>

        <button 
          className="connect-button"
          onClick={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {(error || walletError) && (
          <div className="error-message">
            {error || walletError}
          </div>
        )}

        <p className="network-info">
          Network: Sepolia Testnet (Yellow SDK)
          <br />
          Vault: Arc Testnet
        </p>
      </div>
    </div>
  )
}

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
