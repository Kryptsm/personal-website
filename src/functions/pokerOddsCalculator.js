/**
 * Poker Odds Calculator
 * Pre-computed and dynamic odds for Texas Hold'em
 */

import {
  RANKS,
  calculateWinProbability,
  parseCard,
} from "./pokerHandEvaluator.js";

/**
 * Get hand strength category
 * @param {string} handString - Like "AKs", "77"
 * @param {number} numPlayers - Total players
 * @returns {object} - {category, color, recommendation}
 */
export function getHandStrength(handString, numPlayers = 2) {
  const winRate = estimateWinRate(handString, numPlayers);

  if (winRate >= 65) {
    return {
      category: "Premium",
      color: "#22c55e",
      recommendation: "RAISE - This is a premium hand. Bet aggressively.",
    };
  } else if (winRate >= 50) {
    return {
      category: "Strong",
      color: "#3b82f6",
      recommendation: "RAISE/CALL - Strong hand, play confidently.",
    };
  } else if (winRate >= 40) {
    return {
      category: "Playable",
      color: "#eab308",
      recommendation: "CALL - Good hand in position, proceed with caution.",
    };
  } else if (winRate >= 30) {
    return {
      category: "Marginal",
      color: "#f97316",
      recommendation: "FOLD/CALL - Weak hand, only play in late position.",
    };
  } else {
    return {
      category: "Weak",
      color: "#ef4444",
      recommendation: "FOLD - This hand is too weak to play profitably.",
    };
  }
}

/**
 * Generate all possible starting hands
 */
export function generateStartingHands() {
  const hands = [];

  for (let i = 0; i < RANKS.length; i++) {
    for (let j = i; j < RANKS.length; j++) {
      const rank1 = RANKS[i];
      const rank2 = RANKS[j];

      if (i === j) {
        // Pocket pair
        hands.push({
          hand: `${rank1}${rank2}`,
          suited: false,
          isPair: true,
          rank1Index: i,
          rank2Index: j,
        });
      } else {
        // Suited
        hands.push({
          hand: `${rank1}${rank2}s`,
          suited: true,
          isPair: false,
          rank1Index: i,
          rank2Index: j,
        });

        // Offsuit
        hands.push({
          hand: `${rank1}${rank2}o`,
          suited: false,
          isPair: false,
          rank1Index: i,
          rank2Index: j,
        });
      }
    }
  }

  return hands;
}

/**
 * Calculate odds for a specific starting hand
 * @param {string} handString - Hand notation like "AKs", "QQo", "JTo"
 * @param {number} numOpponents - Number of opponents (1-9)
 * @param {number} simulations - Number of Monte Carlo simulations
 */
export function calculateHandOdds(
  handString,
  numOpponents = 1,
  simulations = 5000
) {
  const { card1, card2 } = parseHandString(handString);

  if (!card1 || !card2) {
    return null;
  }

  const holeCards = [parseCard(card1), parseCard(card2)];
  return calculateWinProbability(holeCards, [], numOpponents, simulations);
}

/**
 * Parse hand string into card notation
 * @param {string} handString - Like "AKs", "77", "JTo"
 * @returns {object} - {card1, card2} or null
 */
function parseHandString(handString) {
  if (!handString || handString.length < 2) return null;

  const rank1 = handString[0];
  const rank2 = handString[1];
  const suited = handString.includes("s");
  const isPair = rank1 === rank2;

  if (!RANKS.includes(rank1) || !RANKS.includes(rank2)) return null;

  if (isPair) {
    return { card1: rank1 + "h", card2: rank2 + "d" };
  }

  if (suited) {
    return { card1: rank1 + "h", card2: rank2 + "h" };
  }

  // Offsuit
  return { card1: rank1 + "h", card2: rank2 + "d" };
}

/**
 * Pre-computed win rates for common scenarios
 * These are approximate values based on statistical analysis
 */
