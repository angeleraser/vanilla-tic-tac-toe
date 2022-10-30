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

class TicTacToe {
  constructor(
    options = {
      boardSize: 0,
      animationDuration: 0,
      renderRoot: null,
      roomid: "",
    }
  ) {
    this.allowBoardWriting = true;
    this.animationDuration = options.animationDuration;
    this.boardSize = options.boardSize;
    this.playersCount = options.players || 1;
    this.roomid = options.roomid;
    this.totalCells = Math.pow(options.boardSize, 2);
    this.actionsEl = this.createActionsHTML();
    this.boardEl = this.createHTMLWrapper(["board-container"]);
    this.overlayEl = this.createHTMLWrapper(["board-loading-overlay"]);
    this.renderRoot = options.renderRoot;
    this.PLAYERS = { X: "x", O: "o" };
    this.scoreEl = this.createScoreHTML();
    this.isDestroyed = false;
    this.lastWinner = null;
    this.isShowOverlay = false;

    this.state = {
      gameBoard: createBoardTemplate(options.boardSize),
      isX: true,
      isEnded: false,
      isDraw: false,
      movesCount: 0,
      score: {
        x: 0,
        o: 0,
        draw: 0,
      },
    };
  }

  /**
   * @public
   */
  init() {
    throw new Error("Method not implemented.");
  }

  /**
   * @public
   */
  render() {
    this.renderRoot.appendChild(this.scoreEl);
    this.renderRoot.appendChild(this.boardEl);
    this.renderRoot.appendChild(this.actionsEl);

    this.renderHTML();
  }

  /**
   * @public
   */
  destroy() {
    if (this.isDestroyed) return;

    this.renderRoot.removeChild(this.scoreEl);
    this.renderRoot.removeChild(this.boardEl);
    this.renderRoot.removeChild(this.actionsEl);
    this.resetAllStats();
    this.isDestroyed = true;
  }

  /**
   * @public
   */
  onBoardClick(callback = (e) => {}) {
    this.boardEl.addEventListener("click", (e) => {
      const { target: cell } = e;

      const isBoardDisabled =
        !this.allowBoardWriting ||
        this.boardEl.className.includes("board-disabled") ||
        cell.style.cursor === "not-allowed";

      if (
        cell.tagName !== "BUTTON" ||
        this.state.isEnded ||
        cell.dataset.value ||
        isBoardDisabled
      ) {
        return e.preventDefault();
      }

      void callback({
        coords: this.getCellCoords(cell),
        cellValue: this.state.isX ? this.PLAYERS.X : this.PLAYERS.O,
      });
    });
  }

  /**
   * @public
   */
  onReset(callback = (e) => {}) {
    const resetBtn = this.actionsEl.querySelector('[data-id="reset-btn"]');
    resetBtn?.addEventListener("click", callback);
  }

  /**
   * @public
   */
  onQuit(callback = (e) => {}) {
    const quitBtn = this.actionsEl.querySelector('[data-id="quit-btn"]');

    quitBtn?.addEventListener("click", ({ target }) => {
      !this.isDestroyed && this.destroy();
      void callback(target);
    });
  }

  /**
   * @public
   */
  writeBoardCell(value = "", coords = []) {
    const cellEl = this.boardEl.querySelector(`[data-coords="${coords}"]`);

    if (!cellEl) return;

    cellEl.textContent = value;
    cellEl.dataset.value = value;

    this.addNewMove(value, coords);
    return this.checkForAxiesMatch(value);
  }

  /**
   * @public
   */
  resetAllStats() {
    this.setState({
      gameBoard: createBoardTemplate(this.boardSize),
      isX: true,
      isEnded: false,
      movesCount: 0,
      score: {
        x: 0,
        o: 0,
        draw: 0,
      },
      isDraw: false,
    });

    this.renderHTML();
  }

  /**
   * @public
   */
  setState(data = {}) {
    this.state = data;
  }

  /**
   * @public
   */
  disableBoardWriting() {
    this.allowBoardWriting = false;
    this.disableBoardHTML();
  }

  /**
   * @public
   */
  enableBoardWriting() {
    this.allowBoardWriting = true;
    this.enableBoardHTML();
  }

  /**
   * @public
   */
  renderHTML() {
    Object.keys(this.state.score).forEach(this.renderScoreHTML.bind(this));
    this.renderBoardHTML(this.boardSize);
    this.setTurnIndicatorHTML();
  }

  showOverlay(msg = "") {
    this.overlayEl.textContent = msg;
    this.renderRoot.appendChild(this.overlayEl);
    this.isShowOverlay = true;
  }

  hideOverlay() {
    this.overlayEl.textContent = "";
    this.isShowOverlay && this.renderRoot.removeChild(this.overlayEl);
    this.isShowOverlay = false;
  }

  /**
   * @private
   */
  addNewMove(cellValue = "", coords = []) {
    this.state.gameBoard[coords[0]][coords[1]] = cellValue;
    this.state.isX = !this.state.isX;
    this.state.movesCount += 1;
    this.setTurnIndicatorHTML();
  }

  /**
   * @private
   */
  checkForAxiesMatch(cellValue = "") {
    const { isMatch, axis } = evalBoardAxies(this.state.gameBoard, cellValue);
    this.state.isEnded = isMatch || this.state.movesCount === this.totalCells;

    if (!this.state.isEnded) return false;

    isMatch && this.decorateWinnerCells(axis);
    isMatch && (this.lastWinner = cellValue);
    this.state.isDraw = !isMatch;

    const key = isMatch ? cellValue : "draw";
    this.updateScore(key);
    this.finalizeTurn(key);

    return true;
  }

