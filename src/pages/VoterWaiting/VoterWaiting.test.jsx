import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VoterWaiting } from './VoterWaiting'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      const translations = {
        'voterWaiting.submitted': 'Vote Submitted!',
        'voterWaiting.waiting': `Waiting for other voters, ${params?.name}...`,
        'voterWaiting.resultsWillAppear': 'Results will appear automatically when revealed.'
      }
      return translations[key] || key
    }
  })
}))

// Mock session service
vi.mock('../../services/sessionService', () => ({
  getSessionById: vi.fn()
}))

import { getSessionById } from '../../services/sessionService'

describe('VoterWaiting', () => {
  const mockOnSessionUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('displays submitted message', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(screen.getByText('Vote Submitted!')).toBeInTheDocument()
  })

  test('displays waiting message with voter name', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(screen.getByText('Waiting for other voters, Alice...')).toBeInTheDocument()
  })

  test('displays results info message', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(screen.getByText('Results will appear automatically when revealed.')).toBeInTheDocument()
  })

  test('shows spinner', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(document.querySelector('.voter-waiting__spinner')).toBeInTheDocument()
  })

  test('polls session immediately on mount', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(getSessionById).toHaveBeenCalledWith('session-123')
  })

  test('does not poll when sessionId is empty', async () => {
    await act(async () => {
      render(
        <VoterWaiting
          sessionId=""
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(getSessionById).not.toHaveBeenCalled()
  })

  test('calls onSessionUpdate when stage becomes eliminated', async () => {
    const eliminatedSession = { stage: 'eliminated', round: 1 }
    getSessionById.mockResolvedValue(eliminatedSession)

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(mockOnSessionUpdate).toHaveBeenCalledWith(eliminatedSession)
  })

  test('calls onSessionUpdate when stage becomes winner', async () => {
    const winnerSession = { stage: 'winner', round: 2 }
    getSessionById.mockResolvedValue(winnerSession)

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={2}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(mockOnSessionUpdate).toHaveBeenCalledWith(winnerSession)
  })

  test('calls onSessionUpdate when round advances', async () => {
    const nextRoundSession = { stage: 'voting', round: 2 }
    getSessionById.mockResolvedValue(nextRoundSession)

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(mockOnSessionUpdate).toHaveBeenCalledWith(nextRoundSession)
  })

  test('does not call onSessionUpdate when still in same round', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(mockOnSessionUpdate).not.toHaveBeenCalled()
  })

  test('handles poll error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getSessionById.mockRejectedValue(new Error('Network error'))

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to poll session:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('VoterWaiting polling interval', () => {
  const mockOnSessionUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('polls every 2 seconds', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    await act(async () => {
      render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
    })

    expect(getSessionById).toHaveBeenCalledTimes(1)

    // Advance 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(getSessionById).toHaveBeenCalledTimes(2)
  })

  test('cleans up interval on unmount', async () => {
    getSessionById.mockResolvedValue({ stage: 'voting', round: 1 })

    let unmount
    await act(async () => {
      const result = render(
        <VoterWaiting
          sessionId="session-123"
          voterName="Alice"
          currentRound={1}
          onSessionUpdate={mockOnSessionUpdate}
        />
      )
      unmount = result.unmount
    })

    expect(getSessionById).toHaveBeenCalledTimes(1)

    unmount()

    // Advance time - should not poll anymore
    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(getSessionById).toHaveBeenCalledTimes(1)
  })
})
