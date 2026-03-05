<template>
	<div
		class="suggestions-wrapper"
		v-if="
			loadingSuggestions || possibleWords.length > 0 || guesses.length === 0
		"
	>
		<!-- Quick Suggestion -->
		<div class="quick-suggestion" :class="{ standalone: !showSuggestions }">
			<div class="quick-header" v-if="loadingSuggestions">
				<strong>Calculating optimal word...</strong>
				<span class="quick-context">(Analyzing patterns)</span>
			</div>
			<div class="quick-header" v-else-if="guesses.length === 0">
				<strong>Suggested First Word:</strong>
				<span
					class="quick-word clickable-word"
					@click="selectWord(getTopPerformingStartingWords()[0])"
				>
					{{ getTopPerformingStartingWords()[0].toUpperCase() }}
				</span>
				<span class="quick-context">(55.2 pts)</span>
				<button @click="toggleSuggestions" class="inline-toggle-button">
					{{ showSuggestions ? "Hide Analysis" : "Show Analysis" }}
				</button>
			</div>
			<div class="quick-header" v-else>
				<strong>Suggested Next Word:</strong>
				<span
					class="quick-word clickable-word"
					@click="selectWord(possibleWords[0] || '')"
				>
					{{ (possibleWords[0] || "").toUpperCase() }}
				</span>
				<span class="quick-context" v-if="possibleWords.length > 1">
					({{ possibleWords.length }} options)
				</span>
				<span class="quick-context" v-else>(Perfect match!)</span>
				<button @click="toggleSuggestions" class="inline-toggle-button">
					{{ showSuggestions ? "Hide Analysis" : "Show Analysis" }}
				</button>
			</div>
		</div>

		<!-- Detailed Analysis -->
		<div v-if="showSuggestions" class="suggestions-container">
			<div class="suggestions-content">
				<!-- Strategy Information -->
				<div v-if="suggestedStrategy" class="strategy-info">
					{{ suggestedStrategy }}
				</div>

				<!-- Advanced metrics for power users -->
				<div
					v-if="possibleWords.length > 1 && possibleWords.length <= 20"
					class="metrics-section"
				>
					<div class="metrics-title">Advanced Metrics (Top 6 Words):</div>
					<div class="metrics-explanation" v-if="guesses.length === 0">
						Rankings from partition-based algorithm testing (Feb 2026): CARTE
						(98.42% success) proven optimal performer, CARNE (~98.2%), TRACE
						(~98.1%), CRATE (~98.1%). Partition scoring evaluates how well each
						guess splits remaining candidates.
					</div>
					<div class="metrics-explanation" v-else>
						Enhanced scoring with entropy analysis: information theory +
						constraint satisfaction + pattern recognition + endgame optimization
						for maximum efficiency
					</div>
					<div class="metrics-grid">
						<div
							v-for="(word, index) in possibleWords.slice(0, 6)"
							:key="word"
							class="metric-item clickable-metric"
							:class="{ 'top-recommendation': index === 0 }"
							@click="selectWord(word)"
						>
							<span class="word-rank">{{ index + 1 }}.</span>
							<span class="word-name">{{ word.toUpperCase() }}</span>
							<span
								class="word-score"
								:title="
									guesses.length === 0
										? formatStartingScoreBreakdown(word)
										: formatScoreBreakdown(word)
								"
							>
								{{
									guesses.length === 0
										? Math.round(calculateStartingWordScore(word) * 10) / 10 +
										  " pts"
										: Math.round(calculateWordCompleteScore(word) * 10) / 10
								}}
							</span>
						</div>
					</div>
				</div>

				<!-- All Possible Words -->
				<div v-if="possibleWords.length > 1" class="possible-words-container">
					<div class="words-header">
						<strong>All {{ possibleWords.length }} Possible Words:</strong>
					</div>
					<div class="clickable-words-list">
						<span
							v-for="(word, index) in possibleWords"
							:key="word"
							class="clickable-possible-word"
							@click="selectWord(word)"
						>
							{{ word.toUpperCase()
							}}{{ index < possibleWords.length - 1 ? ", " : "" }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import {
	getWordSuggestions,
	scoreWordWithPositions,
} from "../../../functions/wordleAlgorithm.js";

import * as TestData from "../../../functions/wordleTestData.js";
import * as WeightedScoring from "../../../functions/wordleWeightedScoring.js";
import { debugLogModule } from "../../../functions/debugUtils.js";

// Props
const props = defineProps({
	guesses: Array,
	correctSpots: Array,
	closeSpots: Array,
	incorrectLetters: Array,
	words: Array,
});

// Emits
const emit = defineEmits(["suggestions-calculated", "word-selected"]);

// State
const possibleWords = ref([]);
const suggestedStrategy = ref("");
const showSuggestions = ref(false);
const loadingSuggestions = ref(false);

// Methods
const toggleSuggestions = () =>
	(showSuggestions.value = !showSuggestions.value);

const selectWord = (word) => {
	emit("word-selected", word.toLowerCase());
};

// Word scoring functions
const calculateStartingWordScore = (word) => {
	// Use weighted practical efficiency score
	const weightedData = WeightedScoring.getStartingWordData(word);
	if (weightedData) {
		return weightedData.practicalScore;
	}

	// Simple fallback scoring
	const vowelCount = (word.match(/[aeiou]/gi) || []).length;
	return vowelCount * 5 + new Set(word.toLowerCase()).size * 3;
};
const calculateWordCompleteScore = (word) => {
	const usedLetters = new Set();
	props.guesses.forEach((guess) => {
		guess.forEach((letter) => {
			if (letter) usedLetters.add(letter.toLowerCase());
		});
	});

	return scoreWordWithPositions(word, usedLetters);
};

// Format score breakdown for tooltips with weighted performance data
const formatStartingScoreBreakdown = (word) => {
	// Use enhanced weighted scoring data for tooltips
	return WeightedScoring.formatWeightedStartingWordTooltip(word);
};

// Use top performing words from utility file
const getTopPerformingStartingWords = TestData.getTopPerformingStartingWords;

const formatScoreBreakdown = (word) => {
	// Check if this is a starting word with weighted data
	const weightedData = WeightedScoring.getStartingWordData(word);
	if (weightedData && guesses.length === 0) {
		return `${word.toUpperCase()} - Performance Analysis:
Practical Score: ${weightedData.practicalScore} pts (Rank #${weightedData.rank})
Success Rate: ${weightedData.successRate}%
Tier: ${weightedData.tier}`;
	}

	// Simple fallback analysis
	const vowels = (word.match(/[aeiou]/gi) || []).length;
	const unique = new Set(word.toLowerCase()).size;
	return `${word.toUpperCase()} Analysis:
Vowels: ${vowels}
Unique Letters: ${unique}/5`;
};

function getSuggestions() {
	loadingSuggestions.value = true;

	debugLogModule("SUGGESTIONS", "Getting suggestions with state:", {
		correctSpots: props.correctSpots,
		closeSpots: props.closeSpots,
		incorrectLetters: props.incorrectLetters,
		guesses: props.guesses,
	});

	const currentGuessCount = props.guesses.filter((guess) =>
		guess.every((letter) => letter !== ""),
	).length;

	if (currentGuessCount === 0) {
		possibleWords.value = getTopPerformingStartingWords().slice(0, 10);
		suggestedStrategy.value =
			"🏆 CARTE is the optimal starting word with our partition-based algorithm: 98.42% success rate (14,620/14,855 wins) with 4.20 average attempts. The algorithm uses information-theoretic partition scoring to find the guess that best splits remaining candidates, achieving near-perfect solve rates.";
		loadingSuggestions.value = false;
		return;
	}

	const usedLetters = new Set();
	props.guesses.forEach((guess) => {
		guess.forEach((letter) => {
			if (letter) usedLetters.add(letter.toLowerCase());
		});
	});

	const suggestions = getWordSuggestions(
		props.words,
		props.correctSpots,
		props.closeSpots,
		props.incorrectLetters,
		usedLetters,
		currentGuessCount,
	);

	debugLogModule(
		"SUGGESTIONS",
		`Found ${suggestions.length} suggestions:`,
		suggestions.slice(0, 5),
	);

	possibleWords.value = suggestions;
	// Simple strategy explanation
	if (suggestions.length > 50) {
		suggestedStrategy.value = "Information Gathering: Exploring possibilities";
	} else if (suggestions.length > 10) {
		suggestedStrategy.value = "Focused Search: Narrowing down options";
	} else if (suggestions.length > 3) {
		suggestedStrategy.value = "Precision Strike: Close to solution";
	} else {
		suggestedStrategy.value = "Final Convergence: Few possibilities remain";
	}
	loadingSuggestions.value = false;

	emit("suggestions-calculated", {
		words: possibleWords.value,
		strategy: suggestedStrategy.value,
	});
}

// Expose getSuggestions method
defineExpose({
	getSuggestions,
});
</script>

<style scoped>
.suggestions-wrapper {
	margin: 0 auto;
	max-width: 600px;
	width: 100%;
}

.quick-suggestion {
	padding: 12px 18px;
	background: linear-gradient(
		135deg,
		rgba(16, 185, 129, 0.12),
		rgba(34, 197, 94, 0.08)
	);
	border: 2px solid rgba(16, 185, 129, 0.3);
	border-bottom: none;
	border-radius: 12px 12px 0 0;
	width: 100%;
	box-sizing: border-box;
}

.quick-suggestion.standalone {
	border-bottom: 2px solid rgba(16, 185, 129, 0.3);
	border-radius: 12px;
}

.quick-header {
	text-align: center;
	color: #065f46;
	font-size: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	flex-wrap: wrap;
}

.quick-word {
	font-size: 22px;
	font-weight: bold;
	color: #047857;
	letter-spacing: 2px;
	padding: 2px 8px;
	background-color: rgba(16, 185, 129, 0.15);
	border-radius: 6px;
}

.quick-context {
	color: #6b7280;
	font-size: 14px;
	font-weight: 500;
}

.suggestions-container {
	background-color: rgba(248, 250, 252, 0.95);
	border: 2px solid #e2e8f0;
	border-top: 2px solid rgba(16, 185, 129, 0.3);
	border-radius: 0 0 12px 12px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.inline-toggle-button {
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid rgba(59, 130, 246, 0.3);
	color: #2563eb;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 4px;
	transition: all 0.2s ease;
	margin-left: 8px;
}

.inline-toggle-button:hover {
	background-color: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.5);
	transform: translateY(-1px);
}

.suggestions-content {
	padding: 16px;
}

.strategy-info {
	margin: 0 0 15px 0;
	padding: 12px 16px;
	background-color: rgba(74, 144, 226, 0.1);
	border: 1px solid rgba(74, 144, 226, 0.3);
	border-radius: 8px;
	color: #2c5282;
	font-size: 14px;
	text-align: center;
	font-weight: 500;
}

.top-recommendation {
	margin: 0;
	padding: 16px 20px;
	background: linear-gradient(
		135deg,
		rgba(34, 197, 94, 0.1),
		rgba(16, 185, 129, 0.1)
	);
	border: 2px solid rgba(34, 197, 94, 0.3);
	border-radius: 12px;
	text-align: center;
}

.recommendation-header {
	color: #059669;
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 8px;
}

.recommended-word {
	font-size: 32px;
	font-weight: bold;
	color: #047857;
	letter-spacing: 4px;
	margin: 10px 0;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.possible-words-container {
	margin: 0;
	padding: 15px;
	border-radius: 8px;
	text-align: center;
	line-height: 1.6;
	color: #333;
	font-size: 16px;
	max-height: 200px;
	overflow-y: auto;
	background-color: rgba(255, 255, 255, 0.8);
	border: 1px solid #e0e0e0;
}

.words-header {
	margin-bottom: 8px;
	color: #555;
	font-size: 14px;
}

.clickable-words-list {
	line-height: 1.8;
}

.metrics-section {
	margin: 0 auto 15px auto;
	padding: 12px 16px;
	background-color: rgba(138, 43, 226, 0.08);
	border: 1px solid rgba(138, 43, 226, 0.2);
	border-radius: 8px;
	max-width: 600px;
}

.metrics-title {
	color: #6b21a8;
	font-size: 14px;
	font-weight: 600;
	text-align: center;
	margin-bottom: 6px;
}

.metrics-explanation {
	color: #6b7280;
	font-size: 11px;
	text-align: center;
	margin-bottom: 12px;
	font-style: italic;
	line-height: 1.3;
}

.metrics-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(2, 1fr);
	gap: 6px;
}

.metric-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px 8px;
	background-color: rgba(255, 255, 255, 0.5);
	border-radius: 4px;
	font-size: 13px;
	min-height: 32px;
}

