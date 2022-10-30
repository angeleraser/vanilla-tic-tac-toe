import { TicTacToe, TicTacToePlayer } from "./tic-tac-toe.js";

class OfflineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
  }

  init() {
    this.joinPlayer(
      new TicTacToePlayer({
        name: "Player",
        key: "x",
        role: this.PLAYERS_ROLES.HOME,
      })
    );

    this.joinPlayer(
      new TicTacToePlayer({
        name: "CPU",
        key: "o",
        role: this.PLAYERS_ROLES.VISITOR,
      })
    );

    this.render();

    this.onBoardClick(({ player, coords }) => {
      const isFinalized = this.writeBoardCell({
        value: player.key,
        coords,
        player,
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

    const cpuPlayer = this.players.visitor;
    const delay = 1500;

    setTimeout(() => {
      const isFinalized = this.writeBoardCell({
        value: cpuPlayer.key,
        coords: this.getCellCoords(this.getRandomCell()),
        player: cpuPlayer,
      });

      if (isFinalized && this.lastWinner === cpuPlayer.role) {
        this.resetTurnState();
        return setTimeout(this.writeCPUCell.bind(this), delay);
      }

      this.enableBoardWriting();
    }, delay);
  }
}

export { OfflineTicTacToe };
