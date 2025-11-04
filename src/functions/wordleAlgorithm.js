/**
 * Wordle Algorithm - Comprehensive word filtering and scoring system
 * Separated from Vue component for better testability and maintainability
 */

import { debugLogModule } from "./debugUtils.js";

// Simplified letter frequency data (only most common letters)
const letterFreq = {
  e: 11.16, a: 8.5, r: 7.58, i: 7.54, o: 7.16, t: 6.95, n: 6.65, s: 5.74,
  l: 5.49, c: 4.54, u: 3.63, d: 3.38, p: 3.17, m: 3.01, h: 3.0, g: 2.47,
  b: 2.07, f: 1.81, y: 1.78, w: 1.29, k: 1.1, v: 1.01
};

// Simplified positional frequency (only top letters per position)
const positionalFreq = {
  0: { s: 365, c: 198, b: 173, t: 149, p: 141, a: 140, f: 135 },
  1: { a: 304, o: 279, r: 267, e: 241, i: 201, l: 200, u: 185 },
  2: { a: 306, i: 266, o: 243, e: 177, u: 165, r: 163, l: 162 },
  3: { e: 318, n: 182, s: 171, a: 162, l: 162, i: 158, r: 150 },
  4: { e: 422, y: 364, t: 253, r: 212, s: 171, l: 156, h: 137 },
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
export function getInformationGatherers(words, closeSpots, incorrectLetters, usedLetters) {
  return words.filter((word) => {
    // Must obey close letter constraints
    if (closeSpots) {
      for (let i = 0; i < closeSpots.length; i++) {
        const spot = closeSpots[i];
        if (spot && spot.length) {
          for (const letter of spot) {
            if (!word.toLowerCase().includes(letter.toLowerCase()) ||
                word[i].toLowerCase() === letter.toLowerCase()) {
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

    // Prefer words with unused letters
    const unusedLetterCount = word
      .split("")
      .filter((letter) => !usedLetters.has(letter.toLowerCase())).length;

    return unusedLetterCount >= 2;
  }).slice(0, 50); // Limit results for performance
}

/**
 * Score a word based on letter frequency and positions
 */
export function scoreWordWithPositions(word, usedLetters) {
  let score = 0;
  const letterCounts = {};

  // Count letters in the word
  for (const letter of word.toLowerCase()) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  // Score each position
  for (let i = 0; i < word.length; i++) {
    const letter = word[i].toLowerCase();

    // Base frequency score
    const letterScore = letterFreq[letter] || 0;

    // Positional bonus
    const positionalScore =
      (positionalFreq[i] && positionalFreq[i][letter]) || 0;

    // Penalty for repeated letters in the same word
    const repetitionPenalty = letterCounts[letter] > 1 ? 0.3 : 1.0;

    // Bonus for unused letters
    const newLetterBonus = usedLetters.has(letter) ? 0.5 : 1.2;

    score +=
      (letterScore + positionalScore * 0.1) *
      repetitionPenalty *
      newLetterBonus;
  }

  return score;
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
        bonus += 10; // Strong bonus for correct positions
      }
    }
  }

  // Bonus for containing required letters in non-forbidden positions
  if (closeSpots) {
    for (let i = 0; i < closeSpots.length; i++) {
      const spot = closeSpots[i];
      if (spot && spot.length) {
        for (const letter of spot) {
          if (
            word.toLowerCase().includes(letter.toLowerCase()) &&
            word[i].toLowerCase() !== letter.toLowerCase()
          ) {
            bonus += 5; // Moderate bonus for having required letters correctly placed
          }
        }
      }
    }
  }

  return bonus;
}

/**
 * Simplified pattern bonus - fast heuristics
 */
export function applyPatternBonus(word) {
  let bonus = 0;
  const w = word.toLowerCase();

  // Common endings
  if (w.endsWith("ed") || w.endsWith("er") || w.endsWith("ly")) bonus += 2;
  
  // Vowel distribution
  const vowelCount = (w.match(/[aeiou]/g) || []).length;
  if (vowelCount === 2 || vowelCount === 3) bonus += 2;
  
  // Unique letters bonus
  if (new Set(w).size === 5) bonus += 3;
  
  // Avoid double letters (less information)
  if (new Set(w).size < 5) bonus -= 1;

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

  // If very few candidates, just return them
  if (solutionCandidates.length <= 2) {
    return solutionCandidates.slice(0, 20);
  }

  // Get information gathering words
  const informationGatherers = getInformationGatherers(
    words,
    closeSpots,
    incorrectLetters,
    usedLetters
  );

  // Simple strategy weights based on candidate count
  let solutionWeight = 1.0;
  let informationWeight = 0.5;

  if (solutionCandidates.length <= 10) {
    solutionWeight = 3.0;
    informationWeight = 0.2;
  } else if (solutionCandidates.length > 50) {
    solutionWeight = 0.5;
    informationWeight = 1.0;
  }

  // Score solution candidates
  const scoredSolutions = solutionCandidates.map((word) => ({
    word,
    score: (scoreWordWithPositions(word, usedLetters) + 
            applyPatternBonus(word) +
            calculateConstraintSatisfactionBonus(word, correctSpots, closeSpots)) * solutionWeight
  }));

  // Score information gatherers
  const scoredInformationGatherers = informationGatherers.map((word) => ({
    word,
    score: (scoreWordWithPositions(word, usedLetters) + 
            applyPatternBonus(word)) * informationWeight
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
