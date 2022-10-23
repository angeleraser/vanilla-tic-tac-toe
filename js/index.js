import { OnlineTicTacToe } from "./classes/online-tic-tac-toe.js";
import { OfflineTicTacToe } from "./classes/offline-tic-tac-toe.js";

const TicTacToeClient = new OnlineTicTacToe({
  boardSize: 3,
  animationDuration: 0.3,
  renderRoot: document.getElementById("app"),
  roomid: "tic-tac-toe",
  players: 2,
});

TicTacToeClient.init();
