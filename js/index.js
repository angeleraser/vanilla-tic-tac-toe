import {
  classNames,
  evalBoardAxies,
  createBoardTemplate,
  BOARD_SIZE,
  TOTAL_CELLS,
  ANIMATION_DURATION,
} from "./utils.js";

const boardEl = document.getElementById("board");
const resetBtnEl = document.getElementById("reset-btn");

let gameBoard = [],
  isX = true,
  isEnded = false,
  movesCount = 0,
  resetDelay = 250;

const score = {
  x: 0,
  o: 0,
  draws: 0,
};

function drawScoreHTML(key) {
  const suffix = key !== "draws" ? " Wins" : "";
  const el = document.getElementById(`${key}-score`);
  el && (el.textContent = `${score[key]}${suffix}`);
}

function setWinnerPadsColor(axis = []) {
  axis.forEach((p, i) => {
    const btn = document.querySelector(
      `[data-rowid='${p[0]}'][data-colid='${p[1]}']`
    );
    btn.classList.add("board-cell-match");
    btn.style.transitionDelay = `${(i + 1) / 10}s`;
  });
}

async function dispelBoardHTML() {
  return document.querySelectorAll(".board-cell").forEach((btn, i) => {
    btn.classList.remove("show-animation");
    btn.classList.add("dispel-animation");
  });
}

function renderBoardHTML(size) {
  const buttons = createBoardTemplate(size).map((row, ri) => {
    return row.map((_, ci) => createBoardCell(ri, ci, size));
  });

  boardEl.innerHTML = "";
  boardEl.dataset.boardsize = size;
  boardEl.style.gridTemplateColumns = "1fr ".repeat(size);

  buttons.flat(1).forEach((btn, i) => {
    btn.style.animationDelay = `${(i + 1) / 25}s`;
    boardEl.appendChild(btn);
  });
}

function setTurnIndicatorHTML() {
  document
    .querySelector(`.player-${isX ? "x" : "o"}-indicator`)
    .classList.add("active");

  document
    .querySelector(`.player-${!isX ? "x" : "o"}-indicator`)
    .classList.remove("active");
}

function createBoardCell(rowId, colId, boardSize) {
  const btn = document.createElement("button");

  const classes = classNames({
    "board-cell-bottom": rowId === boardSize - 1,
    "board-cell-left": colId === 0,
    "board-cell-right": colId === boardSize - 1,
    "board-cell-top": rowId === 0,
    "board-cell": colId === 0 || colId === boardSize - 1,
  });
  const boardWidth = boardEl.getBoundingClientRect().width * 0.5;

  btn.style.fontSize = `${Math.floor(boardWidth / boardSize)}px`;
  btn.classList.add("board-cell");
  btn.classList.add("show-animation");
  classes.length && btn.classList.add(...classes);
  btn.dataset.rowid = rowId;
  btn.dataset.colid = colId;
  btn.dataset.key = "";
  btn.style.animationDuration = `${ANIMATION_DURATION}s`;
  btn.style.transition = `${ANIMATION_DURATION}s background-color`;

  return btn;
}

function resetTurnStats() {
  isEnded = false;
  isX = true;
  movesCount = 0;
  resetDelay = 250;
  gameBoard = createBoardTemplate(BOARD_SIZE);
  setTurnIndicatorHTML();
}

function resetAllStats() {
  score.x = 0;
  score.y = 0;
  score.draws = 0;
  resetTurnStats();
  Object.keys(score).forEach(drawScoreHTML);
}

function init() {
  resetTurnStats();
  renderBoardHTML(BOARD_SIZE);
  setTurnIndicatorHTML();
}

resetBtnEl.addEventListener("click", () => {
  resetAllStats();
  init();
});

boardEl.addEventListener("click", (e) => {
  const { target: btn } = e;

  if (btn.tagName !== "BUTTON" || isEnded) return;

  const { rowid, colid } = btn.dataset;
  const key = isX ? "x" : "o";

  if (!btn.dataset.key) {
    btn.textContent = key;
    btn.dataset.key = key;
    gameBoard[Number(rowid)][Number(colid)] = key;
    isX = !isX;
    movesCount += 1;
    setTurnIndicatorHTML();
  }

  const { isMatch, axis } = evalBoardAxies(gameBoard, key);

  isEnded = isMatch || movesCount === TOTAL_CELLS;

  if (!isEnded) return;

  if (isMatch) setTimeout(() => setWinnerPadsColor(axis), resetDelay);

  const accumDelay = ANIMATION_DURATION * TOTAL_CELLS;

  resetDelay += (accumDelay / (BOARD_SIZE * 0.1)) * 80 + 500;
  setTimeout(dispelBoardHTML, resetDelay);

  resetDelay += accumDelay * 150;
  setTimeout(() => {
    const k = isMatch ? key : "draws";

    score[k] += 1;
    drawScoreHTML(k);
    resetTurnStats();
    renderBoardHTML(BOARD_SIZE);
  }, resetDelay);
});

init();
