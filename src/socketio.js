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

  function removeSocket(auth, socket) {
    if (!sockets[auth]) return;
    const index = sockets[auth].indexOf(socket);
    if (index !== -1) {
      sockets[auth].splice(index, 1);
    }
  }

  io.on("connection", (socket) => {
    log("Socketio incomming connection");
    socket.emit("authRequest");
    socket.on("authorize", (auth) => {
      log("Socketio authorization requested", auth);
      addSocket(auth, socket);
      socket.emit("authorized", auth);

      socket.on("disconnect", () => {
        log("Socketio client disconnected");
        removeSocket(auth, socket);
      });
    });
  });
};

type SendSubtitleType = ({| auth: string, subtitle: string |}) => number;

const sendSubtitle: SendSubtitleType = ({ auth, subtitle }) => {
  if (sockets[auth]) {
    sockets[auth].forEach((socket) => {
      socket.emit("subtitle", { original: subtitle });
    });
  }

  return getConnectedClients(auth);
};

type GetConnectedClientsType = (string) => number;

const getConnectedClients: GetConnectedClientsType = (auth) => {
  return sockets[auth] ? sockets[auth].length : 0;
};

type GetStatsType = () => {| connected: { string: number } |};

const getStats: GetStatsType = () => {
  const connected = {};
  for (const auth in sockets) {
    connected[auth] = sockets[auth].length;
  }
  return { connected };
};

module.exports = { initSocketio, sendSubtitle, getConnectedClients, getStats };
