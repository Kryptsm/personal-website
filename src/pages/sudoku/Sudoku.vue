<script setup>
import { ref, onMounted } from "vue";

// Create a 9x9 grid structure to store Sudoku values
const grid = ref([]);
const optionsGrid = ref([]);

// Initialize the grid with empty cells
const initializeGrid = () => {
  const newGrid = [];
  for (let row = 0; row < 9; row++) {
    const currentRow = [];
    for (let col = 0; col < 9; col++) {
      currentRow.push("");
    }
    newGrid.push(currentRow);
  }
  // grid.value = newGrid;

  grid.value = [
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
  ];
};

// Function to handle input in a cell
const handleInput = (e, row, col) => {
  const value = e.target.value;

  // Only allow empty string or numbers 1-9
  if (value === "" || (value >= "1" && value <= "9")) {
    grid.value[row][col] = value;
  } else {
    // Reset to previous valid value
    e.target.value = grid.value[row][col];
  }
};

// Initialize the grid when the component is mounted
onMounted(() => {
  initializeGrid();
});

function calculate() {
  console.log(grid.value);

  let initialValue = grid.value;
  let storedOptions = calculateOptions();
  let initialOptions = storedOptions;

  optionsGrid.value = storedOptions;
  console.log(storedOptions);

  //Checks each square for if a number can only go in a single spot, and fills in that spot with that number if so
  //Iterates over each row of squares (3 total)
  for (let squareRow = 0; squareRow < 3; squareRow++) {
    //Iterates over each column of squares (3 total)
    for (let squareCol = 0; squareCol < 3; squareCol++) {
      //Gets the 3x3 of options for each cell
      const options = getSquare(
        storedOptions,
        (squareRow + 1) * 3 - 1,
        (squareCol + 1) * 3 - 1
      );
      //Gets the 3x3 of values for each cell
      const values = getSquare(
        grid.value,
        (squareRow + 1) * 3 - 1,
        (squareCol + 1) * 3 - 1
      );

      //For each possible number 1-9
      for (let i = 1; i <= 9; i++) {
        let tally = 0;
        //We go over each cell and tally if that number can possibly be in that cell
        options.forEach((row) => {
          row.forEach((column) => {
            if (column && column.includes(i)) tally++;
          });
        });
        //If this specific number can only appear in one specific cell
        if (tally == 1) {
          // Find the cell in the current 3x3 square that can take this value
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              if (options[row][col].includes(i) && values[row][col] === "") {
                // Calculate the actual grid coordinates based on which square we're in
                const actualRow = squareRow * 3 + row;
                const actualCol = squareCol * 3 + col;

                // If we found a cell, set its value in the correct location of the grid
                grid.value[actualRow][actualCol] = i.toString();
                console.log(
                  `Setting cell (${actualRow}, ${actualCol}) to ${i} [Square: (${
                    squareRow + 1
                  }, ${squareCol + 1})]`
                );
                storedOptions = calculateOptions();
              }
            }
          }
        }
      }
    }
  }

  // Check rows for numbers that can only go in one position
  storedOptions.forEach((row, rowIndex) => {
    for (let x = 1; x <= 9; x++) {
      let tally = 0;
      let currentColIndex = 0;
      row.forEach((col, colIndex) => {
        if (col.includes(x)) {
          tally++;
          currentColIndex = colIndex;
        }
      });
      if (tally == 1) {
        grid.value[rowIndex][currentColIndex] = x.toString();
        console.log(
          `Row check: Setting cell (${rowIndex + 1}, ${
            currentColIndex + 1
          }) to ${x}`
        );
        storedOptions = calculateOptions();
      }
    }
  });

  // Check columns for numbers that can only go in one position
  for (let colIndex = 0; colIndex < 9; colIndex++) {
    for (let x = 1; x <= 9; x++) {
      let tally = 0;
      let currentRowIndex = 0;

      // Check each cell in this column
      for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        if (storedOptions[rowIndex][colIndex].includes(x)) {
          tally++;
          currentRowIndex = rowIndex;
        }
      }

      // If this number can only go in one position in this column
      if (tally == 1) {
        grid.value[currentRowIndex][colIndex] = x.toString();
        console.log(
          `Column check: Setting cell (${currentRowIndex + 1}, ${
            colIndex + 1
          }) to ${x}`
        );
        storedOptions = calculateOptions();
      }
    }
  }

  // Marks locations with only one option as that option
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (
        optionsGrid.value[row][col] &&
        optionsGrid.value[row][col].length === 1
      ) {
        grid.value[row][col] = optionsGrid.value[row][col][0].toString();
        console.log(
          `Setting cell (${row + 1}, ${col + 1}) to ${
            optionsGrid.value[row][col][0]
          } due to being only viable option`
        );
      }
    }
  }

  let hasChanges = JSON.stringify(initialValue) !== JSON.stringify(grid.value);
  let hasOptionsChanges =
    JSON.stringify(initialOptions) !== JSON.stringify(storedOptions);

  console.log(
    "Grid Has Changes: ",
    hasChanges,
    "Options Has Changes: ",
    hasOptionsChanges
  );

  if (hasChanges || hasOptionsChanges) {
    calculate();
  }
}

