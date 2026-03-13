import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TapRankBallot } from './TapRankBallot'

// Create a shared mock dispatch function
const mockDispatch = vi.fn()

// Mock the voting context
vi.mock('../../../context/votingContext.jsx', () => ({
  useVoting: () => ({
    state: { sessionId: null, voterName: null, isHost: false, round: 1 },
    dispatch: mockDispatch
  })
}))

describe('TapRankBallot', () => {
  const candidates = ['Malta', 'Albanie', 'Taghazout']
  const voterName = 'Tom'

  beforeEach(() => {
    mockDispatch.mockClear()
  })

  test('renders all candidates as chips', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    expect(screen.getByText('Malta')).toBeInTheDocument()
    expect(screen.getByText('Albanie')).toBeInTheDocument()
    expect(screen.getByText('Taghazout')).toBeInTheDocument()
  })

  test('tapping candidate assigns next rank', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    fireEvent.click(screen.getByText('Malta'))
    expect(screen.getByLabelText('Malta, ranked 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Albanie'))
    expect(screen.getByLabelText('Albanie, ranked 2')).toBeInTheDocument()
  })

  test('tapping ranked candidate removes rank and shifts others', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    // Rank Malta as 1, Albanie as 2
    fireEvent.click(screen.getByText('Malta'))
    fireEvent.click(screen.getByText('Albanie'))

    // Remove Malta (rank 1)
    fireEvent.click(screen.getByText('Malta'))

    // Albanie should now be rank 1
    const albanieChip = screen.getByLabelText(/Albanie, ranked 1/)
    expect(albanieChip).toBeInTheDocument()
  })

  test('auto-completes last candidate when N-1 are ranked', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    // Rank 2 of 3 candidates
    fireEvent.click(screen.getByText('Malta'))
    fireEvent.click(screen.getByText('Albanie'))

    // Taghazout should auto-complete as rank 3
    expect(screen.getByLabelText(/Taghazout, ranked 3/)).toBeInTheDocument()
  })

  test('submit button disabled until all ranked', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeDisabled()

    // Rank all candidates (2 taps, last auto-completes)
    fireEvent.click(screen.getByText('Malta'))
    fireEvent.click(screen.getByText('Albanie'))

    expect(submitButton).toBeEnabled()
  })

  test('shows instruction text', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)
    expect(screen.getByText('Tap candidates in order of preference')).toBeInTheDocument()
  })

  test('produces correct rankings array on submit', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    // Rank in specific order: Albanie first, then Malta (Taghazout auto-completes)
    fireEvent.click(screen.getByText('Albanie'))
    fireEvent.click(screen.getByText('Malta'))

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_BALLOT',
      payload: ['Albanie', 'Malta', 'Taghazout']
    })
  })
})
