<template>
  <div class="wordle-grid">
    <!-- Current Guess Input Row -->
    <div class="current-guess">
      <div class="row">
        <input
          v-for="(letter, index) in currentGuess"
          :key="index"
          :ref="(el) => (inputRefs[index] = el)"
          type="text"
          maxlength="1"
          :value="letter"
          @input="(e) => handleInput(e, index)"
          @keydown="(e) => handleKeyDown(e, index)"
          @click="() => handleCellClick(index)"
          class="letter-input"
          :class="{
            'has-letter': letter !== '',
          }"
          :disabled="hasWon"
        />
      </div>
    </div>

    <!-- Previous Guesses -->
    <div class="guesses-history">
      <div
        v-for="(guess, guessIdx) in guesses"
        :key="guessIdx"
        class="guess-row"
      >
        <div
          v-for="(letter, letterIdx) in guess"
          :key="letterIdx"
          class="letter-display clickable-letters"
          :class="{
            'state-correct': isCorrectLetter(letter, letterIdx),
            'state-close': isCloseLetter(letter, letterIdx),
            'state-wrong': isWrongLetter(letter, letterIdx),
            'game-won': hasWon,
          }"
          @click.prevent="!hasWon && cycleLetter(letterIdx, letter)"
        >
          {{ letter.toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
  currentGuess: Array,
  guesses: Array,
  correctSpots: Array,
  closeSpots: Array,
  incorrectLetters: Array,
  hasWon: Boolean,
});

// Emits
const emit = defineEmits([
  "input-change",
  "keydown-event",
  "cell-click",
  "cycle-letter",
]);

// Local refs
const inputRefs = ref([]);

// Methods
const handleInput = (e, index) => {
  emit("input-change", e, index);
};

const handleKeyDown = (e, index) => {
  emit("keydown-event", e, index);
};

const handleCellClick = (index) => {
  emit("cell-click", index);
};

const cycleLetter = (letterIdx, letter) => {
  emit("cycle-letter", letterIdx, letter);
};

// Helper methods for letter states
const isCorrectLetter = (letter, index) => {
  if (!letter) return false;
  return (
    props.correctSpots[index] === letter ||
    props.correctSpots[index] === letter.toUpperCase() ||
    props.correctSpots[index] === letter.toLowerCase()
  );
};

const isCloseLetter = (letter, index) => {
  if (!letter || !props.closeSpots[index]) return false;
  return (
    props.closeSpots[index].includes(letter) ||
    props.closeSpots[index].includes(letter.toUpperCase()) ||
    props.closeSpots[index].includes(letter.toLowerCase())
  );
};

const isWrongLetter = (letter, index) => {
  if (!letter) return false;

  return (
    !isCorrectLetter(letter, index) &&
    !isCloseLetter(letter, index) &&
    (props.incorrectLetters.includes(letter) ||
      props.incorrectLetters.includes(letter.toUpperCase()) ||
      props.incorrectLetters.includes(letter.toLowerCase()))
  );
};

// Expose inputRefs for parent component
defineExpose({
  inputRefs,
});
</script>

<style scoped>
/* Grid styles extracted from main component */
.wordle-grid {
  max-width: 400px;
  margin: 0 auto;
}

.current-guess {
  margin-bottom: 20px;
}

.row {
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-bottom: 10px;
}

.letter-input {
  width: 60px;
  height: 60px;
  border: 2px solid #d1d5db;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;
}

.letter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.letter-input.has-letter {
  background-color: #f3f4f6;
  border-color: #6b7280;
}

.letter-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.guesses-history {
  margin-top: 20px;
}

.guess-row {
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-bottom: 10px;
}

.letter-display {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 4px;
  border: 2px solid #d1d5db;
  background-color: #f9fafb;
  position: relative;
  transition: all 0.2s ease;
}

.clickable-letters {
  cursor: pointer;
}

.clickable-letters:hover:not(.game-won) {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.clickable-letters:active:not(.game-won) {
  transform: scale(0.95);
}

.state-correct {
  background-color: #22c55e !important;
  color: white;
  border-color: #16a34a;
}

.state-close {
  background-color: #f0c000 !important;
  color: white;
  border-color: #d97706;
}

.state-wrong {
  background-color: #6b7280 !important;
  color: white;
  border-color: #4b5563;
}

/* Tooltip styles */
.state-wrong:hover:not(.game-won)::before {
  content: "→ Close";
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fbbf24;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  z-index: 999999;
  pointer-events: none;
  border: 1px solid #f59e0b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  animation: tooltipFadeIn 0.2s ease-out;
}

.state-close:hover:not(.game-won)::before {
  content: "→ Correct";
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #10b981;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  z-index: 999999;
  pointer-events: none;
  border: 1px solid #059669;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  animation: tooltipFadeIn 0.2s ease-out;
}

.state-correct:hover:not(.game-won)::before {
  content: "→ Wrong";
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #6b7280;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  z-index: 999999;
  pointer-events: none;
  border: 1px solid #4b5563;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  animation: tooltipFadeIn 0.2s ease-out;
}

.game-won {
  cursor: default !important;
  pointer-events: none;
}

.game-won .state-wrong:hover:not(.game-won)::before,
.game-won .state-close:hover:not(.game-won)::before,
.game-won .state-correct:hover:not(.game-won)::before {
  display: none;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
