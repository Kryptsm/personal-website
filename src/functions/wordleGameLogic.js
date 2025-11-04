/**
 * Wordle Game Logic - Centralized game state management
 */

import * as GameUtils from "./wordleGameUtils.js";

/**
 * Handle input changes for the current guess
 */
export function handleInputChange(
  e,
  index,
  currentGuess,
  inputRefs,
  findNextAvailableIndex,
  hasWon,
  correctSpots
) {
  // Prevent input if the user has won
  if (hasWon) {
    e.target.value = correctSpots[index];
    return;
  }

  const value = e.target.value.toUpperCase();

  if (value.length === 0) {
    currentGuess[index] = "";
    return;
  }

  const newChar = value[value.length - 1];

  if (/^[A-Z]$/.test(newChar)) {
    currentGuess[index] = newChar;
    e.target.value = newChar;

    if (index < 4) {
      const nextIndex = findNextAvailableIndex(index);
      if (nextIndex !== -1 && inputRefs[nextIndex]) {
        setTimeout(() => inputRefs[nextIndex]?.focus(), 10);
      }
    }
  } else {
    currentGuess[index] = "";
    e.target.value = "";
  }
}

/**
 * Handle keydown events
 */
export function handleKeyDown(
  e,
  index,
  currentGuess,
  inputRefs,
  findNextAvailableIndex,
  hasWon,
  submitCallback,
  words
) {
  // Prevent keyboard input if the user has won
  if (hasWon) {
    e.preventDefault();
    return;
  }

  // Prevent default for certain keys
  if (e.key === "/" || (e.ctrlKey && /^[fgk]$/.test(e.key)) || (e.metaKey && /^[fgk]$/.test(e.key))) {
    e.preventDefault();
    return;
  }

  // Handle Enter key for submission
  if (e.key === "Enter") {
    e.preventDefault();
    if (canSubmitGuess(currentGuess, words) && submitCallback) {
      submitCallback();
    }
    return;
  }

  // Handle letter input
  if (/^[A-Za-z]$/.test(e.key)) {
    const letter = e.key.toUpperCase();
    currentGuess[index] = letter;

    if (index < 4) {
      const nextIndex = findNextAvailableIndex(index);
      if (nextIndex !== -1 && inputRefs[nextIndex]) {
        setTimeout(() => inputRefs[nextIndex]?.focus(), 1);
      }
    }
    return;
  }

  // Handle backspace
  if (e.key === "Backspace") {
    e.preventDefault();
    if (currentGuess[index] !== "") {
      e.target.value = "";
      currentGuess[index] = "";
    } else {
      // Move to previous input and clear it
      if (index > 0) {
        currentGuess[index - 1] = "";
        if (inputRefs[index - 1]) {
          setTimeout(() => {
            inputRefs[index - 1].focus();
            inputRefs[index - 1].value = "";
          }, 1);
        }
      }
    }
  }
}

/**
 * Check if current guess is complete and valid
 */
export function canSubmitGuess(currentGuess, words) {
  const isComplete = currentGuess.every((letter) => letter !== "");
  if (!isComplete) return false;

  const word = currentGuess.join("").toLowerCase();
  return words.includes(word);
}

/**
 * Submit the current guess
 */
export function submitGuess(
  currentGuess,
  guesses,
  guessIndex,
  words,
  updateGameState,
  getSuggestions
) {
  const word = currentGuess.join("").toLowerCase();

  if (!words.includes(word)) {
    // Silently reject invalid words - user can see it's not being accepted
    return false;
  }

  if (GameUtils.isDuplicateGuess(guesses, currentGuess)) {
    // Silently reject duplicate guesses - user will see it's already in their guess history
    return false;
  }

  // Add guess to history
  guesses.unshift([...currentGuess]);
  guessIndex++;

  // Update game state and trigger suggestions
  updateGameState();
  setTimeout(getSuggestions, 0);

  // Clear current guess
  currentGuess.fill("");

  return true;
}

/**
 * Cycle letter state (wrong -> close -> correct)
 */
