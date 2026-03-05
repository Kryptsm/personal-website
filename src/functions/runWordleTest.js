/**
 * Simple runner for Wordle algorithm testing
 * Usage:
 *   npm run test-wordle              (tests CARTE - our best performer!)
 *   npm run test-wordle CRATE        (tests CRATE)
 *   npm run test-wordle compare      (compares multiple words)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
	testWordleAlgorithmSuccessRate,
	compareStartingWords,
} from "./wordleSuccessRateTester.js";
import { getTestSummary } from "./wordleTestTracker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load words from words.json
const wordsPath = path.join(__dirname, "../pages/wordle/words.json");
const words = JSON.parse(fs.readFileSync(wordsPath, "utf8"));

console.log(`Loaded ${words.length} words from words.json`);

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

if (command === "compare") {
	// Compare multiple starting words
	console.log("Running comparison of high-performing starting words...\n");

	const startingWords = ["CARTE", "CARNE", "TRACE", "CRATE", "CRANE", "SLATE"];
	const results = compareStartingWords(words, startingWords, words.length);

	console.log("\n" + "=".repeat(60));
	console.log("FINAL COMPARISON RESULTS");
	console.log("=".repeat(60));

	results.forEach((result, index) => {
		const medal =
			index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
		console.log(
			`${medal} ${index + 1}. ${result.word}: ${result.successRate.toFixed(
				2,
			)}% (${result.gamesWon.toLocaleString()}/${result.totalGames.toLocaleString()} wins)`,
		);
		console.log(`    Average attempts: ${result.averageAttempts.toFixed(2)}`);
	});

	const best = results[0];
	const worst = results[results.length - 1];
	const slateResult = results.find((r) => r.word === "SLATE");

	console.log(`\n📊 Performance Analysis:`);
	console.log(`   Best: ${best.word} (${best.successRate.toFixed(2)}%)`);
	console.log(`   Worst: ${worst.word} (${worst.successRate.toFixed(2)}%)`);
	console.log(
		`   SLATE: ${slateResult.successRate.toFixed(2)}% (rank #${
			results.findIndex((r) => r.word === "SLATE") + 1
		})`,
	);
	console.log(
		`   Performance spread: ${(best.successRate - worst.successRate).toFixed(
			2,
		)} percentage points`,
	);
} else {
	// Test single starting word
	const startingWord =
		command && command.length === 5 ? command.toUpperCase() : "CARTE";

	if (command && command.length !== 5) {
		console.log(`Invalid word "${command}" - using CARTE instead`);
	}

	console.log(`Testing starting word: ${startingWord}\n`);

	const results = testWordleAlgorithmSuccessRate(words, startingWord, {
		sampleSize: null, // Test all words
		algorithmVersion: "current",
	});

	// Show test history summary
	getTestSummary();
}
