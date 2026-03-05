/**
 * Benchmark script for Wordle algorithm improvements.
 * Tests against word list and compares distributions.
 */

import { readFileSync } from "fs";
import { testAlgorithmSuccessRate } from "./wordleAlgorithmTester.js";

const words = JSON.parse(readFileSync("src/pages/wordle/words.json", "utf8"));

const mode = process.argv[2] || "quick";
const startingWord = process.argv[3] || "CARTE";

let maxTestWords;
switch (mode) {
	case "quick":
		maxTestWords = 200;
		break;
	case "medium":
		maxTestWords = 1000;
		break;
	case "full":
		maxTestWords = null;
		break;
	default:
		maxTestWords = parseInt(mode) || 200;
}

console.log(
	`\nBenchmarking with starting word: ${startingWord}, mode: ${mode} (${
		maxTestWords || "ALL"
	} words)\n`,
);

const startTime = Date.now();
let lastProgress = 0;

const result = testAlgorithmSuccessRate(words, startingWord, {
	maxTestWords,
	randomSample: false,
	verbose: false,
	progressCallback: (current, total, stats) => {
		if (current === 0) return;
		const pct = Math.floor((current / total) * 100);
		if (pct >= lastProgress + 5) {
			lastProgress = pct;
			const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
			const rate = (current / ((Date.now() - startTime) / 1000)).toFixed(1);
			const won = stats && stats.gamesWon != null ? stats.gamesWon : current;
			const successRate =
				current > 0 ? ((won / current) * 100).toFixed(2) : "0.00";
			console.log(
				`  ${pct}% (${current}/${total}) - ${elapsed}s elapsed - ${rate} games/s - ${successRate}% success so far`,
			);
		}
	},
});

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

console.log(`\n=== RESULTS (${elapsed}s) ===`);
console.log(`Success Rate: ${result.successRate.toFixed(2)}%`);
console.log(`Games: ${result.gamesWon}/${result.totalGames} won`);
console.log(`Average Attempts: ${result.averageAttempts.toFixed(2)}`);
console.log(`Distribution:`, result.attemptDistribution);
console.log(`Losses: ${result.gamesLost}`);

if (result.failedWords && result.failedWords.length > 0) {
	console.log(`\nSample failed words (first 20):`);
	console.log(result.failedWords.slice(0, 20).join(", "));
}
