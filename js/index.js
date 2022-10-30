import { OnlineTicTacToe } from "./classes/online-tic-tac-toe.js";
import { OfflineTicTacToe } from "./classes/offline-tic-tac-toe.js";

const backBtn = document.getElementById("back-btn");
const mainScreenEl = document.getElementById("main-screen");
const onePlayerCpuBtn = document.getElementById("1-player-cpu");
const roomJoinScreenEl = document.getElementById("join-room-screen");
const roomNameForm = document.getElementById("room-name-form");
const roomNameInput = document.getElementById("room-name-input");
const rootEl = document.getElementById("app");
const twoPlayersLocalBtn = document.getElementById("2-players-local");
const twoPlayersOnlineBtn = document.getElementById("2-players-online");

function hide() {
  this.style.display = "none";
  rootEl.removeChild(this);
}

function show() {
  this.style.display = "flex";
  rootEl.appendChild(this);
}

mainScreenEl.hide = hide;
mainScreenEl.show = show;
roomJoinScreenEl.hide = hide;
roomJoinScreenEl.show = show;

roomJoinScreenEl.hide();

const baseClientConfig = {
  animationDuration: 0.3,
  boardSize: 3,
  renderRoot: rootEl,
  roomid: "tic-tac-toe",
};

const handleShowMainScreen = () => {
  roomNameInput.value = "";
  mainScreenEl.show();
};

const handleInitLocalClient = (players = 1) => {
  const client = new OfflineTicTacToe({
    ...baseClientConfig,
    players,
  });

  mainScreenEl.hide();
  client.init();
  client.onQuit(handleShowMainScreen);
};

onePlayerCpuBtn.addEventListener("click", () => handleInitLocalClient(1));

twoPlayersLocalBtn.addEventListener("click", () => handleInitLocalClient(2));

twoPlayersOnlineBtn.addEventListener("click", () => {
  mainScreenEl.hide();
  roomJoinScreenEl.show();
});

backBtn.addEventListener("click", () => {
  roomJoinScreenEl.hide();
  mainScreenEl.show();
});

roomNameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!roomNameInput.value.trim()) return;

  const client = new OnlineTicTacToe({
    ...baseClientConfig,
    players: 2,
    roomid: roomNameInput.value,
  });

  roomJoinScreenEl.hide();
  client.init(handleShowMainScreen);

  client.onQuit(handleShowMainScreen);
  client.onDisconnect(handleShowMainScreen);
});
