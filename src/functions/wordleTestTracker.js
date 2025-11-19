/**
 * Wordle Test Results Tracker
 * Simple system to track algorithm performance over time
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_FILE = path.join(__dirname, "../../wordle-test-results.json");

/**
 * Save test results to file
 */
export function saveTestResults(results, algorithmVersion = "current") {
  let testHistory = {};

  // Load existing results if file exists
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      const data = fs.readFileSync(RESULTS_FILE, "utf8");
      testHistory = JSON.parse(data);
    }
  } catch (error) {
    console.log("Starting new test history file...");
  }

  // Create entry for this test
  const timestamp = new Date().toISOString();
  const testId = `${Date.now()}`;

  const testEntry = {
    timestamp,
    algorithmVersion,
    startingWord: results.startingWord,
    totalGames: results.totalGames,
    gamesWon: results.gamesWon,
    successRate: results.successRate,
    averageAttempts: results.averageAttempts,
    attemptDistribution: results.attemptDistribution,
  };

  if (!testHistory.tests) {
    testHistory.tests = {};
  }

  testHistory.tests[testId] = testEntry;
  testHistory.lastUpdated = timestamp;

  // Save back to file
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(testHistory, null, 2));

  console.log(`Results saved to ${RESULTS_FILE}`);
  return testId;
}

/**
 * Get test history
 */
export function getTestHistory() {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      const data = fs.readFileSync(RESULTS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading test history:", error);
  }
  return { tests: {} };
}

/**
 * Compare current results with previous tests
 */
export function compareWithHistory(currentResults, startingWord = "SLATE") {
  const history = getTestHistory();
  const previousTests = Object.values(history.tests || {})
    .filter(
      (test) => test.startingWord.toUpperCase() === startingWord.toUpperCase()
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (previousTests.length === 0) {
    console.log(`No previous test results found for ${startingWord}`);
    return null;
  }

  const lastTest = previousTests[0];
  const successRateDiff = currentResults.successRate - lastTest.successRate;
  const avgAttemptsDiff =
    currentResults.averageAttempts - lastTest.averageAttempts;

  console.log(
    `\nComparison with previous test (${new Date(
      lastTest.timestamp
    ).toLocaleDateString()}):`
  );
  console.log(
    `Success Rate: ${currentResults.successRate.toFixed(2)}% (${
      successRateDiff >= 0 ? "+" : ""
    }${successRateDiff.toFixed(2)}%)`
  );
  console.log(
    `Average Attempts: ${currentResults.averageAttempts.toFixed(2)} (${
      avgAttemptsDiff >= 0 ? "+" : ""
    }${avgAttemptsDiff.toFixed(2)})`
  );

  // Show detailed attempt distribution comparison
  console.log("\n📊 Attempt Distribution Comparison:");
  console.log("   Guesses | Current | Previous | Change");
  console.log("   --------|---------|----------|--------");

  let currentEarlyWins = 0;
  let previousEarlyWins = 0;
  let currentLateWins = 0;
  let previousLateWins = 0;

  for (let i = 1; i <= 6; i++) {
    const current = currentResults.attemptDistribution[i] || 0;
    const previous = lastTest.attemptDistribution[i] || 0;
    const change = current - previous;
    const currentPct = ((current / currentResults.totalGames) * 100).toFixed(1);
    const previousPct = ((previous / lastTest.totalGames) * 100).toFixed(1);

    if (i <= 3) {
      currentEarlyWins += current;
      previousEarlyWins += previous;
    } else {
      currentLateWins += current;
      previousLateWins += previous;
    }

    console.log(
      `      ${i}    | ${currentPct.padStart(5)}% | ${previousPct.padStart(
        6
      )}% | ${change >= 0 ? "+" : ""}${change.toString().padStart(5)}`
    );
  }

  // Calculate performance insights
  const currentEarlyPct = (currentEarlyWins / currentResults.totalGames) * 100;
  const previousEarlyPct = (previousEarlyWins / lastTest.totalGames) * 100;
  const earlyWinChange = currentEarlyPct - previousEarlyPct;

  console.log("\n🎯 Performance Analysis:");
  console.log(
    `   Early wins (≤3 guesses): ${currentEarlyPct.toFixed(
      1
    )}% vs ${previousEarlyPct.toFixed(1)}% (${
      earlyWinChange >= 0 ? "+" : ""
    }${earlyWinChange.toFixed(1)}%)`
  );
  console.log(
    `   Late wins (4-6 guesses): ${(
      (currentLateWins / currentResults.totalGames) *
      100
    ).toFixed(1)}% vs ${(
      (previousLateWins / lastTest.totalGames) *
      100
    ).toFixed(1)}%`
  );

  // Determine performance character
  if (successRateDiff > 0) {
    console.log(
      `🎉 Algorithm improved by ${successRateDiff.toFixed(
        2
      )} percentage points!`
    );
  } else if (successRateDiff < 0) {
    console.log(
      `📉 Algorithm performance decreased by ${Math.abs(
        successRateDiff
      ).toFixed(2)} percentage points`
    );

    if (earlyWinChange > 0) {
      console.log(
        `✨ But getting more early wins - algorithm may be faster even if slightly less successful overall`
      );
    }
  } else {
    console.log(`➡️ No change in success rate`);

    if (Math.abs(earlyWinChange) > 0.5) {
      console.log(
        `🔄 But shift in attempt distribution: ${
          earlyWinChange >= 0 ? "more" : "fewer"
        } early wins`
      );
    }
  }

  return {
    previousTest: lastTest,
    successRateChange: successRateDiff,
    averageAttemptsChange: avgAttemptsDiff,
    isImprovement: successRateDiff > 0,
  };
}

/**
 * Get summary of all tests
 */
export function getTestSummary() {
  const history = getTestHistory();
  const tests = Object.values(history.tests || {});

  if (tests.length === 0) {
    console.log("No test results found");
    return;
  }

  console.log(`\nTest History Summary (${tests.length} tests):`);
  console.log("===========================================");

  // Group by starting word
  const byStartingWord = {};
  tests.forEach((test) => {
    const word = test.startingWord.toUpperCase();
    if (!byStartingWord[word]) {
      byStartingWord[word] = [];
    }
    byStartingWord[word].push(test);
  });

  Object.entries(byStartingWord).forEach(([word, wordTests]) => {
    wordTests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latest = wordTests[0];
    const oldest = wordTests[wordTests.length - 1];

    console.log(
      `\n${word}: ${wordTests.length} test${wordTests.length > 1 ? "s" : ""}`
    );
    console.log(
      `  Latest: ${latest.successRate.toFixed(2)}% (${new Date(
        latest.timestamp
      ).toLocaleDateString()})`
    );

    if (wordTests.length > 1) {
      const improvement = latest.successRate - oldest.successRate;
      console.log(
        `  Oldest: ${oldest.successRate.toFixed(2)}% (${new Date(
          oldest.timestamp
        ).toLocaleDateString()})`
      );
      console.log(
        `  Change: ${improvement >= 0 ? "+" : ""}${improvement.toFixed(
          2
        )}% over time`
      );
    }
  });
}
