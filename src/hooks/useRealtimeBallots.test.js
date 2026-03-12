import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn()
  }
  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn()
    }
  }
})

describe('useRealtimeBallots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ballot count starting at 0', async () => {
    const { useRealtimeBallots } = await import('./useRealtimeBallots')
    const { result } = renderHook(() =>
      useRealtimeBallots('session-123', true)
    )

    expect(result.current.ballotCount).toBe(0)
    expect(result.current.votersSubmitted).toEqual([])
  })

  it('does not subscribe when disabled', async () => {
    const { supabase } = await import('../lib/supabase')
    const { useRealtimeBallots } = await import('./useRealtimeBallots')

    renderHook(() => useRealtimeBallots('session-123', false))

    expect(supabase.channel).not.toHaveBeenCalled()
  })
})
