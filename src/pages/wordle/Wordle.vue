<script setup>
import { TrashIcon } from "@heroicons/vue/24/outline";
import { ref, onMounted } from "vue";
import Notification from "../shared/Notification.vue";

// Wordle game state
const currentGuess = ref(["", "", "", "", ""]);
const guessIndex = ref(0);
const inputRefs = ref([]); // Will hold references to the input elements
const guesses = ref([]);
const correctSpots = ref(["", "", "", "", ""]); // Array to track correct letter positions
const closeSpots = ref([[], [], [], [], []]); // Array to track close letter positions
const correctMode = ref(false);
const closeMode = ref(false);
const maxGuesses = 6;
const showHints = ref(false); // Toggle for showing letter hints

// Notification state
const notification = ref({
  message: "",
  type: "",
  show: false,
});

// Function to show a notification
const showNotification = (message, type = "info") => {
  notification.value = {
    message,
    type,
    show: true,
  };

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Function to find next available input (skipping readonly fields)
const findNextAvailableIndex = (currentIndex) => {
  for (let i = currentIndex + 1; i < 5; i++) {
    if (correctSpots.value[i] === "") {
      return i;
    }
  }
  return -1; // No available input found
};

// Function to find previous available input (skipping readonly fields)
const findPrevAvailableIndex = (currentIndex) => {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (correctSpots.value[i] === "") {
      return i;
    }
  }
  return -1; // No available input found
};

// Function to set focus to the next input field
const focusNextInput = (index) => {
  const nextAvailableIndex = findNextAvailableIndex(index);

  if (nextAvailableIndex !== -1 && inputRefs.value[nextAvailableIndex]) {
    inputRefs.value[nextAvailableIndex].focus();
    // Select any existing text for easy replacement
    inputRefs.value[nextAvailableIndex].select();
  }
};

// Function to set focus to the previous input field
const focusPrevInput = (index) => {
  const prevAvailableIndex = findPrevAvailableIndex(index);

  if (prevAvailableIndex !== -1 && inputRefs.value[prevAvailableIndex]) {
    inputRefs.value[prevAvailableIndex].focus();
    // Select any existing text for easy replacement
    inputRefs.value[prevAvailableIndex].select();
  }
};

// Function to handle key input in the letter fields
const handleInput = (e, index) => {
  // Ensure only one character and it's a letter
  const value = e.target.value.toUpperCase();
  if (/^[A-Z]$/.test(value)) {
    // Allow any letter, even if it was previously marked as forbidden
    currentGuess.value[index] = value;

    // Simply move to the next input, without auto-submitting
    setTimeout(() => focusNextInput(index), 0);
  } else {
    currentGuess.value[index] = "";
  }
};

// Function to handle key navigation
const handleKeyDown = (e, index) => {
  // Only prevent default for specific keys that might trigger browser behavior
  // but still allow normal typing of letters
  if (
    e.key === "/" ||
    (e.ctrlKey && /^[fgk]$/.test(e.key)) ||
    (e.metaKey && /^[fgk]$/.test(e.key))
  ) {
    e.preventDefault();
    return;
  }

  if (e.key === "Backspace" && currentGuess.value[index] === "") {
    // If Backspace is pressed in an empty field, move to the previous input
    focusPrevInput(index);
  } else if (e.key === "Enter") {
    // If Enter is pressed and all letters are filled, submit the word
    if (currentGuess.value.every((letter) => letter !== "")) {
      e.preventDefault(); // Prevent default form submission behavior
      submitGuess(e);
    }
  }
};

const submitGuess = (e) => {
  e.preventDefault();
  // Check if all 5 letters are filled
  const isComplete = currentGuess.value.every((letter) => letter !== "");

  if (isComplete && guessIndex.value < maxGuesses) {
    // Add the current guess to the beginning of the array
    guesses.value.unshift([...currentGuess.value]);
    guessIndex.value++;

    // Create a new array for the next guess, but keep any known correct letters
    const newGuess = ["", "", "", "", ""];

    // Preserve any correct letters in their positions
    for (let i = 0; i < 5; i++) {
      if (correctSpots.value[i] !== "") {
        newGuess[i] = correctSpots.value[i];
      }
    }

    currentGuess.value = newGuess;

    // Run deduction logic after submitting a guess
    deduceLetters();

    // Focus on the first editable empty input
    setTimeout(() => {
      // Find first editable empty input (not a correct letter)
      let firstEditableEmptyIndex = -1;
      for (let i = 0; i < 5; i++) {
        if (currentGuess.value[i] === "" && correctSpots.value[i] === "") {
          firstEditableEmptyIndex = i;
          break;
        }
      }

      if (
        firstEditableEmptyIndex !== -1 &&
        inputRefs.value[firstEditableEmptyIndex]
      ) {
        inputRefs.value[firstEditableEmptyIndex].focus();
      } else if (inputRefs.value[0] && correctSpots.value[0] === "") {
        inputRefs.value[0].focus();
      }
    }, 0);
  }
};

