import { TicTacToe } from "./tic-tac-toe.js";

class LocalTicTacToe extends TicTacToe {
  constructor(options = { players: 1 }) {
    super(options);
    this.__preventPlayerClick__ = false;
    this.players = options.players || 1;
  }

  init() {
    this.render();

    this.onBoardClick(({ cellValue, coords }) => {
      const disableCPU =
        !this.__preventPlayerClick__ && this.writeBoardCell(cellValue, coords);

      if (!disableCPU && this.players === 1) this.__writeCPUCell__();
    });
  }

  __getRandomCell__() {
    const cells = Array.from(
      this.__boardEl__.querySelectorAll(".board-cell")
    ).filter((cell) => !cell.dataset.value);

    const randomIndex = Math.floor(cells.length * Math.random());
    return cells[randomIndex];
  }

  __writeCPUCell__() {
    this.__preventPlayerClick__ = true;

    setTimeout(() => {
      const value = this.state.isX ? this.__PLAYERS__.X : this.__PLAYERS__.O;
      const coords = this.__getCellCoords__(this.__getRandomCell__());

      this.writeBoardCell(value, coords);
      this.__preventPlayerClick__ = false;
    }, 1000);
  }
}

export { LocalTicTacToe };