/**
 * Get the 3x3 square from the 9x9 grid that contains the cell at position (x, y)
 * @param {Array} grid - The 9x9 Sudoku grid
 * @param {Number} x - The row index (0-8)
 * @param {Number} y - The column index (0-8)
 * @returns {Array} A 3x3 array representing the square that contains the specified cell
 */
function getSquare(grid, x, y) {
  // Calculate the top-left corner of the 3x3 square that contains (x, y)
  const squareRowStart = Math.floor(x / 3) * 3;
  const squareColStart = Math.floor(y / 3) * 3;

  // Extract the 3x3 square from the grid
  const square = [];
  for (let i = 0; i < 3; i++) {
    square[i] = [];
    for (let j = 0; j < 3; j++) {
      square[i][j] = grid[squareRowStart + i][squareColStart + j];
    }
  }

  return square;
}

/**
 * Flatten a 3x3 square into a 1D array for easier checking
 * @param {Array} square - The 3x3 square to flatten
 * @returns {Array} A 1D array with all values from the square
 */
function flattenSquare(square) {
  return square
    .reduce((flat, row) => flat.concat(row), [])
    .filter((val) => val !== "");
}

//Calculates which number options are viable in every cell of the 9x9 grid
function calculateOptions() {
  const options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let array = [];

  for (let row = 0; row < 9; row++) {
    array[row] = [];
    for (let col = 0; col < 9; col++) {
      let localOptions = [...options];
      const value = grid.value[row][col];

      // Get the current 3x3 square
      const square = getSquare(grid.value, row, col);
      const squareValues = flattenSquare(square);

      // Filter options based on row, column and square constraints
      localOptions = localOptions.filter(
        (num) =>
          !grid.value[row].includes(num.toString()) &&
          !grid.value.map((r) => r[col]).includes(num.toString()) &&
          !squareValues.includes(num.toString()) &&
          !value
      );
      if (localOptions && localOptions.length == 1) {
        grid.value[row][col] = localOptions[0].toString();
        console.log(
          `Setting cell (${row + 1}, ${col + 1}) to ${localOptions[0]}`
        );
        localOptions = [];
        col = -1;
        row = -1;
        break;
      }
      array[row][col] = localOptions;
    }
  }

  // Check rows for Naked Pairs (two cells with the same two number options)
  array.forEach((row, rowIndex) => {
    row.forEach((group) => {
      if (group.length === 2) {
        // Check for Naked Pairs
        const [first, second] = group;
        if (first && second) {
          let nakedCount = 0;
          let nakedIndexes = [];
          row.forEach((group, groupIndex) => {
            if (
              group.length === 2 &&
              group.includes(first) &&
              group.includes(second)
            ) {
              nakedCount++;
              nakedIndexes.push({
                x: Math.ceil((groupIndex + 1) / 3),
                y: Math.ceil((rowIndex + 1) / 3),
              });
            }
          });

          if (nakedCount == 2) {
            if (
              nakedIndexes[0].x == nakedIndexes[1].x &&
              nakedIndexes[0].y == nakedIndexes[1].y
            ) {
              console.log(
                "Same Square Naked Pairs: ",
                first,
                second,
                "At: ",
                nakedIndexes[0].x,
                nakedIndexes[0].y
              );
            }
            row.forEach((group, groupIndex) => {
              if (
                !(
                  group.includes(first) &&
                  group.includes(second) &&
                  group.length == 2
                ) &&
                (group.includes(first) || group.includes(second))
              ) {
                let filter = group.filter(
                  (num) => num !== first && num !== second
                );
                array[rowIndex][groupIndex] = filter;
              }
            });
          }
        }
      }
    });
  });

  for (let x = 0; x < 9; x++) {
    let column = [];
    for (let y = 0; y < 9; y++) {
      column.push(array[y][x]);
    }
    column.forEach((group) => {
      if (group.length === 2) {
        // Check for Naked Pairs
        const [first, second] = group;
        if (first && second) {
          let nakedPairs = column.filter(
            (group) =>
              group.length == 2 &&
              group.includes(first) &&
              group.includes(second)
          );

          if (nakedPairs.length == 2) {
            column.forEach((group, groupIndex) => {
              if (
                !(
                  group.includes(first) &&
                  group.includes(second) &&
                  group.length == 2
                ) &&
                (group.includes(first) || group.includes(second))
              ) {
                let filter = group.filter(
                  (num) => num !== first && num !== second
                );
                array[groupIndex][x] = filter;
              }
            });
          }
        }
      }
    });
  }

  for (let squareRow = 0; squareRow < 3; squareRow++) {
    for (let squareCol = 0; squareCol < 3; squareCol++) {
      // Collect all cell options in this 3x3 square
      let squareCells = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const rowIdx = squareRow * 3 + i;
          const colIdx = squareCol * 3 + j;
          squareCells.push({
            row: rowIdx,
            col: colIdx,
            options: array[rowIdx][colIdx],
          });
        }
      }
      // Find all naked pairs in this square
      let nakedPairs = [];
      for (let i = 0; i < squareCells.length; i++) {
        const cellA = squareCells[i];
        if (cellA.options.length === 2) {
          for (let j = i + 1; j < squareCells.length; j++) {
            const cellB = squareCells[j];
            if (
              cellB.options.length === 2 &&
              cellA.options[0] === cellB.options[0] &&
              cellA.options[1] === cellB.options[1]
            ) {
              nakedPairs.push([cellA, cellB]);
            }
          }
        }
      }
      // For each naked pair, remove those two numbers from other cells in the square
      nakedPairs.forEach(([cellA, cellB]) => {
        const [first, second] = cellA.options;
        squareCells.forEach((cell) => {
          if (
            !(
              (cell.row === cellA.row && cell.col === cellA.col) ||
              (cell.row === cellB.row && cell.col === cellB.col)
            )
          ) {
            if (cell.options.includes(first) || cell.options.includes(second)) {
              array[cell.row][cell.col] = cell.options.filter(
                (num) => num !== first && num !== second
              );
            }
          }
        });
      });
    }
  }

  return array;
}

