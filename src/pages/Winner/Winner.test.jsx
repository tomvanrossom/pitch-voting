import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'winner.finalResults': 'Final Results',
        'winner.theWinnerIs': 'Winner:',
        'winner.votingSummary': 'Voting summary',
        'results.round': 'Round',
        'results.winner': 'Winner',
        'results.caption': 'Results caption'
      }
      return translations[key] || key
    }
  })
}))

// Mock voting context
const mockState = {
  winner: 'Charlie',
  eliminatedHistory: ['Alice', 'Bob'],
  scoreHistory: [
    { Alice: 3, Bob: 5, Charlie: 7 },
    { Bob: 4, Charlie: 6 }
  ],
  candidates: ['Charlie'],
  session: { candidates: ['Alice', 'Bob', 'Charlie'] }
}

vi.mock('../../context/votingContext.jsx', () => ({
  useVoting: vi.fn(() => ({ state: mockState }))
}))

import { useVoting } from '../../context/votingContext.jsx'
import { Winner } from './Winner'

beforeEach(() => {
  vi.mocked(useVoting).mockReturnValue({ state: mockState })
})

describe('Winner', () => {
  test('displays winner name in alert', () => {
    render(<Winner />)

    // Check specifically within the alert
    const alert = screen.getByRole('status')
    expect(alert).toHaveTextContent('Charlie')
    expect(alert).toHaveTextContent('Winner:')
  })

  test('displays winner alert with trophy', () => {
    render(<Winner />)

    const alert = screen.getByRole('status')
    expect(alert).toHaveTextContent('🏆')
  })

  test('has accessible heading', () => {
    render(<Winner />)

    expect(screen.getByText('Final Results')).toBeInTheDocument()
  })

  test('shows voting summary toggle', () => {
    render(<Winner />)

    expect(screen.getByText('Voting summary')).toBeInTheDocument()
  })

  test('summary is collapsed by default', () => {
    render(<Winner />)

    const toggleButton = screen.getByRole('button', { name: /voting summary/i })
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('clicking toggle expands summary', () => {
    render(<Winner />)

    const toggleButton = screen.getByRole('button', { name: /voting summary/i })
    fireEvent.click(toggleButton)

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('pressing Enter expands summary', () => {
    render(<Winner />)

    const toggleButton = screen.getByRole('button', { name: /voting summary/i })
    fireEvent.keyDown(toggleButton, { key: 'Enter' })

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('pressing Space expands summary', () => {
    render(<Winner />)

    const toggleButton = screen.getByRole('button', { name: /voting summary/i })
    fireEvent.keyDown(toggleButton, { key: ' ' })

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('toggle button has aria-controls', () => {
    render(<Winner />)

    const toggleButton = screen.getByRole('button', { name: /voting summary/i })
    expect(toggleButton).toHaveAttribute('aria-controls', 'results-table')
  })

  test('expand icon rotates when expanded', () => {
    render(<Winner />)

    const toggleButton = screen.getByRole('button', { name: /voting summary/i })
    const icon = toggleButton.querySelector('.winner__summary-icon')

    expect(icon).not.toHaveClass('winner__summary-icon--expanded')

    fireEvent.click(toggleButton)

    expect(icon).toHaveClass('winner__summary-icon--expanded')
  })
})
