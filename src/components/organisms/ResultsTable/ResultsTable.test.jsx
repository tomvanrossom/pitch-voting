import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResultsTable } from './ResultsTable'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'results.round': 'Round',
        'results.winner': 'Winner',
        'results.caption': 'Round-by-round elimination results'
      }
      return translations[key] || key
    }
  })
}))

describe('ResultsTable', () => {
  const mockHistoryData = [
    { round: 1, eliminated: 'Alice', score: { Alice: 3, Bob: 5, Charlie: 7 } },
    { round: 2, eliminated: 'Bob', score: { Alice: null, Bob: 4, Charlie: 6 } }
  ]
  const allOptions = ['Alice', 'Bob', 'Charlie']
  const winner = 'Charlie'

  test('renders table with correct headers', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    expect(screen.getByText('Round')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  test('renders round numbers', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('renders scores for each candidate', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    // Round 1 scores
    expect(screen.getByText('5')).toBeInTheDocument() // Bob round 1
    expect(screen.getByText('7')).toBeInTheDocument() // Charlie round 1
  })

  test('shows eliminated candidate score with error chip', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    // Alice was eliminated in round 1 with score 3
    const aliceChip = screen.getByText('3')
    expect(aliceChip.closest('.chip')).toHaveClass('chip--error')
  })

  test('shows winner row with trophy', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    expect(screen.getByText('Winner')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  test('trophy chip has success color', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    const trophyChip = screen.getByText('🏆')
    expect(trophyChip.closest('.chip')).toHaveClass('chip--success')
  })

  test('renders dash for missing scores', () => {
    const historyWithMissing = [
      { round: 1, eliminated: 'Alice', score: { Alice: 3 } } // Bob and Charlie missing
    ]

    render(<ResultsTable historyData={historyWithMissing} allOptions={allOptions} winner={winner} />)

    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThan(0)
  })

  test('has accessible caption', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    expect(screen.getByText('Round-by-round elimination results')).toBeInTheDocument()
  })

  test('orders columns by elimination sequence with winner last', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    const headers = screen.getAllByRole('columnheader')
    // First header is "Round", then eliminated in order, then winner
    expect(headers[0]).toHaveTextContent('Round')
    expect(headers[1]).toHaveTextContent('Alice')  // eliminated round 1
    expect(headers[2]).toHaveTextContent('Bob')    // eliminated round 2
    expect(headers[3]).toHaveTextContent('Charlie') // winner (last)
  })

  test('shows leader score with success chip', () => {
    render(<ResultsTable historyData={mockHistoryData} allOptions={allOptions} winner={winner} />)

    // Charlie had highest score in round 1 (7) and round 2 (6)
    const charlieRound1Chip = screen.getByText('7')
    expect(charlieRound1Chip.closest('.chip')).toHaveClass('chip--success')

    const charlieRound2Chip = screen.getByText('6')
    expect(charlieRound2Chip.closest('.chip')).toHaveClass('chip--success')
  })

  test('shows multiple leaders when scores are tied', () => {
    // Round 1: Alice eliminated (3), Bob and Charlie tied for lead (7)
    const tiedHistoryData = [
      { round: 1, eliminated: 'Alice', score: { Alice: 3, Bob: 7, Charlie: 7 } },
      { round: 2, eliminated: 'Bob', score: { Alice: null, Bob: 4, Charlie: 6 } }
    ]

    render(<ResultsTable historyData={tiedHistoryData} allOptions={allOptions} winner={winner} />)

    // In round 1, both Bob and Charlie have score 7 (tied leaders)
    const leaderChips = screen.getAllByText('7')
    expect(leaderChips).toHaveLength(2)
    leaderChips.forEach(chip => {
      expect(chip.closest('.chip')).toHaveClass('chip--success')
    })
  })
})
