/**
 * Wordle Algorithm Success Rate Tester
 *
 * This module provides comprehensive testing capabilities to measure the success rate
 * of the Wordle solving algorithm. It can simulate complete games against any target
 * word list and provide detailed statistics.
 */

import {
  getWordSuggestions,
  getSolutionCandidates,
} from "./wordleAlgorithm.js";

/**
 * Simulate the letter feedback that Wordle would give for a guess against a target word
 * Returns the game state updates (correctSpots, closeSpots, incorrectLetters)
 */
function simulateWordleFeedback(guess, targetWord) {
  const guessArray = guess.toLowerCase().split("");
  const targetArray = targetWord.toLowerCase().split("");

  const correctSpots = ["", "", "", "", ""];
  const closeSpots = [[], [], [], [], []];
  const incorrectLetters = [];

  // First pass: identify correct positions
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === targetArray[i]) {
      correctSpots[i] = guessArray[i];
    }
  }

  // Second pass: identify close letters (right letter, wrong position)
  for (let i = 0; i < 5; i++) {
    if (correctSpots[i] === "") {
      // Not already marked as correct
      const letter = guessArray[i];

      // Check if this letter exists elsewhere in the target word
      // but not in positions already marked as correct
      let foundInWrongPosition = false;

      for (let j = 0; j < 5; j++) {
        if (j !== i && targetArray[j] === letter && correctSpots[j] === "") {
          foundInWrongPosition = true;
          break;
        }
      }

      if (foundInWrongPosition) {
        closeSpots[i].push(letter);
      } else if (!targetArray.includes(letter)) {
        // Letter is not in the target word at all
        if (!incorrectLetters.includes(letter)) {
          incorrectLetters.push(letter);
        }
      }
    }
  }

  return { correctSpots, closeSpots, incorrectLetters };
}

/**
 * Merge new game state with existing state
 */
function mergeGameState(currentState, newState) {
  const { correctSpots, closeSpots, incorrectLetters } = currentState;
  const newCorrectSpots = [...correctSpots];
  const newCloseSpots = closeSpots.map((spot) => [...spot]);
  const newIncorrectLetters = [...incorrectLetters];

  // Update correct spots
  for (let i = 0; i < 5; i++) {
    if (newState.correctSpots[i] !== "") {
      newCorrectSpots[i] = newState.correctSpots[i];
    }
  }

  // Update close spots
  for (let i = 0; i < 5; i++) {
    if (newState.closeSpots[i] && newState.closeSpots[i].length > 0) {
      for (const letter of newState.closeSpots[i]) {
        if (!newCloseSpots[i].includes(letter)) {
          newCloseSpots[i].push(letter);
        }
      }
    }
  }

  // Update incorrect letters
  for (const letter of newState.incorrectLetters) {
    if (!newIncorrectLetters.includes(letter)) {
      newIncorrectLetters.push(letter);
    }
  }

  return {
    correctSpots: newCorrectSpots,
    closeSpots: newCloseSpots,
    incorrectLetters: newIncorrectLetters,
  };
}

/**
 * Check if the game is won (all correct spots filled)
 */
function isGameWon(correctSpots) {
  return correctSpots.every((spot) => spot !== "");
}

/**
 * Simulate a complete Wordle game for a specific target word
 */
