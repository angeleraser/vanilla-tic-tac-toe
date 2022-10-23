import { TicTacToe } from "./tic-tac-toe.js";

class OfflineTicTacToe extends TicTacToe {
  constructor(options = { players: 1 }) {
    super(options);
    this.preventPlayerClick = false;
    this.playersCount = options.players || 1;
  }

  init() {
    this.render();

    this.onBoardClick(({ cellValue, coords }) => {
      const disableCPU =
        !this.preventPlayerClick && this.writeBoardCell(cellValue, coords);

      if (!disableCPU && this.playersCount === 1) this.writeCPUCell();
    });

    this.onResetBtnClick(this.resetAllStats.bind(this));
  }

  getRandomCell() {
    const cells = Array.from(
      this.boardEl.querySelectorAll(".board-cell")
    ).filter((cell) => !cell.dataset.value);

    const randomIndex = Math.floor(cells.length * Math.random());
    return cells[randomIndex];
  }

  writeCPUCell() {
    this.preventPlayerClick = true;

    setTimeout(() => {
      const value = this.state.isX ? this.PLAYERS.X : this.PLAYERS.O;
      const coords = this.getCellCoords(this.getRandomCell());

      this.writeBoardCell(value, coords);
      this.preventPlayerClick = false;
    }, 1000);
  }
}

export { OfflineTicTacToe };
