import { describe, it, expect } from 'vitest'
import { generateSessionCode } from './sessionService'

describe('generateSessionCode', () => {
  it('returns a 6-character alphanumeric string', () => {
    const code = generateSessionCode()

    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('generates different codes on subsequent calls', () => {
    const codes = new Set()
    for (let i = 0; i < 100; i++) {
      codes.add(generateSessionCode())
    }
    expect(codes.size).toBeGreaterThan(90)
  })
})
