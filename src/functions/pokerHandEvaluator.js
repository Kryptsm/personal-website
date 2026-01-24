/**
 * Poker Hand Evaluator
 * Evaluates poker hands and calculates win probabilities
 */

// Card ranks (2-14, where 14 is Ace)
export const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];
export const SUITS = ["h", "d", "c", "s"]; // hearts, diamonds, clubs, spades

// Hand rankings
export const HAND_RANKS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_A_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  PAIR: 2,
  HIGH_CARD: 1,
};

/**
 * Convert card string to value object
 * @param {string} card - Card string like "Ah" (Ace of hearts)
 * @returns {object} - {rank: number, suit: string}
 */
export function parseCard(card) {
  const rank = card[0];
  const suit = card[1];
  return {
    rank: RANKS.indexOf(rank) + 2,
    suit: suit,
    display: card,
  };
}

/**
 * Evaluate a 5-7 card poker hand
 * @param {array} cards - Array of card objects
 * @returns {object} - {rank: number, value: array, name: string}
 */
export function evaluateHand(cards) {
  if (cards.length < 5) {
    return { rank: 0, value: [], name: "Invalid Hand" };
  }

  // Get all 5-card combinations if more than 5 cards
  const combinations = cards.length === 5 ? [cards] : getCombinations(cards, 5);

  let bestHand = null;

  for (const hand of combinations) {
    const evaluation = evaluate5CardHand(hand);
    if (!bestHand || compareHands(evaluation, bestHand) > 0) {
      bestHand = evaluation;
    }
  }

  return bestHand;
}

/**
 * Get all combinations of k elements from array
 */
function getCombinations(arr, k) {
  if (k === 1) return arr.map((el) => [el]);
  if (k === arr.length) return [arr];

  const combinations = [];

  for (let i = 0; i < arr.length - k + 1; i++) {
    const head = arr[i];
    const tailCombinations = getCombinations(arr.slice(i + 1), k - 1);
    for (const tail of tailCombinations) {
      combinations.push([head, ...tail]);
    }
  }

  return combinations;
}

/**
 * Evaluate exactly 5 cards
 */
function evaluate5CardHand(cards) {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  // Count ranks
  const rankCounts = {};
  ranks.forEach((rank) => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts)
    .map(Number)
    .sort((a, b) => b - a);

  const isFlush = suits.every((suit) => suit === suits[0]);
  const isStraight = checkStraight(ranks);

  // Royal Flush
  if (isFlush && isStraight && ranks[0] === 14) {
    return { rank: HAND_RANKS.ROYAL_FLUSH, value: ranks, name: "Royal Flush" };
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return {
      rank: HAND_RANKS.STRAIGHT_FLUSH,
      value: ranks,
      name: "Straight Flush",
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return {
      rank: HAND_RANKS.FOUR_OF_A_KIND,
      value: uniqueRanks,
      name: "Four of a Kind",
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: HAND_RANKS.FULL_HOUSE,
      value: uniqueRanks,
      name: "Full House",
    };
  }

  // Flush
  if (isFlush) {
    return { rank: HAND_RANKS.FLUSH, value: ranks, name: "Flush" };
  }

  // Straight
  if (isStraight) {
    return { rank: HAND_RANKS.STRAIGHT, value: ranks, name: "Straight" };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return {
      rank: HAND_RANKS.THREE_OF_A_KIND,
      value: uniqueRanks,
      name: "Three of a Kind",
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { rank: HAND_RANKS.TWO_PAIR, value: uniqueRanks, name: "Two Pair" };
  }

  // One Pair
  if (counts[0] === 2) {
    return { rank: HAND_RANKS.PAIR, value: uniqueRanks, name: "Pair" };
  }

  // High Card
  return { rank: HAND_RANKS.HIGH_CARD, value: ranks, name: "High Card" };
}

/**
 * Check if ranks form a straight
 */
function checkStraight(ranks) {
  // Check normal straight
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] - ranks[i + 1] !== 1) {
      // Check for wheel (A-2-3-4-5)
      if (
        ranks[0] === 14 &&
        ranks[1] === 5 &&
        ranks[2] === 4 &&
        ranks[3] === 3 &&
        ranks[4] === 2
      ) {
        return true;
      }
      return false;
    }
  }
  return true;
}

