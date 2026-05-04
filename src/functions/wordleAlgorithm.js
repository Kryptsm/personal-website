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

// =====================================================================
// PARTITION-BASED SCORING (Information Theory)
// =====================================================================

/**
 * Compute a compact feedback pattern key for a guess against a target.
 * Base-3 encoding: 2=green, 1=yellow, 0=gray.
 * Properly handles duplicate letters by consuming target positions.
 * Returns integer 0-242 (3^5 - 1).
 */
function getPatternKey(guess, target) {
	const g = guess.toLowerCase();
	const t = target.toLowerCase();
	const result = [0, 0, 0, 0, 0];
	const targetUsed = [false, false, false, false, false];

	// First pass: exact matches (green = 2)
	for (let i = 0; i < 5; i++) {
		if (g.charCodeAt(i) === t.charCodeAt(i)) {
			result[i] = 2;
			targetUsed[i] = true;
		}
	}

	// Second pass: wrong position matches (yellow = 1)
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

/**
 * Compute the expected number of remaining candidates after a guess.
 * Uses E[remaining] = sum(|bucket|^2) / |total| metric.
 * Lower is better — means the guess splits candidates more evenly.
 */
function computeExpectedRemaining(guess, candidates) {
	const buckets = new Int32Array(243); // 3^5 = 243 possible patterns
	const n = candidates.length;

	for (let i = 0; i < n; i++) {
		buckets[getPatternKey(guess, candidates[i])]++;
	}

	let sumSquares = 0;
	for (let i = 0; i < 243; i++) {
		const c = buckets[i];
		if (c > 0) sumSquares += c * c;
	}

	return sumSquares / n;
}

/**
 * Optimized partition stats computation with fully unrolled pattern matching.
 * Accepts pre-lowercased strings for maximum performance.
 * Returns both expectedRemaining and singletonCount for dual-objective scoring.
 */
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

		// Green pass
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

		// Yellow pass - position 0 (g0 !== t0 since r0 === 0)
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
		// Yellow pass - position 1 (g1 !== t1 since r1 === 0)
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
		// Yellow pass - position 2 (g2 !== t2 since r2 === 0)
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
		// Yellow pass - position 3 (g3 !== t3 since r3 === 0)
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
		// Yellow pass - position 4 (g4 !== t4 since r4 === 0)
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

/**
 * Get diverse probe words from the full word list for partition evaluation.
 * These are words (possibly non-candidates) with high new-letter coverage.
 */
function getDiverseProbes(words, incorrectLetters, usedLetters, limit) {
	const incorrectSet = new Set(incorrectLetters.map((l) => l.toLowerCase()));

	const scored = [];
	for (const word of words) {
		const w = word.toLowerCase();
		let hasIncorrect = false;
		for (let i = 0; i < w.length; i++) {
			if (incorrectSet.has(w[i])) {
				hasIncorrect = true;
				break;
			}
		}
		if (hasIncorrect) continue;

		let score = 0;
		const seen = new Set();
		for (let i = 0; i < w.length; i++) {
			if (!seen.has(w[i])) {
				seen.add(w[i]);
				if (!usedLetters.has(w[i])) {
					score += letterFreq[w[i]] || 0;
				}
			}
		}
		// Lower threshold to admit more candidate probes
		if (score > 3) {
			scored.push({ word, score });
		}
	}

	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, limit).map((s) => s.word);
}

/**
 * Get probes optimized for discriminating between specific candidates.
 * Analyzes positional letter distributions in the candidate set and selects
 * words that test the positions where candidates differ most.
 */
