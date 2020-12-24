// @flow
const socketio = require("socket.io");

const log = console.log.bind(console);
const error = console.error.bind(console);

const sockets = {};

type InitSocketio = (?http$Server) => void;

const initSocketio: InitSocketio = (server) => {
  if (!server) {
    throw new Error("Socketio requires server");
  }

  const io = socketio(server);

  function addSocket(auth, socket) {
    if (!sockets[auth]) sockets[auth] = [];
    if (sockets[auth].indexOf(socket) === -1) {
      sockets[auth].push(socket);
    }
  }

  io.on("connection", (socket) => {
    log("Socketio incomming connection");
    socket.emit("authRequest");
    socket.on("authorize", (auth) => {
      log("Socketio authorization requested", auth);
      addSocket(auth, socket);
      socket.emit("authorized", auth);
    });
  });
};

type SendSubtitleType = ({| auth: string, subtitle: string |}) => number;

const sendSubtitle: SendSubtitleType = ({ auth, subtitle }) => {
  let connected = 0;
  if (sockets[auth]) {
    connected = sockets[auth].length;
    sockets[auth].forEach((socket) => {
      socket.emit("subtitle", { original: subtitle });
    });
  }
  return connected;
};

module.exports = { initSocketio, sendSubtitle };
