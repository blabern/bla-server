// TODO this is supposed to be only for dev
require("flow-remove-types/register");

const express = require("express");
const { Server } = require("http");
const { initMongoDb } = require("./mongodb");
const { initRoutes } = require("./routes");
const { initSocketio } = require("./socketio");

const app = express();
const server = Server(app);

const port = process.env.PORT || 3000;
const log = console.log.bind(console);
const error = console.error.bind(console);

server.listen(port, () => {
  log("Listening on port", port);
});

initRoutes(app);

initSocketio(server);

initMongoDb();