function getDiscriminatingProbes(
	words,
	candidatesLower,
	incorrectLetters,
	limit,
) {
	const incorrectSet = new Set(incorrectLetters.map((l) => l.toLowerCase()));
	const n = candidatesLower.length;
	if (n < 3) return [];

	// Analyze candidate set: for each position, how diverse are the letters?
	const posLetterCounts = Array.from({ length: 5 }, () => new Map());
	for (const c of candidatesLower) {
		for (let i = 0; i < 5; i++) {
			const ch = c[i];
			posLetterCounts[i].set(ch, (posLetterCounts[i].get(ch) || 0) + 1);
		}
	}

	// Compute discrimination value per position (higher = more diverse)
	const posDiscrimination = posLetterCounts.map((counts) => {
		let sumSq = 0;
		for (const count of counts.values()) {
			sumSq += (count / n) * (count / n);
		}
		return 1 - sumSq; // Gini impurity: 0 = all same, ~1 = all different
	});

	// Score each word by how well it targets high-discrimination positions
	const scored = [];
	for (const word of words) {
		const w = word.toLowerCase();
		let hasIncorrect = false;
		for (let i = 0; i < w.length; i++) {
			if (incorrectSet.has(w[i])) {
				hasIncorrect = true;
				break;
			}
		}
		if (hasIncorrect) continue;

		let score = 0;
		const seen = new Set();
		for (let i = 0; i < 5; i++) {
			const ch = w[i];
			if (seen.has(ch)) continue; // Penalize duplicate letters
			seen.add(ch);

			// How much does this letter at this position split candidates?
			const count = posLetterCounts[i].get(ch) || 0;
			// Best split: letter appears in ~half the candidates at this position
			const splitQuality = (count * (n - count)) / (n * n);
			score += splitQuality * (1 + posDiscrimination[i]);

			// Also check other positions for yellow information
			for (let j = 0; j < 5; j++) {
				if (j === i) continue;
				const countJ = posLetterCounts[j].get(ch) || 0;
				if (countJ > 0) {
					score += ((countJ * (n - countJ)) / (n * n)) * 0.3;
				}
			}
		}

		if (score > 0) {
			scored.push({ word, score });
		}
	}

	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, limit).map((s) => s.word);
}

// =====================================================================
// CONSTRAINT CHECKING
// =====================================================================

/**
 * Check if a word satisfies basic game constraints
 */
