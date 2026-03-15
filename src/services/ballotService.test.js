import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

// Mock supabaseHelpers
vi.mock('../utils/supabaseHelpers', () => ({
  createHostClient: vi.fn()
}))

describe('submitBallot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits a ballot for a voter', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockBallot = {
      id: 'ballot-uuid',
      session_id: 'session-uuid',
      round: 1,
      voter_name: 'Alice',
      rankings: ['Option1', 'Option2']
    }

    supabase.rpc.mockResolvedValue({ data: mockBallot, error: null })

    const { submitBallot } = await import('./ballotService')
    const result = await submitBallot('session-uuid', 1, 'Alice', ['Option1', 'Option2'])

    expect(result).toEqual(mockBallot)
    expect(supabase.rpc).toHaveBeenCalledWith('insert_ballot', {
      p_session_id: 'session-uuid',
      p_round: 1,
      p_voter_name: 'Alice',
      p_rankings: ['Option1', 'Option2']
    })
  })

  it('throws error on duplicate submission', async () => {
    const { supabase } = await import('../lib/supabase')

    supabase.rpc.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate' }
    })

    const { submitBallot } = await import('./ballotService')
    await expect(
      submitBallot('session-uuid', 1, 'Alice', ['Option1'])
    ).rejects.toThrow('already submitted')
  })
})

describe('getRoundBallots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches all ballots for a round with host token', async () => {
    const { createHostClient } = await import('../utils/supabaseHelpers')

    const mockBallots = [
      { voter_name: 'Alice', rankings: ['A', 'B'] },
      { voter_name: 'Bob', rankings: ['B', 'A'] }
    ]

    createHostClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockBallots, error: null })
          })
        })
      })
    })

    const { getRoundBallots } = await import('./ballotService')
    const result = await getRoundBallots('session-uuid', 1, 'host-token')

    expect(result).toHaveLength(2)
    expect(result[0].voter_name).toBe('Alice')
  })
})
