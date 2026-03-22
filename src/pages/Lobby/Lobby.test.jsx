import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Lobby } from './Lobby'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      const translations = {
        'lobby.welcome': `Welcome, ${params?.name}!`,
        'lobby.waiting': 'Waiting for host to start voting...',
        'lobby.votersAndCandidates': `${params?.voters} voters, ${params?.candidates} candidates`
      }
      return translations[key] || key
    }
  })
}))

// Mock session service
vi.mock('../../services/sessionService', () => ({
  getSessionById: vi.fn(),
  registerVoterJoined: vi.fn()
}))

import { getSessionById, registerVoterJoined } from '../../services/sessionService'

describe('Lobby', () => {
  const mockOnSessionStart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    registerVoterJoined.mockResolvedValue({})
  })

  test('displays welcome message with voter name', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(screen.getByText('Welcome, Alice!')).toBeInTheDocument()
  })

  test('displays waiting message', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(screen.getByText('Waiting for host to start voting...')).toBeInTheDocument()
  })

  test('shows spinner', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(document.querySelector('.lobby__spinner')).toBeInTheDocument()
  })

  test('registers voter as joined on mount', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(registerVoterJoined).toHaveBeenCalledWith('session-123', 'Alice')
  })

  test('polls session immediately on mount', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: ['Alice'], candidates: ['A', 'B'] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(getSessionById).toHaveBeenCalledWith('session-123')
  })

  test('displays voter and candidate count after poll', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: ['Alice', 'Bob'], candidates: ['A', 'B', 'C'] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(screen.getByText('2 voters, 3 candidates')).toBeInTheDocument()
  })

  test('calls onSessionStart when stage becomes voting', async () => {
    const votingSession = { stage: 'voting', voters: ['Alice'], candidates: ['A', 'B'] }
    getSessionById.mockResolvedValue(votingSession)

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(mockOnSessionStart).toHaveBeenCalledWith(votingSession)
  })

  test('does not call onSessionStart when stage is setup', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(mockOnSessionStart).not.toHaveBeenCalled()
  })

  test('handles poll error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getSessionById.mockRejectedValue(new Error('Network error'))

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to poll session:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('Lobby polling interval', () => {
  const mockOnSessionStart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    registerVoterJoined.mockResolvedValue({})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('polls every 3 seconds', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    await act(async () => {
      render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
    })

    expect(getSessionById).toHaveBeenCalledTimes(1)

    // Advance 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    // Allow promises to resolve
    await act(async () => {
      await Promise.resolve()
    })

    expect(getSessionById).toHaveBeenCalledTimes(2)
  })

  test('cleans up interval on unmount', async () => {
    getSessionById.mockResolvedValue({ stage: 'setup', voters: [], candidates: [] })

    let unmount
    await act(async () => {
      const result = render(<Lobby sessionId="session-123" voterName="Alice" onSessionStart={mockOnSessionStart} />)
      unmount = result.unmount
    })

    expect(getSessionById).toHaveBeenCalledTimes(1)

    unmount()

    // Advance time - should not poll anymore
    await act(async () => {
      vi.advanceTimersByTime(6000)
    })

    expect(getSessionById).toHaveBeenCalledTimes(1)
  })
})
