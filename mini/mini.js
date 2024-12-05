const gridSize = 5; // 5x5 grid
const crosswordGrid = document.getElementById("board-container");
const clueBox = document.getElementById("clue-box");

const acrossClues = [
    "A delivery that doesn't require a signature",
    "Exclamation let out after a breakthrough with an article",
    "Low energy",
    "Me, or the type of guy a Lady like you would go for",
    "It can be seized, but not held"
];
const downClues = [
    "Playful argument, with -ER",
    '"_____ OUT" (phrase often said when holding the door for a cat)',
    "A commercial featuring Kendrick Lamar, perhaps",
    "A central idea in the writing of Plato or Aristotle",
    "Overplayed Pharrell Williams song"
];

const answerKey = [
    ["B", "I", "R", "T", "H"],
    ["A", "N", "A", "H", "A"],
    ["N", "O", "P", "E", "P"],
    ["T", "R", "A", "M", "P"],
    ["", "", "D", "A", "Y"]
];

let isRowMode = true; // Tracks whether the user is in row or column mode

const cellNumbers = {
    "0-0": 1, "0-1": 2, "0-2": 3, "0-3": 4, "0-4": 5,
    "1-0": 6, "2-0": 7, "3-0": 8, "4-2": 9
};

const disabledCells = [
    { row: 4, col: 0 }, // Row 5, Column 1 (zero-based index)
    { row: 4, col: 1 }  // Row 5, Column 2
];

// Render grid
function renderGrid() {
    crosswordGrid.innerHTML = ""; // Clear grid container before rendering
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;

            const cellKey = `${row}-${col}`;
            if (cellNumbers[cellKey]) {
                const textBox = document.createElement("div");
                textBox.classList.add("cell-textbox");
                textBox.textContent = cellNumbers[cellKey];
                cellElement.appendChild(textBox);
            }

            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");
            cellElement.appendChild(cellContent);

            if (disabledCells.some((cell) => cell.row === row && cell.col === col)) {
                cellElement.classList.add("disabled");
            }

            crosswordGrid.appendChild(cellElement);

            cellElement.addEventListener("click", () => toggleSelectionMode(cellElement));
        }
    }
    crosswordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
}

// Update the clue box with the relevant clue
function updateClueBox(selectedCell) {
    const row = parseInt(selectedCell.dataset.row, 10);
    const col = parseInt(selectedCell.dataset.col, 10);

    let clueNumber = null;

    if (isRowMode) {
        clueNumber = row + 1; // Row index (0-based) corresponds directly to the acrossClues index
        clueBox.textContent = clueNumber
            ? `${acrossClues[clueNumber - 1]}`
            : "No clue available";
    } else {
        const colKey = `0-${col}`;
        clueNumber = cellNumbers[colKey];
        clueBox.textContent = clueNumber
            ? `${downClues[clueNumber - 1]}`
            : "No clue available";
    }
}

// Toggle selection mode (row or column) based on the selected cell
function toggleSelectionMode(cell) {
    const isAlreadySelected = cell.classList.contains("selected");

    // Clear all styles
    document.querySelectorAll(".cell").forEach((cell) => {
        cell.classList.remove("selected", "highlight");
    });

    if (isAlreadySelected) {
        isRowMode = !isRowMode; // Toggle only on user clicks
    }

    cell.classList.add("selected");
    updateClueBox(cell);

    if (isRowMode) {
        highlightRow(cell.dataset.row);
    } else {
        highlightColumn(cell.dataset.col);
    }
}

// Highlight all cells in the given row
function highlightRow(row) {
    document.querySelectorAll(`.cell[data-row='${row}']`).forEach((cell) => {
        if (!cell.classList.contains("selected") && !cell.classList.contains("disabled")) {
            cell.classList.add("highlight");
        }
    });
}

// Highlight all cells in the given column
function highlightColumn(col) {
    document.querySelectorAll(`.cell[data-col='${col}']`).forEach((cell) => {
        if (!cell.classList.contains("selected") && !cell.classList.contains("disabled")) {
            cell.classList.add("highlight");
        }
    });
}

// Keyboard implementation
const keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Del"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

function createKeyboard() {
    const keyboardContainer = document.getElementById('keyboard-container');

    keyboard.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');

        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add(key === "Enter" ? 'enter-key-tile' : 'key-tile');
            keyDiv.textContent = key;

            // Add functionality for the keys
            keyDiv.addEventListener('click', () => handleKeyPress(key));
            rowDiv.appendChild(keyDiv);
        });

        keyboardContainer.appendChild(rowDiv);
    });
}