function simulateWordleGame(
  targetWord,
  allWords,
  startingWord = "SLATE",
  maxGuesses = 6
) {
  const gameHistory = {
    targetWord: targetWord.toLowerCase(),
    startingWord: startingWord.toLowerCase(),
    guesses: [],
    won: false,
    attempts: 0,
    finalState: null,
  };

  // Initialize game state
  let gameState = {
    correctSpots: ["", "", "", "", ""],
    closeSpots: [[], [], [], [], []],
    incorrectLetters: [],
  };

  let usedLetters = new Set();
  let currentGuess = startingWord.toLowerCase();

  for (let attempt = 1; attempt <= maxGuesses; attempt++) {
    // Record the guess
    gameHistory.guesses.push(currentGuess);
    gameHistory.attempts = attempt;

    // Add letters to used set
    for (const letter of currentGuess) {
      usedLetters.add(letter);
    }

    // Check if this guess is the target word
    if (currentGuess === targetWord.toLowerCase()) {
      gameHistory.won = true;
      gameHistory.finalState = gameState;
      return gameHistory;
    }

    // Get feedback from this guess
    const feedback = simulateWordleFeedback(currentGuess, targetWord);

    // Update game state
    gameState = mergeGameState(gameState, feedback);

    // Check if game is won after processing feedback
    if (isGameWon(gameState.correctSpots)) {
      gameHistory.won = true;
      gameHistory.finalState = gameState;
      return gameHistory;
    }

    // If this isn't the last attempt, get next suggestion
    if (attempt < maxGuesses) {
      const suggestions = getWordSuggestions(
        allWords,
        gameState.correctSpots,
        gameState.closeSpots,
        gameState.incorrectLetters,
        usedLetters,
        attempt
      );

      if (suggestions.length > 0) {
        currentGuess = suggestions[0].toLowerCase();
      } else {
        // Fallback: try to find any valid word
        const solutionCandidates = getSolutionCandidates(
          allWords,
          gameState.correctSpots,
          gameState.closeSpots,
          gameState.incorrectLetters
        );

        if (solutionCandidates.length > 0) {
          currentGuess = solutionCandidates[0].toLowerCase();
        } else {
          // No valid words found, game effectively lost
          break;
        }
      }
    }
  }

  gameHistory.finalState = gameState;
  return gameHistory;
}

/**
 * Test the algorithm success rate against a list of target words
 */
export function testAlgorithmSuccessRate(
  wordList,
  startingWord = "SLATE",
  options = {}
) {
  const {
    maxGuesses = 6,
    maxTestWords = null, // Test all words if null
    randomSample = false,
    verbose = false,
    progressCallback = null,
  } = options;

  // Determine which words to test
  let wordsToTest = [...wordList];

  if (maxTestWords && maxTestWords < wordList.length) {
    if (randomSample) {
      // Random sample
      wordsToTest = [];
      const indices = new Set();
      while (indices.size < maxTestWords) {
        indices.add(Math.floor(Math.random() * wordList.length));
      }
      for (const index of indices) {
        wordsToTest.push(wordList[index]);
      }
    } else {
      // Take first N words
      wordsToTest = wordList.slice(0, maxTestWords);
    }
  }

  const results = {
    startingWord: startingWord.toLowerCase(),
    totalGames: wordsToTest.length,
    gamesWon: 0,
    gamesLost: 0,
    successRate: 0,
    averageAttempts: 0,
    attemptDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    gameDetails: [],
    statistics: {
      fastestWin: null,
      slowestWin: null,
      commonFailureReasons: [],
      performanceTrends: {},
    },
  };

  let totalAttempts = 0;

  // Test each word
  for (let i = 0; i < wordsToTest.length; i++) {
    const targetWord = wordsToTest[i];

    if (progressCallback && i % 100 === 0) {
      progressCallback(i, wordsToTest.length, results.gamesWon);
    }

    const gameResult = simulateWordleGame(
      targetWord,
      wordList,
      startingWord,
      maxGuesses
    );

    // Update statistics
    if (gameResult.won) {
      results.gamesWon++;
      results.attemptDistribution[gameResult.attempts]++;
      totalAttempts += gameResult.attempts;

      // Track fastest/slowest wins
      if (
        !results.statistics.fastestWin ||
        gameResult.attempts < results.statistics.fastestWin.attempts
      ) {
        results.statistics.fastestWin = {
          targetWord: gameResult.targetWord,
          attempts: gameResult.attempts,
          guesses: [...gameResult.guesses],
        };
      }

      if (
        !results.statistics.slowestWin ||
        gameResult.attempts > results.statistics.slowestWin.attempts
      ) {
        results.statistics.slowestWin = {
          targetWord: gameResult.targetWord,
          attempts: gameResult.attempts,
          guesses: [...gameResult.guesses],
        };
      }
    } else {
      results.gamesLost++;
      totalAttempts += maxGuesses; // Count failed games as max attempts
    }

    // Store detailed results if verbose
    if (verbose) {
      results.gameDetails.push({
        targetWord: gameResult.targetWord,
        won: gameResult.won,
        attempts: gameResult.attempts,
        guesses: [...gameResult.guesses],
        finalState: gameResult.finalState,
      });
    }

    if (verbose && (i % 500 === 0 || i === wordsToTest.length - 1)) {
      console.log(
        `Progress: ${i + 1}/${wordsToTest.length} (${(
          ((i + 1) / wordsToTest.length) *
          100
        ).toFixed(1)}%) - Current success rate: ${(
          (results.gamesWon / (i + 1)) *
          100
        ).toFixed(2)}%`
      );
    }
  }

  // Calculate final statistics
  results.successRate = (results.gamesWon / results.totalGames) * 100;
  results.averageAttempts = totalAttempts / results.totalGames;

  // Calculate performance insights
  results.statistics.performanceTrends = {
    oneGuessWins: results.attemptDistribution[1],
    twoGuessWins: results.attemptDistribution[2],
    earlyWins:
      results.attemptDistribution[1] +
      results.attemptDistribution[2] +
      results.attemptDistribution[3],
    lateWins:
      results.attemptDistribution[4] +
      results.attemptDistribution[5] +
      results.attemptDistribution[6],
    mostCommonWinLength: Object.keys(results.attemptDistribution).reduce(
      (a, b) =>
        results.attemptDistribution[a] > results.attemptDistribution[b] ? a : b
    ),
  };

  if (progressCallback) {
    progressCallback(wordsToTest.length, wordsToTest.length, results.gamesWon);
  }

  return results;
}