export const PRE_FLOP_WIN_RATES = {
  2: {
    // 1 opponent (heads-up)
    AA: 85.3,
    KK: 82.4,
    QQ: 79.9,
    JJ: 77.5,
    TT: 75.1,
    99: 72.1,
    88: 69.1,
    77: 66.2,
    66: 63.3,
    55: 60.4,
    44: 57.5,
    33: 54.7,
    22: 51.9,
    AKs: 67.0,
    AKo: 65.4,
    AQs: 66.1,
    AQo: 64.5,
    AJs: 65.4,
    AJo: 63.6,
    ATs: 64.7,
    ATo: 62.9,
    A9s: 62.3,
    A9o: 60.3,
    A8s: 61.6,
    A8o: 59.5,
    A7s: 60.8,
    A7o: 58.6,
    A6s: 60.1,
    A6o: 57.8,
    A5s: 60.2,
    A5o: 57.9,
    A4s: 59.5,
    A4o: 57.1,
    A3s: 58.9,
    A3o: 56.4,
    A2s: 58.2,
    A2o: 55.8,
    KQs: 63.4,
    KQo: 61.4,
    KJs: 62.6,
    KJo: 60.5,
    KTs: 61.9,
    KTo: 59.7,
    K9s: 59.2,
    K9o: 56.7,
    QJs: 60.3,
    QJo: 57.9,
    QTs: 59.5,
    QTo: 57.1,
    JTs: 57.5,
    JTo: 55.0,
  },
  3: {
    // 2 opponents
    AA: 73.4,
    KK: 69.1,
    QQ: 65.9,
    JJ: 63.0,
    TT: 60.3,
    99: 56.7,
    88: 53.4,
    77: 50.3,
    66: 47.3,
    55: 44.5,
    44: 41.8,
    33: 39.2,
    22: 36.8,
    AKs: 52.6,
    AKo: 50.0,
    AQs: 51.3,
    AQo: 48.7,
    AJs: 50.2,
    AJo: 47.5,
    ATs: 49.2,
    ATo: 46.5,
    KQs: 48.7,
    KQo: 45.9,
    KJs: 47.6,
    KJo: 44.8,
    QJs: 45.8,
    QJo: 42.8,
    JTs: 43.5,
    JTo: 40.4,
  },
  4: {
    // 3 opponents
    AA: 63.9,
    KK: 58.7,
    QQ: 54.7,
    JJ: 51.3,
    TT: 48.2,
    99: 44.6,
    88: 41.3,
    77: 38.3,
    66: 35.5,
    55: 32.9,
    44: 30.5,
    33: 28.3,
    22: 26.2,
    AKs: 42.8,
    AKo: 39.7,
    AQs: 41.3,
    AQo: 38.2,
    AJs: 40.0,
    AJo: 36.9,
    ATs: 38.9,
    ATo: 35.8,
    KQs: 38.3,
    KQo: 35.1,
    KJs: 37.1,
    KJo: 33.9,
  },
  5: {
    // 4 opponents
    AA: 56.2,
    KK: 50.4,
    QQ: 46.0,
    JJ: 42.4,
    TT: 39.2,
    99: 35.6,
    88: 32.5,
    77: 29.7,
    66: 27.2,
    55: 24.9,
    44: 22.9,
    33: 21.0,
    22: 19.3,
    AKs: 35.5,
    AKo: 32.1,
    AQs: 34.0,
    AQo: 30.6,
    AJs: 32.7,
    AJo: 29.4,
    ATs: 31.6,
    ATo: 28.3,
  },
  6: {
    // 5 opponents
    AA: 49.8,
    KK: 43.6,
    QQ: 39.1,
    JJ: 35.5,
    TT: 32.4,
    99: 29.1,
    88: 26.3,
    77: 23.8,
    66: 21.6,
    55: 19.6,
    44: 17.9,
    33: 16.3,
    22: 14.9,
    AKs: 29.7,
    AKo: 26.3,
    AQs: 28.2,
    AQo: 24.9,
  },
  7: {
    // 6 opponents
    AA: 44.5,
    KK: 38.2,
    QQ: 33.9,
    JJ: 30.4,
    TT: 27.5,
    99: 24.6,
    88: 22.1,
    77: 19.9,
    66: 18.0,
    55: 16.3,
    44: 14.8,
    33: 13.4,
    22: 12.2,
    AKs: 25.1,
    AKo: 21.9,
    AQs: 23.8,
    AQo: 20.7,
  },
  8: {
    // 7 opponents
    AA: 40.2,
    KK: 34.1,
    QQ: 30.0,
    JJ: 26.7,
    TT: 24.0,
    99: 21.4,
    88: 19.1,
    77: 17.2,
    66: 15.5,
    55: 14.0,
    44: 12.7,
    33: 11.4,
    22: 10.3,
    AKs: 21.8,
    AKo: 18.8,
    AQs: 20.6,
    AQo: 17.7,
  },
  9: {
    // 8 opponents
    AA: 36.2,
    KK: 30.5,
    QQ: 26.7,
    JJ: 23.7,
    TT: 21.2,
    99: 18.9,
    88: 16.8,
    77: 15.1,
    66: 13.6,
    55: 12.2,
    44: 11.0,
    33: 9.9,
    22: 8.9,
    AKs: 19.0,
    AKo: 16.3,
    AQs: 18.0,
    AQo: 15.4,
  },
  10: {
    // 9 opponents (full table)
    AA: 31.0,
    KK: 26.5,
    QQ: 22.8,
    JJ: 19.7,
    TT: 17.2,
    99: 15.0,
    88: 13.1,
    77: 11.5,
    66: 10.1,
    55: 8.9,
    44: 7.8,
    33: 6.9,
    22: 6.1,
    AKs: 16.7,
    AKo: 14.3,
    AQs: 15.5,
    AQo: 13.2,
    AJs: 14.8,
    AJo: 12.5,
    ATs: 14.2,
    ATo: 11.9,
    A9s: 13.5,
    A9o: 11.2,
    A8s: 13.0,
    A8o: 10.7,
    A7s: 12.6,
    A7o: 10.3,
    A6s: 12.3,
    A6o: 10.0,
    A5s: 12.4,
    A5o: 10.1,
    A4s: 12.0,
    A4o: 9.7,
    A3s: 11.7,
    A3o: 9.4,
    A2s: 11.4,
    A2o: 9.1,
    KQs: 13.6,
    KQo: 11.4,
    KJs: 13.1,
    KJo: 10.9,
    KTs: 12.6,
    KTo: 10.4,
    K9s: 11.8,
    K9o: 9.6,
    QJs: 12.2,
    QJo: 10.0,
    QTs: 11.7,
    QTo: 9.5,
    JTs: 11.3,
    JTo: 9.1,
  },
};

