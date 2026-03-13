import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { JoinSession } from './JoinSession'

// Mock the session service
vi.mock('../../services/sessionService', () => ({
  joinSession: vi.fn()
}))

import { joinSession } from '../../services/sessionService'

describe('JoinSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('auto-submits lookup when initialCode is provided', async () => {
    const mockSession = { id: '123', code: 'ABC123', voters: ['Alice', 'Bob'] }
    joinSession.mockResolvedValue(mockSession)

    render(<JoinSession initialCode="ABC123" onSessionJoined={vi.fn()} />)

    await waitFor(() => {
      expect(joinSession).toHaveBeenCalledWith('ABC123')
    })
  })

  test('does not auto-submit when initialCode is empty', () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    expect(joinSession).not.toHaveBeenCalled()
  })
})