// Function to remove a guess
const removeGuess = (index) => {
  // Remove the guess at the specified index
  guesses.value.splice(index, 1);

  // Decrement the guessIndex to allow one more submission
  if (guessIndex.value > 0) {
    guessIndex.value--;
  }

  // If the deleted guess was the most recent and no guess is in progress
  if (currentGuess.value.every((letter) => letter === "") && index === 0) {
    // Move the deleted guess back to the input fields for editing
    setTimeout(() => {
      if (inputRefs.value[0]) {
        inputRefs.value[0].focus();
      }
    }, 0);
  }
};

// Function to check if a letter is marked as correct
const isCorrect = (letterIdx, letter) => {
  return correctSpots.value[letterIdx] === letter;
};

// Function to check if a letter is marked as close
const isClose = (letterIdx, letter) => {
  return (
    closeSpots.value[letterIdx] && closeSpots.value[letterIdx].includes(letter)
  );
};

// Function to mark a letter as correct or close based on active mode
const markLetter = (letterIdx, letter) => {
  if (!correctMode.value && !closeMode.value) return;

  // Prevent browser search from appearing when clicking on letters
  if (typeof event !== "undefined") {
    event.preventDefault();
  }

  if (correctMode.value) {
    // Toggle correct marking
    if (correctSpots.value[letterIdx] === letter) {
      // Create a new array to ensure reactivity
      const newCorrectSpots = [...correctSpots.value];
      newCorrectSpots[letterIdx] = "";
      correctSpots.value = newCorrectSpots;

      // Clear the letter from the current guess if it was there
      if (currentGuess.value[letterIdx] === letter) {
        currentGuess.value[letterIdx] = "";
      }
    } else {
      // Create a new array to ensure reactivity
      const newCorrectSpots = [...correctSpots.value];
      newCorrectSpots[letterIdx] = letter;
      correctSpots.value = newCorrectSpots;

      // Also automatically set this letter in the current guess
      currentGuess.value[letterIdx] = letter;

      // Remove this letter from closeSpots at this index only
      // This preserves "close" markings in other positions
      if (
        closeSpots.value[letterIdx] &&
        closeSpots.value[letterIdx].includes(letter)
      ) {
        const newCloseSpots = [...closeSpots.value];
        newCloseSpots[letterIdx] = newCloseSpots[letterIdx].filter(
          (l) => l !== letter
        );
        closeSpots.value = newCloseSpots;
      }
    }
  } else if (closeMode.value) {
    // Toggle close marking
    const newCloseSpots = [...closeSpots.value];

    if (newCloseSpots[letterIdx] && newCloseSpots[letterIdx].includes(letter)) {
      // Remove letter from close spots
      newCloseSpots[letterIdx] = newCloseSpots[letterIdx].filter(
        (l) => l !== letter
      );
    } else {
      // Add letter to close spots
      if (!newCloseSpots[letterIdx]) {
        newCloseSpots[letterIdx] = [];
      }
      newCloseSpots[letterIdx] = [...newCloseSpots[letterIdx], letter];

      // If this letter is marked as correct at this index, remove the correct marking
      if (correctSpots.value[letterIdx] === letter) {
        const newCorrectSpots = [...correctSpots.value];
        newCorrectSpots[letterIdx] = "";
        correctSpots.value = newCorrectSpots;

        // Also remove from current guess if it matches
        if (currentGuess.value[letterIdx] === letter) {
          currentGuess.value[letterIdx] = "";
        }
      }
    }

    closeSpots.value = newCloseSpots;
  }

  // Run deduction logic after marking to see if we can determine letters that must go in specific positions
  deduceLetters();
};

