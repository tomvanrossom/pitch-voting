import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSessionCode, createSession } from './sessionService'

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
