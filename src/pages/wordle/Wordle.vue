<script setup>
import { ref, onMounted, computed, watch } from "vue";
import WordleSuggestions from "./components/WordleSuggestions.vue";
import WordleGameGrid from "./components/WordleGameGrid.vue";
import WordleControls from "./components/WordleControls.vue";
import words from "./words.json";
import * as GameLogic from "../../functions/wordleGameLogic.js";

import { debugLogModule } from "../../functions/debugUtils.js";

// Game state
const currentGuess = ref(["", "", "", "", ""]);
const guessIndex = ref(0);
const guesses = ref([]);
const correctSpots = ref(["", "", "", "", ""]);
const closeSpots = ref([[], [], [], [], []]);
const incorrectLetters = ref([]);

const suggestionsRef = ref(null);
const gameGridRef = ref(null);

// Computed properties
const hasWon = computed(() => GameLogic.checkWinCondition(correctSpots.value));
const winningWord = computed(() =>
  GameLogic.getWinningWord(correctSpots.value)
);
const canSubmit = computed(() =>
  GameLogic.canSubmitGuess(currentGuess.value, words)
);

// Event handlers
const handleInputChange = (e, index) => {
  GameLogic.handleInputChange(
    e,
    index,
    currentGuess.value,
    gameGridRef.value?.inputRefs || [],
    GameLogic.findNextAvailableIndex,
    hasWon.value,
    correctSpots.value
  );
};

const handleKeyDown = (e, index) => {
  GameLogic.handleKeyDown(
    e,
    index,
    currentGuess.value,
    gameGridRef.value?.inputRefs || [],
    GameLogic.findNextAvailableIndex,
    hasWon.value,
    handleSubmit,
    words
  );
};

const handleCellClick = (index) => {
  GameLogic.handleCellClick(index, gameGridRef.value?.inputRefs || []);
};

const handleSubmit = () => {
  if (!canSubmit.value) return;

  const success = GameLogic.submitGuess(
    currentGuess.value,
    guesses.value,
    guessIndex.value,
    words,
    updateGameState,
    getSuggestions
  );

  // Win condition is handled by the win-message div in template
};

const handleCycleLetter = (letterIdx, letter) => {
  const result = GameLogic.cycleLetter(
    letterIdx,
    letter,
    correctSpots.value,
    closeSpots.value,
    incorrectLetters.value
  );

  correctSpots.value = result.correctSpots;
  closeSpots.value = result.closeSpots;
  incorrectLetters.value = result.incorrectLetters;

  // Update suggestions when game state changes
  setTimeout(getSuggestions, 100);
};

const handleReset = () => {
  GameLogic.resetGame(
    currentGuess.value,
    guesses.value,
    guessIndex.value,
    correctSpots.value,
    closeSpots.value,
    incorrectLetters.value
  );
};

const handleWordSelected = (selectedWord) => {
  GameLogic.fillCurrentGuess(selectedWord, currentGuess.value);
};

// Game state management
const updateGameState = () => {
  GameLogic.updateIncorrectLetters(
    guesses.value,
    correctSpots.value,
    closeSpots.value,
    incorrectLetters.value
  );
};

const getSuggestions = () => {
  if (suggestionsRef.value) {
    suggestionsRef.value.getSuggestions();
  }
};

const handleSuggestionsCalculated = (data) => {
  debugLogModule(
    "UI",
    `Suggestions calculated: ${data.words.length} words with strategy: ${data.strategy}`
  );
};

// Watch for game state changes to update suggestions
watch(
  [correctSpots, closeSpots, incorrectLetters],
  () => {
    // Debounce the suggestions update to avoid excessive calls
    setTimeout(getSuggestions, 200);
  },
  { deep: true }
);

// Initialize component
onMounted(() => {
  // Initialize inputRefs through the game grid ref
  if (gameGridRef.value) {
    gameGridRef.value.inputRefs = new Array(5).fill(null);
  }

  // Fill correct spots in current guess
  for (let i = 0; i < 5; i++) {
    if (correctSpots.value[i] !== "") {
      currentGuess.value[i] = correctSpots.value[i];
    }
  }

  updateGameState();
  setTimeout(getSuggestions, 100);
});
</script>

<template>
  <div class="wordle">
    <div class="explanation-section">
      <h2>Wordle Assistant</h2>
      <p>
        Enter your guesses and mark each letter as correct (green), close
        (yellow), or wrong (gray). Click on letters in previous guesses to cycle
        through states.
      </p>
    </div>

    <!-- Game Grid -->
    <WordleGameGrid
      ref="gameGridRef"
      :currentGuess="currentGuess"
      :guesses="guesses"
      :correctSpots="correctSpots"
      :closeSpots="closeSpots"
      :incorrectLetters="incorrectLetters"
      :hasWon="hasWon"
      @input-change="handleInputChange"
      @keydown-event="handleKeyDown"
      @cell-click="handleCellClick"
      @cycle-letter="handleCycleLetter"
    />

    <!-- Game Controls -->
    <WordleControls
      :hasWon="hasWon"
      :winningWord="winningWord"
      :canSubmit="canSubmit"
      :guessCount="guesses.length"
      @submit="handleSubmit"
      @reset="handleReset"
    />

    <!-- Win Celebration or Suggestions -->
    <div v-if="hasWon" class="win-message">
      <h3>Perfect! You found the word!</h3>
      <p>
        The word was: <strong>{{ winningWord }}</strong>
      </p>
      <button @click="handleReset" class="reset-button">Play Again</button>
    </div>

    <WordleSuggestions
      v-else
      ref="suggestionsRef"
      :guesses="guesses"
      :correct-spots="correctSpots"
      :close-spots="closeSpots"
      :incorrect-letters="incorrectLetters"
      :words="words"
      @suggestions-calculated="handleSuggestionsCalculated"
      @word-selected="handleWordSelected"
    />
  </div>
</template>

<style scoped>
.wordle {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.explanation-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.explanation-section h2 {
  color: #1f2937;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.explanation-section p {
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto;
}

.win-message {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);
}

.win-message h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.win-message p {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.reset-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .wordle {
    padding: 15px;
  }

  .explanation-section h2 {
    font-size: 24px;
  }

  .explanation-section p {
    font-size: 14px;
  }
}
</style>