// Computed property for viable letters in each position
const getViableLetters = () => {
  // Start with all positions potentially having all letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const viableLetters = Array(5)
    .fill()
    .map(() => [...alphabet]);

  // Track letters that must be used somewhere (found in close positions)
  const allCloseLetters = new Set();
  for (let i = 0; i < 5; i++) {
    if (closeSpots.value[i] && closeSpots.value[i].length > 0) {
      closeSpots.value[i].forEach((letter) => allCloseLetters.add(letter));
    }
  }

  // Process each position
  for (let position = 0; position < 5; position++) {
    // If there's a correct letter for this position, only that letter is viable
    if (correctSpots.value[position] !== "") {
      viableLetters[position] = [correctSpots.value[position]];
      continue;
    }

    // Filter out letters that are marked as "close" for this position
    // (they can't be in this position since they're known to be elsewhere)
    if (closeSpots.value[position] && closeSpots.value[position].length > 0) {
      viableLetters[position] = viableLetters[position].filter(
        (letter) => !closeSpots.value[position].includes(letter)
      );
    }
  }

  // Check previous guesses to eliminate letters that are definitely not in the word
  const usedLetters = new Set();
  const definitelyNotInWord = new Set();

  // First, gather all letters that are definitely in the word (either correct or close)
  for (let i = 0; i < 5; i++) {
    if (correctSpots.value[i] !== "") {
      usedLetters.add(correctSpots.value[i]);
    }
    if (closeSpots.value[i] && closeSpots.value[i].length > 0) {
      closeSpots.value[i].forEach((letter) => usedLetters.add(letter));
    }
  }

  // Check previous guesses for letters that weren't marked as correct or close
  guesses.value.forEach((guess) => {
    guess.forEach((letter, i) => {
      // If this letter isn't marked as correct or close anywhere, it's not in the word
      if (
        !usedLetters.has(letter) &&
        !isCorrect(i, letter) &&
        !isClose(i, letter)
      ) {
        definitelyNotInWord.add(letter);
      }
    });
  });

  // Remove letters that are definitely not in the word from all positions
  for (let position = 0; position < 5; position++) {
    if (correctSpots.value[position] === "") {
      // Skip positions with correct letters
      viableLetters[position] = viableLetters[position].filter(
        (letter) => !definitelyNotInWord.has(letter)
      );
    }
  }

  // Sort the letters alphabetically for easier reading
  for (let position = 0; position < 5; position++) {
    viableLetters[position].sort();
  }

  return viableLetters;
};

// Function to get the status of each letter in the alphabet for the keyboard
const getLetterStatus = () => {
  const letterStatus = {};
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Initialize all letters as unused
  alphabet.forEach((letter) => {
    letterStatus[letter] = "unused";
  });

  // Check for correct letters
  for (let i = 0; i < 5; i++) {
    if (correctSpots.value[i] !== "") {
      letterStatus[correctSpots.value[i]] = "correct";
    }
  }

  // Check for close letters
  for (let i = 0; i < 5; i++) {
    if (closeSpots.value[i] && closeSpots.value[i].length > 0) {
      closeSpots.value[i].forEach((letter) => {
        // Only mark as close if not already marked as correct
        if (letterStatus[letter] !== "correct") {
          letterStatus[letter] = "close";
        }
      });
    }
  }

  // Check all guesses for used letters that aren't correct or close
  guesses.value.forEach((guess) => {
    guess.forEach((letter) => {
      // If the letter status is still 'unused', mark it as 'used'
      if (letterStatus[letter] === "unused") {
        letterStatus[letter] = "used";
      }
    });
  });

  return letterStatus;
};

// Function to get possible letters for a position based on close letters in other positions
const getPossibleLettersForPosition = (position) => {
  // Find all letters that are marked as "close" in other positions
  const possibleLetters = new Set();

  // Check all positions for close letters
  for (let i = 0; i < 5; i++) {
    // Skip the current position, we want close letters from other positions
    if (i === position) continue;

    // Add each close letter from other positions
    if (closeSpots.value[i] && closeSpots.value[i].length > 0) {
      closeSpots.value[i].forEach((letter) => {
        // Only add if this letter isn't already marked as close in the current position
        // (if it's close in this position, it can't go here)
        const currentCloseSpots = closeSpots.value[position] || [];
        if (!currentCloseSpots.includes(letter)) {
          // Also check if this letter is already correctly placed in this position
          if (correctSpots.value[position] !== letter) {
            possibleLetters.add(letter);
          }
        }
      });
    }
  }

  // Check correct positions too - if a letter is already correctly placed elsewhere,
  // we don't need to consider it for this position
  for (let i = 0; i < 5; i++) {
    if (i !== position && correctSpots.value[i] !== "") {
      // If this letter is already correctly placed elsewhere, remove it from possible letters
      if (possibleLetters.has(correctSpots.value[i])) {
        possibleLetters.delete(correctSpots.value[i]);
      }
    }
  }

  // Return as sorted array
  return Array.from(possibleLetters).sort();
};

