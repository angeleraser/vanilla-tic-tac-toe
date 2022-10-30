import { TicTacToe } from "./tic-tac-toe.js";

const PROD_SERVER_URL = "https://tic-tac-toe-angel.herokuapp.com/";
const DEV_SERVER_URL = "http://localhost:3000";

const EVENTS = {
  ALLOW_WRITE: "allow-write",
  BOARD_CLICK: "board-click",
  JOIN_ROOM: "join-room",
  MATCH_READY: "match-ready",
  PLAYER_DISCONNECT: "player-disconnect",
  QUIT: "quit",
  RESET: "reset",
  TWO_PLAYERS_JOIN: "two-players-join",
  UNABLE_JOIN: "unable-join",
};

class OnlineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
    this.playerKey = null;
    this.isRoomJoined = false;
    this.isRemoteJoined = false;

    try {
      this.socket = io(DEV_SERVER_URL);
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

      this.onBoardClick(({ value, coords }) => {
        this.disableBoardWriting();

        this.socket.emit(
          EVENTS.BOARD_CLICK,
          this.getEventPayload({
            cellValue: value,
            coords,
          })
        );

        if (!this.playerKey) this.playerKey = value;

        const isFinalized = this.writeBoardCell({
          value,
          coords,
        });
        const hasWinnerKey = this.lastWinner === this.playerKey;

        if (isFinalized) {
          if ((hasWinnerKey && this.state.isDraw) || hasWinnerKey) {
            this.enableBoardWriting();
          }

          isFinalized && this.resetTurnState();
        }
      });

      this.socket.emit(
        "join-room",
        this.getEventPayload({ roomid: this.roomid })
      );

      this.socket.on(EVENTS.BOARD_CLICK, (payload) => {
        this.enableBoardWriting();

        const { cellValue, coords } = payload;

        const isFinalized = this.writeBoardCell({
          value: cellValue,
          coords,
        });
        const hasWinnerKey = this.lastWinner === this.playerKey;

        if (isFinalized) {
          if (!hasWinnerKey) this.disableBoardWriting();

          if (this.state.isDraw && hasWinnerKey) this.enableBoardWriting();

          this.resetTurnState();
        }
      });

      this.socket.on(EVENTS.TWO_PLAYERS_JOIN, ({ socketId }) => {
        this.hideOverlay();
        this.enableBoardWriting();
        console.log(`Player ${socketId} joined the room.`);
        this.isRemoteJoined = true;

        this.socket.emit(EVENTS.MATCH_READY, this.getEventPayload());
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

      this.socket.on(EVENTS.MATCH_READY, () => {
        this.hideOverlay();
        this.isRemoteJoined = true;
      });
    });

    setTimeout(() => {
      if (!this.socket?.connected && !this.isDestroyed) {
        this.showMessage("Unable to connect server, please try again.", 250);
        this.hideOverlay();
        this.destroy();
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
          ? "You has been disconnected from room."
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
