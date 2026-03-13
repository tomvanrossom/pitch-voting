import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VoterChip } from './VoterChip'

describe('VoterChip', () => {
  test('renders voter name', () => {
    render(<VoterChip name="Alice" selected={false} onSelect={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  test('calls onSelect with name when clicked', () => {
    const onSelect = vi.fn()
    render(<VoterChip name="Alice" selected={false} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith('Alice')
  })

  test('applies selected class when selected', () => {
    render(<VoterChip name="Alice" selected={true} onSelect={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).toHaveClass('voter-chip--selected')
  })

  test('does not have selected class when unselected', () => {
    render(<VoterChip name="Alice" selected={false} onSelect={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).not.toHaveClass('voter-chip--selected')
  })

  test('is disabled when disabled prop is true', () => {
    render(<VoterChip name="Alice" selected={false} onSelect={vi.fn()} disabled />)
    const chip = screen.getByRole('button')
    expect(chip).toBeDisabled()
  })

  test('does not call onSelect when disabled', () => {
    const onSelect = vi.fn()
    render(<VoterChip name="Alice" selected={false} onSelect={onSelect} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).not.toHaveBeenCalled()
  })
})
