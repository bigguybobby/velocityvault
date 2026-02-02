import { useState, useEffect } from 'react'
import { YellowProvider } from './contexts/YellowContext'
import WalletConnect from './components/WalletConnect'
import TradingInterface from './components/TradingInterface'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <YellowProvider>
      <div className="app">
        <header className="app-header">
          <h1>⚡ VelocityVault</h1>
          <p className="tagline">Gasless Trading on Arc</p>
        </header>

        <main className="app-main">
          {!isConnected ? (
            <WalletConnect onConnect={() => setIsConnected(true)} />
          ) : (
            <TradingInterface />
          )}
        </main>

        <footer className="app-footer">
          <p>Built with Yellow Network • Arc • LI.FI • Uniswap v4 • Sui • ENS</p>
          <p className="demo-note">HackMoney 2026 Demo</p>
        </footer>
      </div>
    </YellowProvider>
  )
}

export default App