/**
 * Compare multiple starting words
 */
export function compareStartingWords(wordList, startingWords, options = {}) {
  const comparisons = [];

  console.log(
    `Comparing ${startingWords.length} starting words against ${wordList.length} target words...`
  );

  for (let i = 0; i < startingWords.length; i++) {
    const startingWord = startingWords[i];
    console.log(
      `\nTesting starting word: ${startingWord.toUpperCase()} (${i + 1}/${
        startingWords.length
      })`
    );

    const progressCallback = options.verbose
      ? (current, total, won) => {
          if (current % 1000 === 0 || current === total) {
            console.log(
              `  Progress: ${current}/${total} - Success rate: ${(
                (won / current) *
                100
              ).toFixed(2)}%`
            );
          }
        }
      : null;

    const results = testAlgorithmSuccessRate(wordList, startingWord, {
      ...options,
      progressCallback,
    });

    comparisons.push({
      startingWord: startingWord.toUpperCase(),
      ...results,
    });

    console.log(
      `  Final result: ${results.successRate.toFixed(2)}% success rate (${
        results.gamesWon
      }/${results.totalGames} games won)`
    );
  }

  // Sort by success rate
  comparisons.sort((a, b) => b.successRate - a.successRate);

  return {
    totalWordsCompared: startingWords.length,
    targetWordCount: wordList.length,
    comparisons,
    bestPerformer: comparisons[0],
    worstPerformer: comparisons[comparisons.length - 1],
    averageSuccessRate:
      comparisons.reduce((sum, comp) => sum + comp.successRate, 0) /
      comparisons.length,
  };
}

/**
 * Quick test function for interactive use
 */
