/**
 * Weighted Performance Scoring System for Wordle
 * Evaluates words based on both success rate and guess efficiency
 */

/**
 * Scoring systems for different priorities
 */
export const SCORING_SYSTEMS = {
  // Practical efficiency - balance between success and speed (default)
  practical: {
    name: "Practical Efficiency",
    weights: { 1: 20, 2: 18, 3: 16, 4: 14, 5: 10, 6: 6, failed: 0 },
  },

  // Speed focused - extreme bias toward 3-4 guess solutions
  speedFocused: {
    name: "Speed Focused",
    weights: { 1: 30, 2: 28, 3: 26, 4: 24, 5: 8, 6: 4, failed: 0 },
  },

  // Reliability focused - small penalty for slower but emphasis on not failing
  reliability: {
    name: "Reliability Focused",
    weights: { 1: 12, 2: 11, 3: 10, 4: 9, 5: 8, 6: 7, failed: -2 },
  },

  // Traditional - just success rate (for comparison)
  traditional: {
    name: "Traditional Success Rate",
    weights: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, failed: 0 },
  },
};

/**
 * Updated starting word performance data - based on actual algorithm testing (Nov 2025)
 */
export const STARTING_WORD_DATA = {
  TRACE: { rank: 1, successRate: 86.94, practicalScore: 55.2, tier: "Optimal" },
  CRATE: { rank: 2, successRate: 85.8, practicalScore: 54.1, tier: "Elite" },
  TRAIN: { rank: 3, successRate: 85.59, practicalScore: 53.8, tier: "Elite" },
  SLATE: { rank: 4, successRate: 84.74, practicalScore: 52.9, tier: "Elite" },
  ADIEU: { rank: 5, successRate: 84.14, practicalScore: 52.1, tier: "Good" },
  AROSE: { rank: 6, successRate: 82.42, practicalScore: 50.5, tier: "Good" },
  AUDIO: { rank: 7, successRate: 82.0, practicalScore: 50.0, tier: "Good" },
};

/**
 * Get optimal starting words ranked by practical efficiency
 */
export function getOptimalStartingWords(limit = 10) {
  return Object.entries(STARTING_WORD_DATA)
    .sort((a, b) => b[1].successRate - a[1].successRate) // Sort by success rate (our primary metric)
    .slice(0, limit)
    .map(([word]) => word.toLowerCase());
}

/**
 * Calculate weighted performance score
 */
export function calculateWeightedScore(
  distribution,
  totalGames,
  scoringSystem = SCORING_SYSTEMS.practical
) {
  let totalScore = 0;

  Object.entries(distribution).forEach(([guesses, count]) => {
    const weight = scoringSystem.weights[guesses] || 0;
    totalScore += count * weight;
  });

  const maxPossibleScore =
    totalGames * Math.max(...Object.values(scoringSystem.weights));
  return (totalScore / maxPossibleScore) * 100;
}

/**
 * Get starting word data for a specific word
 */
export function getStartingWordData(word) {
  return STARTING_WORD_DATA[word.toUpperCase()] || null;
}

/**
 * Format starting word tooltip - simplified
 */
export function formatWeightedStartingWordTooltip(word) {
  const data = getStartingWordData(word);

  if (!data) {
    return `${word.toUpperCase()} - Standard word`;
  }

  return `${word.toUpperCase()} - Performance Analysis:
Rank: #${data.rank} (${data.tier} tier)
Success Rate: ${data.successRate}%
Practical Score: ${data.practicalScore} pts`;
}
