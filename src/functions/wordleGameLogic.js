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
  if (
    e.key === "/" ||
    (e.ctrlKey && /^[fgk]$/.test(e.key)) ||
    (e.metaKey && /^[fgk]$/.test(e.key))
  ) {
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
 * Automatically analyze a new guess against known game state
 * This ensures that letters in new guesses are automatically marked with their known states
 */
export function analyzeGuessAgainstKnownState(
  guess,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  const newCorrectSpots = [...correctSpots];
  const newCloseSpots = closeSpots.map((spot) => [...spot]);
  const newIncorrectLetters = [...incorrectLetters];

  guess.forEach((letter, index) => {
    if (!letter) return;

    const upperLetter = letter.toUpperCase();
    const lowerLetter = letter.toLowerCase();

    // Check if this letter is already known to be correct at this position
    if (
      correctSpots[index] &&
      correctSpots[index].toUpperCase() === upperLetter
    ) {
      // Already correct, keep it correct
      newCorrectSpots[index] = upperLetter;
      return;
    }

    // Check if this letter is known to be correct somewhere else
    const correctPosition = correctSpots.findIndex(
      (spot, pos) => spot && spot.toUpperCase() === upperLetter && pos !== index
    );

    if (correctPosition !== -1) {
      // This letter is correct somewhere else, so it's close here
      if (!newCloseSpots[index]) {
        newCloseSpots[index] = [];
      }
      if (!newCloseSpots[index].includes(upperLetter)) {
        newCloseSpots[index].push(upperLetter);
      }
      return;
    }

    // Check if this letter is already known to be close
    const isKnownClose = closeSpots.some(
      (spot) =>
        spot &&
        spot.some((closeLetter) => closeLetter.toUpperCase() === upperLetter)
    );

    if (isKnownClose) {
      // Known to be close, apply close status
      if (!newCloseSpots[index]) {
        newCloseSpots[index] = [];
      }
      if (!newCloseSpots[index].includes(upperLetter)) {
        newCloseSpots[index].push(upperLetter);
      }
      return;
    }

    // Check if this letter is known to be incorrect
    if (
      incorrectLetters.includes(lowerLetter) ||
      incorrectLetters.includes(upperLetter)
    ) {
      // Known to be incorrect, keep it in incorrect list
      if (
        !newIncorrectLetters.includes(lowerLetter) &&
        !newIncorrectLetters.includes(upperLetter)
      ) {
        newIncorrectLetters.push(upperLetter);
      }
      return;
    }

    // Letter is unknown - let user decide through cycling
  });

  return {
    correctSpots: newCorrectSpots,
    closeSpots: newCloseSpots,
    incorrectLetters: newIncorrectLetters,
  };
}

/**
 * Cycle letter state with proper position-specific logic
 * Cycles through: Wrong -> Close -> Correct -> Wrong
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

  // Determine current state for this specific position (handle case sensitivity)
  const upperLetter = letter.toUpperCase();
  const isCorrect =
    correctSpots[letterIdx] === letter ||
    correctSpots[letterIdx] === upperLetter;
  const isClose =
    closeSpots[letterIdx] &&
    (closeSpots[letterIdx].includes(letter) ||
      closeSpots[letterIdx].includes(upperLetter));
  const isWrong =
    incorrectLetters.includes(letter) || incorrectLetters.includes(upperLetter);

  if (isCorrect) {
    // Correct -> Wrong (only mark as wrong if not correct anywhere else)
    newCorrectSpots[letterIdx] = "";

    // Only add to incorrect if this letter is not correct in any other position
    const isCorrectElsewhere = correctSpots.some(
      (spot, idx) =>
        idx !== letterIdx && (spot === letter || spot === upperLetter)
    );

    if (!isCorrectElsewhere && !newIncorrectLetters.includes(upperLetter)) {
      newIncorrectLetters.push(upperLetter);
    }
  } else if (isClose) {
    // Close -> Correct
    newCloseSpots[letterIdx] = newCloseSpots[letterIdx].filter(
      (l) => l !== letter && l !== upperLetter
    );
    newCorrectSpots[letterIdx] = upperLetter;

    // Remove from incorrect if present (letter is confirmed to be in the word)
    let incorrectIndex = newIncorrectLetters.indexOf(letter);
    if (incorrectIndex > -1) {
      newIncorrectLetters.splice(incorrectIndex, 1);
    }
    incorrectIndex = newIncorrectLetters.indexOf(upperLetter);
    if (incorrectIndex > -1) {
      newIncorrectLetters.splice(incorrectIndex, 1);
    }
  } else if (isWrong) {
    // Wrong -> Close
    let incorrectIndex = newIncorrectLetters.indexOf(letter);
    if (incorrectIndex > -1) {
      newIncorrectLetters.splice(incorrectIndex, 1);
    }
    incorrectIndex = newIncorrectLetters.indexOf(upperLetter);
    if (incorrectIndex > -1) {
      newIncorrectLetters.splice(incorrectIndex, 1);
    }

    if (!newCloseSpots[letterIdx]) {
      newCloseSpots[letterIdx] = [];
    }
    if (!newCloseSpots[letterIdx].includes(upperLetter)) {
      newCloseSpots[letterIdx].push(upperLetter);
    }
  } else {
    // Default state -> Wrong (start with wrong)
    if (!newIncorrectLetters.includes(upperLetter)) {
      newIncorrectLetters.push(upperLetter);
    }
  }

  return {
    correctSpots: newCorrectSpots,
    closeSpots: newCloseSpots,
    incorrectLetters: newIncorrectLetters,
  };
}

/**
 * Enhanced cycle letter with better state management (no auto-fill to preserve user choice)
 */
export function cycleLetterWithPropagation(
  letterIdx,
  letter,
  correctSpots,
  closeSpots,
  incorrectLetters,
  currentGuess,
  guesses
) {
  // Just do the basic cycling - let users make their own strategic choices
  return cycleLetter(
    letterIdx,
    letter,
    correctSpots,
    closeSpots,
    incorrectLetters
  );
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
  // Reset closeSpots to array of empty arrays
  for (let i = 0; i < closeSpots.length; i++) {
    closeSpots[i] = [];
  }
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
 * Auto-fill current guess with known correct letters
 */
export function autoFillCorrectLetters(currentGuess, correctSpots) {
  for (let i = 0; i < correctSpots.length; i++) {
    if (correctSpots[i] && correctSpots[i] !== "") {
      currentGuess[i] = correctSpots[i].toUpperCase();
    }
  }
}

/**
 * Update incorrect letters based on current game state
 * Sets default state for new letters and cleans up incorrect letters that are now known to be correct or close
 */
export function updateIncorrectLetters(
  guesses,
  correctSpots,
  closeSpots,
  incorrectLetters
) {
  const newIncorrectLetters = [...incorrectLetters];

  // Process all letters in all guesses
  guesses.forEach((guess) => {
    guess.forEach((letter, index) => {
      if (!letter) return;

      const upperLetter = letter.toUpperCase();

      // Check if this letter is marked as correct at this position
      const isCorrectHere = correctSpots[index] === upperLetter;

      // Check if this letter is marked as close at this position
      const isCloseHere =
        closeSpots[index] && closeSpots[index].includes(upperLetter);

      // Check if this letter is marked as correct anywhere
      const isCorrectAnywhere = correctSpots.some(
        (spot) => spot === upperLetter
      );

      // Check if this letter is marked as close anywhere
      const isCloseAnywhere = closeSpots.some(
        (spots) => spots && spots.includes(upperLetter)
      );

      if (isCorrectHere || isCloseHere) {
        // Letter has a known state at this position, remove from incorrect if present
        const incorrectIndex = newIncorrectLetters.indexOf(upperLetter);
        if (incorrectIndex > -1) {
          newIncorrectLetters.splice(incorrectIndex, 1);
        }
      } else if (!isCorrectAnywhere && !isCloseAnywhere) {
        // Letter is not marked as correct or close anywhere, default to incorrect
        if (!newIncorrectLetters.includes(upperLetter)) {
          newIncorrectLetters.push(upperLetter);
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
