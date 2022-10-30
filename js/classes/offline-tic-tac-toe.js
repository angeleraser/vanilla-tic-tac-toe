import { TicTacToe } from "./tic-tac-toe.js";

class OfflineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
  }

  init() {
    this.render();

    this.onBoardClick(({ coords, value }) => {
      const isFinalized = this.writeBoardCell({
        value,
        coords,
      });

      if (!isFinalized && this.playersCount === 1) this.writeCPUCell();

      isFinalized && this.resetTurnState();
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

    const cpuKey = this.PLAYERS_KEYS.O;
    const delay = 1500;

    setTimeout(() => {
      const isFinalized = this.writeBoardCell({
        value: cpuKey,
        coords: this.getCellCoords(this.getRandomCell()),
      });

      if (isFinalized && this.lastWinner === cpuKey) {
        this.resetTurnState();
        return setTimeout(this.writeCPUCell.bind(this), delay);
      }

      this.enableBoardWriting();
    }, delay);
  }
}

export { OfflineTicTacToe };
