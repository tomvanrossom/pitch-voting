import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      const translations = {
        'eliminated.roundResult': 'Round Result',
        'eliminated.loserThisRound': 'The loser of this round:',
        'eliminated.nextRound': 'Next Round',
        'eliminated.proceedToRound': `Proceed to round ${params?.round} of voting`,
        'eliminated.waitingForHost': 'Waiting for host to start next round...'
      }
      return translations[key] || key
    }
  })
}))

// Mock session service
vi.mock('../../services/sessionService', () => ({
  getSessionById: vi.fn()
}))

const mockDispatch = vi.fn()

// Mock voting context - will be overridden per test
vi.mock('../../context/votingContext.jsx', () => ({
  useVoting: vi.fn()
}))

import { useVoting } from '../../context/votingContext.jsx'
import { Eliminated } from './Eliminated'

describe('Eliminated - Host View', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useVoting).mockReturnValue({
      state: { loser: 'Alice', round: 1, isHost: true, sessionId: 'session-123' },
      dispatch: mockDispatch
    })
  })

  test('displays eliminated candidate name', () => {
    render(<Eliminated />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('The loser of this round:')).toBeInTheDocument()
  })

  test('shows Next Round button for host', () => {
    render(<Eliminated />)

    // Button has aria-label "Proceed to round X of voting"
    expect(screen.getByRole('button', { name: /proceed to round/i })).toBeInTheDocument()
    expect(screen.getByText('Next Round')).toBeInTheDocument()
  })

  test('clicking Next Round dispatches NEXT_ROUND', () => {
    render(<Eliminated />)

    fireEvent.click(screen.getByRole('button', { name: /proceed to round/i }))

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'NEXT_ROUND' })
  })

  test('has accessible heading', () => {
    render(<Eliminated />)

    expect(screen.getByText('Round Result')).toBeInTheDocument()
  })
})

describe('Eliminated - Voter View', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useVoting).mockReturnValue({
      state: { loser: 'Bob', round: 2, isHost: false, sessionId: 'session-123' },
      dispatch: mockDispatch
    })
  })

  test('shows waiting message for voters', () => {
    render(<Eliminated />)

    expect(screen.getByText('Waiting for host to start next round...')).toBeInTheDocument()
  })

  test('shows spinner for voters', () => {
    render(<Eliminated />)

    expect(document.querySelector('.eliminated__spinner')).toBeInTheDocument()
  })

  test('does not show Next Round button for voters', () => {
    render(<Eliminated />)

    expect(screen.queryByRole('button', { name: /next round/i })).not.toBeInTheDocument()
  })
})
