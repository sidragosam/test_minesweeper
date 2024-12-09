document.addEventListener("DOMContentLoaded", () => {
  const minesweeper = document.getElementById("minesweeper");
  const resetButton = document.getElementById("reset-button");
  const difficultySelector = document.getElementById("difficulty-selector");
  const mineCounter = document.getElementById("mine-counter");
  const timerElement = document.getElementById("timer");

  let rows = 10;
  let cols = 10;
  let minesCount = 20;
  let flagsPlaced = 0;
  let cells = [];
  let mines = [];
  let timer;
  let timeElapsed = 0;
  let gameOver = false;

  function initGame() {
    clearInterval(timer);
    timeElapsed = 0;
    timerElement.textContent = "Time: 0s";
    flagsPlaced = 0;
    gameOver = false;
    updateMineCounter();
    minesweeper.innerHTML = "";
    cells = [];
    mines = [];
    setDifficulty();
    generateMines();
    createBoard();
    startTimer();
  }

  function setDifficulty() {
    const difficulty = difficultySelector.value;
    if (difficulty === "easy") {
      rows = cols = 8;
      minesCount = 10;
    } else if (difficulty === "medium") {
      rows = cols = 10;
      minesCount = 20;
    } else if (difficulty === "hard") {
      rows = cols = 14;
      minesCount = 40;
    }
    minesweeper.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    minesweeper.style.gridTemplateRows = `repeat(${rows}, 30px)`;
  }

  function startTimer() {
    timer = setInterval(() => {
      timeElapsed++;
      timerElement.textContent = `Time: ${timeElapsed}s`;
    }, 1000);
  }

  function updateMineCounter() {
    mineCounter.textContent = `Mines: ${minesCount - flagsPlaced}`;
  }

  function generateMines() {
    while (mines.length < minesCount) {
      const mine = Math.floor(Math.random() * rows * cols);
      if (!mines.includes(mine)) {
        mines.push(mine);
      }
    }
  }

  function createBoard() {
    for (let i = 0; i < rows * cols; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      cell.addEventListener("click", () => revealCell(cell));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cell);
      });
      minesweeper.appendChild(cell);
      cells.push(cell);
    }
  }

  function revealCell(cell) {
    const index = parseInt(cell.dataset.index);
    if (
      cell.classList.contains("revealed") ||
      cell.classList.contains("flagged") ||
      gameOver
    ) {
      return;
    }
    if (mines.includes(index)) {
      cell.classList.add("mine");
      endGame(false);
    } else {
      const adjacentMines = countAdjacentMines(index);
      cell.classList.add("revealed");
      if (adjacentMines > 0) {
        cell.textContent = adjacentMines;
        cell.dataset.number = adjacentMines;
      } else {
        revealAdjacentCells(index);
      }
      checkWin();
    }
  }

  function toggleFlag(cell) {
    if (cell.classList.contains("revealed") || gameOver) {
      return;
    }
    if (cell.classList.contains("flagged")) {
      cell.classList.remove("flagged");
      flagsPlaced--;
    } else if (flagsPlaced < minesCount) {
      cell.classList.add("flagged");
      flagsPlaced++;
    }
    updateMineCounter();
    checkWin();
  }

  function countAdjacentMines(index) {
    const adjacentIndices = getAdjacentIndices(index);
    return adjacentIndices.filter((i) => mines.includes(i)).length;
  }

  function revealAdjacentCells(index) {
    const adjacentIndices = getAdjacentIndices(index);
    adjacentIndices.forEach((i) => {
      const cell = cells[i];
      if (
        !cell.classList.contains("revealed") &&
        !cell.classList.contains("flagged")
      ) {
        revealCell(cell);
      }
    });
  }

  function getAdjacentIndices(index) {
    const adjacentIndices = [];
    const row = Math.floor(index / cols);
    const col = index % cols;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          adjacentIndices.push(newRow * cols + newCol);
        }
      }
    }
    return adjacentIndices;
  }

  function endGame(won) {
    gameOver = true;
    clearInterval(timer);
    cells.forEach((cell, index) => {
      if (mines.includes(index)) {
        cell.classList.add("mine");
      }
      cell.removeEventListener("click", revealCell);
      cell.removeEventListener("contextmenu", toggleFlag);
    });
    setTimeout(() => {
      alert(won ? "🎉 Congratulations! You Won!" : "💥 Game Over!");
      resetButton.textContent = won ? "😎" : "😵";
    }, 100);
  }

  function checkWin() {
    const revealedCells = cells.filter((cell) =>
      cell.classList.contains("revealed")
    ).length;
    if (revealedCells === rows * cols - minesCount) {
      endGame(true);
    }
  }

  resetButton.addEventListener("click", () => {
    resetButton.textContent = "😊";
    initGame();
  });

  difficultySelector.addEventListener("change", initGame);

  initGame();
});
