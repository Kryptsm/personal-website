/**
 * Wordle Algorithm - Comprehensive word filtering and scoring system
 * Separated from Vue component for better testability and maintainability
 */

import { debugLogModule } from "./debugUtils.js";

// Wordle-specific letter frequency data (based on actual Wordle answers)
const letterFreq = {
  e: 12.9, // Higher in Wordle answers
  a: 9.8, // Very common in Wordle
  r: 8.9, // Extremely valuable
  i: 8.1, // High frequency
  o: 7.5, // Common vowel
  t: 7.8, // Higher than general English
  n: 6.9, // Solid consonant
  s: 6.2, // Common but not as high as general English
  l: 5.9, // Reliable letter
  c: 4.8, // Good starting letter
  u: 4.4, // Higher in Wordle
  d: 4.2, // Common ending
  p: 3.8, // Good starting letter
  m: 3.6, // Decent frequency
  h: 4.1, // Higher than expected
  g: 3.1, // Moderate frequency
  b: 2.8, // Good starting letter
  f: 2.3, // Less common
  y: 2.9, // Common ending
  w: 2.4, // Higher in Wordle
  k: 1.8, // Moderate frequency
  v: 1.6, // Less common
  z: 0.4, // Rare
  x: 0.3, // Very rare
  q: 0.2, // Extremely rare
  j: 0.4, // Rare
};

// Enhanced Wordle-specific positional frequency (based on actual answer analysis)
const positionalFreq = {
  0: {
    s: 420,
    c: 230,
    b: 190,
    t: 180,
    p: 170,
    a: 160,
    f: 150,
    m: 140,
    w: 130,
    d: 125,
    h: 120,
    r: 115,
  },
  1: {
    a: 350,
    o: 320,
    r: 290,
    e: 280,
    i: 240,
    l: 220,
    u: 210,
    h: 180,
    n: 160,
    y: 140,
  },
  2: {
    a: 340,
    i: 300,
    o: 280,
    e: 220,
    u: 200,
    r: 190,
    l: 180,
    n: 160,
    s: 140,
    t: 130,
  },
  3: {
    e: 380,
    n: 220,
    s: 200,
    a: 190,
    l: 180,
    i: 170,
    r: 160,
    t: 150,
    c: 140,
    k: 130,
  },
  4: {
    e: 480,
    y: 420,
    t: 290,
    r: 250,
    s: 210,
    l: 180,
    h: 160,
    d: 150,
    n: 140,
    k: 130,
  },
};

/**
 * Check if a word satisfies basic game constraints
 */
