const startBtn = document.getElementById("startBtn");
const pads = document.querySelectorAll(".pad");
const roundDisplay = document.getElementById("round");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const playAgainBtn = document.getElementById("playAgainBtn");
const setupPanel = document.getElementById("setupPanel");
const playPanel = document.getElementById("playPanel");
const modeLabel = document.getElementById("modeLabel");
const restartBtn = document.getElementById("restartBtn");
const levelInfo = document.getElementById("level-info");
const levelButtons = document.querySelectorAll(".level-btn");
const newGameBtn = document.getElementById("newGameBtn");

const colors = ["green", "red", "yellow", "blue"];

const sounds = {
  green: new Audio("sounds/c.wav"),
  red: new Audio("sounds/d.wav"),
  yellow: new Audio("sounds/e.wav"),
  blue: new Audio("sounds/g.wav"),
};

const levels = {
  easy: {
    rounds: 6,
    baseSpeed: 750,
    text: "Beat 6 rounds to win.",
  },
  medium: {
    rounds: 12,
    baseSpeed: 620,
    text: "Beat 12 rounds to win.",
  },
  hard: {
    rounds: 20,
    baseSpeed: 500,
    text: "Beat 20 rounds to win.",
  },
  expert: {
    rounds: null,
    baseSpeed: 420,
    text: "Endless mode. Play until you make a mistake.",
  },
};

let sequence = [];
let userSequence = [];
let round = 0;
let maxRounds = null;
let baseSpeed = 700;
let currentSpeed = 700;
let isPlaying = false;
let selectedLevel = "easy";
let gameActive = false;

function resetAudio(audio) {
  audio.currentTime = 0;
  audio.play();
}

function activatePad(color) {
  const pad = document.querySelector(`[data-color="${color}"]`);
  if (!pad) return;

  pad.classList.add("active");
  resetAudio(sounds[color]);

  setTimeout(
    () => {
      pad.classList.remove("active");
    },
    Math.max(220, currentSpeed * 0.55),
  );
}

function disablePads() {
  pads.forEach(pad => pad.classList.add("disabled"));
}

function enablePads() {
  pads.forEach(pad => pad.classList.remove("disabled"));
}

function getNextSpeed() {
  return Math.max(220, baseSpeed - (round - 1) * 18);
}

function updateRoundDisplay() {
  roundDisplay.textContent = round;
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function showSetup() {
  setupPanel.classList.remove("hidden");
  playPanel.classList.add("hidden");
  hideOverlay();

  gameActive = false;
  isPlaying = false;
  sequence = [];
  userSequence = [];
  round = 0;
  updateRoundDisplay();
  disablePads();

  setSelectedLevel("easy");
}

function showGame() {
  setupPanel.classList.add("hidden");
  playPanel.classList.remove("hidden");

  modeLabel.textContent = `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} mode`;
}

function setSelectedLevel(levelKey) {
  selectedLevel = levelKey;
  const level = levels[levelKey];

  maxRounds = level.rounds;
  baseSpeed = level.baseSpeed;
  levelInfo.textContent = level.text;

  levelButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.level === levelKey);
  });

  startBtn.classList.remove("hidden");
  hideOverlay();
}

function startGame() {
  if (!selectedLevel) return;

  showGame();

  sequence = [];
  userSequence = [];
  round = 0;
  gameActive = true;
  hideOverlay();
  updateRoundDisplay();
  disablePads();

  nextRound();
}

function nextRound() {
  userSequence = [];
  round++;
  currentSpeed = getNextSpeed();
  updateRoundDisplay();

  const nextColor = colors[Math.floor(Math.random() * colors.length)];
  sequence.push(nextColor);

  playSequence();
}

function playSequence() {
  isPlaying = true;
  disablePads();

  sequence.forEach((color, index) => {
    setTimeout(() => {
      activatePad(color);
    }, index * currentSpeed);
  });

  setTimeout(
    () => {
      isPlaying = false;
      if (gameActive) {
        enablePads();
      }
    },
    sequence.length * currentSpeed + 120,
  );
}

function loseGame() {
  gameActive = false;
  isPlaying = false;
  disablePads();
  showOverlay("You lost", "Better luck next time.");
}

function winGame() {
  gameActive = false;
  isPlaying = false;
  disablePads();
  showOverlay("You won!", "You completed all rounds.");
}

function handleInput(color) {
  if (!gameActive || isPlaying) return;

  userSequence.push(color);
  activatePad(color);

  const currentIndex = userSequence.length - 1;

  if (userSequence[currentIndex] !== sequence[currentIndex]) {
    loseGame();
    return;
  }

  if (userSequence.length === sequence.length) {
    disablePads();

    if (maxRounds && round >= maxRounds) {
      setTimeout(() => {
        winGame();
      }, 500);
      return;
    }

    setTimeout(() => {
      nextRound();
    }, 800);
  }
}

levelButtons.forEach(button => {
  button.addEventListener("click", () => {
    setSelectedLevel(button.dataset.level);
  });
});

pads.forEach(pad => {
  pad.addEventListener("click", () => {
    handleInput(pad.dataset.color);
  });
});

showSetup();

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
  startGame();
});

playAgainBtn.addEventListener("click", () => {
  showSetup();
});

newGameBtn.addEventListener("click", () => {
  showSetup();
});
