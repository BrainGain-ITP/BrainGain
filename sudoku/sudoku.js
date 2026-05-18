const sudokuGrid = document.getElementById("sudokuGrid");
const levelButtons = document.querySelectorAll(".level-btn");
const levelInfo = document.getElementById("level-info");
const newGameBtn = document.getElementById("newGameBtn");
const restartBtn = document.getElementById("restartBtn");
const checkBtn = document.getElementById("checkBtn");

const numberButtons = document.querySelectorAll(".number-btn[data-number]");
const clearNumberBtn = document.getElementById("clearNumberBtn");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayBtn = document.getElementById("overlayBtn");
const setupPanel = document.getElementById("setupPanel");
const playPanel = document.getElementById("playPanel");
const startBtn = document.getElementById("startBtn");
const modeLabel = document.getElementById("modeLabel");
let overlayAction = "continue";


const levels = {
  easy: {
    clues: 44,
    text: "Easy mode gives you more starting numbers."
  },
  medium: {
    clues: 34,
    text: "Medium mode gives you a balanced challenge."
  },
  hard: {
    clues: 26,
    text: "Hard mode gives you fewer starting numbers."
  }
};

function showSetup() {
  setupPanel.classList.remove("hidden");
  playPanel.classList.add("hidden");
}

function showGame() {
  setupPanel.classList.add("hidden");
  playPanel.classList.remove("hidden");

  modeLabel.textContent =
    `${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} mode`;
}

let boards = [];
let currentLevel = "easy";
let currentSolution = "";
let currentPuzzle = "";
let selectedCell = null;

async function loadBoards() {
  try {
    const response = await fetch("sudoku.json");
    boards = await response.json();
    showSetup();
  } catch (error) {
    sudokuGrid.innerHTML = "<p style='color:white;'>Could not load Sudoku boards.</p>";
    console.error("Error loading sudoku.json:", error);
  }
}

function getRandomBoard() {
  return boards[Math.floor(Math.random() * boards.length)].solution;
}

function shuffle(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function createPuzzle(solution, clues) {
  const puzzle = Array(81).fill("0");
  const indexes = shuffle([...Array(81).keys()]);

  indexes.slice(0, clues).forEach(index => {
    puzzle[index] = solution[index];
  });

  return puzzle.join("");
}

function newGame() {
  hideOverlay();
  selectedCell = null;

  currentSolution = getRandomBoard();
  currentPuzzle = createPuzzle(currentSolution, levels[currentLevel].clues);

  renderGrid();
  showGame();
}

function restartGame() {
  hideOverlay();
  selectedCell = null;
  renderGrid();
}

function renderGrid() {
  sudokuGrid.innerHTML = "";

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("input");
    cell.classList.add("sudoku-cell");
    cell.setAttribute("maxlength", "1");
    cell.setAttribute("inputmode", "numeric");

    if (currentPuzzle[i] !== "0") {
      cell.value = currentPuzzle[i];
      cell.classList.add("fixed");
      cell.disabled = true;
    } else {
      cell.value = "";
      cell.addEventListener("input", () => handleInput(cell));
      cell.addEventListener("click", () => selectCell(cell));
    }

    sudokuGrid.appendChild(cell);
  }
}

function selectCell(cell) {
  document.querySelectorAll(".sudoku-cell").forEach(c => c.classList.remove("selected"));
  selectedCell = cell;
  cell.classList.add("selected");
}

function handleInput(cell) {
  cell.value = cell.value.replace(/[^1-9]/g, "");
  cell.classList.remove("wrong");

  if (cell.value.length > 1) {
    cell.value = cell.value[0];
  }

  checkIfComplete();
}

function getUserBoard() {
  return [...document.querySelectorAll(".sudoku-cell")]
    .map(cell => cell.value || "0")
    .join("");
}

function checkBoard() {
  const cells = document.querySelectorAll(".sudoku-cell");
  let hasMistake = false;

  cells.forEach((cell, index) => {
    cell.classList.remove("wrong");

    if (!cell.classList.contains("fixed") && cell.value && cell.value !== currentSolution[index]) {
      cell.classList.add("wrong");
      hasMistake = true;
    }
  });

  if (getUserBoard() === currentSolution) {
    showOverlay("You solved it!", "Great job completing the Sudoku.", "newGame");
  } else if (hasMistake) {
    showOverlay("Not quite", "Some numbers are incorrect. Try correcting the highlighted cells.", "continue");
  } else {
    showOverlay("Keep going", "No mistakes found so far.", "continue");
  }
}

function checkIfComplete() {
  if (getUserBoard() === currentSolution) {
    showOverlay("You solved it!", "Great job completing the Sudoku.");
  }
}

function clearSelectedCell() {
  if (!selectedCell || selectedCell.classList.contains("fixed")) return;

  selectedCell.value = "";
  selectedCell.classList.remove("wrong");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function showOverlay(title, text, action = "continue") {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlayAction = action;

  if (action === "newGame") {
    overlayBtn.textContent = "New Game";
  } else {
    overlayBtn.textContent = "Continue";
  }

  overlay.classList.remove("hidden");
}

numberButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedCell) return;
    if (selectedCell.classList.contains("fixed")) return;

    selectedCell.value = button.dataset.number;
    selectedCell.classList.remove("wrong");

    selectedCell.dispatchEvent(new Event("input"));

    checkIfComplete();
  });
});

clearNumberBtn.addEventListener("click", () => {
  clearSelectedCell();
});

levelButtons.forEach(button => {
  button.addEventListener("click", () => {
    levelButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentLevel = button.dataset.level;
    levelInfo.textContent = levels[currentLevel].text;
  });
});

startBtn.addEventListener("click", newGame);

newGameBtn.addEventListener("click", () => {
  showSetup();
});
restartBtn.addEventListener("click", restartGame);
checkBtn.addEventListener("click", checkBoard);

overlayBtn.addEventListener("click", () => {
  hideOverlay();

  if (overlayAction === "newGame") {
    newGame();
  }
});

loadBoards();