.metric-item.top-recommendation {
	background: linear-gradient(
		135deg,
		rgba(34, 197, 94, 0.15),
		rgba(16, 185, 129, 0.15)
	);
	border: 1px solid rgba(34, 197, 94, 0.4);
	box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}

.metric-item.top-recommendation .word-name {
	color: #047857;
	font-weight: 700;
}

.metric-item.top-recommendation .word-rank {
	color: #059669;
	font-weight: 800;
}

.metric-item.top-recommendation .word-score {
	color: #065f46;
	font-weight: 600;
}

.word-rank {
	font-weight: bold;
	color: #6b21a8;
	min-width: 20px;
}

.word-name {
	font-weight: bold;
	color: #333;
	flex: 1;
	text-align: center;
	letter-spacing: 0.5px;
}

.word-score {
	color: #666;
	font-size: 12px;
	min-width: 30px;
	text-align: right;
	cursor: help;
	border-bottom: 1px dotted #999;
}

.clickable-metric {
	cursor: pointer !important;
	transition: all 0.2s ease;
}

.clickable-metric:hover {
	background-color: rgba(147, 51, 234, 0.15) !important;
	transform: translateX(2px);
}

.clickable-metric.top-recommendation:hover {
	background: linear-gradient(
		135deg,
		rgba(34, 197, 94, 0.25),
		rgba(16, 185, 129, 0.25)
	) !important;
	transform: translateX(2px) scale(1.02);
}

/* Clickable word styles */
.clickable-word {
	cursor: pointer !important;
	transition: all 0.2s ease;
	border-radius: 4px;
	padding: 2px 4px;
}

.clickable-word:hover {
	background-color: rgba(16, 185, 129, 0.2) !important;
	transform: scale(1.05);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clickable-word:active {
	transform: scale(0.95);
}

.clickable-possible-word {
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: 3px;
	padding: 1px 3px;
	display: inline-block;
}

.clickable-possible-word:hover {
	background-color: rgba(59, 130, 246, 0.2);
	color: #1d4ed8;
}

@media (max-width: 600px) {
	.quick-header {
		flex-direction: column;
		gap: 4px;
	}

	.suggestions-header {
		flex-direction: column;
		gap: 8px;
	}

	.recommended-word {
		font-size: 24px;
		letter-spacing: 2px;
	}

	.metrics-grid {
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(3, 1fr);
		gap: 4px;
	}

	.metric-item {
		font-size: 12px;
		padding: 4px 6px;
		min-height: 28px;
	}

	.word-name {
		font-size: 12px;
	}

	.word-score {
		font-size: 11px;
	}
}
</style>