/**
 * Get win rate for a hand from pre-computed table
 * @param {string} handString - Like "AKs", "77"
 * @param {number} numPlayers - Total players (2-10)
 * @returns {number} - Win rate percentage or null
 */
export function getPreComputedWinRate(handString, numPlayers = 2) {
  const rates = PRE_FLOP_WIN_RATES[numPlayers];
  return rates ? rates[handString] : null;
}

/**
 * Estimate win rate (uses pre-computed if available, otherwise approximates)
 */
export function estimateWinRate(handString, numPlayers = 2) {
  if (!handString || handString.length < 2) {
    return 50; // Default fallback
  }

  // Try pre-computed first
  const preComputed = getPreComputedWinRate(handString, numPlayers);
  if (preComputed !== null && preComputed !== undefined) {
    return preComputed;
  }

  // Approximate based on hand strength and player count
  const headsUpRate = getPreComputedWinRate(handString, 2);
  if (headsUpRate !== null && headsUpRate !== undefined && numPlayers > 2) {
    // Rough approximation: reduce win rate as more players join
    return Math.max(5, headsUpRate * Math.pow(0.85, numPlayers - 2));
  }

  // Fallback: calculate based on hand category
  return estimateByHandCategory(handString, numPlayers);
}

/**
 * Estimate win rate by hand category
 */
function estimateByHandCategory(handString, numPlayers) {
  if (!handString || handString.length < 2) {
    return 50; // Default fallback
  }

  const isPair = handString.length === 2 && handString[0] === handString[1];
  const suited = handString.includes("s");
  const rank1Index = RANKS.indexOf(handString[0]);
  const rank2Index = RANKS.indexOf(handString[1]);

  // Validate ranks
  if (rank1Index === -1 || rank2Index === -1) {
    return 50; // Default for invalid ranks
  }

  let baseRate;

  if (isPair) {
    baseRate = 50 + rank1Index * 2.5; // Pairs: 52-80%
  } else {
    const highCard = Math.max(rank1Index, rank2Index);
    const gap = Math.abs(rank1Index - rank2Index);
    baseRate = 40 + highCard * 1.5 - gap * 2;
    if (suited) baseRate += 3;
  }

  // Adjust for number of players
  const adjustment = Math.pow(0.85, numPlayers - 2);
  return Math.max(5, Math.min(85, baseRate * adjustment));
}

/**
 * Create a complete odds table for display
 */
export function createOddsTable(numPlayers = 2) {
  const table = [];

  // Create 13x13 grid (one for each rank)
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const row = [];
    for (let j = RANKS.length - 1; j >= 0; j--) {
      const rank1 = RANKS[i];
      const rank2 = RANKS[j];

      let handString;
      if (i === j) {
        handString = rank1 + rank2; // Pair
      } else if (i > j) {
        handString = rank1 + rank2 + "s"; // Suited (above diagonal)
      } else {
        handString = rank2 + rank1 + "o"; // Offsuit (below diagonal)
      }

      const winRate = estimateWinRate(handString, numPlayers);

      row.push({
        hand: handString,
        winRate: (winRate || 50).toFixed(1),
        isPair: i === j,
        suited: i > j,
        offsuit: i < j,
      });
    }
    table.push(row);
  }

  return table;
}

/**
 * Get color for win rate
 */
export function getWinRateColor(winRate) {
  if (winRate >= 50) return "#22c55e"; // Green (50%+ = favorite)
  if (winRate >= 35) return "#eab308"; // Yellow (35-50% = playable)
  return "#ef4444"; // Red (<35% = weak)
}
