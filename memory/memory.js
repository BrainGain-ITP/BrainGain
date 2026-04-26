const memoryGrid = document.getElementById("memoryGrid");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const finalStats = document.getElementById("finalStats");
const playAgainBtn = document.getElementById("playAgainBtn");
const levelButtons = document.querySelectorAll(".level-btn");

const levels = {
  easy: 6,
  medium: 12,
  hard: 18
};

let allCards = [];
let currentLevel = "easy";
let currentPairs = levels[currentLevel];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchesFound = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

async function loadCards() {
  try {
    const response = await fetch("cards.json");
    allCards = await response.json();
    createBoard();
  } catch (error) {
    memoryGrid.innerHTML = "<p style='color: white;'>Could not load cards.</p>";
    console.error("Error loading cards.json:", error);
  }
}

function shuffle(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function getColumns(totalCards) {
  const width = window.innerWidth;

  if (totalCards === 12) {
    return width <= 600 ? 3 : 4;
  }

  if (totalCards === 24) {
    return width <= 600 ? 4 : 6;
  }

  if (totalCards === 36) {
    return width <= 600 ? 4 : 6;
  }

  return 4;
}

function applyGridLayout(totalCards) {
  const columns = getColumns(totalCards);

  let minSize = "70px";
  let maxSize = "110px";

  if (window.innerWidth <= 600) {
    minSize = "50px";
    maxSize = "72px";
  } else if (window.innerWidth <= 900) {
    minSize = "60px";
    maxSize = "90px";
  }

  memoryGrid.style.gridTemplateColumns = `repeat(${columns}, minmax(${minSize}, ${maxSize}))`;
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      timer++;
      timerDisplay.textContent = `Time: ${timer}s`;
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetGameState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchesFound = 0;
  timer = 0;
  gameStarted = false;
  stopTimer();

  movesDisplay.textContent = "Moves: 0";
  timerDisplay.textContent = "Time: 0s";
  hideOverlay();
}

function createBoard() {
  resetGameState();
  memoryGrid.innerHTML = "";

  const selectedCards = shuffle(allCards).slice(0, currentPairs);
  const gameCards = shuffle([...selectedCards, ...selectedCards]);

  applyGridLayout(gameCards.length);

  gameCards.forEach(cardData => {
    const card = document.createElement("button");
    card.classList.add("memory-card");
    card.dataset.symbol = cardData.symbol;
    card.dataset.name = cardData.name;
    card.setAttribute("aria-label", `Memory card: ${cardData.name}`);

    card.innerHTML = `
    <div class="memory-card-inner">
      <div class="memory-card-front"></div>
      <div class="memory-card-back">${cardData.symbol}</div>
    </div>
  `;

    card.addEventListener("click", () => flipCard(card));
    memoryGrid.appendChild(card);
  });
}

function flipCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;
  if (card.classList.contains("flipped")) return;

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesDisplay.textContent = `Moves: ${moves}`;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.disabled = true;
    secondCard.disabled = true;

    matchesFound++;
    resetTurn();

    if (matchesFound === currentPairs) {
      stopTimer();
      showOverlay(
      "Well done!",
      "You matched all pairs.",
      `You finished ${currentLevel} mode in ${moves} moves and ${timer} seconds.`
  );
}
  } else {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 900);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

restartBtn.addEventListener("click", createBoard);

levelButtons.forEach(button => {
  button.addEventListener("click", () => {
    levelButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentLevel = button.dataset.level;
    currentPairs = levels[currentLevel];
    createBoard();
  });
});

window.addEventListener("resize", () => {
  if (memoryGrid.children.length > 0) {
    applyGridLayout(memoryGrid.children.length);
  }
});

function hideOverlay() {
  overlay.classList.add("hidden");
}

function showOverlay(title, text, stats = "") {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  finalStats.textContent = stats;
  overlay.classList.remove("hidden");
}

playAgainBtn.addEventListener("click", () => {
  hideOverlay();
  createBoard();
});

loadCards();