/**
 * Compare two hands
 * @returns {number} - 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
function compareHands(hand1, hand2) {
  if (hand1.rank !== hand2.rank) {
    return hand1.rank > hand2.rank ? 1 : -1;
  }

  // Same hand rank, compare high cards
  for (let i = 0; i < hand1.value.length; i++) {
    if (hand1.value[i] !== hand2.value[i]) {
      return hand1.value[i] > hand2.value[i] ? 1 : -1;
    }
  }

  return 0;
}

/**
 * Create a full deck of cards
 */
export function createDeck() {
  const deck = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(parseCard(rank + suit));
    }
  }
  return deck;
}

/**
 * Shuffle array in place
 */
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate win probability using Monte Carlo simulation
 * OPTIMIZED VERSION with early termination and reduced allocations
 * @param {array} holeCards - Player's two hole cards
 * @param {array} communityCards - Community cards (0-5)
 * @param {number} numOpponents - Number of opponents
 * @param {number} simulations - Number of simulations to run
 */
export function calculateWinProbability(
  holeCards,
  communityCards = [],
  numOpponents = 1,
  simulations = 10000
) {
  let wins = 0;
  let ties = 0;

  const usedCards = [...holeCards, ...communityCards].map((c) => c.display);

  // Pre-create deck once and reuse (optimization)
  const baseDeck = createDeck().filter(
    (card) => !usedCards.includes(card.display)
  );
  const cardsNeeded = 5 - communityCards.length;
  const cardsPerSim = cardsNeeded + numOpponents * 2;

  for (let i = 0; i < simulations; i++) {
    // Fisher-Yates shuffle (in-place for performance)
    const deck = [...baseDeck];
    for (let j = deck.length - 1; j > cardsPerSim; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [deck[j], deck[k]] = [deck[k], deck[j]];
    }

    let deckIndex = 0;

    // Deal remaining community cards
    const simCommunity = [...communityCards];
    for (let j = 0; j < cardsNeeded; j++) {
      simCommunity.push(deck[deckIndex++]);
    }

    // Evaluate player's hand
    const playerHand = evaluateHand([...holeCards, ...simCommunity]);

    // Deal and evaluate opponent hands
    let playerWins = true;
    let hasTie = false;

    for (let j = 0; j < numOpponents; j++) {
      const oppCards = [deck[deckIndex++], deck[deckIndex++]];
      const oppHand = evaluateHand([...oppCards, ...simCommunity]);

      const comparison = compareHands(playerHand, oppHand);
      if (comparison < 0) {
        playerWins = false;
        break; // Early termination - no need to check other opponents
      } else if (comparison === 0) {
        hasTie = true;
      }
    }

    if (playerWins) {
      if (hasTie) {
        ties++;
      } else {
        wins++;
      }
    }
  }

  return {
    winRate: (wins / simulations) * 100,
    tieRate: (ties / simulations) * 100,
    loseRate: ((simulations - wins - ties) / simulations) * 100,
    simulations,
  };
}

/**
 * Get pre-flop hand strength category
 */
export function getHandCategory(card1, card2) {
  const rank1 = card1.rank;
  const rank2 = card2.rank;
  const suited = card1.suit === card2.suit;
  const isPair = rank1 === rank2;

  // Premium hands
  if ((rank1 >= 12 && rank2 >= 12) || (isPair && rank1 >= 10)) {
    return { category: "Premium", color: "#22c55e" };
  }

  // Strong hands
  if (
    (isPair && rank1 >= 7) ||
    (rank1 >= 11 && rank2 >= 10) ||
    (suited && rank1 >= 10 && rank2 >= 9)
  ) {
    return { category: "Strong", color: "#3b82f6" };
  }

  // Playable hands
  if (
    (isPair && rank1 >= 4) ||
    (rank1 >= 10 && rank2 >= 8) ||
    (suited && rank1 >= 9 && rank2 >= 8)
  ) {
    return { category: "Playable", color: "#eab308" };
  }

  // Speculative hands
  if (suited || (rank1 >= 9 && rank2 >= 7)) {
    return { category: "Speculative", color: "#f97316" };
  }

  // Weak hands
  return { category: "Weak", color: "#ef4444" };
}
