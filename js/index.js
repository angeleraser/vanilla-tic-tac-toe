import {
  classNames,
  evalBoardAxies,
  createBoardTemplate,
  BOARD_SIZE,
} from "./utils.js";

const boardEl = document.getElementById("board");
const resetBtn = document.getElementById("reset-btn");

let gameBoard = [],
  isX = true,
  isEnded = false,
  movesCount = 0;

const score = {
  x: 0,
  o: 0,
  draws: 0,
};

function drawScoreHTML(key = "") {
  const suffix = key !== "draws" ? " Wins" : "";
  const el = document.getElementById(`${key}-score`);
  el && (el.textContent = `${score[key]}${suffix}`);
}

function setWinnerPadsColor(axis = []) {
  axis.forEach((p) => {
    const [r, c] = p;
    document
      .querySelector(`[data-rowid='${r}'][data-colid='${c}']`)
      .classList.add("board-pad-match");
  });
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

  const boardWidth = boardEl.getBoundingClientRect().width * 0.8;
  btn.style.fontSize = `${Math.floor(boardWidth / boardSize)}px`;

  return btn;
}

function resetTurnStats() {
  isEnded = false;
  isX = true;
  movesCount = 0;
  gameBoard = createBoardTemplate(BOARD_SIZE);
  setTurnIndicatorHTML();
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
  }, 800);
}

function init() {
  resetTurnStats();
  renderBoardHTML(BOARD_SIZE);
  setTurnIndicatorHTML();
}

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

  const { isMatch, axis } = evalBoardAxies(gameBoard, key);
  const isFullfiled = movesCount === BOARD_SIZE * BOARD_SIZE;

  isEnded = isMatch || isFullfiled;

  if (isEnded && isMatch) {
    updateScore(key);
    setWinnerPadsColor(axis);
  }

  if (isEnded && isFullfiled) updateScore("draw");
});

init();
