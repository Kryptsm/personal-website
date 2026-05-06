/**
 * Pre-compute the optimal second guess for each CARTE feedback pattern.
 *
 * After CARTE is played, there are 243 possible feedback patterns (3^5).
 * For each pattern that maps to a non-trivial candidate set (>2 candidates),
 * this script exhaustively evaluates ALL 14,855 words to find the guess
 * that maximizes singletons (uniquely identified candidates = 3-guess wins).
 *
 * Output: A lookup table mapping pattern index → best second guess word.
 */

import { readFileSync, writeFileSync } from "fs";

const words = JSON.parse(readFileSync("src/pages/wordle/words.json", "utf8"));

const STARTING_WORD = "carte";

// Compute pattern key using same logic as wordleAlgorithm.js
function getPatternKey(guess, target) {
	const g = guess.toLowerCase();
	const t = target.toLowerCase();
	const result = [0, 0, 0, 0, 0];
	const targetUsed = [false, false, false, false, false];

	for (let i = 0; i < 5; i++) {
		if (g.charCodeAt(i) === t.charCodeAt(i)) {
			result[i] = 2;
			targetUsed[i] = true;
		}
	}
	for (let i = 0; i < 5; i++) {
		if (result[i] === 0) {
			for (let j = 0; j < 5; j++) {
				if (!targetUsed[j] && g.charCodeAt(i) === t.charCodeAt(j)) {
					result[i] = 1;
					targetUsed[j] = true;
					break;
				}
			}
		}
	}
	return (
		result[0] * 81 + result[1] * 27 + result[2] * 9 + result[3] * 3 + result[4]
	);
}

// Optimized partition stats (same as in wordleAlgorithm.js)
function computePartitionStats(guessLower, candidatesLower) {
	const buckets = new Int32Array(243);
	const n = candidatesLower.length;
	const g0 = guessLower.charCodeAt(0),
		g1 = guessLower.charCodeAt(1),
		g2 = guessLower.charCodeAt(2),
		g3 = guessLower.charCodeAt(3),
		g4 = guessLower.charCodeAt(4);

	for (let idx = 0; idx < n; idx++) {
		const t = candidatesLower[idx];
		const t0 = t.charCodeAt(0),
			t1 = t.charCodeAt(1),
			t2 = t.charCodeAt(2),
			t3 = t.charCodeAt(3),
			t4 = t.charCodeAt(4);

		let r0 = 0,
			r1 = 0,
			r2 = 0,
			r3 = 0,
			r4 = 0;
		let u0 = false,
			u1 = false,
			u2 = false,
			u3 = false,
			u4 = false;

		if (g0 === t0) {
			r0 = 2;
			u0 = true;
		}
		if (g1 === t1) {
			r1 = 2;
			u1 = true;
		}
		if (g2 === t2) {
			r2 = 2;
			u2 = true;
		}
		if (g3 === t3) {
			r3 = 2;
			u3 = true;
		}
		if (g4 === t4) {
			r4 = 2;
			u4 = true;
		}

		if (r0 === 0) {
			if (!u1 && g0 === t1) {
				r0 = 1;
				u1 = true;
			} else if (!u2 && g0 === t2) {
				r0 = 1;
				u2 = true;
			} else if (!u3 && g0 === t3) {
				r0 = 1;
				u3 = true;
			} else if (!u4 && g0 === t4) {
				r0 = 1;
				u4 = true;
			}
		}
		if (r1 === 0) {
			if (!u0 && g1 === t0) {
				r1 = 1;
				u0 = true;
			} else if (!u2 && g1 === t2) {
				r1 = 1;
				u2 = true;
			} else if (!u3 && g1 === t3) {
				r1 = 1;
				u3 = true;
			} else if (!u4 && g1 === t4) {
				r1 = 1;
				u4 = true;
			}
		}
		if (r2 === 0) {
			if (!u0 && g2 === t0) {
				r2 = 1;
				u0 = true;
			} else if (!u1 && g2 === t1) {
				r2 = 1;
				u1 = true;
			} else if (!u3 && g2 === t3) {
				r2 = 1;
				u3 = true;
			} else if (!u4 && g2 === t4) {
				r2 = 1;
				u4 = true;
			}
		}
		if (r3 === 0) {
			if (!u0 && g3 === t0) {
				r3 = 1;
				u0 = true;
			} else if (!u1 && g3 === t1) {
				r3 = 1;
				u1 = true;
			} else if (!u2 && g3 === t2) {
				r3 = 1;
				u2 = true;
			} else if (!u4 && g3 === t4) {
				r3 = 1;
				u4 = true;
			}
		}
		if (r4 === 0) {
			if (!u0 && g4 === t0) {
				r4 = 1;
				u0 = true;
			} else if (!u1 && g4 === t1) {
				r4 = 1;
				u1 = true;
			} else if (!u2 && g4 === t2) {
				r4 = 1;
				u2 = true;
			} else if (!u3 && g4 === t3) {
				r4 = 1;
				u3 = true;
			}
		}

		buckets[r0 * 81 + r1 * 27 + r2 * 9 + r3 * 3 + r4]++;
	}

	let sumSquares = 0;
	let singletons = 0;
	let maxBucket = 0;
	for (let i = 0; i < 243; i++) {
		const c = buckets[i];
		if (c > 0) {
			sumSquares += c * c;
			if (c === 1) singletons++;
			if (c > maxBucket) maxBucket = c;
		}
	}

	return {
		expectedRemaining: sumSquares / n,
		singletonCount: singletons,
		maxBucketSize: maxBucket,
	};
}

