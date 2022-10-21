const boardEl = document.getElementById("board");

function createBoardBtn(rowId = 0, colId = 0) {
  const btn = document.createElement("button");
  btn.classList.add("board-btn");
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
    r.map((c, ci) => createBoardBtn(ri, ci))
  );
  boardEl.style.gridTemplateColumns = "1fr ".repeat(buttons.length);
  boardEl.innerHTML = "";
  buttons.flat(1).forEach((btn) => boardEl.appendChild(btn));
}

function hasWinner(board = [], coords = [0, 0], k = "") {
  const [x, y, z] = [[], [], []];

  for (let i = 0; i < board.length; i++) {
    y.push(board[i][coords[1]]);
    x.push(board[i][coords[0]]);

    const isCorner =
      (coords[1] === board.length - 1 || !coords[1]) &&
      (!coords[0] || coords[0] === board.length - 1);

    if (isCorner) {
      const ci = coords[1] - i;
      const b = coords[0] ? [...board].reverse() : board;
      z.push(b[i][ci > 0 ? ci : Math.abs(ci)]);
    }
  }

  function hasMatch(arr = []) {
    return !(arr.length < 3) && arr.every((v) => v === k);
  }

  return hasMatch(x) || hasMatch(y) || hasMatch(z);
}

function initGameBoard() {
  renderBoardHTML(BOARD_SIZE);
  gameBoard = getBoardTemplate(BOARD_SIZE);
}

const BOARD_SIZE = 3;

let gameBoard = [],
  isX = true,
  isEnded = false;

boardEl.addEventListener("click", (e) => {
  if (isEnded) return e.preventDefault();

  const { target: btn } = e;
  const { rowid, colid } = btn.dataset;
  const key = isX ? "X" : "O";

  if (!btn.dataset.key) {
    btn.textContent = key;
    btn.dataset.key = key;
    gameBoard[rowid][colid] = key;
    isX = !isX;
  }

  if (hasWinner(gameBoard, [Number(rowid), Number(colid)], key)) {
    isEnded = true;
    alert(`${key} WINS`);
    initGameBoard();
  }
});

initGameBoard();
