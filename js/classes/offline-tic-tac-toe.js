import { TicTacToe } from "./tic-tac-toe.js";

class OfflineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
  }

  init() {
    this.render();

    this.onBoardClick(({ cellValue, coords }) => {
      const enableCPU = !this.writeBoardCell(cellValue, coords);

      if (enableCPU && this.playersCount === 1) this.writeCPUCell();
    });

    this.onReset(this.resetAllStats.bind(this));
  }

  /**
   * @private
   */
  getRandomCell() {
    const cells = Array.from(
      this.boardEl.querySelectorAll(".board-cell")
    ).filter((cell) => !cell.dataset.value);

    const randomIndex = Math.floor(cells.length * Math.random());
    return cells[randomIndex];
  }

  /**
   * @private
   */
  writeCPUCell() {
    this.disableBoardWriting();

    setTimeout(() => {
      const value = this.state.isX ? this.PLAYERS.X : this.PLAYERS.O;
      const coords = this.getCellCoords(this.getRandomCell());

      this.writeBoardCell(value, coords);
      this.enableBoardWriting();
    }, 1500);
  }
}

export { OfflineTicTacToe };