  resetTurnState() {
    this.state.isEnded = false;
    this.state.isX =
      this.lastWinner === this.PLAYERS.X || this.lastWinner === null;
    this.state.movesCount = 0;
    this.state.gameBoard = createBoardTemplate(this.boardSize);
    this.state.isDraw = false;
  }

  /**
   * @private
   */
  updateScore(key = "") {
    this.state.score[key] += 1;
  }

  /**
   * @private
   */
  finalizeTurn() {
    let resetDelay = 250,
      accumDelay = this.animationDuration * this.totalCells;

    resetDelay += (accumDelay / (this.boardSize * 0.1)) * 80 + 500;

    this.disableBoardHTML();
    const wasEnabled = this.allowBoardWriting;
    setTimeout(this.showDispelBoardAnimation.bind(this), resetDelay);

    setTimeout(() => {
      this.renderHTML();
      wasEnabled && this.enableBoardHTML();
    }, (resetDelay += accumDelay * 150));
  }

  /**
   * @private
   */
  renderBoardHTML(size = 0) {
    const buttons = createBoardTemplate(size).map((row, ri) => {
      return row.map((_, ci) => this.createBoardCellHTML(ri, ci, size));
    });

    this.boardEl.innerHTML = "";
    this.boardEl.dataset.boardsize = size;
    this.boardEl.style.gridTemplateColumns = "1fr ".repeat(size);

    buttons.flat(1).forEach((btn, i) => {
      btn.style.animationDelay = `${(i + 1) / 25}s`;
      this.boardEl.appendChild(btn);
    });
  }

  /**
   * @private
   */
  createHTMLWrapper(classes = [], datasets = []) {
    const container = document.createElement("div");
    container.classList.add(...classes);
    datasets.forEach((ds) => (container.dataset[ds.key] = ds.value));

    return container;
  }

  /**
   * @private
   */
  createScoreHTML() {
    const div = this.createHTMLWrapper(["score-container"]);
    const players = [this.PLAYERS.X, "draw", this.PLAYERS.O];

    players.forEach((p) => {
      const pContainer = this.createHTMLWrapper(["player", `player-${p}`]);
      const pKey = this.createHTMLWrapper(["player-key"]);
      const pScore = this.createHTMLWrapper(
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

  /**
   * @private
   */
  createActionsHTML() {
    const container = this.createHTMLWrapper(["board-actions-container"]);
    const quitBtn = document.createElement("button");

    quitBtn.dataset.id = "quit-btn";
    quitBtn.textContent = "Quit";
    quitBtn.classList.add("reset-btn");
    container.appendChild(quitBtn);

    const turnIndicator = this.createHTMLWrapper(["turn-indicator-container"]);
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

  /**
   * @private
   */
  createBoardCellHTML(rowId = 0, colId = 0, boardSize = 0) {
    const btn = document.createElement("button");

    const classes = classNames({
      "board-cell-bottom": rowId === boardSize - 1,
      "board-cell-left": colId === 0,
      "board-cell-right": colId === boardSize - 1,
      "board-cell-top": rowId === 0,
    });

    const boardHeight =
      (this.boardEl.getBoundingClientRect().height / this.boardSize) * 0.2;
    const boardWidth =
      (this.boardEl.getBoundingClientRect().width / this.boardSize) * 0.2;

    btn.style.fontSize = `${Math.floor(boardHeight + boardWidth)}px`;
    btn.classList.add("board-cell");
    btn.classList.add("cell-fade-in");
    classes.length && btn.classList.add(...classes);
    btn.dataset.coords = [rowId, colId];
    btn.dataset.value = this.state.gameBoard[rowId][colId] || "";
    btn.textContent = this.state.gameBoard[rowId][colId] || "";
    btn.style.animationDuration = `${this.animationDuration}s`;
    btn.style.transition = `${this.animationDuration}s background-color`;

    return btn;
  }

  /**
   * @private
   */
  showDispelBoardAnimation() {
    const cells = this.boardEl.querySelectorAll(".board-cell");

    cells.forEach((btn) => {
      btn.classList.remove("cell-fade-in");
      btn.classList.add("cell-fade-out");
    });
  }

  /**
   * @private
   */
  enableBoardHTML() {
    this.boardEl.classList.remove("board-disabled");
  }

  /**
   * @private
   */
  disableBoardHTML() {
    this.boardEl.classList.add("board-disabled");
  }

  /**
   * @private
   */
  decorateWinnerCells(axis = []) {
    axis.forEach((coords, i) => {
      const btn = this.boardEl.querySelector(`[data-coords='${coords}']`);
      btn.classList.add("board-cell-match");
      btn.style.transitionDelay = `${(i + 1) / 10}s`;
    });
  }

  /**
   * @private
   */
  renderScoreHTML(label = "") {
    const suffix = label !== "draw" ? " Wins" : "";
    const el = this.scoreEl.querySelector(`[data-id="${label}"]`);
    el && (el.textContent = `${this.state.score[label]}${suffix}`);
  }

  /**
   * @private
   */
  setTurnIndicatorHTML() {
    this.actionsEl
      .querySelector(
        `.player-${this.state.isX ? this.PLAYERS.X : this.PLAYERS.O}-indicator`
      )
      .classList.add("active");

    this.actionsEl
      .querySelector(
        `.player-${!this.state.isX ? this.PLAYERS.X : this.PLAYERS.O}-indicator`
      )
      .classList.remove("active");
  }

  /**
   * @private
   */
  getCellCoords(cellEl) {
    const { coords } = cellEl.dataset;
    return coords.split(",").map((v) => Number(v));
  }
}

export { TicTacToe };
