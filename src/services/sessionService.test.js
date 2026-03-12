import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSessionCode, createSession, joinSession, getSessionById } from './sessionService'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

describe('generateSessionCode', () => {
  it('returns a 6-character alphanumeric string', () => {
    const code = generateSessionCode()

    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('generates different codes on subsequent calls', () => {
    const codes = new Set()
    for (let i = 0; i < 100; i++) {
      codes.add(generateSessionCode())
    }
    expect(codes.size).toBeGreaterThan(90)
  })
})

describe('createSession', () => {
  it('creates a session with voters and candidates', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockSession = {
      id: 'uuid-123',
      code: 'ABC123',
      host_token: 'host-uuid',
      voters: ['Alice', 'Bob'],
      candidates: ['Option1', 'Option2']
    }

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
        })
      })
    })

    const result = await createSession(['Alice', 'Bob'], ['Option1', 'Option2'])

    expect(result.session).toEqual(mockSession)
    expect(result.hostToken).toBe('host-uuid')
  })
})

describe('joinSession', () => {
  it('fetches session by code', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockSession = {
      id: 'uuid-123',
      code: 'ABC123',
      voters: ['Alice', 'Bob'],
      candidates: ['Option1', 'Option2'],
      stage: 'setup'
    }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
        })
      })
    })

    const { joinSession } = await import('./sessionService')
    const result = await joinSession('ABC123')

    expect(result).toEqual(mockSession)
  })

  it('throws error for invalid code', async () => {
    const { supabase } = await import('../lib/supabase')

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
        })
      })
    })

    const { joinSession } = await import('./sessionService')
    await expect(joinSession('INVALID')).rejects.toThrow()
  })
})

describe('getSessionById', () => {
  it('fetches session by id', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockSession = {
      id: 'uuid-123',
      code: 'ABC123',
      voters: ['Alice', 'Bob'],
      stage: 'voting'
    }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
        })
      })
    })

    const { getSessionById } = await import('./sessionService')
    const result = await getSessionById('uuid-123')

    expect(result.id).toBe('uuid-123')
  })
})