function patternToString(patternIdx) {
	const chars = ["⬜", "🟨", "🟩"];
	const r = [];
	let v = patternIdx;
	for (let i = 4; i >= 0; i--) {
		r[i] = chars[v % 3];
		v = Math.floor(v / 3);
	}
	return r.join("");
}

// Step 1: Partition all words by their CARTE pattern
console.log(
	`Partitioning ${words.length} words by CARTE feedback pattern...\n`,
);

const patternBuckets = new Map(); // patternIdx → [candidate words]
const wordsLower = words.map((w) => w.toLowerCase());

for (const word of wordsLower) {
	const pattern = getPatternKey(STARTING_WORD, word);
	if (!patternBuckets.has(pattern)) {
		patternBuckets.set(pattern, []);
	}
	patternBuckets.get(pattern).push(word);
}

// Sort by bucket size (largest first)
const sortedPatterns = [...patternBuckets.entries()].sort(
	(a, b) => b[1].length - a[1].length,
);

console.log(`Found ${sortedPatterns.length} distinct patterns from CARTE\n`);
console.log("Top 20 patterns by candidate count:");
for (let i = 0; i < Math.min(20, sortedPatterns.length); i++) {
	const [pat, candidates] = sortedPatterns[i];
	console.log(
		`  Pattern ${pat} ${patternToString(pat)}: ${candidates.length} candidates`,
	);
}

// Step 2: For each pattern, find the optimal second guess
console.log(
	`\nFinding optimal second guesses (evaluating ALL ${words.length} words)...\n`,
);

const lookupTable = {};
let totalTheoreticalSingletons = 0;
let totalCandidates = 0;
let patternsProcessed = 0;

const startTime = Date.now();

for (const [patternIdx, candidates] of sortedPatterns) {
	if (candidates.length <= 2) {
		// Trivially solved: just guess one of the candidates
		lookupTable[patternIdx] = {
			word: candidates[0],
			singletons: candidates.length,
			candidates: candidates.length,
			expectedRemaining: 1.0,
		};
		totalTheoreticalSingletons += candidates.length;
		totalCandidates += candidates.length;
		patternsProcessed++;
		continue;
	}

	// Evaluate ALL words as potential second guesses
	let bestWord = null;
	let bestSingletons = -1;
	let bestExpRemaining = Infinity;
	let bestMaxBucket = Infinity;

	for (const guess of wordsLower) {
		const stats = computePartitionStats(guess, candidates);

		// Primary: maximize singletons (directly optimizes 3-guess wins)
		// Secondary: minimize expected remaining (for 4+ guess performance)
		if (
			stats.singletonCount > bestSingletons ||
			(stats.singletonCount === bestSingletons &&
				stats.expectedRemaining < bestExpRemaining)
		) {
			bestWord = guess;
			bestSingletons = stats.singletonCount;
			bestExpRemaining = stats.expectedRemaining;
			bestMaxBucket = stats.maxBucketSize;
		}
	}

	lookupTable[patternIdx] = {
		word: bestWord,
		singletons: bestSingletons,
		candidates: candidates.length,
		expectedRemaining: bestExpRemaining,
		maxBucket: bestMaxBucket,
	};

	totalTheoreticalSingletons += bestSingletons;
	totalCandidates += candidates.length;
	patternsProcessed++;

	if (patternsProcessed % 10 === 0 || candidates.length > 100) {
		const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log(
			`  Pattern ${patternIdx} ${patternToString(patternIdx)}: ${
				candidates.length
			} candidates → ` +
				`best="${bestWord}" singletons=${bestSingletons}/${candidates.length} ` +
				`(${((bestSingletons / candidates.length) * 100).toFixed(
					1,
				)}%) E[rem]=${bestExpRemaining.toFixed(2)} ` +
				`maxBucket=${bestMaxBucket} [${elapsed}s]`,
		);
	}
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

console.log(`\n=== SUMMARY ===`);
console.log(`Total patterns: ${sortedPatterns.length}`);
console.log(`Total candidates: ${totalCandidates}`);
console.log(
	`Total theoretical 3-guess wins: ${totalTheoreticalSingletons} / ${totalCandidates} = ${(
		(totalTheoreticalSingletons / totalCandidates) *
		100
	).toFixed(2)}%`,
);
console.log(`Pre-computation time: ${totalTime}s`);

// Save lookup table
const output = {
	startingWord: STARTING_WORD,
	totalWords: words.length,
	totalPatterns: sortedPatterns.length,
	theoretical3GuessWins: totalTheoreticalSingletons,
	theoretical3GuessRate:
		((totalTheoreticalSingletons / totalCandidates) * 100).toFixed(2) + "%",
	computedAt: new Date().toISOString(),
	// Convert to simple word lookup: patternIdx → word
	patternToWord: Object.fromEntries(
		Object.entries(lookupTable).map(([k, v]) => [k, v.word]),
	),
	// Full details for analysis
	details: lookupTable,
};

writeFileSync(
	"src/functions/carteSecondGuesses.json",
	JSON.stringify(output, null, 2),
);
console.log(`\nLookup table saved to src/functions/carteSecondGuesses.json`);

// Show the top 30 patterns with their optimal second guesses
console.log(`\nTop 30 patterns by size with optimal second guess:`);
for (let i = 0; i < Math.min(30, sortedPatterns.length); i++) {
	const [pat, candidates] = sortedPatterns[i];
	const entry = lookupTable[pat];
	console.log(
		`  ${patternToString(pat)} (${candidates.length
			.toString()
			.padStart(4)} cands) → ` +
			`"${entry.word}" singletons=${entry.singletons}/${candidates.length} ` +
			`(${((entry.singletons / candidates.length) * 100).toFixed(1)}%)`,
	);
}
