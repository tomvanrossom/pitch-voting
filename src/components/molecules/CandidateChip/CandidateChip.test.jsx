import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CandidateChip } from './CandidateChip'

describe('CandidateChip', () => {
  test('renders candidate name', () => {
    render(<CandidateChip name="Malta" onTap={vi.fn()} />)
    expect(screen.getByText('Malta')).toBeInTheDocument()
  })

  test('has accessible label with rank when ranked', () => {
    render(<CandidateChip name="Malta" rank={1} onTap={vi.fn()} />)
    expect(screen.getByLabelText('Malta, ranked 1')).toBeInTheDocument()
  })

  test('has accessible label without rank when unranked', () => {
    render(<CandidateChip name="Malta" onTap={vi.fn()} />)
    expect(screen.getByLabelText('Malta, not ranked')).toBeInTheDocument()
  })

  test('calls onTap with candidate name when clicked', () => {
    const onTap = vi.fn()
    render(<CandidateChip name="Malta" onTap={onTap} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onTap).toHaveBeenCalledWith('Malta')
  })

  test('applies ranked class when rank is provided', () => {
    render(<CandidateChip name="Malta" rank={2} onTap={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).toHaveClass('candidate-chip--ranked')
  })

  test('is disabled when disabled prop is true', () => {
    render(<CandidateChip name="Malta" disabled onTap={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).toBeDisabled()
  })
})