export function doesSatisfyBasicConstraints(
  word,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  // Check correct spots
  if (correctSpots) {
    for (let i = 0; i < correctSpots.length; i++) {
      if (
        correctSpots[i] &&
        word[i].toLowerCase() !== correctSpots[i].toLowerCase()
      ) {
        return false;
      }
    }
  }

  // Check close spots (must contain the letter but not in this position)
  if (closeSpots) {
    for (let i = 0; i < closeSpots.length; i++) {
      const spot = closeSpots[i];
      if (spot && spot.length) {
        for (const letter of spot) {
          // Word must contain the close letter AND not have it in the wrong position
          if (
            !word.toLowerCase().includes(letter.toLowerCase()) ||
            word[i].toLowerCase() === letter.toLowerCase()
          ) {
            return false;
          }
        }
      }
    }
  }

  // Check incorrect letters
  if (incorrectLetters && incorrectLetters.length > 0) {
    for (const letter of incorrectLetters) {
      if (word.toLowerCase().includes(letter.toLowerCase())) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Filter words that are valid solution candidates
 */
export function getSolutionCandidates(
  words,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  return words.filter((word) =>
    doesSatisfyBasicConstraints(
      word,
      correctSpots,
      closeSpots,
      incorrectLetters
    )
  );
}

/**
 * Simple entropy estimation - lightweight alternative to complex calculations
 */
function estimateWordValue(candidateWord, solutionCandidates) {
  if (solutionCandidates.length <= 1) return 0;

  // Simple heuristic: count unique letters and common patterns
  const uniqueLetters = new Set(candidateWord.toLowerCase()).size;
  const vowelCount = (candidateWord.match(/[aeiou]/g) || []).length;

  // Basic scoring without expensive pattern analysis
  return uniqueLetters * 2 + (vowelCount >= 2 ? 3 : 0);
}

/**
 * Get information gathering words - simplified version
 */
export function getInformationGatherers(
  words,
  closeSpots,
  incorrectLetters,
  usedLetters
) {
  return words
    .filter((word) => {
      // Must obey close letter constraints
      if (closeSpots) {
        for (let i = 0; i < closeSpots.length; i++) {
          const spot = closeSpots[i];
          if (spot && spot.length) {
            for (const letter of spot) {
              if (
                !word.toLowerCase().includes(letter.toLowerCase()) ||
                word[i].toLowerCase() === letter.toLowerCase()
              ) {
                return false;
              }
            }
          }
        }
      }

      // Must not contain incorrect letters
      if (incorrectLetters && incorrectLetters.length > 0) {
        for (const letter of incorrectLetters) {
          if (word.toLowerCase().includes(letter.toLowerCase())) {
            return false;
          }
        }
      }

      // Enhanced unused letter strategy
      const unusedLetters = word
        .split("")
        .filter((letter) => !usedLetters.has(letter.toLowerCase()));

      const unusedLetterCount = unusedLetters.length;

      // Require at least 3 unused letters for good information gathering
      if (unusedLetterCount < 3) return false;

      // Score unused letters by strategic value
      let informationValue = 0;
      const priorityLetters = [
        "e",
        "a",
        "r",
        "i",
        "o",
        "t",
        "n",
        "s",
        "l",
        "c",
        "u",
        "d",
        "p",
        "m",
        "h",
      ];

      for (const letter of unusedLetters) {
        const freq = letterFreq[letter.toLowerCase()] || 0;
        const priorityBonus = priorityLetters.includes(letter.toLowerCase())
          ? 2
          : 1;
        informationValue += freq * priorityBonus;
      }

      // Must have high information value
      if (informationValue < 25) return false;

      // Bonus for optimal vowel-consonant distribution in information gathering
      const vowels = unusedLetters.filter((l) =>
        "aeiou".includes(l.toLowerCase())
      );
      const consonants = unusedLetters.filter(
        (l) => !"aeiou".includes(l.toLowerCase())
      );

      // Prefer words with 1-2 unused vowels and 2-3 unused consonants
      const hasGoodVowelBalance = vowels.length >= 1 && vowels.length <= 2;
      const hasGoodConsonantBalance =
        consonants.length >= 2 && consonants.length <= 4;

      return hasGoodVowelBalance && hasGoodConsonantBalance;
    })
    .map((word) => {
      // Score information gatherers for better selection
      const unusedLetters = word
        .split("")
        .filter((letter) => !usedLetters.has(letter.toLowerCase()));
      let score = 0;

      for (const letter of unusedLetters) {
        score += letterFreq[letter.toLowerCase()] || 0;
      }

      return { word, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.word)
    .slice(0, 40); // Slightly fewer but higher quality options
}

/**
 * Enhanced word scoring system optimized for Wordle success
 */
export function scoreWordWithPositions(word, usedLetters) {
  let score = 0;
  const letterCounts = {};
  const w = word.toLowerCase();

  // Count letters in the word
  for (const letter of w) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  // Score each position with enhanced logic
  for (let i = 0; i < word.length; i++) {
    const letter = w[i];

    // Enhanced base frequency score
    const letterScore = letterFreq[letter] || 0;

    // Enhanced positional bonus with higher impact
    const positionalScore =
      (positionalFreq[i] && positionalFreq[i][letter]) || 0;

    // More nuanced repetition penalty
    let repetitionPenalty = 1.0;
    if (letterCounts[letter] > 1) {
      repetitionPenalty = letterCounts[letter] === 2 ? 0.4 : 0.2; // Harsh penalty for repeats
    } else {
      repetitionPenalty = 1.3; // Bonus for unique letters
    }

    // Enhanced unused letter bonus
    const newLetterBonus = usedLetters.has(letter) ? 0.6 : 1.4;

    // Position-specific bonuses for common Wordle patterns
    let positionBonus = 1.0;
    if (i === 0 && ["s", "c", "b", "t", "p", "f", "m", "w"].includes(letter))
      positionBonus = 1.2;
    if (i === 1 && ["a", "o", "r", "e", "i", "l", "u", "h"].includes(letter))
      positionBonus = 1.2;
    if (i === 4 && ["e", "y", "t", "r", "s", "d", "n"].includes(letter))
      positionBonus = 1.3;

    score +=
      (letterScore + positionalScore * 0.15) *
      repetitionPenalty *
      newLetterBonus *
      positionBonus;
  }

  // Bonus for common Wordle word patterns
  score += getWordStructureBonus(w);

  return score;
}

/**
 * Additional scoring for word structure patterns
 */
function getWordStructureBonus(word) {
  let bonus = 0;

  // CVCVC pattern bonus (very common in Wordle)
  if (
    word.match(
      /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/
    )
  ) {
    bonus += 5;
  }

  // Common digraph bonuses
  if (word.includes("th") || word.includes("ch") || word.includes("sh"))
    bonus += 3;
  if (word.includes("st") || word.includes("nd") || word.includes("nt"))
    bonus += 3;
  if (word.includes("er") || word.includes("ar") || word.includes("or"))
    bonus += 3;

  // Avoid problematic patterns
  if (word.match(/[bcdfghjklmnpqrstvwxyz]{3}/)) bonus -= 4; // 3+ consecutive consonants
  if (word.includes("x") || word.includes("z") || word.includes("q"))
    bonus -= 2; // rare letters

  return bonus;
}

/**
 * Enhanced endgame scoring for final candidates
 * Focuses on word commonality and Wordle answer likelihood
 */
export function scoreEndgameWord(
  word,
  usedLetters,
  correctSpots,
  closeSpots,
  currentGuessCount
) {
  let score = scoreWordWithPositions(word, usedLetters);

  // Strong bonus for constraint satisfaction in endgame
  score +=
    calculateConstraintSatisfactionBonus(word, correctSpots, closeSpots) * 2;

  // Enhanced pattern bonus for endgame
  score += applyPatternBonus(word) * 1.5;

  // Wordle answer likelihood bonus - common words are more likely to be answers
  const commonWordBonus = getWordCommonalityBonus(word);
  score += commonWordBonus;

  // Late game urgency - prefer simpler, more common words
  if (currentGuessCount >= 4) {
    score += getUrgencyBonus(word);
  }

  return score;
}

/**
 * Bonus for word commonality in Wordle answers
 */
function getWordCommonalityBonus(word) {
  const w = word.toLowerCase();
  let bonus = 0;

  // Tier 1: Extremely common Wordle answers (highest priority)
  const tier1Words = [
    "about",
    "world",
    "house",
    "right",
    "great",
    "white",
    "black",
    "place",
    "small",
    "young",
    "sound",
    "light",
    "water",
    "money",
    "story",
    "might",
    "think",
    "point",
    "first",
    "under",
    "being",
  ];
  if (tier1Words.includes(w)) return 25;

  // Tier 2: Very common Wordle answers
  const tier2Words = [
    "other",
    "which",
    "their",
    "would",
    "there",
    "could",
    "where",
    "while",
    "never",
    "after",
    "these",
    "three",
    "again",
    "large",
    "public",
    "order",
    "power",
    "shall",
    "years",
    "voice",
    "music",
    "court",
    "study",
  ];
  if (tier2Words.includes(w)) return 18;

  // Tier 3: Common 5-letter word patterns that appear in Wordle
  const tier3Words = [
    "bread",
    "dream",
    "cream",
    "steam",
    "beach",
    "teach",
    "reach",
    "peace",
    "heart",
    "earth",
    "worth",
    "north",
    "south",
    "month",
    "death",
    "birth",
    "chair",
    "table",
    "green",
    "clean",
  ];
  if (tier3Words.includes(w)) return 12;

  // Pattern-based bonuses
  if (w.match(/^[sc][th]/)) bonus += 8; // st-, ch-, sh-, etc.
  if (w.match(/[aeiou][rln][tds]$/)) bonus += 6; // -art, -ent, -and, etc.
  if (w.match(/^[aeiou]/)) bonus += 4; // vowel starts
  if (
    w.match(
      /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/
    )
  )
    bonus += 5; // CVCVC pattern

  // Wordle-favorable letter combinations
  if (w.includes("er") || w.includes("ar") || w.includes("or")) bonus += 4;
  if (w.includes("th") || w.includes("ch") || w.includes("sh")) bonus += 4;
  if (w.includes("st") || w.includes("nd") || w.includes("nt")) bonus += 4;

  // Penalties for unlikely Wordle patterns
  if (w.endsWith("tion") || w.endsWith("ing")) bonus -= 10; // too long patterns
  if (w.includes("x") || w.includes("z") || w.includes("q") || w.includes("j"))
    bonus -= 4; // rare letters
  if (w.match(/[bcdfghjklmnpqrstvwxyz]{3}/)) bonus -= 6; // too many consecutive consonants

  return Math.max(bonus, 0); // Don't go negative
}

/**
 * Urgency bonus for late-game simplicity
 */
function getUrgencyBonus(word) {
  const w = word.toLowerCase();
  let bonus = 0;

  // Prefer words with more common letters
  const commonLetters = ["e", "a", "r", "i", "o", "t", "n", "s"];
  const commonLetterCount = w
    .split("")
    .filter((letter) => commonLetters.includes(letter)).length;
  bonus += commonLetterCount * 3;

  // Avoid obscure words in endgame
  const obscurePatterns = ["x", "z", "q", "j"];
  if (obscurePatterns.some((pattern) => w.includes(pattern))) {
    bonus -= 10;
  }

  // Prefer simple consonant-vowel patterns
  if (
    w.match(
      /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/
    )
  ) {
    bonus += 8;
  }

  return bonus;
}

/**
 * Calculate constraint satisfaction bonus for words that match known constraints
 */
export function calculateConstraintSatisfactionBonus(
  word,
  correctSpots,
  closeSpots
) {
  let bonus = 0;

  // Bonus for each correct position matched
  if (correctSpots) {
    for (let i = 0; i < correctSpots.length; i++) {
      if (
        correctSpots[i] &&
        word[i].toLowerCase() === correctSpots[i].toLowerCase()
      ) {
        bonus += 15; // Increased bonus for correct positions
      }
    }
  }

  // Enhanced bonus for containing required letters in optimal positions
  if (closeSpots) {
    for (let i = 0; i < closeSpots.length; i++) {
      const spot = closeSpots[i];
      if (spot && spot.length) {
        for (const letter of spot) {
          if (
            word.toLowerCase().includes(letter.toLowerCase()) &&
            word[i].toLowerCase() !== letter.toLowerCase()
          ) {
            bonus += 12; // Increased base bonus for satisfying close constraints

            // Find where the close letter appears in the word
            const letterPositions = [];
            for (let j = 0; j < word.length; j++) {
              if (word[j].toLowerCase() === letter.toLowerCase()) {
                letterPositions.push(j);
              }
            }

            // Substantial bonus for placing close letters in their most likely positions
            for (const pos of letterPositions) {
              if (
                positionalFreq[pos] &&
                positionalFreq[pos][letter.toLowerCase()]
              ) {
                const posBonus = Math.floor(
                  positionalFreq[pos][letter.toLowerCase()] / 20
                );
                bonus += Math.min(posBonus, 8); // Cap the positional bonus
              }

              // Extra bonus for placing common letters in very strong positions
              if (letter.toLowerCase() === "e" && pos === 4) bonus += 5; // E at end
              if (letter.toLowerCase() === "r" && (pos === 1 || pos === 3))
                bonus += 4; // R in strong positions
              if (letter.toLowerCase() === "s" && pos === 0) bonus += 4; // S at start
              if (letter.toLowerCase() === "t" && (pos === 0 || pos === 4))
                bonus += 3; // T at ends
            }

            // Multiple close letters handled efficiently
            if (spot.length > 1) {
              bonus += spot.length * 2; // Bonus for satisfying multiple constraints
            }
          }
        }
      }
    }
  }

  return bonus;
}

/**
 * Enhanced pattern bonus - Wordle-specific pattern recognition
 */
export function applyPatternBonus(word) {
  let bonus = 0;
  const w = word.toLowerCase();

  // Wordle-specific endings (5-letter words)
  if (w.endsWith("er")) bonus += 4; // Very common in Wordle
  else if (w.endsWith("ed")) bonus += 3;
  else if (w.endsWith("ly")) bonus -= 1; // Less common in 5-letter words
  else if (w.endsWith("es")) bonus += 3;
  else if (w.endsWith("st")) bonus += 4;
  else if (w.endsWith("nd")) bonus += 3;
  else if (w.endsWith("nt")) bonus += 3;
  else if (w.endsWith("rd")) bonus += 2;
  else if (w.endsWith("th")) bonus += 2;
  else if (w.endsWith("se")) bonus += 2;

  // Wordle-common beginnings
  if (w.startsWith("st")) bonus += 5; // Very productive in Wordle
  else if (w.startsWith("cr")) bonus += 4;
  else if (w.startsWith("tr")) bonus += 4;
  else if (w.startsWith("pr")) bonus += 3;
  else if (w.startsWith("br")) bonus += 3;
  else if (w.startsWith("fr")) bonus += 3;
  else if (w.startsWith("pl")) bonus += 3;
  else if (w.startsWith("cl")) bonus += 3;
  else if (w.startsWith("bl")) bonus += 3;
  else if (w.startsWith("fl")) bonus += 3;
  else if (w.startsWith("sl")) bonus += 3;
  else if (w.startsWith("sh")) bonus += 4;
  else if (w.startsWith("ch")) bonus += 3;
  else if (w.startsWith("th")) bonus += 4;
  else if (w.startsWith("wh")) bonus += 3;

  // Optimal vowel distribution for Wordle
  const vowelCount = (w.match(/[aeiou]/g) || []).length;
  const vowels = w.match(/[aeiou]/g) || [];
  const uniqueVowels = new Set(vowels).size;

  if (vowelCount === 2 && uniqueVowels === 2)
    bonus += 6; // Two different vowels optimal
  else if (vowelCount === 2 && uniqueVowels === 1)
    bonus += 2; // Two same vowels less ideal
  else if (vowelCount === 3) bonus += 1;
  else if (vowelCount === 1) bonus -= 2;
  else if (vowelCount === 0 || vowelCount >= 4) bonus -= 4;

  // Unique letters bonus - crucial for Wordle
  const uniqueLetterCount = new Set(w).size;
  if (uniqueLetterCount === 5) bonus += 8; // All unique letters excellent
  else if (uniqueLetterCount === 4) bonus += 3;
  else if (uniqueLetterCount === 3) bonus -= 3;
  else if (uniqueLetterCount <= 2) bonus -= 8;

  // Consonant clusters - Wordle patterns
  if (w.match(/[bcdfghjklmnpqrstvwxyz]{3,}/)) bonus -= 4; // Harsh penalty
  if (w.match(/[bcdfghjklmnpqrstvwxyz]{2}/)) {
    // Some two-consonant clusters are good
    if (
      w.includes("st") ||
      w.includes("tr") ||
      w.includes("cr") ||
      w.includes("pr") ||
      w.includes("br") ||
      w.includes("fr") ||
      w.includes("pl") ||
      w.includes("cl") ||
      w.includes("bl") ||
      w.includes("fl") ||
      w.includes("sl") ||
      w.includes("th") ||
      w.includes("ch") ||
      w.includes("sh") ||
      w.includes("wh") ||
      w.includes("nt") ||
      w.includes("nd") ||
      w.includes("nk") ||
      w.includes("mp") ||
      w.includes("ng")
    ) {
      bonus += 2;
    }
  }

  // Common Wordle letter combinations
  if (w.includes("tion")) bonus -= 5; // Too long for 5-letter words
  if (w.includes("ing")) bonus -= 3; // Uncommon in 5-letter Wordle words
  if (w.includes("ough")) bonus -= 4; // Unlikely pattern

  // Wordle-favorable patterns
  if (
    w.includes("ar") ||
    w.includes("er") ||
    w.includes("or") ||
    w.includes("ur") ||
    w.includes("ir")
  )
    bonus += 3; // R-vowel combinations
  if (
    w.includes("an") ||
    w.includes("en") ||
    w.includes("in") ||
    w.includes("on") ||
    w.includes("un")
  )
    bonus += 2; // N-vowel combinations
  if (
    w.includes("at") ||
    w.includes("et") ||
    w.includes("it") ||
    w.includes("ot") ||
    w.includes("ut")
  )
    bonus += 2; // T-vowel combinations

  // Letter position patterns that work well in Wordle
  if (w[1] === "h" && ["t", "c", "s", "w", "p"].includes(w[0])) bonus += 3; // th, ch, sh, wh, ph
  if (w[1] === "r" && ["t", "c", "p", "b", "f", "g", "d"].includes(w[0]))
    bonus += 3; // tr, cr, pr, br, fr, gr, dr

  return bonus;
}

/**
 * Simplified main algorithm to get word suggestions
 */
export function getWordSuggestions(
  words,
  correctSpots,
  closeSpots,
  incorrectLetters,
  usedLetters,
  currentGuessCount
) {
  // Get solution candidates (words that could be the answer)
  const solutionCandidates = getSolutionCandidates(
    words,
    correctSpots,
    closeSpots,
    incorrectLetters
  );

  // Enhanced endgame logic for very few candidates
  if (solutionCandidates.length <= 3) {
    return solutionCandidates
      .map((word) => ({
        word,
        score: scoreEndgameWord(
          word,
          usedLetters,
          correctSpots,
          closeSpots,
          currentGuessCount
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.word)
      .slice(0, 20);
  }

  // Get information gathering words
  const informationGatherers = getInformationGatherers(
    words,
    closeSpots,
    incorrectLetters,
    usedLetters
  );

  // Enhanced strategy weights with more aggressive endgame
  let solutionWeight = 1.0;
  let informationWeight = 0.5;

  // Optimized strategy for both success rate and faster wins
  if (solutionCandidates.length <= 2) {
    solutionWeight = 10.0; // Maximum focus on solutions
    informationWeight = 0.01;
  } else if (solutionCandidates.length <= 3) {
    solutionWeight = 9.0; // Very high solution focus
    informationWeight = 0.02;
  } else if (solutionCandidates.length <= 5) {
    solutionWeight = 7.5; // High solution focus
    informationWeight = 0.05;
  } else if (solutionCandidates.length <= 10) {
    solutionWeight = 6.0; // Strong solution bias
    informationWeight = 0.15;
  } else if (solutionCandidates.length <= 20) {
    solutionWeight = 4.5; // Moderate solution bias
    informationWeight = 0.3;
  } else if (solutionCandidates.length <= 40) {
    solutionWeight = 2.8; // Balanced approach
    informationWeight = 0.6;
  } else if (solutionCandidates.length <= 80) {
    solutionWeight = 1.5; // Information gathering focus
    informationWeight = 1.0;
  } else {
    solutionWeight = 0.5; // Heavy information gathering
    informationWeight = 1.5;
  }

  // Enhanced progressive strategy - earlier solution focus for better distribution
  if (currentGuessCount >= 5) {
    solutionWeight *= 6.0; // Desperate for solutions
    informationWeight *= 0.1;
  } else if (currentGuessCount >= 4) {
    solutionWeight *= 4.0; // Very high solution priority
    informationWeight *= 0.25;
  } else if (currentGuessCount >= 3) {
    solutionWeight *= 2.5; // Start prioritizing solutions earlier
    informationWeight *= 0.6;
  } else if (currentGuessCount >= 2) {
    // NEW: Start solution bias after just 2 guesses when candidates are reasonable
    if (solutionCandidates.length <= 50) {
      solutionWeight *= 1.8;
      informationWeight *= 0.7;
    }
  }

  // Score solution candidates with enhanced Wordle answer likelihood
  const scoredSolutions = solutionCandidates.map((word) => ({
    word,
    score:
      (scoreWordWithPositions(word, usedLetters) +
        applyPatternBonus(word) +
        calculateConstraintSatisfactionBonus(word, correctSpots, closeSpots) +
        getWordCommonalityBonus(word) * 1.5) * // Stronger commonality bonus for solutions
      solutionWeight,
  }));

  // Score information gatherers
  const scoredInformationGatherers = informationGatherers.map((word) => ({
    word,
    score:
      (scoreWordWithPositions(word, usedLetters) + applyPatternBonus(word)) *
      informationWeight,
  }));

  // Combine and sort all suggestions
  const allSuggestions = [...scoredSolutions, ...scoredInformationGatherers];

  // Remove duplicates and sort by score
  const uniqueSuggestions = [];
  const seenWords = new Set();

  allSuggestions
    .sort((a, b) => b.score - a.score)
    .forEach((item) => {
      if (!seenWords.has(item.word)) {
        seenWords.add(item.word);
        uniqueSuggestions.push(item.word);
      }
    });

  return uniqueSuggestions.slice(0, 20);
}