// Function to get a condensed list of most likely letters for a slot (for input hints)
const getPossibleLettersForSlot = (position) => {
  // If this position already has a correct letter, return empty array
  if (correctSpots.value[position] !== "") {
    return [];
  }

  // Get all viable letters for this position based on our existing deduction logic
  const allViableLetters = getViableLetters()[position];

  // Start with close letters from other positions (these are our strongest hints)
  const bestCandidates = getPossibleLettersForPosition(position);

  // If we have "close" letters that could go here, prioritize those
  // Otherwise use all viable letters but limit the number
  let result = [];

  if (bestCandidates.length > 0) {
    // We have some strong candidates from close letters
    result = bestCandidates;
  } else if (allViableLetters.length < 10) {
    // We don't have too many options, so show them all
    result = allViableLetters;
  } else {
    // Too many options, don't show any to avoid clutter
    return [];
  }

  // Limit to the most likely options (max 5 letters) to avoid cluttering the input
  return result.slice(0, 5);
};

// Function to get forbidden letters for a slot (letters that can't go in this position)
const getForbiddenLettersForSlot = (position) => {
  // If this position already has a correct letter, return empty array
  if (correctSpots.value[position] !== "") {
    return [];
  }

  // Get letters that have been marked as "close" for this position
  return closeSpots.value[position]
    ? [...closeSpots.value[position]].sort()
    : [];
};

// Function to deduce letters that must go in certain positions
const deduceLetters = () => {
  // Get all close letters (letters that are in the word but we don't know exactly where)
  const closeLettersSet = new Set();
  for (let i = 0; i < 5; i++) {
    if (closeSpots.value[i] && closeSpots.value[i].length > 0) {
      closeSpots.value[i].forEach((letter) => closeLettersSet.add(letter));
    }
  }

  // Convert to array for easier processing
  const closeLetters = Array.from(closeLettersSet);

  // Count how many times each letter appears as correct across all positions
  const correctLetterCounts = {};
  for (let i = 0; i < 5; i++) {
    const letter = correctSpots.value[i];
    if (letter !== "") {
      correctLetterCounts[letter] = (correctLetterCounts[letter] || 0) + 1;
    }
  }

  // For each close letter, check how many positions it could go in
  let deductionsMade = false;
  closeLetters.forEach((letter) => {
    // Skip deduction if this letter is already placed correctly somewhere
    // Since it might be valid in multiple positions (like duplicates)
    if (correctLetterCounts[letter]) {
      return;
    }

    // This will store all positions where this letter could potentially go
    const possiblePositions = [];

    // Check each position
    for (let position = 0; position < 5; position++) {
      // Skip if this position already has a correct letter
      if (correctSpots.value[position] !== "") continue;

      // Skip if this letter is marked as close in this position
      // (meaning it can't go here - it's in the word but in a different spot)
      if (
        closeSpots.value[position] &&
        closeSpots.value[position].includes(letter)
      )
        continue;

      // This position is a possibility for this letter
      possiblePositions.push(position);
    }

    // If there's only one possible position for this letter, it must go there!
    if (possiblePositions.length === 1) {
      const position = possiblePositions[0];
      const positionDisplay = position + 1; // Convert to 1-indexed for user display

      // Create a new correctSpots array to ensure reactivity
      const newCorrectSpots = [...correctSpots.value];
      newCorrectSpots[position] = letter;
      correctSpots.value = newCorrectSpots;

      // Update current guess with the deduced letter
      currentGuess.value[position] = letter;

      // Remove this letter from closeSpots only at the deduced position if it exists there
      // but keep it in other positions for historical purposes
      if (
        closeSpots.value[position] &&
        closeSpots.value[position].includes(letter)
      ) {
        const newCloseSpots = [...closeSpots.value];
        newCloseSpots[position] = newCloseSpots[position].filter(
          (l) => l !== letter
        );
        closeSpots.value = newCloseSpots;
      }

      // Notify the user about the deduction
      showNotification(
        `Deduced that ${letter} must be in position ${positionDisplay}!`,
        "success"
      );
      deductionsMade = true;
    }
  });

  return deductionsMade;
};

