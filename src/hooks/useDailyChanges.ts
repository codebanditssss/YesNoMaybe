import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PnLCalculator, DailyChange } from '@/lib/pnl-calculator'

interface DailySnapshot {
  id: string
  user_id: string
  snapshot_date: string
  total_value: number
  total_invested: number
  total_pnl: number
  active_positions: number
  created_at: string
  updated_at: string
}

interface UseDailyChangesResult {
  dailyChange: DailyChange | null
  yesterdaySnapshot: DailySnapshot | null
  todayValue: number
  loading: boolean
  error: string | null
  createSnapshot: () => Promise<void>
  refresh: () => void
}

export function useDailyChanges(currentTotalValue: number): UseDailyChangesResult {
  const [dailyChange, setDailyChange] = useState<DailyChange | null>(null)
  const [yesterdaySnapshot, setYesterdaySnapshot] = useState<DailySnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user, session } = useAuth()

  const getAuthHeaders = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error('No session token available')
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }, [session])

  const fetchYesterdaySnapshot = useCallback(async () => {
    if (!user || !session) {
      setDailyChange(null)
      setYesterdaySnapshot(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Calculate yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0] // YYYY-MM-DD

      const headers = await getAuthHeaders()
      
      // Try to get yesterday's snapshot
      const response = await fetch(`/api/portfolio-snapshots?date=${yesterdayStr}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch snapshot: ${response.status}`)
      }

      const result = await response.json()

      if (result.hasSnapshot && result.snapshot) {
        setYesterdaySnapshot(result.snapshot)
        
        // Calculate daily change using our P&L calculator
        const change = PnLCalculator.calculateDailyChange(
          currentTotalValue,
          result.snapshot.total_value
        )
        setDailyChange(change)
      } else {
        // No snapshot available - first day or missing data
        setYesterdaySnapshot(null)
        setDailyChange(null)
      }

    } catch (err) {
      console.error('Error fetching daily change:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch daily change')
      setDailyChange(null)
      setYesterdaySnapshot(null)
    } finally {
      setLoading(false)
    }
  }, [user, session, currentTotalValue, getAuthHeaders])

  const createSnapshot = useCallback(async () => {
    if (!user || !session) {
      throw new Error('Authentication required')
    }

    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/portfolio-snapshots?action=create', {
        method: 'POST',
        headers
      })

      if (!response.ok) {
        throw new Error(`Failed to create snapshot: ${response.status}`)
      }

      const result = await response.json()
      console.log('Daily snapshot created:', result.message)
      
      // Refresh daily change after creating snapshot
      setTimeout(() => {
        fetchYesterdaySnapshot()
      }, 1000)

    } catch (err) {
      console.error('Error creating snapshot:', err)
      throw err
    }
  }, [user, session, getAuthHeaders, fetchYesterdaySnapshot])

  const refresh = useCallback(() => {
    fetchYesterdaySnapshot()
  }, [fetchYesterdaySnapshot])

  // Fetch daily change when current value changes
  useEffect(() => {
    if (user && session && currentTotalValue > 0) {
      fetchYesterdaySnapshot()
    }
  }, [user, session, currentTotalValue, fetchYesterdaySnapshot])

  return {
    dailyChange,
    yesterdaySnapshot,
    todayValue: currentTotalValue,
    loading,
    error,
    createSnapshot,
    refresh
  }
} 