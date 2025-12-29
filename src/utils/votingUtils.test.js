import { describe, it, expect } from 'vitest';
import { weightedFindLoser } from './votingUtils';

describe('weightedFindLoser', () => {
  it('should calculate Borda count scores correctly', () => {
    const ballots = [
      ['A', 'B', 'C'],
      ['B', 'A', 'C'],
      ['A', 'B', 'C'],
    ];
    const candidates = ['A', 'B', 'C'];

    const result = weightedFindLoser(ballots, candidates);

    // A: (1 + 2 + 1) = 4
    // B: (2 + 1 + 2) = 5
    // C: (3 + 3 + 3) = 9
    expect(result.score).toEqual({
      A: 4,
      B: 5,
      C: 9,
    });
  });

  it('should identify the loser (highest score)', () => {
    const ballots = [
      ['A', 'B', 'C'],
      ['B', 'A', 'C'],
      ['A', 'B', 'C'],
    ];
    const candidates = ['A', 'B', 'C'];

    const result = weightedFindLoser(ballots, candidates);

    expect(result.loser).toBe('C'); // C has highest score (9)
  });

  it('should handle ties by picking one loser', () => {
    const ballots = [
      ['A', 'B'],
      ['B', 'A'],
    ];
    const candidates = ['A', 'B'];

    const result = weightedFindLoser(ballots, candidates);

    // Both have score 3 (1+2 and 2+1)
    expect(result.score.A).toBe(3);
    expect(result.score.B).toBe(3);
    expect(['A', 'B']).toContain(result.loser); // Should pick one
  });

  it('should only count remaining candidates', () => {
    const ballots = [
      ['A', 'B', 'C', 'D'], // Full ballot from earlier round
      ['B', 'A', 'D'],      // C was eliminated
    ];
    const candidates = ['A', 'B', 'D']; // C eliminated

    const result = weightedFindLoser(ballots, candidates);

    // Should only count A, B, D (ignore C)
    expect(result.score.C).toBeUndefined();
    expect(result.score.A).toBeDefined();
    expect(result.score.B).toBeDefined();
    expect(result.score.D).toBeDefined();
  });

  it('should handle single candidate', () => {
    const ballots = [['A'], ['A'], ['A']];
    const candidates = ['A'];

    const result = weightedFindLoser(ballots, candidates);

    expect(result.loser).toBe('A');
    expect(result.score.A).toBe(3); // 1+1+1
  });

  it('should handle empty ballots gracefully', () => {
    const ballots = [];
    const candidates = ['A', 'B', 'C'];

    const result = weightedFindLoser(ballots, candidates);

    // All scores should be 0
    expect(result.score.A).toBe(0);
    expect(result.score.B).toBe(0);
    expect(result.score.C).toBe(0);
    expect(['A', 'B', 'C']).toContain(result.loser);
  });

  it('should give higher scores to lower-ranked candidates', () => {
    const ballots = [['A', 'B', 'C', 'D']];
    const candidates = ['A', 'B', 'C', 'D'];

    const result = weightedFindLoser(ballots, candidates);

    // Rank 1 = 1 point, Rank 2 = 2 points, etc.
    expect(result.score.A).toBe(1); // Best rank
    expect(result.score.B).toBe(2);
    expect(result.score.C).toBe(3);
    expect(result.score.D).toBe(4); // Worst rank
    expect(result.loser).toBe('D'); // Highest score
  });
});
