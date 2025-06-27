import { useState, useEffect, useCallback } from 'react'

// Types for orderbook
export interface OrderbookLevel {
  price: number
  quantity: number
  orders: Array<{
    id: string
    quantity: number
    username: string
  }>
}

export interface TradeInfo {
  id: string
  quantity: number
  price: number
  timestamp: string
  side: 'YES' | 'NO' | null
}

export interface MarketInfo {
  title: string
  category: string
  status: 'active' | 'resolved' | 'cancelled'
  resolutionDate: string
  currentPrice: number
  volume24h: number
  priceChange24h: number
  totalVolume: number
  yesVolume: number
  noVolume: number
}

export interface OrderbookData {
  marketId: string
  marketInfo: MarketInfo
  orderbook: {
    yesBids: OrderbookLevel[]
    noAsks: OrderbookLevel[]
    bestYesBid: number | null
    bestNoAsk: number | null
    spread: number | null
    totalYesQuantity: number
    totalNoQuantity: number
    totalOrderbookVolume: number
  }
  recentTrades: TradeInfo[]
  lastUpdated: string
}

interface UseOrderbookOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useOrderbook(marketId?: string, options: UseOrderbookOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5000
  } = options

  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch orderbook data
  const fetchOrderbook = useCallback(async () => {
    if (!marketId) {
      setOrderbook(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      if (!orderbook) setLoading(true) // Only show loading on initial fetch

      const response = await fetch(`/api/orderbook?market_id=${marketId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch orderbook')
      }

      const data: OrderbookData = await response.json()
      setOrderbook(data)
    } catch (err) {
      console.error('Error fetching orderbook:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orderbook')
    } finally {
      setLoading(false)
    }
  }, [marketId, orderbook])

  // Refresh orderbook data
  const refresh = useCallback(() => {
    fetchOrderbook()
  }, [fetchOrderbook])

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && marketId && refreshInterval > 0) {
      const interval = setInterval(fetchOrderbook, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, marketId, refreshInterval, fetchOrderbook])

  // Initial fetch when marketId changes
  useEffect(() => {
    fetchOrderbook()
  }, [fetchOrderbook])

  // Computed values
  const hasData = !!orderbook
  const isEmpty = hasData && orderbook.orderbook.totalOrderbookVolume === 0
  const spread = orderbook?.orderbook.spread
  const spreadPercentage = spread && orderbook?.orderbook.bestYesBid 
    ? (spread / orderbook.orderbook.bestYesBid) * 100 
    : 0

  // Market statistics
  const marketStats = orderbook ? {
    totalLiquidity: orderbook.orderbook.totalYesQuantity + orderbook.orderbook.totalNoQuantity,
    yesLiquidity: orderbook.orderbook.totalYesQuantity,
    noLiquidity: orderbook.orderbook.totalNoQuantity,
    liquidityRatio: orderbook.orderbook.totalOrderbookVolume > 0 
      ? (orderbook.orderbook.totalYesQuantity / orderbook.orderbook.totalOrderbookVolume) * 100 
      : 50,
    recentTradeCount: orderbook.recentTrades.length,
    lastTradePrice: orderbook.recentTrades[0]?.price || orderbook.marketInfo.currentPrice,
    priceVolatility: Math.abs(orderbook.marketInfo.priceChange24h)
  } : null

  // Best prices for quick access
  const bestPrices = orderbook ? {
    bestYesBid: orderbook.orderbook.bestYesBid,
    bestNoAsk: orderbook.orderbook.bestNoAsk,
    midPrice: orderbook.orderbook.bestYesBid && orderbook.orderbook.bestNoAsk
      ? (orderbook.orderbook.bestYesBid + (100 - orderbook.orderbook.bestNoAsk)) / 2
      : orderbook.marketInfo.currentPrice
  } : null

  // Order book depth analysis
  const getDepthAnalysis = useCallback(() => {
    if (!orderbook) return null

    const { yesBids, noAsks } = orderbook.orderbook
    
    // Calculate total volume at different price levels
    const yesVolume5 = yesBids.slice(0, 5).reduce((sum, level) => sum + level.quantity, 0)
    const noVolume5 = noAsks.slice(0, 5).reduce((sum, level) => sum + level.quantity, 0)
    
    return {
      top5YesVolume: yesVolume5,
      top5NoVolume: noVolume5,
      yesDepth: yesBids.length,
      noDepth: noAsks.length,
      averageYesOrderSize: yesBids.length > 0 
        ? yesBids.reduce((sum, level) => sum + level.quantity, 0) / yesBids.length 
        : 0,
      averageNoOrderSize: noAsks.length > 0 
        ? noAsks.reduce((sum, level) => sum + level.quantity, 0) / noAsks.length 
        : 0
    }
  }, [orderbook])

  return {
    // Core data
    orderbook,
    marketInfo: orderbook?.marketInfo,
    yesBids: orderbook?.orderbook.yesBids || [],
    noAsks: orderbook?.orderbook.noAsks || [],
    recentTrades: orderbook?.recentTrades || [],
    
    // State
    loading,
    error,
    hasData,
    isEmpty,
    
    // Actions
    refresh,
    
    // Computed values
    bestPrices,
    spread,
    spreadPercentage: Math.round(spreadPercentage * 100) / 100,
    marketStats,
    
    // Analysis functions
    getDepthAnalysis,
    
    // Utility functions
    formatPrice: (price: number) => (price / 10).toFixed(1), // Convert from API format (0-100) to display format (0-10)
    getMaxQuantity: () => {
      if (!orderbook) return 0
      const maxYes = Math.max(...orderbook.orderbook.yesBids.map(level => level.quantity), 0)
      const maxNo = Math.max(...orderbook.orderbook.noAsks.map(level => level.quantity), 0)
      return Math.max(maxYes, maxNo)
    },
    getDepthPercentage: (quantity: number) => {
      const maxQty = orderbook ? Math.max(
        Math.max(...orderbook.orderbook.yesBids.map(level => level.quantity), 0),
        Math.max(...orderbook.orderbook.noAsks.map(level => level.quantity), 0)
      ) : 1
      return maxQty > 0 ? (quantity / maxQty) * 100 : 0
    }
  }
}

// Hook for multiple markets orderbook summary
export function useOrderbookSummary(marketIds: string[]) {
  const [summaries, setSummaries] = useState<Record<string, Pick<OrderbookData, 'marketId' | 'marketInfo' | 'orderbook'>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummaries = useCallback(async () => {
    if (marketIds.length === 0) return

    try {
      setLoading(true)
      setError(null)

      // Fetch all market summaries in parallel
      const promises = marketIds.map(async (marketId) => {
        const response = await fetch(`/api/orderbook?market_id=${marketId}`)
        if (response.ok) {
          const data: OrderbookData = await response.json()
          return { [marketId]: data }
        }
        return null
      })

      const results = await Promise.all(promises)
      const validResults = results.filter(result => result !== null)
      
      const newSummaries = validResults.reduce((acc, result) => ({ ...acc, ...result }), {})
      setSummaries(newSummaries)

    } catch (err) {
      console.error('Error fetching orderbook summaries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch summaries')
    } finally {
      setLoading(false)
    }
  }, [marketIds])

  useEffect(() => {
    fetchSummaries()
  }, [fetchSummaries])

  return {
    summaries,
    loading,
    error,
    refresh: fetchSummaries
  }
} 