import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { 
  NitroliteClient,
  WalletStateSigner,
  createAuthRequestMessage,
  createEIP712AuthMessageSigner,
  createAuthVerifyMessageFromChallenge,
  createECDSAMessageSigner,
  createCreateChannelMessage,
  createResizeChannelMessage,
  createTransferMessage,
} from '@erc7824/nitrolite'
import type { WalletClient } from 'viem'

interface YellowContextType {
  isConnected: boolean
  sessionKey: string | null
  balance: string
  channelId: string | null
  connect: (walletClient: WalletClient) => Promise<void>
  deposit: (amount: string) => Promise<void>
  trade: (action: 'buy' | 'sell', asset: string, amount: string) => Promise<void>
  withdraw: (amount: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

const YellowContext = createContext<YellowContextType | undefined>(undefined)

const YELLOW_WS_URL = 'wss://clearnet-sandbox.yellow.com/ws'
const CUSTODY_ADDRESS = '0x019B65A265EB3363822f2752141b3dF16131b262'
const ADJUDICATOR_ADDRESS = '0x7c7ccbc98469190849BCC6c926307794fDfB11F2'

export function YellowProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')
  const [channelId, setChannelId] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [client, setClient] = useState<NitroliteClient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isConnected) return

    const websocket = new WebSocket(YELLOW_WS_URL)
    
    websocket.onopen = () => {
      console.log('✅ Connected to Yellow Network')
    }

    websocket.onmessage = (event) => {
      const response = JSON.parse(event.data)
      handleWebSocketMessage(response)
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection to Yellow Network failed')
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [isConnected])

  const handleWebSocketMessage = (response: any) => {
    console.log('WS message:', response)

    if (response.error) {
      setError(response.error.message || 'Unknown error')
      setIsLoading(false)
      return
    }

    if (!response.res) return

    const [_, method, data] = response.res

    switch (method) {
      case 'auth_verify':
        console.log('✅ Authenticated')
        setSessionKey(data.session_key)
        setIsLoading(false)
        break

      case 'channels':
        const openChannel = data.channels?.find((c: any) => c.status === 'open')
        if (openChannel) {
          setChannelId(openChannel.channel_id)
          setBalance(openChannel.amount || '0')
        }
        setIsLoading(false)
        break

      case 'create_channel':
        setChannelId(data.channel_id)
        console.log('✅ Channel created:', data.channel_id)
        setIsLoading(false)
        break

      case 'resize_channel':
        console.log('✅ Channel funded')
        setIsLoading(false)
        break

      case 'transfer':
        console.log('✅ Transfer complete')
        // Update balance after transfer
        setBalance((prev) => {
          const prevNum = parseFloat(prev)
          const transferAmount = parseFloat(data.amount || '0')
          return (prevNum - transferAmount).toString()
        })
        setIsLoading(false)
        break
    }
  }

  const connect = async (walletClient: WalletClient) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create public client
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      })

      // Initialize Nitrolite client
      const nitroliteClient = new NitroliteClient({
        publicClient,
        walletClient,
        stateSigner: new WalletStateSigner(walletClient),
        addresses: {
          custody: CUSTODY_ADDRESS,
          adjudicator: ADJUDICATOR_ADDRESS,
        },
        chainId: sepolia.id,
        challengeDuration: 3600n,
      })

      setClient(nitroliteClient)

      // Generate session keypair
      const sessionPrivateKey = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('') as `0x${string}`

      const sessionAccount = walletClient.account
      if (!sessionAccount) throw new Error('No account found')

      // Create auth request
      const authParams = {
        session_key: sessionAccount.address,
        allowances: [{ asset: 'ytest.usd', amount: '1000000000' }],
        expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600),
        scope: 'velocityvault.app',
      }

      const authRequestMsg = await createAuthRequestMessage({
        address: sessionAccount.address,
        application: 'VelocityVault',
        ...authParams,
      })

      // Wait for WS to be ready
      await new Promise((resolve) => {
        const checkWs = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            clearInterval(checkWs)
            resolve(true)
          }
        }, 100)
      })

      // Send auth request
      ws?.send(authRequestMsg)
      setIsConnected(true)

    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect')
      setIsLoading(false)
    }
  }

  const deposit = async (amount: string) => {
    if (!client || !ws || !sessionKey) {
      setError('Not connected to Yellow Network')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In production, this would:
      // 1. User approves USDC on Arc
      // 2. User deposits to VelocityVault
      // 3. Create Yellow channel with that balance
      
      // For demo: create channel if needed
      if (!channelId) {
        const sessionSigner = createECDSAMessageSigner('0x' + '1'.repeat(64) as `0x${string}`)
        
        const createChannelMsg = await createCreateChannelMessage(
          sessionSigner,
          {
            chain_id: sepolia.id,
            token: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
          }
        )

        ws.send(createChannelMsg)
      } else {
        // Resize existing channel
        const sessionSigner = createECDSAMessageSigner('0x' + '1'.repeat(64) as `0x${string}`)
        
        const resizeMsg = await createResizeChannelMessage(
          sessionSigner,
          {
            channel_id: channelId as `0x${string}`,
            allocate_amount: BigInt(parseFloat(amount) * 1e6), // Convert to USDC units
            funds_destination: client.account.address,
          }
        )

        ws.send(resizeMsg)
      }

      // Update balance optimistically
      setBalance((prev) => (parseFloat(prev) + parseFloat(amount)).toString())

    } catch (err: any) {
      console.error('Deposit error:', err)
      setError(err.message || 'Deposit failed')
      setIsLoading(false)
    }
  }

  const trade = async (action: 'buy' | 'sell', asset: string, amount: string) => {
    if (!ws || !sessionKey) {
      setError('Not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create off-chain transfer intent
      // This represents the trade action but doesn't execute it yet
      // The AI agent monitors these intents and executes via LI.FI

      const sessionSigner = createECDSAMessageSigner('0x' + '1'.repeat(64) as `0x${string}`)
      
      const transferMsg = await createTransferMessage(
        sessionSigner,
        {
          destination: '0x0000000000000000000000000000000000000001', // Placeholder
          allocations: [{
            asset: 'ytest.usd',
            amount: (parseFloat(amount) * 1e6).toString()
          }]
        },
        Date.now()
      )

      ws.send(transferMsg)

      // Emit event for agent to monitor
      console.log(`🤖 Trade intent: ${action} ${amount} ${asset}`)

    } catch (err: any) {
      console.error('Trade error:', err)
      setError(err.message || 'Trade failed')
      setIsLoading(false)
    }
  }

  const withdraw = async (amount: string) => {
    if (!client) {
      setError('Not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In production: close Yellow channel, withdraw from VelocityVault
      // For demo: update balance
      setBalance((prev) => Math.max(0, parseFloat(prev) - parseFloat(amount)).toString())
      setIsLoading(false)
    } catch (err: any) {
      console.error('Withdraw error:', err)
      setError(err.message || 'Withdraw failed')
      setIsLoading(false)
    }
  }

  const value: YellowContextType = {
    isConnected,
    sessionKey,
    balance,
    channelId,
    connect,
    deposit,
    trade,
    withdraw,
    isLoading,
    error,
  }

  return (
    <YellowContext.Provider value={value}>
      {children}
    </YellowContext.Provider>
  )
}

export function useYellow() {
  const context = useContext(YellowContext)
  if (!context) {
    throw new Error('useYellow must be used within YellowProvider')
  }
  return context
}
