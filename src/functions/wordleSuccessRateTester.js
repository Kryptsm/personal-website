/**
 * Wordle Algorithm Success Rate Tester - Core Functions
 */

import { testAlgorithmSuccessRate } from "./wordleAlgorithmTester.js";
import { saveTestResults, compareWithHistory } from "./wordleTestTracker.js";

/**
 * Test the Wordle algorithm success rate with a given starting word
 */
export function testWordleAlgorithmSuccessRate(
  wordList,
  startingWord = "TRACE",
  options = {}
) {
  const {
    sampleSize = null,
    saveResults = true,
    compareHistory = true,
    algorithmVersion = "current",
  } = options;

  console.log(
    `Testing ${startingWord.toUpperCase()} against ${
      sampleSize || wordList.length
    } words...`
  );

  const results = testAlgorithmSuccessRate(wordList, startingWord, {
    maxTestWords: sampleSize,
    randomSample: sampleSize ? true : false,
    verbose: false,
  });

  console.log(
    `${startingWord.toUpperCase()}: ${results.successRate.toFixed(
      2
    )}% success rate (${results.gamesWon}/${results.totalGames} wins)`
  );

  // Display detailed attempt distribution
  console.log("\n📊 Attempt Distribution:");
  let earlyWins = 0;
  let lateWins = 0;

  for (let i = 1; i <= 6; i++) {
    const count = results.attemptDistribution[i] || 0;
    const percentage = ((count / results.totalGames) * 100).toFixed(1);
    const bar = "█".repeat(Math.round((count / results.totalGames) * 30));

    console.log(
      `   ${i} guess${i > 1 ? "es" : ""}: ${count
        .toString()
        .padStart(5)} (${percentage.padStart(4)}%) ${bar}`
    );

    if (i <= 3) earlyWins += count;
    else lateWins += count;
  }

  const earlyWinPct = ((earlyWins / results.totalGames) * 100).toFixed(1);
  const lateWinPct = ((lateWins / results.totalGames) * 100).toFixed(1);

  console.log(`\n🎯 Performance Profile:`);
  console.log(
    `   Early wins (≤3 guesses): ${earlyWins} games (${earlyWinPct}%)`
  );
  console.log(`   Late wins (4-6 guesses): ${lateWins} games (${lateWinPct}%)`);
  console.log(
    `   Average attempts: ${results.averageAttempts.toFixed(2)} guesses`
  );

  if (results.statistics.fastestWin) {
    console.log(
      `   Fastest win: "${results.statistics.fastestWin.targetWord.toUpperCase()}" in ${
        results.statistics.fastestWin.attempts
      } guess${results.statistics.fastestWin.attempts > 1 ? "es" : ""}`
    );
  }

  // Save and compare results
  if (saveResults) {
    saveTestResults(results, algorithmVersion);
  }

  if (compareHistory) {
    compareWithHistory(results, startingWord);
  }

  return results;
}

/**
 * Compare multiple starting words to find the best performer
 */
export function compareStartingWords(
  wordList,
  startingWords = ["TRACE", "CRATE", "TRAIN", "SLATE"],
  sampleSize = 2000
) {
  console.log(
    `Comparing ${startingWords.length} starting words (${sampleSize} samples each)...`
  );

  const results = [];

  for (const word of startingWords) {
    const result = testAlgorithmSuccessRate(wordList, word, {
      maxTestWords: sampleSize,
      randomSample: true,
      verbose: false,
    });

    results.push({
      word: word.toUpperCase(),
      successRate: result.successRate,
      averageAttempts: result.averageAttempts,
      gamesWon: result.gamesWon,
      totalGames: result.totalGames,
    });
  }

  results.sort((a, b) => b.successRate - a.successRate);

  console.log("\nResults:");
  results.forEach((result, index) => {
    console.log(
      `${index + 1}. ${result.word}: ${result.successRate.toFixed(
        2
      )}% (avg: ${result.averageAttempts.toFixed(2)} attempts)`
    );
  });

  return results;
}

/**
 * Quick test function
 */
export function quickTest(wordList, startingWord = "TRACE", sampleSize = 1000) {
  return testWordleAlgorithmSuccessRate(wordList, startingWord, { sampleSize });
}