// Solves the Sudoku puzzle using a depth-first based algorithm. Basically, it checks for empty cells and tries all possible numbers.
// If it runs into an issue with a number, it backtracks and tries alternate approaches.
// Very expensive but it does work.
function solveSudoku() {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid.value[row][col] == "") {
        // Try all possible numbers
        for (let num = 1; num <= 9; num++) {
          grid.value[row][col] = num;
          if (isValid(row, col, num)) {
            if (solveSudoku()) {
              return true;
            }
          }
          grid.value[row][col] = "";
        }
        return false; // No valid number found
      }
    }
  }
  return true; // Solved (No empty spaces left)
}

function isValid(row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (
      (+grid.value[row][i] === num && i != col) ||
      (+grid.value[i][col] === num && i != row)
    ) {
      return false;
    }
  }
  // Check 3x3 square
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (+grid.value[i][j] === num && i != row && j != col) {
        return false;
      }
    }
  }
  return true;
}
</script>

<template>
  <div class="sudoku-container">
    <h1>Sudoku</h1>
    <button class="calculate button" @click="calculate">Calculate</button>
    <button class="calculate button" @click="solveSudoku">
      DFS (Slow, Expensive)
    </button>

    <div class="sudoku-grid">
      <div
        v-for="(row, rowIndex) in grid"
        :key="`row-${rowIndex}`"
        class="sudoku-row"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="sudoku-cell relative"
          :class="{
            'right-border': colIndex === 2 || colIndex === 5,
            'bottom-border': rowIndex === 2 || rowIndex === 5,
          }"
        >
          <input
            type="text"
            maxlength="1"
            v-model="grid[rowIndex][colIndex]"
            @input="handleInput($event, rowIndex, colIndex)"
            class="cell-input z-2"
          />
          <span
            class="one absolute top-0 left-0.5 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(1) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >1</span
          >
          <span
            class="two absolute top-0 left-3.5 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(2) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >2</span
          >
          <span
            class="three absolute top-0 left-7 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(3) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >3</span
          >
          <span
            class="four absolute top-3 left-0.5 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(4) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >4</span
          >
          <span
            class="five absolute top-3 left-3.5 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(5) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >5</span
          >
          <span
            class="six absolute top-3 left-7 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(6) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >6</span
          >
          <span
            class="seven absolute top-6 left-0.5 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(7) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >7</span
          >
          <span
            class="eight absolute top-6 left-3.5 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(8) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >8</span
          >
          <span
            class="nine absolute top-6 left-7 text-[10px] pointer-events-none"
            v-if="
              optionsGrid.length &&
              optionsGrid[rowIndex][colIndex].includes(9) &&
              grid.length &&
              grid[rowIndex][colIndex] == ''
            "
            >9</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sudoku-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

button {
  margin: 10px 0 5px 0;
  padding: 5px 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: #4ea4ff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: darken(#007bff, 10%);
  }
}

button + button {
  margin-bottom: 20px;
}

.sudoku-grid {
  display: flex;
  flex-direction: column;
  border: 2px solid #333;
  width: fit-content;
}

.sudoku-row {
  display: flex;
}

.sudoku-cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;

  &.right-border {
    border-right: 2px solid #333;
  }

  &.bottom-border {
    border-bottom: 2px solid #333;
  }
}

.cell-input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 20px;
  border: none;
  outline: none;
  padding: 0;

  &:focus {
    background-color: #e6f7ff;
  }

  // Hide spinner arrows for number inputs
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    font-size: 8px;
    overflow: visible;
  }
}
</style>
