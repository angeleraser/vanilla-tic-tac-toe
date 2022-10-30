import { TicTacToe } from "./tic-tac-toe.js";

class OfflineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
  }

  init() {
    this.render();

    this.onBoardClick(({ cellValue, coords }) => {
      const isDone = this.writeBoardCell(cellValue, coords);

      if (!isDone && this.playersCount === 1) return this.writeCPUCell();

      isDone && this.resetTurnState();
    });
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

    const delay = 1500;

    setTimeout(() => {
      const isEnded = this.writeBoardCell(
        this.PLAYERS.O,
        this.getCellCoords(this.getRandomCell())
      );

      if (isEnded && this.lastWinner === this.PLAYERS.O) {
        return setTimeout(this.writeCPUCell.bind(this), delay);
      }

      this.enableBoardWriting();
    }, delay);
  }
}

export { OfflineTicTacToe };
