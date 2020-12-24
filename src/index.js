// @flow
// TODO this is supposed to be only for dev
require("flow-remove-types/register");

const express = require("express");
const { Server } = require("http");
const { initMongoDb } = require("./mongodb");
const { initRoutes } = require("./routes");
const { initSocketio } = require("./socketio");

const app = express();

const port = process.env.PORT || 3000;
const log = console.log.bind(console);
const error = console.error.bind(console);

initRoutes(app);

const server = app.listen(port, () => {
  log("Listening on port", port);
});

initSocketio(server);

initMongoDb();
