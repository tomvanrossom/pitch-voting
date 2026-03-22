import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreateSession } from './CreateSession'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'createSession.title': 'Create Voting Session',
        'createSession.votersLabel': 'Voters (comma-separated)',
        'createSession.votersPlaceholder': 'Alice, Bob, Charlie',
        'createSession.candidatesLabel': 'Candidates (comma-separated)',
        'createSession.candidatesPlaceholder': 'Option A, Option B, Option C',
        'createSession.createButton': 'Create Session',
        'createSession.creating': 'Creating...',
        'createSession.minVotersError': 'At least 2 voters required',
        'createSession.minCandidatesError': 'At least 2 candidates required'
      }
      return translations[key] || key
    }
  })
}))

// Mock session service
vi.mock('../../services/sessionService', () => ({
  createSession: vi.fn()
}))

import { createSession } from '../../services/sessionService'

describe('CreateSession', () => {
  const mockOnSessionCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('renders form with all fields', () => {
    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    expect(screen.getByText('Create Voting Session')).toBeInTheDocument()
    expect(screen.getByLabelText(/voters/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/candidates/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create session/i })).toBeInTheDocument()
  })

  test('shows error when less than 2 voters', async () => {
    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: 'Option A, Option B' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('At least 2 voters required')
    })
  })

  test('shows error when less than 2 candidates', async () => {
    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice, Bob' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: 'Option A' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('At least 2 candidates required')
    })
  })

  test('calls createSession with parsed voters and candidates', async () => {
    const mockSession = { id: 'session-123', code: 'ABC123' }
    createSession.mockResolvedValue({ session: mockSession, hostToken: 'token-123' })

    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice, Bob, Charlie' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: 'Option A, Option B' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith(
        ['Alice', 'Bob', 'Charlie'],
        ['Option A', 'Option B']
      )
    })
  })

  test('calls onSessionCreated on success', async () => {
    const mockSession = { id: 'session-123', code: 'ABC123' }
    createSession.mockResolvedValue({ session: mockSession, hostToken: 'token-123' })

    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice, Bob' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: 'Option A, Option B' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(mockOnSessionCreated).toHaveBeenCalledWith(mockSession, 'token-123')
    })
  })

  test('stores host token in localStorage', async () => {
    const mockSession = { id: 'session-123', code: 'ABC123' }
    createSession.mockResolvedValue({ session: mockSession, hostToken: 'token-123' })

    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice, Bob' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: 'Option A, Option B' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(localStorage.getItem('host_session-123')).toBe('token-123')
    })
  })

  test('shows loading state while creating', async () => {
    createSession.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice, Bob' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: 'Option A, Option B' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Creating...')
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  test('trims whitespace from inputs', async () => {
    const mockSession = { id: 'session-123', code: 'ABC123' }
    createSession.mockResolvedValue({ session: mockSession, hostToken: 'token-123' })

    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: '  Alice  ,  Bob  ' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: '  A  ,  B  ' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith(['Alice', 'Bob'], ['A', 'B'])
    })
  })

  test('filters empty entries', async () => {
    const mockSession = { id: 'session-123', code: 'ABC123' }
    createSession.mockResolvedValue({ session: mockSession, hostToken: 'token-123' })

    render(<CreateSession onSessionCreated={mockOnSessionCreated} />)

    fireEvent.change(screen.getByLabelText(/voters/i), { target: { value: 'Alice,,Bob,' } })
    fireEvent.change(screen.getByLabelText(/candidates/i), { target: { value: ',A,,B,' } })
    fireEvent.click(screen.getByRole('button', { name: /create session/i }))

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith(['Alice', 'Bob'], ['A', 'B'])
    })
  })
})
