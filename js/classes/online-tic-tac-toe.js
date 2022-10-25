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
  RECOVER_STATE: "recover-state",
  RESET: "reset",
  QUIT: "quit",
  MATCH_READY: "match-ready",
};

class OnlineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);

    try {
      this.socket = io(DEV_SERVER_URL);
    } catch {
      this.socket = null;
    }
  }

  init(onUnableToConnect = () => {}) {
    this.allowBoardWriting = false;
    this.render();

    this.showOverlay("Joining to room...");

    this.socket?.on("connect", () => {
      this.hideOverlay();
      this.showOverlay("Waiting for the other party...");
      console.log(`Connected to room: ${this.roomid}.`);

      this.onBoardClick(({ cellValue, coords }) => {
        if (!this.allowBoardWriting) return;

        this.socket.emit(
          EVENTS.BOARD_CLICK,
          this.getEventPayload({ cellValue, coords })
        );

        this.writeBoardCell(cellValue, coords);
        this.allowBoardWriting = false;
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

        this.writeBoardCell(cellValue, coords);
        this.allowBoardWriting = true;
      });

      this.socket.on(EVENTS.TWO_PLAYERS_JOIN, ({ socketId }) => {
        this.allowBoardWriting = true;

        console.log(`Player ${socketId} joined the room.`);
        this.hideOverlay();

        this.socket.emit(
          EVENTS.MATCH_READY,
          this.getEventPayload({ state: this.state })
        );

        this.socket.emit(
          EVENTS.RECOVER_STATE,
          this.getEventPayload({ state: this.state })
        );
      });

      this.socket.on(EVENTS.RECOVER_STATE, (payload) => {
        this.setState(payload.state);
        this.renderHTML(payload);
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
        this.showMessage("Unable to connect server, please try again.");
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
      this.allowBoardWriting = false;
      this.destroy();
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
  showMessage(msg = "") {
    setTimeout(() => alert(msg), 1000);
  }
}

export { OnlineTicTacToe };
