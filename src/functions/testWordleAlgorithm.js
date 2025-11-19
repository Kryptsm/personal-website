/**
 * Wordle Algorithm Testing Script
 *
 * Run this script to test the Wordle solving algorithm success rate
 * Usage examples:
 *
 * // Quick test with SLATE (1000 random words)
 * node testWordleAlgorithm.js
 *
 * // Full test with SLATE (all words)
 * node testWordleAlgorithm.js --full
 *
 * // Test specific starting word
 * node testWordleAlgorithm.js --word CRATE
 *
 * // Compare multiple starting words
 * node testWordleAlgorithm.js --compare
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  testAlgorithmSuccessRate,
  compareStartingWords,
  quickTest,
  generateDetailedReport,
} from "./wordleAlgorithmTester.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load words from JSON file
function loadWords() {
  try {
    const wordsPath = path.join(__dirname, "../pages/wordle/words.json");
    const wordsData = fs.readFileSync(wordsPath, "utf8");
    const words = JSON.parse(wordsData);

    // Filter to 5-letter words only and convert to lowercase
    const fiveLetterWords = words
      .filter((word) => word.length === 5)
      .map((word) => word.toLowerCase());

    console.log(
      `Loaded ${fiveLetterWords.length} five-letter words from words.json`
    );
    return fiveLetterWords;
  } catch (error) {
    console.error("Error loading words.json:", error.message);
    console.log("Make sure words.json exists in the correct location");
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: "quick", // quick, full, compare
    startingWord: "SLATE",
    sampleSize: 1000,
    verbose: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--full":
      case "-f":
        options.mode = "full";
        break;

      case "--compare":
      case "-c":
        options.mode = "compare";
        break;

      case "--word":
      case "-w":
        if (i + 1 < args.length) {
          options.startingWord = args[i + 1].toUpperCase();
          i++; // Skip next argument
        }
        break;

      case "--sample":
      case "-s":
        if (i + 1 < args.length) {
          options.sampleSize = parseInt(args[i + 1]);
          i++; // Skip next argument
        }
        break;

      case "--quiet":
      case "-q":
        options.verbose = false;
        break;

      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Wordle Algorithm Success Rate Tester

Usage: node testWordleAlgorithm.js [options]

Options:
  --full, -f           Test against all words (takes longer)
  --compare, -c        Compare multiple starting words
  --word WORD, -w      Test specific starting word (default: SLATE)
  --sample N, -s       Sample size for quick test (default: 1000)
  --quiet, -q          Reduce output verbosity
  --help, -h           Show this help message

Examples:
  node testWordleAlgorithm.js                    # Quick test with SLATE
  node testWordleAlgorithm.js --full             # Full test with SLATE
  node testWordleAlgorithm.js --word CRATE       # Quick test with CRATE
  node testWordleAlgorithm.js --compare          # Compare popular starting words
  node testWordleAlgorithm.js --full --word TRAIN # Full test with TRAIN
`);
}

// Main execution function
async function main() {
  const options = parseArgs();
  const words = loadWords();

  console.log("\nWordle Algorithm Success Rate Tester");
  console.log("====================================\n");

  switch (options.mode) {
    case "quick":
      console.log(
        `Running quick test with starting word: ${options.startingWord}`
      );
      console.log(`Sample size: ${options.sampleSize} words\n`);

      const quickResults = quickTest(
        words,
        options.startingWord,
        options.sampleSize
      );
      break;

    case "full":
      console.log(
        `Running full test with starting word: ${options.startingWord}`
      );
      console.log(
        `Testing against all ${words.length} words - this may take a while...\n`
      );

      const progressCallback = (current, total, won) => {
        if (current % 500 === 0 || current === total) {
          const percent = ((current / total) * 100).toFixed(1);
          const successRate = ((won / current) * 100).toFixed(2);
          console.log(
            `Progress: ${current}/${total} (${percent}%) - Current success rate: ${successRate}%`
          );
        }
      };

      const fullResults = testAlgorithmSuccessRate(
        words,
        options.startingWord,
        {
          verbose: options.verbose,
          progressCallback: progressCallback,
        }
      );

      console.log("\n" + generateDetailedReport(fullResults));

      // Save results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `wordle-test-results-${options.startingWord.toLowerCase()}-${timestamp}.json`;
      fs.writeFileSync(filename, JSON.stringify(fullResults, null, 2));
      console.log(`\nDetailed results saved to: ${filename}`);
      break;

    case "compare":
      console.log("Comparing popular starting words...\n");

      const startingWords = [
        "SLATE",
        "CRATE",
        "TRAIN",
        "ADIEU",
        "AROSE",
        "TRACE",
      ];
      const sampleForComparison = Math.min(2000, words.length); // Use reasonable sample for comparison

      console.log(
        `Testing each word against ${sampleForComparison} randomly selected target words\n`
      );

      const comparisonResults = compareStartingWords(words, startingWords, {
        maxTestWords: sampleForComparison,
        randomSample: true,
        verbose: options.verbose,
      });

      console.log("\n" + "=".repeat(60));
      console.log("STARTING WORD COMPARISON RESULTS");
      console.log("=".repeat(60));
      console.log(
        `Sample size: ${sampleForComparison} words per starting word\n`
      );

      comparisonResults.comparisons.forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.startingWord}: ${result.successRate.toFixed(
            2
          )}% (${result.gamesWon}/${result.totalGames})`
        );
        console.log(
          `   Average attempts: ${result.averageAttempts.toFixed(2)}`
        );

        // Show distribution for top 3
        if (index < 3) {
          const dist = result.attemptDistribution;
          console.log(
            `   Distribution: 1:${dist[1]} 2:${dist[2]} 3:${dist[3]} 4:${dist[4]} 5:${dist[5]} 6:${dist[6]}`
          );
        }
        console.log("");
      });

      console.log(
        `Best performer: ${
          comparisonResults.bestPerformer.startingWord
        } (${comparisonResults.bestPerformer.successRate.toFixed(2)}%)`
      );
      console.log(
        `Average success rate: ${comparisonResults.averageSuccessRate.toFixed(
          2
        )}%`
      );

      // Save comparison results
      const comparisonFilename = `wordle-comparison-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;
      fs.writeFileSync(
        comparisonFilename,
        JSON.stringify(comparisonResults, null, 2)
      );
      console.log(`\nComparison results saved to: ${comparisonFilename}`);
      break;
  }

  console.log("\nTesting complete!");
}

// Handle errors and run
process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { loadWords, main };
