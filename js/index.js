import { LocalTicTacToe } from "./classes/local-tic-tac-toe.js";

const ticTacToe = new LocalTicTacToe({
  boardSize: 3,
  animationDuration: 0.3,
  renderRoot: document.getElementById("app"),
  players: 2,
});

ticTacToe.init();

console.log(ticTacToe);
