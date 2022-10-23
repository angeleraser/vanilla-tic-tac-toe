function createBoardTemplate(size = 0) {
  const board = [];

  for (let i = 0; i < size; i++) {
    board.push([]);

    for (let si = 0; si < size; si++) {
      board[i].push(null);
    }
  }

  return board;
}

function classNames(deps) {
  const classes = Object.entries(deps).map((item, i) => {
    const [key, value] = item;
    if (!value || !key) return "";
    return key;
  });

  return classes.length ? classes.filter((v) => v) : "";
}

function evalBoardAxies(board = [], key = "") {
  function getZAxis(coords = [0, 0]) {
    const arr = [];

    for (let i = 0; i < board.length; i++) {
      const ci = coords[1] - i;
      arr.push([i, ci > 0 ? ci : Math.abs(ci)]);
    }

    return arr;
  }

  function evalAxis(axis, id) {
    if (axis.length === 0) return false;

    return axis.every((p) => {
      const [r, c] = p;
      return (id === "y" ? board[c][r] : board[r][c]) === key;
    });
  }

  let r = 0,
    size = board.length,
    isMatch = false,
    wAxis = [];

  while (!isMatch && r < size) {
    let xyAxis = [];

    for (let c = 0; c < size; c++) {
      xyAxis.push([r, c]);

      const isCorner = (c === size - 1 || !c) && (!r || r === size - 1);
      const zAxis = getZAxis([r, c]);

      if (isCorner && evalAxis(zAxis, "z")) {
        return { axis: zAxis, isMatch: true };
      }
    }

    isMatch =
      evalAxis(xyAxis, "x") ||
      (evalAxis(xyAxis, "y") && (xyAxis = xyAxis.map((c) => c.reverse())));

    wAxis = xyAxis;
    r++;
  }

  return { isMatch, axis: wAxis };
}

const PLAYERS = { X: "x", O: "o" };

class TicTacToe {
  constructor(
    options = { boardSize: 0, animationDuration: 0, renderRoot: null }
  ) {
    this.boardSize = options.boardSize;
    this.totalCells = Math.pow(options.boardSize, 2);
    this.animationDuration = options.animationDuration;

    this.renderRoot = options.renderRoot;
    this.__boardEl__ = this.__createHTMLWrapper__(["board-container"]);
    this.__scoreEl__ = this.__createScoreHTML__();
    this.__actionsEl__ = this.__createActionsHTML__();

    this.__PLAYERS__ = PLAYERS;

    this.state = {
      gameBoard: createBoardTemplate(options.boardSize),
      isX: true,
      isEnded: false,
      movesCount: 0,
      score: {
        x: 0,
        o: 0,
        draw: 0,
      },
    };
  }

  render() {
    this.renderRoot.appendChild(this.__scoreEl__);
    this.renderRoot.appendChild(this.__boardEl__);
    this.renderRoot.appendChild(this.__actionsEl__);

    this.__renderHTML__();
  }

  onBoardClick(callback = (e) => {}) {
    this.__boardEl__.addEventListener("click", (e) => {
      const { target: cell } = e;

      if (cell.tagName !== "BUTTON" || this.state.isEnded || cell.dataset.value)
        return;

      void callback({
        coords: this.__getCellCoords__(cell),
        cellValue: this.state.isX ? PLAYERS.X : PLAYERS.O,
      });
    });
  }

  onResetBtnClick(callback = (e) => {}) {
    const resetBtn = this.__actionsEl__.querySelector('[data-id="reset-btn"]');
    resetBtn.addEventListener("click", ({ target }) => callback(target));
  }

  writeBoardCell(value = "", coords = []) {
    const cellEl = this.__boardEl__.querySelector(
      `[data-rowid="${coords[0]}"][data-colid="${coords[1]}"]`
    );

    if (!cellEl) return;

    cellEl.textContent = value;
    cellEl.dataset.value = value;

    this.__addNewMove__(value, coords);
    return this.__checkForAxiesMatch__(value);
  }

  resetAllStats() {
    this.state = {
      gameBoard: createBoardTemplate(this.boardSize),
      isX: true,
      isEnded: false,
      movesCount: 0,
      score: {
        x: 0,
        o: 0,
        draw: 0,
      },
    };

    this.__renderHTML__();
  }

  __renderHTML__() {
    Object.keys(this.state.score).forEach(this.__renderScoreHTML__.bind(this));
    this.__renderBoardHTML__(this.boardSize);
    this.__setTurnIndicatorHTML__();
  }

  __addNewMove__(cellValue = "", coords = []) {
    this.state.gameBoard[coords[0]][coords[1]] = cellValue;
    this.state.isX = !this.state.isX;
    this.state.movesCount += 1;
    this.__setTurnIndicatorHTML__();
  }

  __checkForAxiesMatch__(cellValue = "") {
    const { isMatch, axis } = evalBoardAxies(this.state.gameBoard, cellValue);
    this.state.isEnded = isMatch || this.state.movesCount === this.totalCells;

    if (!this.state.isEnded) return false;

    isMatch && this.__decorateWinnerCells__(axis);

    const key = isMatch ? cellValue : "draw";

    this.__updateScore__(key);
    this.__finalizeTurn__(key);

    return true;
  }

  __resetTurnState__() {
    this.state.isEnded = false;
    this.state.isX = true;
    this.state.movesCount = 0;
    this.state.gameBoard = createBoardTemplate(this.boardSize);
  }

  __updateScore__(key = "") {
    this.state.score[key] += 1;
  }