export function doesSatisfyBasicConstraints(
	word,
	correctSpots,
	closeSpots,
	incorrectLetters,
	maxLetterCounts = {},
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

	// Check max letter counts (learned from duplicate letter feedback)
	if (maxLetterCounts && Object.keys(maxLetterCounts).length > 0) {
		const w = word.toLowerCase();
		for (const [letter, maxCount] of Object.entries(maxLetterCounts)) {
			let count = 0;
			for (let i = 0; i < w.length; i++) {
				if (w[i] === letter) count++;
			}
			if (count > maxCount) return false;
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
	incorrectLetters,
	maxLetterCounts = {},
) {
	return words.filter((word) =>
		doesSatisfyBasicConstraints(
			word,
			correctSpots,
			closeSpots,
			incorrectLetters,
			maxLetterCounts,
		),
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
	usedLetters,
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
				"aeiou".includes(l.toLowerCase()),
			);
			const consonants = unusedLetters.filter(
				(l) => !"aeiou".includes(l.toLowerCase()),
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
			/^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/,
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
	currentGuessCount,
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
			/^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/,
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
			/^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/,
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
	closeSpots,
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
									positionalFreq[pos][letter.toLowerCase()] / 20,
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
 * Main algorithm to get word suggestions using partition-based scoring.
 * For each potential guess, computes how well it splits the remaining candidates.
 * Uses dual-objective scoring: minimizes expected remaining AND maximizes
 * singleton buckets (candidates uniquely identified by one more guess).
 * This directly optimizes for 3-guess wins.
 */
export function getWordSuggestions(
	words,
	correctSpots,
	closeSpots,
	incorrectLetters,
	usedLetters,
	currentGuessCount,
	maxLetterCounts = {},
) {
	// Get solution candidates (words that could be the answer)
	const solutionCandidates = getSolutionCandidates(
		words,
		correctSpots,
		closeSpots,
		incorrectLetters,
		maxLetterCounts,
	);

	debugLogModule(
		"ALGORITHM",
		`Partition scoring: ${solutionCandidates.length} candidates, guess #${
			currentGuessCount + 1
		}`,
	);

	// If only 1-2 candidates, return them directly
	if (solutionCandidates.length <= 2) {
		return solutionCandidates;
	}

	const remainingGuesses = 6 - currentGuessCount;
	const candidateSet = new Set(solutionCandidates);

	// Pre-lowercase candidates once for performance (used by computePartitionStats)
	const candidatesLower = solutionCandidates.map((w) => w.toLowerCase());

	// Build the pool of words to evaluate as potential guesses
	// Strategy: combine diverse probes (letter coverage) + discriminating probes
	// (positional splitting) for maximum partition quality discovery
	let guessPool;
	const guessPoolSet = new Set();
	const addToPool = (word) => {
		const w = word.toLowerCase();
		if (!guessPoolSet.has(w)) {
			guessPoolSet.add(w);
			guessPool.push(w);
		}
	};

	if (solutionCandidates.length <= 100) {
		// Small candidate set: evaluate ALL words from word list
		// (14,855 × 100 = 1.5M pattern computations ≈ fast)
		guessPool = [];
		for (const w of words) {
			addToPool(w);
		}
	} else if (solutionCandidates.length <= 800) {
		// Medium set: candidates + large combined probe pool
		guessPool = [];
		for (const w of solutionCandidates) addToPool(w);
		if (remainingGuesses >= 3) {
			// Diverse probes: words with many new high-frequency letters
			const diverseProbes = getDiverseProbes(
				words,
				incorrectLetters,
				usedLetters,
				1200,
			);
			for (const w of diverseProbes) addToPool(w);
			// Discriminating probes: words that target positions where candidates differ
			const discrimProbes = getDiscriminatingProbes(
				words,
				candidatesLower,
				incorrectLetters,
				800,
			);
			for (const w of discrimProbes) addToPool(w);
		}
	} else {
		// Large set: heuristic pre-filter + probes
		guessPool = [];
		const heuristicScored = solutionCandidates
			.map((w) => ({
				word: w,
				score: scoreWordWithPositions(w, usedLetters) + applyPatternBonus(w),
			}))
			.sort((a, b) => b.score - a.score);
		for (const s of heuristicScored.slice(0, 800)) addToPool(s.word);
		if (remainingGuesses >= 3) {
			const diverseProbes = getDiverseProbes(
				words,
				incorrectLetters,
				usedLetters,
				500,
			);
			for (const w of diverseProbes) addToPool(w);
			const discrimProbes = getDiscriminatingProbes(
				words,
				candidatesLower,
				incorrectLetters,
				400,
			);
			for (const w of discrimProbes) addToPool(w);
		}
	}

	// Score each guess using optimized partition stats
	// Triple objective: minimize E[remaining] + maximize singletons + penalize worst-case buckets
	// Singleton weight scales with guess number: higher on early guesses (where impact
	// on 3-guess wins is greatest) to aggressively optimize for fast solves.
	const isEarlyGuess = currentGuessCount <= 1;
	const singletonWeight = isEarlyGuess ? 8.0 : 4.0;
	const maxBucketPenalty = 0.3; // Penalize guesses leaving a single large unsplit group
	const scored = [];
	const n = candidatesLower.length;

	for (const guess of guessPool) {
		const stats = computePartitionStats(guess, candidatesLower);
		const singletonFraction = stats.singletonCount / n;
		const maxBucketFraction = stats.maxBucketSize / n;
		// Primary: lower expected remaining = better splitting
		// Secondary: higher singleton fraction = more 3-guess wins
		// Tertiary: smaller max bucket = better worst-case behavior
		let score =
			-stats.expectedRemaining +
			singletonWeight * singletonFraction -
			maxBucketPenalty * maxBucketFraction;

		// Candidate urgency: for small candidate sets, picking a candidate gives
		// a 1/k chance of winning THIS turn, which is almost always better than
		// a non-candidate splitter (proven mathematically for k ≤ 5-8).
		const isCandidate = candidateSet.has(guess);
		if (isCandidate) {
			if (remainingGuesses <= 1) {
				score += 10000; // Must pick a candidate on last guess
			} else if (remainingGuesses <= 2) {
				score += Math.max(5.0, 30.0 / solutionCandidates.length);
			} else if (n <= 3) {
				// With 2-3 candidates, a candidate is ALWAYS better than a splitter.
				// The 33-50% win chance plus equivalent info value outweighs pure splitting.
				score += 50.0;
			} else if (n <= 5) {
				// 20-25% win chance; candidate's {1, k-1} split is nearly as good
				// as a non-candidate's {1,1,...,1} for small k
				score += 10.0;
			} else if (n <= 8) {
				// ~12-17% win chance; candidates still often better
				score += 3.0;
			} else if (n <= 15) {
				// Candidates sometimes better for moderate sets
				score += 0.5;
			} else {
				score += 0.01; // Tiny tiebreaker for large sets
			}
		} else if (remainingGuesses <= 1) {
			continue; // Skip non-candidates on last guess
		}

		scored.push({ word: guess, score });
	}

	scored.sort((a, b) => b.score - a.score);
	return scored.map((s) => s.word).slice(0, 20);
}
