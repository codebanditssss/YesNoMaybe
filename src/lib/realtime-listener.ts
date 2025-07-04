import { Client } from 'pg'

export interface RealtimeEvent {
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  new?: any
  old?: any
  timestamp: number
}

class RealtimeListener {
  private client: Client | null = null
  private isConnected = false
  private eventBuffer: Map<string, RealtimeEvent[]> = new Map()
  private maxBufferSize = 100
  private subscribers: Map<string, Set<(event: RealtimeEvent) => void>> = new Map()

  constructor() {
    this.initializeChannels()
  }

  private initializeChannels() {
    const channels = ['orders_changes', 'trades_changes', 'user_balances_changes', 'markets_changes']
    channels.forEach(channel => {
      this.eventBuffer.set(channel, [])
      this.subscribers.set(channel, new Set())
    })
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('🔌 Already connected to PostgreSQL')
      return
    }

    try {
      // Use direct PostgreSQL connection string
      const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
      
      if (!connectionString) {
        throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required')
      }

      this.client = new Client({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      })

      await this.client.connect()
      this.isConnected = true
      
      console.log('🔌 Connected to PostgreSQL for realtime notifications')
      
      // Set up listeners for each channel
      await this.setupListeners()
      
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error)
      throw error
    }
  }

  private async setupListeners(): Promise<void> {
    if (!this.client) return

    const channels = ['orders_changes', 'trades_changes', 'user_balances_changes', 'markets_changes']
    
    // Listen to each channel
    for (const channel of channels) {
      await this.client.query(`LISTEN ${channel}`)
      console.log(`👂 Listening to channel: ${channel}`)
    }

    // Handle notifications
    this.client.on('notification', (notification) => {
      try {
        const { channel, payload } = notification
        if (!channel || !payload) return

        const event: RealtimeEvent = JSON.parse(payload)
        this.handleEvent(channel, event)
        
      } catch (error) {
        console.error('❌ Error processing notification:', error)
      }
    })

    this.client.on('error', (error) => {
      console.error('❌ PostgreSQL client error:', error)
      this.isConnected = false
    })

    this.client.on('end', () => {
      console.log('🔌 PostgreSQL connection ended')
      this.isConnected = false
    })
  }

  private handleEvent(channel: string, event: RealtimeEvent): void {
    console.log(`📡 Received event on ${channel}:`, {
      operation: event.operation,
      table: event.table,
      timestamp: new Date(event.timestamp).toISOString()
    })

    // Add to buffer
    const buffer = this.eventBuffer.get(channel)
    if (buffer) {
      buffer.push(event)
      
      // Keep buffer size manageable
      if (buffer.length > this.maxBufferSize) {
        buffer.shift() // Remove oldest event
      }
    }

    // Notify subscribers
    const channelSubscribers = this.subscribers.get(channel)
    if (channelSubscribers) {
      channelSubscribers.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('❌ Error in subscriber callback:', error)
        }
      })
    }
  }

  // Subscribe to events on a specific channel
  subscribe(channel: string, callback: (event: RealtimeEvent) => void): () => void {
    const channelSubscribers = this.subscribers.get(channel)
    if (channelSubscribers) {
      channelSubscribers.add(callback)
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(channel)
      if (subscribers) {
        subscribers.delete(callback)
      }
    }
  }

  // Get recent events from buffer
  getRecentEvents(channel: string, limit = 10): RealtimeEvent[] {
    const buffer = this.eventBuffer.get(channel)
    if (!buffer) return []
    
    return buffer.slice(-limit)
  }

  // Get all buffered events
  getAllEvents(): Record<string, RealtimeEvent[]> {
    const result: Record<string, RealtimeEvent[]> = {}
    this.eventBuffer.forEach((events, channel) => {
      result[channel] = [...events]
    })
    return result
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
      this.isConnected = false
      console.log('🔌 Disconnected from PostgreSQL')
    }
  }

  get connected(): boolean {
    return this.isConnected
  }
}

// Singleton instance
export const realtimeListener = new RealtimeListener()

// Auto-connect in server environments
if (typeof window === 'undefined') {
  realtimeListener.connect().catch(console.error)
} 