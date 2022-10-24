import { OnlineTicTacToe } from "./classes/online-tic-tac-toe.js";
import { OfflineTicTacToe } from "./classes/offline-tic-tac-toe.js";

const TicTacToeClient = new OfflineTicTacToe({
  animationDuration: 0.3,
  boardSize: 3,
  players: 2,
  renderRoot: document.getElementById("app"),
  roomid: "tic-tac-toe",
});

TicTacToeClient.init();

console.log(TicTacToeClient);
