import { TicTacToe } from "./tic-tac-toe.js";

const PROD_SERVER_URL = "https://tic-tac-toe-angel.herokuapp.com/";
const DEV_SERVER_URL = "http://localhost:3000";

window.mobileAndTabletCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

const EVENTS = {
  ALLOW_WRITE: "allow-write",
  BOARD_CLICK: "board-click",
  JOIN_ROOM: "join-room",
  MATCH_READY: "match-ready",
  PLAYER_DISCONNECT: "player-disconnect",
  QUIT: "quit",
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

        if (isFinalized) {
          const isFirstDraw = !this.lastWinner && this.state.isDraw;

          if (
            (this.isWinner && this.state.isDraw) ||
            this.isWinner ||
            isFirstDraw
          ) {
            this.enableBoardWriting();
          }

          this.resetTurnState();
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

        if (isFinalized) {
          if (!this.isWinner) this.disableBoardWriting();

          if (this.state.isDraw && this.isWinner) this.enableBoardWriting();

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
        this.removeDisconnectOnTabChangeHandler();
      }
    }, 10000);
  }

  onDisconnect(callback) {
    if (!this.socket) return;

    if (window.mobileAndTabletCheck()) this.disconnectOnTabChange();

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
      this.removeDisconnectOnTabChangeHandler();

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
  get isWinner() {
    return this.playerKey === this.lastWinner;
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
  handleVisibilityChange() {
    if (document.visibilityState === "hidden") location.reload();
  }

  /**
   * @private
   */
  disconnectOnTabChange() {
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  /**
   * @private
   */
  removeDisconnectOnTabChangeHandler() {
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }

  /**
   * @private
   */
  showMessage(msg = "", delay = 1000) {
    setTimeout(() => alert(msg), delay);
  }
}

export { OnlineTicTacToe };
