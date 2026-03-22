import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JoinSession } from './JoinSession'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'joinSession.title': 'Join Voting Session',
        'joinSession.codeLabel': 'Session Code',
        'joinSession.codePlaceholder': 'ABC123',
        'joinSession.findSession': 'Find Session',
        'joinSession.lookingUp': 'Looking up...',
        'joinSession.selectVoter': 'Select Your Name',
        'joinSession.joinButton': 'Join Session',
        'joinSession.sessionNotFound': 'Session not found. Check your code.'
      }
      return translations[key] || key
    }
  })
}))

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

describe('JoinSession voter selection', () => {
  const mockSession = {
    id: 'session-123',
    voters: ['Alice', 'Bob', 'Charlie']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    joinSession.mockResolvedValue(mockSession)
  })

  test('shows voter chips after session lookup', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })
  })

  test('selecting a voter chip highlights it', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Alice'))

    fireEvent.click(screen.getByText('Alice'))
    expect(screen.getByText('Alice').closest('button')).toHaveClass('voter-chip--selected')
  })

  test('only one voter can be selected at a time', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Alice'))

    fireEvent.click(screen.getByText('Alice'))
    fireEvent.click(screen.getByText('Bob'))

    expect(screen.getByText('Alice').closest('button')).not.toHaveClass('voter-chip--selected')
    expect(screen.getByText('Bob').closest('button')).toHaveClass('voter-chip--selected')
  })

  test('join button disabled until voter selected', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Alice'))

    const joinButton = screen.getByRole('button', { name: /join session/i })
    expect(joinButton).toBeDisabled()

    fireEvent.click(screen.getByText('Alice'))
    expect(joinButton).toBeEnabled()
  })

  test('join button calls onSessionJoined with correct voter', async () => {
    const onSessionJoined = vi.fn()
    render(<JoinSession onSessionJoined={onSessionJoined} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Bob'))

    fireEvent.click(screen.getByText('Bob'))
    fireEvent.click(screen.getByRole('button', { name: /join session/i }))

    expect(onSessionJoined).toHaveBeenCalledWith(mockSession, 'Bob')
  })
})
