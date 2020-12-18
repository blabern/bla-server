const { connect, connection, model } = require("mongoose");

const log = console.log.bind(console);
const error = console.error.bind(console);
const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_DATABASE } = process.env;

const initMongoDb = () => {
  connect(
    `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@lingvotv.ujzta.mongodb.net/${MONGODB_DATABASE}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  connection.on("error", (err) => {
    error("MongoDB connection error", err);
  });

  connection.once("open", () => {
    log("MongoDB connection open");
  });
};

module.exports = { initMongoDb };
