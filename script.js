const boardEl = document.getElementById("board");
const playerXScoreEl = document.getElementById("player-x-score");
const playerOScoreEl = document.getElementById("player-o-score");
const drawsCountEl = document.getElementById("draws-count");
const resetBtn = document.getElementById("reset-btn");

let gameBoard = [],
  isX = true,
  isEnded = false,
  clicksCount = 0;

const BOARD_SIZE = 3;
const score = {
  x: 0,
  o: 0,
  draws: 0,
};

resetBtn.addEventListener("click", resetGame);
boardEl.addEventListener("click", (e) => {
  if (isEnded) return e.preventDefault();

  const { target: btn } = e;
  const { rowid, colid } = btn.dataset;
  const key = isX ? "x" : "o";

  if (!btn.dataset.key) {
    btn.textContent = key;
    btn.dataset.key = key;
    gameBoard[rowid][colid] = key;
    isX = !isX;
    clicksCount += 1;
    setTurnIndicator();
  }

  const axies = getWinnerAxies(gameBoard, [Number(rowid), Number(colid)], key),
    hasBoardFullfiled = clicksCount === BOARD_SIZE * BOARD_SIZE,
    hasWinKey = hasWinner(Object.values(axies), key);

  isEnded = hasWinKey || hasBoardFullfiled;

  if (isEnded) {
    if (hasWinKey) {
      score[key] += 1;
      drawWinnerLine(axies, { x: rowid, y: colid }, key);
    }

    if (hasBoardFullfiled) {
      score.draws += 1;
    }

    setTimeout(() => {
      hasWinKey && alert(`${key.toUpperCase()} wins!`);
      drawScore();
      initGameBoard();
    }, 500);
  }
});

initGameBoard();

function createBoardBtn(rowId = 0, colId = 0, boardSize) {
  const btn = document.createElement("button");
  const isCorner = colId === 0 || colId === boardSize - 1;

  const classes = classNames({
    "btn-corner-bottom": rowId === boardSize - 1,
    "btn-corner-left": colId === 0,
    "btn-corner-right": colId === boardSize - 1,
    "btn-corner-top": rowId === 0,
    "btn-corner": isCorner,
  });

  btn.classList.add("board-btn");
  classes.length && btn.classList.add(...classes);
  btn.dataset.rowid = rowId;
  btn.dataset.colid = colId;
  btn.dataset.key = "";

  return btn;
}

function getBoardTemplate(size = 0) {
  const board = [];

  for (let i = 0; i < size; i++) {
    board.push([]);

    for (let si = 0; si < BOARD_SIZE; si++) {
      board[i].push(null);
    }
  }

  return board;
}

function renderBoardHTML(size = 0) {
  const buttons = getBoardTemplate(size).map((r, ri) =>
    r.map((c, ci) => createBoardBtn(ri, ci, size))
  );
  boardEl.style.gridTemplateColumns = "1fr ".repeat(buttons.length);
  boardEl.innerHTML = "";
  buttons.flat(1).forEach((btn) => boardEl.appendChild(btn));
}

function getWinnerAxies(board = [], coords = [0, 0], k = "") {
  const [x, y, z] = [[], [], []];

  for (let i = 0; i < board.length; i++) {
    y.push(board[i][coords[1]]);
    x.push(board[coords[0]][i]);

    const isCorner =
      (coords[1] === board.length - 1 || !coords[1]) &&
      (!coords[0] || coords[0] === board.length - 1);

    if (isCorner) {
      const ci = coords[1] - i;
      const b = coords[0] ? board.slice(0).reverse() : board;
      z.push(b[i][ci > 0 ? ci : Math.abs(ci)]);
    }
  }

  return { x, y, z };
}

function hasWinner(coords, k) {
  function hasMatch(arr = []) {
    return !(arr.length < 3) && arr.every((v) => v === k);
  }

  return coords.some(hasMatch);
}

function initGameBoard() {
  isEnded = false;
  isX = true;
  clicksCount = 0;
  boardEl.dataset.winline = "";
  renderBoardHTML(BOARD_SIZE);
  gameBoard = getBoardTemplate(BOARD_SIZE);
  setTurnIndicator();
}

function drawScore() {
  playerXScoreEl.textContent = `${score.x} Wins`;
  playerOScoreEl.textContent = `${score.o} Wins`;
  drawsCountEl.textContent = score.draws;
}

function resetGame() {
  score.x = 0;
  score.y = 0;
  score.draws = 0;
  drawScore();
  initGameBoard();
}

function classNames(deps) {
  const classes = Object.entries(deps).map((item, i) => {
    const [key, value] = item;
    if (!value || !key) return "";
    return key;
  });

  return classes.length ? classes.filter((v) => v) : "";
}

function setTurnIndicator() {
  document
    .querySelector(`.player-${isX ? "x" : "o"}.turn-indicator`)
    .classList.add("active");

  document
    .querySelector(`.player-${!isX ? "x" : "o"}.turn-indicator`)
    .classList.remove("active");
}

function drawWinnerLine(axies, coords, key) {
  const [axis] = Object.entries(axies).find((el) => {
    const [, matches] = el;
    return matches.every((v) => v === key);
  });

  if (axis === "z") {
    boardEl.dataset["winline"] = `${axis}${coords.x}${coords.y}`;
    return;
  }

  boardEl.dataset["winline"] = `${axis}${coords[axis]}`;
}