export function quickTest(wordList, startingWord = "SLATE", sampleSize = 1000) {
  console.log(
    `Quick test: ${startingWord.toUpperCase()} against ${sampleSize} random words`
  );

  const results = testAlgorithmSuccessRate(wordList, startingWord, {
    maxTestWords: sampleSize,
    randomSample: true,
    verbose: true,
  });

  console.log("\n=== QUICK TEST RESULTS ===");
  console.log(`Starting word: ${results.startingWord.toUpperCase()}`);
  console.log(`Games played: ${results.totalGames}`);
  console.log(`Games won: ${results.gamesWon}`);
  console.log(`Success rate: ${results.successRate.toFixed(2)}%`);
  console.log(`Average attempts: ${results.averageAttempts.toFixed(2)}`);
  console.log("\nAttempt distribution:");
  for (let i = 1; i <= 6; i++) {
    console.log(
      `  ${i} guesses: ${results.attemptDistribution[i]} games (${(
        (results.attemptDistribution[i] / results.totalGames) *
        100
      ).toFixed(1)}%)`
    );
  }

  if (results.statistics.fastestWin) {
    console.log(
      `\nFastest win: "${results.statistics.fastestWin.targetWord.toUpperCase()}" in ${
        results.statistics.fastestWin.attempts
      } guess${results.statistics.fastestWin.attempts > 1 ? "es" : ""}`
    );
  }

  if (results.statistics.slowestWin) {
    console.log(
      `Slowest win: "${results.statistics.slowestWin.targetWord.toUpperCase()}" in ${
        results.statistics.slowestWin.attempts
      } guesses`
    );
  }

  return results;
}

/**
 * Generate a detailed report
 */
export function generateDetailedReport(results) {
  const report = [];

  report.push("=".repeat(60));
  report.push("WORDLE ALGORITHM SUCCESS RATE ANALYSIS");
  report.push("=".repeat(60));
  report.push("");

  report.push(`Starting Word: ${results.startingWord.toUpperCase()}`);
  report.push(`Total Games: ${results.totalGames.toLocaleString()}`);
  report.push(`Games Won: ${results.gamesWon.toLocaleString()}`);
  report.push(`Games Lost: ${results.gamesLost.toLocaleString()}`);
  report.push(`Success Rate: ${results.successRate.toFixed(2)}%`);
  report.push(`Average Attempts: ${results.averageAttempts.toFixed(2)}`);
  report.push("");

  report.push("ATTEMPT DISTRIBUTION:");
  report.push("-".repeat(40));
  for (let i = 1; i <= 6; i++) {
    const count = results.attemptDistribution[i];
    const percentage = ((count / results.totalGames) * 100).toFixed(1);
    const bar = "█".repeat(Math.round((count / results.totalGames) * 50));
    report.push(
      `${i} guess${i > 1 ? "es" : ""}: ${count
        .toLocaleString()
        .padStart(6)} (${percentage.padStart(5)}%) ${bar}`
    );
  }
  report.push("");

  if (results.statistics.fastestWin) {
    report.push(
      `Fastest Win: "${results.statistics.fastestWin.targetWord.toUpperCase()}" in ${
        results.statistics.fastestWin.attempts
      } guess${results.statistics.fastestWin.attempts > 1 ? "es" : ""}`
    );
    report.push(
      `  Path: ${results.statistics.fastestWin.guesses
        .map((g) => g.toUpperCase())
        .join(" → ")}`
    );
  }

  if (results.statistics.slowestWin) {
    report.push(
      `Slowest Win: "${results.statistics.slowestWin.targetWord.toUpperCase()}" in ${
        results.statistics.slowestWin.attempts
      } guesses`
    );
    report.push(
      `  Path: ${results.statistics.slowestWin.guesses
        .map((g) => g.toUpperCase())
        .join(" → ")}`
    );
  }

  report.push("");
  report.push(
    `Most common win length: ${results.statistics.performanceTrends.mostCommonWinLength} guesses`
  );
  report.push(
    `Early wins (≤3 guesses): ${results.statistics.performanceTrends.earlyWins.toLocaleString()}`
  );
  report.push(
    `Late wins (4-6 guesses): ${results.statistics.performanceTrends.lateWins.toLocaleString()}`
  );

  return report.join("\n");
}

export default {
  testAlgorithmSuccessRate,
  compareStartingWords,
  quickTest,
  generateDetailedReport,
  simulateWordleGame,
};