export function cycleLetter(
  letterIdx,
  letter,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  const newCorrectSpots = [...correctSpots];
  const newCloseSpots = [...closeSpots];
  const newIncorrectLetters = [...incorrectLetters];

  // Current state
  const isCorrect = correctSpots[letterIdx] === letter;
  const isClose =
    closeSpots[letterIdx] && closeSpots[letterIdx].includes(letter);
  const isWrong = incorrectLetters.includes(letter);

  if (isCorrect) {
    // Correct -> Wrong
    newCorrectSpots[letterIdx] = "";
    if (!newIncorrectLetters.includes(letter)) {
      newIncorrectLetters.push(letter);
    }
  } else if (isClose) {
    // Close -> Correct
    newCloseSpots[letterIdx] = newCloseSpots[letterIdx].filter(
      (l) => l !== letter
    );
    newCorrectSpots[letterIdx] = letter;

    // Remove from incorrect if present
    const incorrectIndex = newIncorrectLetters.indexOf(letter);
    if (incorrectIndex > -1) {
      newIncorrectLetters.splice(incorrectIndex, 1);
    }
  } else {
    // Wrong -> Close
    if (!newCloseSpots[letterIdx]) {
      newCloseSpots[letterIdx] = [];
    }
    newCloseSpots[letterIdx].push(letter);

    // Remove from incorrect
    const incorrectIndex = newIncorrectLetters.indexOf(letter);
    if (incorrectIndex > -1) {
      newIncorrectLetters.splice(incorrectIndex, 1);
    }
  }

  return {
    correctSpots: newCorrectSpots,
    closeSpots: newCloseSpots,
    incorrectLetters: newIncorrectLetters,
  };
}

/**
 * Reset game to initial state
 */
export function resetGame(
  currentGuess,
  guesses,
  guessIndex,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  currentGuess.fill("");
  guesses.splice(0);
  guessIndex = 0;
  correctSpots.fill("");
  closeSpots.fill().map(() => []);
  incorrectLetters.splice(0);
}

/**
 * Fill current guess with selected word
 */
export function fillCurrentGuess(selectedWord, currentGuess) {
  const wordLetters = selectedWord.toLowerCase().split("");

  // Clear current guess first
  currentGuess.fill("");

  // Fill in the selected word letters
  for (let i = 0; i < 5 && i < wordLetters.length; i++) {
    currentGuess[i] = wordLetters[i];
  }
}

/**
 * Update incorrect letters based on current game state
 */
export function updateIncorrectLetters(
  guesses,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  const newIncorrectLetters = [];

  guesses.forEach((guess) => {
    guess.forEach((letter, index) => {
      if (
        letter &&
        correctSpots[index] !== letter &&
        !(closeSpots[index] && closeSpots[index].includes(letter))
      ) {
        if (!newIncorrectLetters.includes(letter)) {
          newIncorrectLetters.push(letter);
        }
      }
    });
  });

  incorrectLetters.splice(0, incorrectLetters.length, ...newIncorrectLetters);
}

/**
 * Check win condition
 */
export function checkWinCondition(correctSpots) {
  return correctSpots.every((spot) => spot !== "");
}

/**
 * Get winning word
 */
export function getWinningWord(correctSpots) {
  return correctSpots.join("").toUpperCase();
}

/**
 * Navigation helpers
 */
export function findNextAvailableIndex(currentIndex) {
  return currentIndex < 4 ? currentIndex + 1 : -1;
}

export function findPrevAvailableIndex(currentIndex) {
  return currentIndex > 0 ? currentIndex - 1 : -1;
}

/**
 * Focus management
 */
export function focusPrevInput(index, inputRefs, findPrevAvailableIndex) {
  const prevIndex = findPrevAvailableIndex(index);
  if (prevIndex !== -1 && inputRefs[prevIndex]) {
    requestAnimationFrame(() => {
      inputRefs[prevIndex].focus();
      inputRefs[prevIndex].select();
    });
  }
}

export function handleCellClick(index, inputRefs) {
  if (inputRefs[index]) {
    inputRefs[index].focus();
  }
}
