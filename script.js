const STATES = ["", "0", "1", "ψ"];
const REAL_STATES = ["0", "1", "ψ"];

let SIZE = 6;
let board = [];
let solution = [];
let hintsOn = true;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateSolution(size) {
  const max = size / 3;
  const grid = Array.from({ length: size }, () => Array(size).fill(""));

  function backtrack(idx = 0) {
    if (idx === size * size) return true;
    const r = Math.floor(idx / size);
    const c = idx % size;
    const vals = shuffle([...REAL_STATES]);
    for (const v of vals) {
      grid[r][c] = v;
      if (isValid(grid, r, c, max) && backtrack(idx + 1)) return true;
      grid[r][c] = "";
    }
    return false;
  }

  backtrack();
  return grid;
}

function isValid(grid, r, c, max) {
  const size = grid.length;

  const rowCounts = { 0: 0, 1: 0, ψ: 0 };
  for (let j = 0; j < size; j++) {
    const v = grid[r][j];
    if (v) {
      rowCounts[v]++;
      if (rowCounts[v] > max) return false;
    }
  }

  const colCounts = { 0: 0, 1: 0, ψ: 0 };
  for (let i = 0; i < size; i++) {
    const v = grid[i][c];
    if (v) {
      colCounts[v]++;
      if (colCounts[v] > max) return false;
    }
  }

  for (let j = Math.max(0, c - 2); j <= c && j + 2 < size; j++) {
    const a = grid[r][j];
    const b = grid[r][j + 1];
    const d = grid[r][j + 2];
    if (a && b && d) {
      if (a === b && a === d) return false;
      if (a !== b && b !== d && a !== d) return false;
    }
  }

  for (let i = Math.max(0, r - 2); i <= r && i + 2 < size; i++) {
    const a = grid[i][c];
    const b = grid[i + 1][c];
    const d = grid[i + 2][c];
    if (a && b && d) {
      if (a === b && a === d) return false;
      if (a !== b && b !== d && a !== d) return false;
    }
  }

  const row = grid[r];
  if (!row.includes("")) {
    const rowStr = row.join("");
    for (let i = 0; i < size; i++) {
      if (i !== r && grid[i].join("") === rowStr) return false;
    }
  }

  const col = [];
  for (let i = 0; i < size; i++) col.push(grid[i][c]);
  if (!col.includes("")) {
    const colStr = col.join("");
    for (let j = 0; j < size; j++) {
      if (j !== c) {
        const other = [];
        for (let i = 0; i < size; i++) other.push(grid[i][j]);
        if (!other.includes("") && other.join("") === colStr) return false;
      }
    }
  }

  return true;
}

function cloneBoard(b) {
  return b.map((row) => row.slice());
}

function countSolutions(b, limit = 2) {
  const size = b.length;
  const max = size / 3;

  function search(idx = 0) {
    if (idx === size * size) return 1;
    const r = Math.floor(idx / size);
    const c = idx % size;
    if (b[r][c]) return search(idx + 1);
    let total = 0;
    for (const v of REAL_STATES) {
      b[r][c] = v;
      if (isValid(b, r, c, max)) {
        total += search(idx + 1);
        if (total >= limit) break;
      }
      b[r][c] = "";
    }
    return total;
  }

  return search();
}

function hasUniqueSolution(p) {
  return countSolutions(cloneBoard(p), 2) === 1;
}

function generatePuzzle(size, diff) {
  const sol = generateSolution(size);
  const puzz = cloneBoard(sol);
  const total = size * size;
  const targets = {
    easy: Math.floor(total * 0.3),
    medium: Math.floor(total * 0.5),
    hard: Math.floor(total * 0.7),
  };
  const target = targets[diff] || targets.easy;
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) cells.push([r, c]);
  }
  shuffle(cells);
  let removed = 0;
  for (const [r, c] of cells) {
    const tmp = puzz[r][c];
    puzz[r][c] = "";
    if (hasUniqueSolution(puzz)) {
      removed++;
      if (removed >= target) break;
    } else {
      puzz[r][c] = tmp;
    }
  }
  return { puzzle: puzz, solution: sol };
}

