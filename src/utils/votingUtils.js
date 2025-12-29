/**
 * Weighted voting utility for ranked-choice voting
 * Uses Borda count method (higher rank = higher score, loser = highest total)
 */

/**
 * Calculate weighted scores for each candidate and find the one with lowest score
 * @param {string[][]} ballots - Array of ranked ballots (each ballot is array of candidates in order)
 * @param {string[]} candidates - Array of candidate names
 * @returns {{ loser: string, score: Object }} - Candidate with highest score (loser) and all scores
 */
export function weightedFindLoser(ballots, candidates) {
  const score = {};
  
  // Initialize scores for all candidates
  candidates.forEach(c => (score[c] = 0));
  
  // Calculate weighted scores
  // Rank 1 gets 1 point, rank 2 gets 2 points, etc. (higher = worse)
  ballots.forEach(ranking => {
    ranking.forEach((cand, idx) => {
      if (candidates.includes(cand)) {
        score[cand] += idx + 1;
      }
    });
  });
  
  // Find candidate(s) with highest score (worst rank)
  const maxSum = Math.max(...Object.values(score));
  const losers = Object.entries(score)
    .filter(([_, v]) => v === maxSum)
    .map(([k]) => k);
  
  // If tied, pick random loser
  const loser = losers.length === 1 
    ? losers[0] 
    : losers[Math.floor(Math.random() * losers.length)];
  
  return { loser, score };
}
