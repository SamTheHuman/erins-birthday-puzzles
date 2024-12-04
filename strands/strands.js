document.addEventListener("DOMContentLoaded", () => {
  // Updated word list and spanagram
  const wordList = ["OYSTEROYSTER", "VILLAYARA", "LAPIS", "MITA", "ELLE", "RASA"];
  const spanagram = "RESTAURANT"; // Spanagram word
  let foundWordsCount = 0;
  const totalWordsCount = wordList.length + 1; // Total includes the spanagram
  let gameOver = false; // Flag to prevent further play after all words are found

  // Updated board letters
  const boardLetters = [
    ["P", "R", "O", "Y", "S", "R"],
    ["I", "A", "E", "T", "A", "S"],
    ["S", "I", "L", "S", "E", "A"],
    ["V", "L", "T", "R", "O", "Y"],
    ["Y", "L", "A", "M", "T", "S"],
    ["A", "A", "R", "U", "I", "E"],
    ["R", "T", "A", "E", "T", "R"],
    ["A", "N", "E", "L", "L", "A"]
  ];

  const board = document.getElementById("board");
  const lineLayer = document.createElement("div");
  lineLayer.classList.add("line-layer");
  board.appendChild(lineLayer);

  const counterDisplay = document.getElementById("counter");
  const selectedWordDisplay = document.getElementById("selected-word");
  const message = document.getElementById("message");
  const themeContent = document.querySelector(".theme-content");

  // Update theme content text
  themeContent.textContent = "A must for any date with Erin";

  let selectedCells = [];
  let selectedWord = "";
  const lineMap = new Map(); // Store lines between selected cells
  const foundCells = new Set(); // Track cells that are part of found words
  const foundLines = new Set(); // Track lines for found words

  // Initialize counter display
  updateCounter();

  // Create the board
  boardLetters.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;

      const letterSpan = document.createElement("span");
      letterSpan.classList.add("cell-text");
      letterSpan.textContent = letter;
      cell.appendChild(letterSpan);

      cell.addEventListener("click", () => handleIndividualClick(cell));
      board.appendChild(cell);
    });
  });

  // Handle individual tile clicks
  function handleIndividualClick(cell) {
    if (gameOver) {
      return; // Do nothing if the game is over
    }

    if (selectedCells.length > 0 && !isAdjacent(cell)) {
      // If the clicked cell is not adjacent, reset lines and selection
      removeLinesForCurrentSelection();
      resetSelection();
    }

    const cellIndex = selectedCells.indexOf(cell);

    if (cellIndex !== -1) {
      // If the cell is the last-selected cell, submit the word
      if (cellIndex === selectedCells.length - 1) {
        submitWord();
      } else {
        // If the cell is in the middle of the selection, remove all cells after it
        removeCellsAfter(cellIndex);
      }
    } else {
      // Add cell to selection if it's not already selected
      addCellToSelection(cell);
    }
    updateSelectedWordDisplay();
  }

  function isAdjacent(cell) {
    if (selectedCells.length === 0) return true;

    const lastCell = selectedCells[selectedCells.length - 1];
    const lastRow = parseInt(lastCell.dataset.row);
    const lastCol = parseInt(lastCell.dataset.col);
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);

    // Check if the cell is adjacent (horizontally, vertically, or diagonally)
    return (
      Math.abs(lastRow - currentRow) <= 1 && Math.abs(lastCol - currentCol) <= 1
    );
  }

  function addCellToSelection(cell) {
    // Ensure the cell is always styled as selected
    cell.classList.remove("found"); // Remove .found style if applicable
    cell.classList.add("selected"); // Apply .selected style

    if (selectedCells.length > 0) {
      const lastCell = selectedCells[selectedCells.length - 1];
      if (selectedWord.length >= 1) {
        drawLineBetweenCells(lastCell, cell, "#DBD8C5"); // Draw line only if selectedWord length > 1
      }
    }
    selectedCells.push(cell);
    selectedWord += cell.textContent.trim();
    updateSelectedWordDisplay();
  }

  function removeCellsAfter(index) {
    // Remove cells from selection starting from the specified index
    for (let i = selectedCells.length - 1; i > index; i--) {
      const cell = selectedCells[i];
      const prevCell = selectedCells[i - 1];
      cell.classList.remove("selected"); // Reset cell style
      removeLineBetweenCells(prevCell, cell); // Remove line
      selectedCells.pop();
    }

    // Update the selected word to match the modified selectedCells array
    selectedWord = selectedCells.map((c) => c.textContent.trim()).join("");
  }

  function submitWord() {
    if (wordList.includes(selectedWord)) {
      message.textContent = `Found "${selectedWord}"!`;
      message.style.color = "green";
      wordList.splice(wordList.indexOf(selectedWord), 1); // Remove found word from the list
      foundWordsCount++;
      updateCounter();
      markCellsAsFound(); // Change color of selected cells
      updateLineColors("#AEDFEE", true); // Change line colors for found word and mark as permanent
    } else if (selectedWord === spanagram) {
      message.textContent = `Found the Spanagram "${spanagram}"!`;
      message.style.color = "#F8CD05";
      foundWordsCount++;
      updateCounter();
      markCellsAsSpanagram(); // Highlight the spanagram cells
      updateLineColors("#F8CD05", true); // Highlight the spanagram lines
    } else {
      message.textContent = `No match for "${selectedWord}". Try again!`;
      message.style.color = "red";
      revertCellsToDefault(); // Revert cell styles to .cell
      removeLinesForCurrentSelection(); // Remove lines for the current selection
    }

    // Check if the game is over
    if (foundWordsCount === totalWordsCount) {
      message.textContent = "You found all the words!";
      gameOver = true; // Set gameOver flag
    }

    selectedWord = ""; // Reset selectedWord after the word is checked
    resetSelection(); // Reset styles and selection
    updateSelectedWordDisplay();
  }

  function resetSelection() {
    selectedCells.forEach((cell) => {
      if (foundCells.has(cell)) {
        cell.classList.remove("selected");
        cell.classList.add("found"); // Revert found cells to .cell.found
      } else {
        cell.classList.remove("selected");
        cell.classList.add("cell"); // Revert to default .cell style
      }
    });
    selectedCells = [];
    selectedWord = "";
    updateSelectedWordDisplay();
  }

  function markCellsAsFound() {
    selectedCells.forEach((cell) => {
      cell.classList.remove("selected");
      cell.classList.add("found"); // Apply 'found' class with new color
      foundCells.add(cell); // Track as part of a found word
    });
  }

  function markCellsAsSpanagram() {
    selectedCells.forEach((cell) => {
      cell.classList.remove("selected");
      cell.style.backgroundColor = "#F8CD05"; // Highlight the spanagram cells
      foundCells.add(cell); // Track as part of a found word
    });
  }

  function revertCellsToDefault() {
    selectedCells.forEach((cell) => {
      if (!foundCells.has(cell)) {
        cell.classList.remove("selected");
        cell.classList.add("cell"); // Reapply the default .cell class
      }
    });
  }

  function updateSelectedWordDisplay() {
    selectedWordDisplay.textContent = selectedWord; // Display only the selected word
  }

  function updateCounter() {
    counterDisplay.textContent = `Words Found: ${foundWordsCount} / ${totalWordsCount}`;
  }

  function drawLineBetweenCells(fromCell, toCell, color) {
    const fromRect = fromCell.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();

    const fromMidpoint = {
      x: fromRect.left + fromRect.width / 2,
      y: fromRect.top + fromRect.height / 2,
    };

    const toMidpoint = {
      x: toRect.left + toRect.width / 2,
      y: toRect.top + toRect.height / 2,
    };

    const line = document.createElement("div");
    line.classList.add("line");

    const angle = Math.atan2(toMidpoint.y - fromMidpoint.y, toMidpoint.x - fromMidpoint.x);
    const distance = Math.hypot(toMidpoint.x - fromMidpoint.x, toMidpoint.y - fromMidpoint.y);

    line.style.width = `${distance}px`;
    line.style.height = "8px";
    line.style.backgroundColor = color;
    line.style.position = "absolute";
    line.style.top = `${fromMidpoint.y - 4}px`; // Adjust for line height
    line.style.left = `${fromMidpoint.x}px`;
    line.style.transform = `rotate(${angle}rad)`;
    line.style.transformOrigin = "0 50%";

    const key = `${fromCell.dataset.row},${fromCell.dataset.col}-${toCell.dataset.row},${toCell.dataset.col}`;
    lineMap.set(key, line); // Store the line in the map

    lineLayer.appendChild(line);
  }

  function removeLineBetweenCells(fromCell, toCell) {
    const key = `${fromCell.dataset.row},${fromCell.dataset.col}-${toCell.dataset.row},${toCell.dataset.col}`;
    const reverseKey = `${toCell.dataset.row},${toCell.dataset.col}-${fromCell.dataset.row},${fromCell.dataset.col}`;
    const line = lineMap.get(key) || lineMap.get(reverseKey);

    if (line && !foundLines.has(line)) {
      lineLayer.removeChild(line);
      lineMap.delete(key);
      lineMap.delete(reverseKey);
    }
  }

  function removeLinesForCurrentSelection() {
    selectedCells.forEach((_, index) => {
      if (index < selectedCells.length - 1) {
        const fromCell = selectedCells[index];
        const toCell = selectedCells[index + 1];
        removeLineBetweenCells(fromCell, toCell);
      }
    });
  }

  function updateLineColors(color, markAsFound) {
    selectedCells.forEach((_, index) => {
      if (index < selectedCells.length - 1) {
        const fromCell = selectedCells[index];
        const toCell = selectedCells[index + 1];
        const key = `${fromCell.dataset.row},${fromCell.dataset.col}-${toCell.dataset.row},${toCell.dataset.col}`;
        const line = lineMap.get(key);
        if (line) {
          line.style.backgroundColor = color; // Update line color
          if (markAsFound) foundLines.add(line); // Mark line as permanent if word is found
        }
      }
    });
  }
});