function handleKeyPress(key) {
    const selectedCell = document.querySelector(".cell.selected");
    if (!selectedCell) return;

        const currentRow = parseInt(selectedCell.dataset.row, 10);
        const currentCol = parseInt(selectedCell.dataset.col, 10);

        let nextRow = currentRow;
        let nextCol = currentCol;

    if (key === "⌫") {
        const cellContent = selectedCell.querySelector(".cell-content");
        if (cellContent.textContent) {
            // Case 1: Clear the current cell if it contains text
            cellContent.textContent = "";
        } else {
            // Case 2: Move to the previous non-disabled cell and clear it
            do {
                if (isRowMode) {
                    if (nextCol > 0) {
                        nextCol--;
                    } else {
                        nextRow = (nextRow - 1 + gridSize) % gridSize;
                        nextCol = gridSize - 1;
                    }
                } else {
                    if (nextRow > 0) {
                        nextRow--;
                    } else {
                        nextCol = (nextCol - 1 + gridSize) % gridSize;
                        nextRow = gridSize - 1;
                    }
                }
            } while (document.querySelector(`.cell[data-row='${nextRow}'][data-col='${nextCol}']`)
                ?.classList.contains("disabled"));

            const prevCell = document.querySelector(
                `.cell[data-row='${nextRow}'][data-col='${nextCol}']`
            );
            if (prevCell) {
                const prevCellContent = prevCell.querySelector(".cell-content");
                prevCellContent.textContent = ""; // Clear the previous cell's content
                toggleSelectionMode(prevCell); // Select the previous cell
            }
        }
    } else if (key === "Del") {
        const cellContent = selectedCell.querySelector(".cell-content");
        if (cellContent) {
            cellContent.textContent = ""; // Clear current cell
        }
    } else if (key === "Enter") {
        if (isRowMode) {
            // Move to the first non-disabled cell in the next row
            nextRow = (currentRow + 1) % gridSize;
            nextCol = 0; // Start from the first column
            while (document.querySelector(`.cell[data-row='${nextRow}'][data-col='${nextCol}']`)
                ?.classList.contains("disabled")) {
                nextCol++;
                if (nextCol >= gridSize) break; // Prevent infinite loop
            }
        } else {
            // Move to the first non-disabled cell in the next column
            nextCol = (currentCol + 1) % gridSize;
            nextRow = 0; // Start from the first row
            while (document.querySelector(`.cell[data-row='${nextRow}'][data-col='${nextCol}']`)
                ?.classList.contains("disabled")) {
                nextRow++;
                if (nextRow >= gridSize) break; // Prevent infinite loop
            }
        }
        // Move selection to the next valid cell
        const nextCell = document.querySelector(
            `.cell[data-row='${nextRow}'][data-col='${nextCol}']`
        );
        if (nextCell && !nextCell.classList.contains("disabled")) {
            toggleSelectionMode(nextCell);
        }
    } else if (key.length === 1 && key.toUpperCase() >= "A" && key.toUpperCase() <= "Z") {
        const cellContent = selectedCell.querySelector(".cell-content");
        cellContent.textContent = key.toUpperCase();
        cellContent.style.color = "black";
        moveToNextNonDisabledCell(selectedCell);
    } else {
        
    }
}

// Initialize the keyboard
createKeyboard();

// Button actions
document.getElementById("check-puzzle-button").addEventListener("click", checkPuzzle);
document.getElementById("clear-puzzle-button").addEventListener("click", clearPuzzle);

function checkPuzzle() {
    document.querySelectorAll(".cell").forEach(cell => {
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);
        const cellContent = cell.querySelector(".cell-content");

        if (!cell.classList.contains("disabled")) {
            if (cellContent.textContent === (answerKey[row][col] || "")) {
                cellContent.style.color = "blue";
            } else if (cellContent.textContent !== "") {
                cellContent.style.color = "red";
            }
        }
    });
}

function clearPuzzle() {
    document.querySelectorAll(".cell").forEach(cell => {
        if (!cell.classList.contains("disabled")) {
            const cellContent = cell.querySelector(".cell-content");
            cellContent.textContent = "";
            cellContent.style.color = "black";
            cellContent.style.textDecoration = "none";
        }
    });
}

// Move to the next non-disabled cell in the current row or column
function moveToNextNonDisabledCell(selectedCell) {
    const currentRow = parseInt(selectedCell.dataset.row, 10);
    const currentCol = parseInt(selectedCell.dataset.col, 10);

    let nextRow = currentRow;
    let nextCol = currentCol;

    do {
        if (isRowMode) {
            nextCol = (nextCol + 1) % gridSize;
            if (nextCol === 0) {
                nextRow = (nextRow + 1) % gridSize; // Wrap to the next row
            }
        } else {
            nextRow = (nextRow + 1) % gridSize;
            if (nextRow === 0) {
                nextCol = (nextCol + 1) % gridSize; // Wrap to the next column
            }
        }
    } while (isCellDisabled(nextRow, nextCol));

    const nextCell = document.querySelector(
        `.cell[data-row='${nextRow}'][data-col='${nextCol}']`
    );
    if (nextCell) {
        toggleSelectionMode(nextCell);
    }
}

// Helper function to check if a cell is disabled
function isCellDisabled(row, col) {
    return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`)
        ?.classList.contains("disabled");
}

// Select a specific cell programmatically
function selectCell(cell) {
    document.querySelectorAll(".cell").forEach((c) => c.classList.remove("selected", "highlight"));
    cell.classList.add("selected");

    if (isRowMode) {
        highlightRow(cell.dataset.row);
    } else {
        highlightColumn(cell.dataset.col);
    }
}

// Initialize crossword
function init() {
    renderGrid();
    clueBox.textContent = "Select a cell to see the clue";
    document.addEventListener("keydown", handleKeyPress); // Add keypress listener
}

init();