  __finalizeTurn__() {
    let resetDelay = 250,
      accumDelay = this.animationDuration * this.totalCells;

    resetDelay += (accumDelay / (this.boardSize * 0.1)) * 80 + 500;

    this.__resetTurnState__();
    setTimeout(this.__showDispelBoardAnimation__.bind(this), resetDelay);
    setTimeout(() => this.__renderHTML__(), (resetDelay += accumDelay * 150));
  }

  __renderBoardHTML__(size = 0) {
    const buttons = createBoardTemplate(size).map((row, ri) => {
      return row.map((_, ci) => this.__createBoardCellHTML__(ri, ci, size));
    });

    this.__boardEl__.innerHTML = "";
    this.__boardEl__.dataset.boardsize = size;
    this.__boardEl__.style.gridTemplateColumns = "1fr ".repeat(size);

    buttons.flat(1).forEach((btn, i) => {
      btn.style.animationDelay = `${(i + 1) / 25}s`;
      this.__boardEl__.appendChild(btn);
    });
  }

  __createHTMLWrapper__(classes = [], datasets = []) {
    const container = document.createElement("div");
    container.classList.add(...classes);
    datasets.forEach((ds) => (container.dataset[ds.key] = ds.value));

    return container;
  }

  __createScoreHTML__() {
    const div = this.__createHTMLWrapper__(["score-container"]);
    const players = [PLAYERS.X, "draw", PLAYERS.O];

    players.forEach((p) => {
      const pContainer = this.__createHTMLWrapper__(["player", `player-${p}`]);
      const pKey = this.__createHTMLWrapper__(["player-key"]);
      const pScore = this.__createHTMLWrapper__(
        ["player-score"],
        [{ key: "id", value: p }]
      );
      pKey.textContent = p.toUpperCase();
      pScore.textContent = `0${p !== "draw" ? " Wins" : ""}`;

      pContainer.innerHTML += pKey.outerHTML + pScore.outerHTML;

      div.innerHTML += pContainer.outerHTML;
    });

    return div;
  }

  __createActionsHTML__() {
    const container = this.__createHTMLWrapper__(["board-actions-container"]);
    const resetBtn = document.createElement("button");

    resetBtn.dataset.id = "reset-btn";
    resetBtn.textContent = "Reset";
    resetBtn.classList.add("reset-btn");

    container.appendChild(resetBtn);

    const turnIndicator = this.__createHTMLWrapper__([
      "turn-indicator-container",
    ]);
    turnIndicator.innerHTML += `
      Current turn:
          <div class="turn-indicator">
            <span class="player-x-indicator">x</span>
            <span class="player-o-indicator">o</span>
          </div>
        </div>
    `;

    container.appendChild(turnIndicator);

    return container;
  }

  __createBoardCellHTML__(rowId = 0, colId = 0, boardSize = 0) {
    const btn = document.createElement("button");

    const classes = classNames({
      "board-cell-bottom": rowId === boardSize - 1,
      "board-cell-left": colId === 0,
      "board-cell-right": colId === boardSize - 1,
      "board-cell-top": rowId === 0,
      "board-cell": colId === 0 || colId === boardSize - 1,
    });
    const boardWidth = this.__boardEl__.getBoundingClientRect().width * 0.5;

    btn.style.fontSize = `${Math.floor(boardWidth / boardSize)}px`;
    btn.classList.add("board-cell");
    btn.classList.add("show-animation");
    classes.length && btn.classList.add(...classes);
    btn.dataset.rowid = rowId;
    btn.dataset.colid = colId;
    btn.dataset.value = "";
    btn.style.animationDuration = `${this.animationDuration}s`;
    btn.style.transition = `${this.animationDuration}s background-color`;

    return btn;
  }

  __showDispelBoardAnimation__() {
    return this.__boardEl__
      .querySelectorAll(".board-cell")
      .forEach((btn, i) => {
        btn.classList.remove("show-animation");
        btn.classList.add("dispel-animation");
      });
  }

  __decorateWinnerCells__(axis = []) {
    axis.forEach((p, i) => {
      const btn = this.__boardEl__.querySelector(
        `[data-rowid='${p[0]}'][data-colid='${p[1]}']`
      );
      btn.classList.add("board-cell-match");
      btn.style.transitionDelay = `${(i + 1) / 10}s`;
    });
  }

  __renderScoreHTML__(winnerCellKey = "") {
    const suffix = winnerCellKey !== "draw" ? " Wins" : "";
    const el = this.__scoreEl__.querySelector(`[data-id="${winnerCellKey}"]`);
    el && (el.textContent = `${this.state.score[winnerCellKey]}${suffix}`);
  }

  __setTurnIndicatorHTML__() {
    this.__actionsEl__
      .querySelector(`.player-${this.state.isX ? "x" : "o"}-indicator`)
      .classList.add("active");

    this.__actionsEl__
      .querySelector(`.player-${!this.state.isX ? "x" : "o"}-indicator`)
      .classList.remove("active");
  }

  __getCellCoords__(cellEl) {
    const { rowid, colid } = cellEl.dataset;

    return [Number(rowid), Number(colid)];
  }

  static promptBoardSize() {
    const availableSizes = [3, 5, 7, 9];

    const welcomeMsg = `Please type one of the following board sizes: \n> ${availableSizes.join(
      "\n> "
    )}`;
    let size = 3;

    if (!availableSizes.includes(size)) size = availableSizes[0];

    return size;
  }
}

export { TicTacToe };
