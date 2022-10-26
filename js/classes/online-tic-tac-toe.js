import { TicTacToe } from "./tic-tac-toe.js";

const PROD_SERVER_URL = "https://tic-tac-toe-angel.herokuapp.com/";
const DEV_SERVER_URL = "http://localhost:3000";

const EVENTS = {
  BOARD_CLICK: "board-click",
  JOIN_ROOM: "join-room",
  ALLOW_WRITE: "allow-write",
  UNABLE_JOIN: "unable-join",
  TWO_PLAYERS_JOIN: "two-players-join",
  PLAYER_DISCONNECT: "player-disconnect",
  RESET: "reset",
  QUIT: "quit",
  MATCH_READY: "match-ready",
};

class OnlineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
    this.playerKey = null;
    this.isRoomJoined = false;
    this.isRemoteJoined = false;

    try {
      this.socket = io(PROD_SERVER_URL);
    } catch {
      this.socket = null;
    }
  }

  init(onUnableToConnect = () => {}) {
    this.disableBoardWriting();
    this.render();

    this.showOverlay("Joining to room...");

    this.socket?.on("connect", () => {
      this.isRoomJoined = true;
      this.hideOverlay();
      this.showOverlay("Waiting for the other party...");
      console.log(`Connected to room: ${this.roomid}.`);

      this.onBoardClick(({ cellValue, coords }) => {
        this.socket.emit(
          EVENTS.BOARD_CLICK,
          this.getEventPayload({ cellValue, coords })
        );

        if (!this.playerKey) this.playerKey = cellValue;

        const isDone = this.writeBoardCell(cellValue, coords);

        if (isDone && this.playerKey === this.lastWinner) {
          return this.enableBoardWriting();
        }

        this.disableBoardWriting();
      });

      this.onReset(() => {
        this.resetAllStats();
        this.socket.emit(EVENTS.RESET, this.getEventPayload());
      });

      this.socket.emit(
        "join-room",
        this.getEventPayload({ roomid: this.roomid })
      );

      this.socket.on(EVENTS.BOARD_CLICK, (payload) => {
        const { cellValue, coords } = payload;

        const isDone = this.writeBoardCell(cellValue, coords);

        if (isDone && this.playerKey !== this.lastWinner) {
          return this.disableBoardWriting();
        }

        this.enableBoardWriting();
      });

      this.socket.on(EVENTS.TWO_PLAYERS_JOIN, ({ socketId }) => {
        this.hideOverlay();
        this.enableBoardWriting();
        console.log(`Player ${socketId} joined the room.`);
        this.isRemoteJoined = true;

        this.socket.emit(
          EVENTS.MATCH_READY,
          this.getEventPayload({ state: this.state })
        );
      });

      this.socket.on(EVENTS.UNABLE_JOIN, ({ roomid }) => {
        this.showMessage(
          `Unable to join room: ${roomid}. \nRoom is already full.`
        );

        this.socket.disconnect();

        console.error(
          `Unable to join room: ${this.roomid}. Room is already full.`
        );
      });

      this.socket.on(EVENTS.RESET, () => this.resetAllStats());

      this.socket.on(EVENTS.MATCH_READY, () => this.hideOverlay());
    });

    setTimeout(() => {
      if (!this.socket?.connected && !this.isDestroyed) {
        this.showMessage("Unable to connect server, please try again.", 250);
        this.destroy();
        this.hideOverlay();
        this.socket?.disconnect();
        onUnableToConnect();
      }
    }, 10000);
  }

  onDisconnect(callback) {
    if (!this.socket) return;

    this.socket.on("disconnect", () => {
      if (this.isRoomJoined) {
        const msg = this.isRemoteJoined
          ? "An error connection has ocurred. \nYou has been disconnected from room."
          : "An connection error has ocurred while waiting the other party.";

        this.showMessage(msg, 250);
      }

      this.hideOverlay();
      this.destroy();
      this.socket.disconnect();
      callback && callback();

      console.warn("You has been disconnected from server.");
    });

    this.socket.on(EVENTS.PLAYER_DISCONNECT, ({ socketId }) => {
      this.socket.disconnect();
      console.warn(`Player ${socketId} left the room.`);
      this.showMessage("The other party has left the room.");
    });

    this.socket.on(EVENTS.QUIT, () => {
      this.socket.disconnect();
      this.showMessage("The other party has quit the game.");
    });
  }

  onQuit(callback) {
    super.onQuit(() => {
      this.isDestroyed = true;

      this.socket?.emit(EVENTS.QUIT, this.getEventPayload());
      this.socket?.disconnect();

      callback && callback();
    });
  }

  /**
   * @private
   */
  getEventPayload(payload = {}) {
    return {
      roomid: this.roomid,
      ...payload,
    };
  }

  /**
   * @private
   */
  showMessage(msg = "", delay = 1000) {
    setTimeout(() => alert(msg), delay);
  }
}

export { OnlineTicTacToe };
