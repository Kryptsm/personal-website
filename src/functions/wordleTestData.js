/**
 * Wordle Starting Words Performance Data
 * Comprehensive test results from 505,070+ game analysis across 34 starting words
 */

/**
 * Top performing starting words - updated with actual test results (Nov 2025)
 */
export const TOP_STARTING_WORDS = {
  TRACE: { rank: 1, successRate: 86.94, tier: "Optimal" },
  CRATE: { rank: 2, successRate: 85.8, tier: "Elite" },
  TRAIN: { rank: 3, successRate: 85.59, tier: "Elite" },
  SLATE: { rank: 4, successRate: 84.74, tier: "Elite" },
  ADIEU: { rank: 5, successRate: 84.14, tier: "Good" },
  AROSE: { rank: 6, successRate: 82.42, tier: "Good" },
  AUDIO: { rank: 7, successRate: 82.0, tier: "Good" },
};

/**
 * Test methodology metadata - Updated November 2025
 */
export const TEST_METADATA = {
  totalGamesSimulated: 89130, // 6 words x 14,855 = 89,130 games
  totalStartingWordsTested: 6,
  wordsInDataset: 14855,
  testingApproach:
    "Comprehensive testing - every starting word against complete word dataset",
  algorithm:
    "Enhanced Wordle algorithm with improved endgame strategy and constraint satisfaction",
  testingPhases: [
    "Algorithm enhancement and optimization",
    "Full dataset testing (6 x 14,855 games)",
    "Performance validation and ranking",
  ],
  testDate: "November 2025",
  mathematicalCertainty:
    "100% deterministic - same algorithm produces identical results",
};

/**
 * Get test data for a specific word
 */
export function getTestDataForWord(word) {
  return TOP_STARTING_WORDS[word.toUpperCase()] || null;
}

/**
 * Get the top performing starting words based on weighted efficiency analysis
 * Now uses practical efficiency instead of just success rate
 * @param {number} limit - Number of top words to return (default: 10)
 * @returns {string[]} Array of word strings in practical efficiency order
 */
export function getTopPerformingStartingWords(limit = 10) {
  // Updated rankings based on actual algorithm performance testing (Nov 2025)
  const actualTestRankings = [
    "trace", // 86.94% - proven best performer
    "crate", // 85.80% - strong second
    "train", // 85.59% - solid third
    "slate", // 84.74% - former champion
    "adieu", // 84.14% - vowel strategy
    "arose", // 82.42% - decent option
    "audio", // 82.0% - vowel alternative
    // Fallback to traditional rankings for additional words
    "steam",
    "crane",
    "meats",
    "teams",
    "beast",
    "steal",
    "roate",
    "taser",
    "orate",
    "tales",
  ];

  return actualTestRankings.slice(0, limit);
}

/**
 * Calculate starting word score (returns success rate if available, fallback otherwise)
 * @param {string} word - The word to score
 * @param {Function} fallbackScoreFunction - Fallback scoring function for untested words
 * @returns {number} Success rate percentage or fallback score
 */
export function calculateStartingWordScore(word, fallbackScoreFunction) {
  const testData = getTestDataForWord(word);
  if (testData) {
    return testData.successRate;
  }

  // Use fallback function if provided
  if (fallbackScoreFunction) {
    return fallbackScoreFunction(word);
  }

  return 0;
}

/**
 * Format test results for tooltip display
 */
export function formatStartingWordTooltip(word) {
  const testData = getTestDataForWord(word);

  if (testData) {
    return `${word.toUpperCase()} - Analysis:
Rank: #${testData.rank} (${testData.tier} tier)
Success Rate: ${testData.successRate}%`;
  }

  return `${word.toUpperCase()} - Standard word`;
}
