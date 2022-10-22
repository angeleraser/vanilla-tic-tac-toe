const boardEl = document.getElementById("board");
const resetBtn = document.getElementById("reset-btn");

let gameBoard = [],
  isX = true,
  isEnded = false,
  movesCount = 0;

const BOARD_SIZE = 5;
const score = {
  x: 0,
  o: 0,
  draws: 0,
};

resetBtn.addEventListener("click", () => {
  resetAllStats();
  init();
});

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
    movesCount += 1;
    setTurnIndicatorHTML();
  }

  const axies = getBoardAxis(gameBoard, [Number(rowid), Number(colid)], key);
  const hasWinKey = hasWinner(Object.values(axies), key);
  const isFullfiled = movesCount === BOARD_SIZE * BOARD_SIZE;

  isEnded = hasWinKey || isFullfiled;

  if (isEnded && hasWinKey) return updateScore(key);

  if (isEnded && isFullfiled) return updateScore("draw");
});

init();

function createBoardPad(rowId = 0, colId = 0, boardSize) {
  const btn = document.createElement("button");
  const isCorner = colId === 0 || colId === boardSize - 1;

  const classes = classNames({
    "board-pad-bottom": rowId === boardSize - 1,
    "board-pad-left": colId === 0,
    "board-pad-right": colId === boardSize - 1,
    "board-pad-top": rowId === 0,
    "board-pad": isCorner,
  });

  btn.classList.add("board-pad");
  classes.length && btn.classList.add(...classes);
  btn.dataset.rowid = rowId;
  btn.dataset.colid = colId;
  btn.dataset.key = "";

  return btn;
}

function createBoardTemplate(size = 0) {
  const board = [];

  for (let i = 0; i < size; i++) {
    board.push([]);

    for (let si = 0; si < BOARD_SIZE; si++) {
      board[i].push(null);
    }
  }

  return board;
}

function getBoardAxis(board = [], coords = [0, 0], k = "") {
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

function hasWinner(axies = [], k = "") {
  function hasMatch(arr = []) {
    return !(arr.length < 3) && arr.every((v) => v === k);
  }

  return axies.some(hasMatch);
}

function init() {
  resetTurnStats();
  renderBoardHTML(BOARD_SIZE);
  setTurnIndicatorHTML();
}

function resetTurnStats() {
  isEnded = false;
  isX = true;
  movesCount = 0;
  gameBoard = createBoardTemplate(BOARD_SIZE);
  renderBoardHTML(BOARD_SIZE);
}

function resetAllStats() {
  score.x = 0;
  score.y = 0;
  score.draws = 0;
  resetTurnStats();
  Object.keys(score).forEach(drawScoreHTML);
}

function updateScore(key = "") {
  score[key] += 1;
  const msg = key === "draw" ? "Is a draw!" : `${key.toUpperCase()} wins!`;

  setTimeout(() => {
    alert(msg);
    drawScoreHTML(key);
    resetTurnStats();
  }, 500);
}

function drawScoreHTML(key = "") {
  const suffix = key !== "draws" ? " Wins" : "";
  const el = document.getElementById(`${key}-score`);
  el && (el.textContent = `${score[key]}${suffix}`);
}

function renderBoardHTML(size = 0) {
  const buttons = createBoardTemplate(size).map((r, ri) =>
    r.map((c, ci) => createBoardPad(ri, ci, size))
  );
  boardEl.innerHTML = "";
  boardEl.dataset.boardsize = size;
  boardEl.style.gridTemplateColumns = "1fr ".repeat(buttons.length);
  buttons.flat(1).forEach((btn) => boardEl.appendChild(btn));
}

function setTurnIndicatorHTML() {
  document
    .querySelector(`.player-${isX ? "x" : "o"}-indicator`)
    .classList.add("active");

  document
    .querySelector(`.player-${!isX ? "x" : "o"}-indicator`)
    .classList.remove("active");
}

function classNames(deps) {
  const classes = Object.entries(deps).map((item, i) => {
    const [key, value] = item;
    if (!value || !key) return "";
    return key;
  });

  return classes.length ? classes.filter((v) => v) : "";
}
