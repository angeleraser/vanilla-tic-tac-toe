import { TicTacToe } from "./tic-tac-toe.js";

const EVENTS = {
  BOARD_CLICK: "board-click",
  JOIN_ROOM: "join-room",
  ALLOW_WRITE: "allow-write",
  UNABLE_JOIN: "unable-join",
  TWO_PLAYERS_JOIN: "two-players-join",
  PLAYER_DISCONNECT: "player-disconnect",
  RECOVER_STATE: "recover-state",
};

class OnlineTicTacToe extends TicTacToe {
  constructor(options) {
    super(options);
    this.socket = io("http://localhost:3000/");
    this.allowBoardWriting = false;
    this.id = this.socket.id;
    this.isRemoteOnline = false;
  }

  init() {
    this.render();

    this.onBoardClick(({ cellValue, coords }) => {
      if (!this.allowBoardWriting) return;

      this.socket.emit(
        EVENTS.BOARD_CLICK,
        this.getEventPayload({ cellValue, coords })
      );

      this.writeBoardCell(cellValue, coords);

      if (!this.getCurrentPlayer()) {
        localStorage.setItem("CURRENT_PLAYER", cellValue);
      }

      this.allowBoardWriting = false;
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
      this.isRemoteOnline = true;

      console.log(`Player ${socketId} joined the room.`);

      this.socket.emit(
        EVENTS.RECOVER_STATE,
        this.getEventPayload({ state: this.state })
      );
    });

    this.socket.on(EVENTS.PLAYER_DISCONNECT, ({ socketId }) => {
      this.allowBoardWriting = false;
      this.isRemoteOnline = false;

      console.warn(`Player ${socketId} left the room.`);

      // alert(
      //   "The other party has left the room \nYou will be disconnected in 30 sec if the player does not join..."
      // );

      setTimeout(() => {
        if (!this.isRemoteOnline) this.socket.disconnect();
      }, 30000);
    });

    this.socket.on(EVENTS.RECOVER_STATE, (payload) => {
      this.setState(payload.state);

      this.allowBoardWriting =
        this.getNextPlayerKey() === localStorage.getItem("CURRENT_PLAYER");

      setTimeout(() => this.renderHTML(payload), 0);
    });

    this.socket.on(EVENTS.UNABLE_JOIN, () => {
      alert("Unable to join room: " + this.roomid);
    });
  }

  getEventPayload(payload = {}) {
    return {
      roomid: this.roomid,
      ...payload,
    };
  }

  getNextPlayerKey() {
    return this.state.isX ? this.PLAYERS.X : this.PLAYERS.O;
  }

  getCurrentPlayer() {
    return localStorage.getItem("CURRENT_PLAYER");
  }
}

export { OnlineTicTacToe };