function renderBoard() {
  const table = document.getElementById("board");
  table.innerHTML = "";
  document.documentElement.style.setProperty("--size", SIZE);
  for (let r = 0; r < SIZE; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < SIZE; c++) {
      const td = document.createElement("td");
      td.classList.add("cell");
      td.dataset.row = r;
      td.dataset.col = c;
      const val = board[r][c];
      if (val) {
        td.textContent = val;
        td.classList.add("prefill", `state-${val}`);
      } else {
        td.addEventListener("click", handleCellClick);
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function resizeBoard() {
  const container = document.getElementById("board-container");
  const controls = document.getElementById("controls");
  const message = document.getElementById("message");
  const rules = document.getElementById("rules");
  const availableHeight =
    window.innerHeight -
    controls.offsetHeight -
    message.offsetHeight -
    rules.offsetHeight -
    40;
  const availableWidth = window.innerWidth - 20;
  const size = Math.min(availableWidth, availableHeight);
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
}

function updateHints() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((c) => c.classList.remove("error"));
  if (!hintsOn) return;

  const max = SIZE / 3;
  const rowMap = {};
  for (let r = 0; r < SIZE; r++) {
    const counts = { 0: 0, 1: 0, ψ: 0 };
    let violation = false;
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (v) {
        counts[v]++;
        if (counts[v] > max) violation = true;
      }
      if (c >= 2) {
        const a = board[r][c - 2];
        const b = board[r][c - 1];
        const d = board[r][c];
        if (
          a &&
          b &&
          d &&
          ((a === b && a === d) || (a !== b && b !== d && a !== d))
        )
          violation = true;
      }
    }
    if (!board[r].includes("")) {
      const key = board[r].join("");
      if (rowMap[key] !== undefined) {
        violation = true;
        for (let c = 0; c < SIZE; c++) {
          document
            .querySelector(`td[data-row="${rowMap[key]}"][data-col="${c}"]`)
            .classList.add("error");
        }
      } else {
        rowMap[key] = r;
      }
    }
    if (violation) {
      for (let c = 0; c < SIZE; c++) {
        document
          .querySelector(`td[data-row="${r}"][data-col="${c}"]`)
          .classList.add("error");
      }
    }
  }

  const colMap = {};
  for (let c = 0; c < SIZE; c++) {
    const counts = { 0: 0, 1: 0, ψ: 0 };
    let violation = false;
    const colVals = [];
    for (let r = 0; r < SIZE; r++) {
      const v = board[r][c];
      colVals.push(v);
      if (v) {
        counts[v]++;
        if (counts[v] > max) violation = true;
      }
      if (r >= 2) {
        const a = board[r - 2][c];
        const b = board[r - 1][c];
        const d = board[r][c];
        if (
          a &&
          b &&
          d &&
          ((a === b && a === d) || (a !== b && b !== d && a !== d))
        )
          violation = true;
      }
    }
    if (!colVals.includes("")) {
      const key = colVals.join("");
      if (colMap[key] !== undefined) {
        violation = true;
        for (let r = 0; r < SIZE; r++) {
          document
            .querySelector(`td[data-row="${r}"][data-col="${colMap[key]}"]`)
            .classList.add("error");
        }
      } else {
        colMap[key] = c;
      }
    }
    if (violation) {
      for (let r = 0; r < SIZE; r++) {
        document
          .querySelector(`td[data-row="${r}"][data-col="${c}"]`)
          .classList.add("error");
      }
    }
  }
}

function handleCellClick(e) {
  const td = e.target;
  const r = parseInt(td.dataset.row, 10);
  const c = parseInt(td.dataset.col, 10);
  const idx = (STATES.indexOf(board[r][c] || "") + 1) % STATES.length;
  const val = STATES[idx];
  board[r][c] = val;
  td.textContent = val;
  td.className = "cell";
  if (val) td.classList.add(`state-${val}`);
  checkSolution();
  updateHints();
}

function checkSolution() {
  const msg = document.getElementById("message");
  if (board.flat().includes("")) {
    msg.textContent = "";
    return;
  }
  if (board.flat().join("") === solution.flat().join("")) {
    msg.textContent = "Puzzle solved!";
  } else {
    msg.textContent = "Rules violated!";
  }
}

function newGame() {
  SIZE = parseInt(document.getElementById("size-select").value, 10);
  const diff = document.getElementById("difficulty-select").value;
  const { puzzle, solution: sol } = generatePuzzle(SIZE, diff);
  board = puzzle;
  solution = sol;
  renderBoard();
  resizeBoard();
  updateHints();
  document.getElementById("message").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("new-game").addEventListener("click", newGame);
  const hintToggle = document.getElementById("hint-toggle");
  hintsOn = hintToggle.checked;
  hintToggle.addEventListener("change", (e) => {
    hintsOn = e.target.checked;
    updateHints();
  });
  window.addEventListener("resize", resizeBoard);
  newGame();
});