// Initialize inputRefs when component is mounted
onMounted(() => {
  // Initialize with empty array of length 5
  inputRefs.value = new Array(5).fill(null);

  // Apply any known correct letters to the current guess
  for (let i = 0; i < 5; i++) {
    if (correctSpots.value[i] !== "") {
      currentGuess.value[i] = correctSpots.value[i];
    }
  }

  // Focus on the first input element when the component loads
  setTimeout(() => {
    // Find first editable empty input (not a correct letter)
    let firstEditableEmptyIndex = -1;
    for (let i = 0; i < 5; i++) {
      if (currentGuess.value[i] === "" && correctSpots.value[i] === "") {
        firstEditableEmptyIndex = i;
        break;
      }
    }

    if (
      firstEditableEmptyIndex !== -1 &&
      inputRefs.value[firstEditableEmptyIndex]
    ) {
      inputRefs.value[firstEditableEmptyIndex].focus();
    } else if (inputRefs.value[0]) {
      inputRefs.value[0].focus();
    }
  }, 100);
});
</script>

<template>
  <div class="wordle">
    <div class="explanation-section">
      <h2>Wordle Assistant</h2>
      <p>
        This tool helps you solve Wordle puzzles by tracking clues and making
        deductions. Enter your guesses and mark letters as "correct" (right
        letter, right spot) or "close" (right letter, wrong spot) by clicking
        the respective buttons, then clicking on letters in your guesses at the
        bottom. The tool will show possible letters for each position, track
        letter status, and automatically deduce where letters must go.
      </p>
    </div>
    <Notification
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
      :status="notification.show"
      @close="notification.show = false"
    />
    <div class="wordle-container">
      <div class="guess-row current">
        <template v-for="(letter, index) in 5" :key="`current-${index}`">
          <div class="input-container">
            <!-- Possible letters at the top -->
            <div
              v-if="!currentGuess[index] && correctSpots[index] === ''"
              class="input-hints top-hints"
            >
              <span
                v-for="possibleLetter in getPossibleLettersForSlot(index)"
                :key="`hint-${possibleLetter}-${index}`"
                class="input-hint-letter"
                >{{ possibleLetter }}</span
              >
            </div>
            <input
              type="text"
              maxlength="1"
              class="letter-input"
              v-model="currentGuess[index]"
              @input="handleInput($event, index)"
              @keydown="handleKeyDown($event, index)"
              :disabled="correctMode || closeMode"
              :readonly="correctSpots[index] !== ''"
              :class="{
                disabled: correctMode || closeMode,
                readonly: correctSpots[index] !== '',
                'has-top-hints':
                  getPossibleLettersForSlot(index).length > 0 &&
                  !currentGuess[index] &&
                  correctSpots[index] === '',
                'has-bottom-hints':
                  getForbiddenLettersForSlot(index).length > 0 &&
                  correctSpots[index] === '',
              }"
              :ref="
                (el) => {
                  if (el) inputRefs[index] = el;
                }
              "
              :data-index="index"
            />
            <!-- Forbidden letters at the bottom -->
            <div
              v-if="
                correctSpots[index] === '' &&
                getForbiddenLettersForSlot(index).length > 0
              "
              class="input-hints bottom-hints"
            >
              <span
                v-for="forbiddenLetter in getForbiddenLettersForSlot(index)"
                :key="`forbidden-${forbiddenLetter}-${index}`"
                class="input-hint-letter forbidden"
                >{{ forbiddenLetter }}</span
              >
            </div>
          </div>
        </template>
      </div>
      <div class="flex w-100 justify-center">
        <button
          class="button submit"
          @click="submitGuess"
          :disabled="correctMode || closeMode"
          :class="{ disabled: correctMode || closeMode }"
        >
          Submit
        </button>
      </div>

      <!-- Letter hints section -->
      <div v-if="false && guesses.length" class="letter-hints">
        <h3 class="text-lg font-bold mb-2">Position Hints</h3>
        <div class="hints-container">
          <div v-for="(position, index) in 5" :key="index" class="hint-column">
            <div class="hint-header">Pos. {{ index + 1 }}</div>
            <div class="hint-content">
              <!-- If we have a correct letter for this position -->
              <div v-if="correctSpots[index] !== ''" class="correct-hint">
                {{ correctSpots[index] }}
              </div>
              <!-- Otherwise show possible letters based on clues -->
              <template v-else>
                <div class="position-hints">
                  <!-- Letters that can't be in this position (marked as close here) -->
                  <div
                    v-if="closeSpots[index] && closeSpots[index].length > 0"
                    class="not-here-section"
                  >
                    <div class="section-label">Is not:</div>
                    <div class="letter-grid">
                      <span
                        v-for="letter in closeSpots[index]"
                        :key="`not-here-${letter}`"
                        class="letter-hint not-here-hint"
                      >
                        {{ letter }}
                      </span>
                    </div>
                  </div>

                  <!-- Letters from other positions marked as close (could go here) -->
                  <div
                    class="possible-section"
                    v-if="getPossibleLettersForPosition(index).length > 0"
                  >
                    <div class="section-label">Could be:</div>
                    <div class="letter-grid">
                      <span
                        v-for="letter in getPossibleLettersForPosition(index)"
                        :key="`possible-${letter}`"
                        class="letter-hint possible-hint"
                      >
                        {{ letter }}
                      </span>
                    </div>
                  </div>

                  <!-- If no constraints or possible letters -->
                  <div
                    v-if="
                      (!closeSpots[index] || closeSpots[index].length === 0) &&
                      getPossibleLettersForPosition(index).length === 0
                    "
                    class="empty-hint"
                  >
                    No constraints yet
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Keyboard display for letter status - always visible when guesses exist -->
      <div v-if="guesses.length" class="keyboard-display">
        <h3 class="text-lg font-bold mb-2">Letter Status</h3>
        <div class="keyboard-row">
          <div
            v-for="letter in 'QWERTYUIOP'.split('')"
            :key="`key-${letter}`"
            class="key-button"
            :class="{
              'correct-key': getLetterStatus()[letter] === 'correct',
              'close-key': getLetterStatus()[letter] === 'close',
              'used-key': getLetterStatus()[letter] === 'used',
            }"
          >
            {{ letter }}
          </div>
        </div>
        <div class="keyboard-row">
          <div class="key-spacer half"></div>
          <div
            v-for="letter in 'ASDFGHJKL'.split('')"
            :key="`key-${letter}`"
            class="key-button"
            :class="{
              'correct-key': getLetterStatus()[letter] === 'correct',
              'close-key': getLetterStatus()[letter] === 'close',
              'used-key': getLetterStatus()[letter] === 'used',
            }"
          >
            {{ letter }}
          </div>
          <div class="key-spacer half"></div>
        </div>
        <div class="keyboard-row">
          <div class="key-spacer full"></div>
          <div
            v-for="letter in 'ZXCVBNM'.split('')"
            :key="`key-${letter}`"
            class="key-button"
            :class="{
              'correct-key': getLetterStatus()[letter] === 'correct',
              'close-key': getLetterStatus()[letter] === 'close',
              'used-key': getLetterStatus()[letter] === 'used',
            }"
          >
            {{ letter }}
          </div>
          <div class="key-spacer full"></div>
        </div>

        <!-- Keyboard legends -->
        <div class="keyboard-legend">
          <div class="legend-item">
            <div class="legend-color correct-key"></div>
            <span>Correct position</span>
          </div>
          <div class="legend-item">
            <div class="legend-color close-key"></div>
            <span>In word, wrong position</span>
          </div>
          <div class="legend-item">
            <div class="legend-color used-key"></div>
            <span>Not in word</span>
          </div>
        </div>
      </div>

      <!-- Previous guesses would be shown here -->
      <div class="flex justify-center mt-3">
        <h3 class="text-lg font-bold">Previous Guesses</h3>
      </div>
      <div class="controls flex flex-col gap-2 mb-2" v-if="guesses.length">
        <div class="click-choice flex justify-around">
          <button
            @click="
              correctMode = !correctMode;
              closeMode = false;
            "
            class="button correct-button"
            :class="{ active: correctMode }"
          >
            {{ correctMode ? "Done" : "Mark Correct Letters" }}
          </button>
          <button
            @click="
              closeMode = !closeMode;
              correctMode = false;
            "
            class="button close-button"
            :class="{ active: closeMode }"
          >
            {{ closeMode ? "Done" : "Mark Close Letters" }}
          </button>
        </div>
      </div>
      <div
        v-for="(guess, idx) in guesses"
        :key="`guess-${idx}`"
        class="guess-row previous"
        :class="{
          marking: correctMode || closeMode,
          'correct-mode': correctMode,
          'close-mode': closeMode,
        }"
      >
        <div
          v-for="(letter, letterIdx) in guess"
          :key="`letter-${idx}-${letterIdx}`"
          class="letter-display"
          :class="{
            correct: isCorrect(letterIdx, letter),
            close: isClose(letterIdx, letter),
          }"
          @click.prevent="markLetter(letterIdx, letter)"
        >
          {{ letter }}
        </div>
        <!-- <div class="button remove" @click="removeGuess(idx)">
          <TrashIcon />
        </div> -->
        <div class="button remove"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wordle {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .explanation-section {
    max-width: 800px;
    margin-bottom: 25px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;

    h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
      color: #333;
      text-align: center;
    }

    p {
      font-size: 1rem;
      line-height: 1.5;
      color: #555;
      text-align: center;
    }
  }

  .wordle-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 20px;
  }

  .button {
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 16px;
  }

  .correct-button,
  .close-button,
  .hints-button {
    padding: 5px 10px;
  }

  .correct-button {
    background-color: #6bc75e;
    border-color: #348d29;
    color: white;

    &:hover {
      background-color: darken(#6bc75e, 10%);
    }

    &.active {
      background-color: #6bc75e;
      color: white;
      font-weight: bold;
    }
  }

  .close-button {
    background-color: #f0c000;
    border-color: #b38f00;
    color: white;

    &:hover {
      background-color: darken(#f0c000, 5%);
    }

    &.active {
      background-color: #f0c000;
      color: white;
      font-weight: bold;
    }
  }

  .hints-button {
    background-color: #4a90e2;
    border-color: #2563eb;
    color: white;
    width: 100%;

    &:hover {
      background-color: darken(#4a90e2, 5%);
    }

    &.active {
      background-color: #2563eb;
      color: white;
      font-weight: bold;
    }
  }

  .guess-row {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .submit {
    padding: 5px 10px;
    width: fit-content;
    margin-top: 5px;

    &:not(.disabled) {
      background-color: rgba(0, 123, 255, 0.1);

      &:hover {
        background-color: rgba(0, 123, 255, 0.2);
      }
    }

    &.disabled,
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #f1f1f1;
      color: #a0a0a0;
    }
  }

  .input-container {
    position: relative;
    width: 50px;
    height: 50px;
  }

  .input-hints {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 3px;
    z-index: 1;
    padding: 0 3px;

    &.top-hints {
      top: 2px;
    }

    &.bottom-hints {
      bottom: 2px;
    }
  }

  .input-hint-letter {
    font-size: 9px;
    opacity: 0.9;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 2px;
    padding: 1px 2px;
    line-height: 1;
    color: #4a90e2;
    background-color: rgba(74, 144, 226, 0.1);

    &.forbidden {
      color: #ea4335;
      background-color: rgba(234, 67, 53, 0.1);
      text-decoration: line-through;
      border: 1px solid rgba(234, 67, 53, 0.3);
    }
  }

  .letter-input {
    width: 50px;
    height: 50px;
    text-align: center;
    font-size: 24px;
    text-transform: uppercase;
    border: 2px solid #d3d6da;
    border-radius: 4px;
    outline: none;
    font-weight: bold;
    position: relative;

    &.has-top-hints {
      padding-top: 14px;
    }

    &.has-bottom-hints {
      padding-bottom: 14px;
    }

    &.has-top-hints.has-bottom-hints {
      padding-top: 14px;
      padding-bottom: 14px;
    }

    &:focus {
      border-color: #878a8c;
      box-shadow: 0 0 0 2px rgba(135, 138, 140, 0.3);
    }

    &.disabled,
    &:disabled {
      background-color: #f1f1f1;
      color: #a0a0a0;
      cursor: not-allowed;
      border-color: #e0e0e0;
    }

    &[readonly] {
      background-color: #b2faa3;
      border-color: #6bc75e;
      color: #348d29;
      font-weight: bold;
    }
  }
  .letter-display {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
    border: 2px solid #d3d6da;
    border-radius: 4px;

    // Marking mode styles
    .marking & {
      cursor: pointer;
      transition: all 0.1s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      }
    }

    .marking.correct-mode & {
      &:hover {
        border-color: #6bc75e;
        background-color: rgba(107, 199, 94, 0.1);
      }
    }

    .marking.close-mode & {
      &:hover {
        border-color: #f0c000;
        background-color: rgba(240, 192, 0, 0.1);
      }
    }

    // Marked states
    &.correct {
      background-color: #6bc75e;
      border-color: #348d29;
      color: white;
    }

    &.close {
      background-color: #f0c000;
      border-color: #b38f00;
      color: white;
    }
  }

  .letter-hints {
    width: 100%;

    h3 {
      text-align: center;
      color: #333;
    }

    .hints-container {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      gap: 10px;
      margin-top: 10px;
    }

    .hint-column {
      flex: 1;
      max-width: 120px;

      .hint-header {
        font-weight: bold;
        text-align: center;
        background-color: #f1f1f1;
        padding: 5px;
        border-radius: 4px 4px 0 0;
        border: 1px solid #d3d6da;
        border-bottom: none;
      }

      .hint-content {
        padding: 10px;
        border: 1px solid #d3d6da;
        border-radius: 0 0 4px 4px;
        background-color: #f9f9f9;
        min-height: 90px;

        .correct-hint {
          font-size: 24px;
          color: #348d29;
          text-align: center;
          padding: 10px 0;
          border-bottom: 1px solid #d3d6da;
          margin-bottom: 5px;
          font-weight: bold;
          background-color: rgba(107, 199, 94, 0.1);
          border-radius: 4px;
        }

        .position-hints {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .section-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
            text-align: center;
            font-weight: bold;
          }

          .letter-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            justify-content: center;
          }

          .letter-hint {
            font-size: 12px;
            padding: 4px;
            border-radius: 4px;
            font-weight: bold;
            cursor: default;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .not-here-hint {
            text-decoration: line-through;
            color: #ea4335;
            background-color: rgba(234, 67, 53, 0.1);
            border: 1px solid #ea4335;
          }

          .empty-hint {
            color: #878a8c;
            font-style: italic;
            font-size: 12px;
            text-align: center;
            padding: 10px;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .hints-container {
        flex-direction: column;
        align-items: center;

        .hint-column {
          width: 100%;
          max-width: 100%;
          margin-bottom: 10px;

          .hint-content {
            min-height: auto;
          }
        }
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .hints-container {
        flex-wrap: wrap;

        .hint-column {
          min-width: 100px;
          margin-bottom: 10px;
        }
      }
    }
  }

  .no-viable-letters {
    font-size: 12px;
    color: #ea4335;
    text-align: center;
    padding: 5px;
    font-style: italic;
  }

  .keyboard-display {
    margin-top: 20px;
    width: 100%;

    h3 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }

    .keyboard-row {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;

      .key-button {
        width: 35px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 2px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 4px;
        cursor: default;
        background-color: #d3d6da;
        color: #1a1a1b;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        user-select: none;

        &.correct-key {
          background-color: #6bc75e;
          border-color: #348d29;
          color: white;
        }

        &.close-key {
          background-color: #f0c000;
          border-color: #b38f00;
          color: white;
        }

        &.used-key {
          background-color: #787c7e;
          color: white;
        }
      }

      .key-spacer {
        &.half {
          width: 18px;
        }

        &.full {
          width: 35px;
        }
      }
    }

    .keyboard-legend {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 8px;
      flex-wrap: wrap;

      .legend-item {
        display: flex;
        align-items: center;
        margin: 0 5px;

        .legend-color {
          width: 15px;
          height: 15px;
          border-radius: 3px;
          margin-right: 5px;

          &.correct-key {
            background-color: #6bc75e;
          }

          &.close-key {
            background-color: #f0c000;
          }

          &.used-key {
            background-color: #787c7e;
          }
        }

        span {
          font-size: 12px;
          color: #666;
        }
      }
    }

    @media (max-width: 480px) {
      .keyboard-row {
        .key-button {
          width: 28px;
          height: 40px;
          font-size: 14px;
          margin: 0 1px;
        }

        .key-spacer {
          &.half {
            width: 14px;
          }

          &.full {
            width: 28px;
          }
        }
      }
    }
  }
}
</style>
