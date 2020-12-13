var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var translate = require("./translate");

var port = process.env.PORT || 3000;
var log = console.log.bind(console);
var error = console.error.bind(console);

var sockets = {};

function addSocket(auth, socket) {
  if (!sockets[auth]) sockets[auth] = [];
  if (sockets[auth].indexOf(socket) === -1) {
    sockets[auth].push(socket);
  }
}

server.listen(port, () => {
  log("Listening on port", port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Ok.");
});

app.all("/*", (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "content-type");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/subtitle", (req, res) => {
  var subtitle = req.body.subtitle;
  var auth = req.query.auth;

  var connected = 0;

  if (sockets[auth]) {
    connected = sockets[auth].length;
    sockets[auth].forEach((socket) => {
      socket.emit("subtitle", { original: subtitle });
    });
  }
  //  log("Subtitle", subtitle);
  res.send({ subtitle: subtitle, connected: connected });
});

app.get("/translation/:langs/:original", (req, res) => {
  var original = req.params.original;
  var langs = req.params.langs.split("-");
  var options = {
    src: langs[0],
    target: langs[1],
  };

  //log("Translating", original);
  translate(original, options, (err, tr) => {
    if (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
    res.send(tr);
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something bad happened.");
});

io.on("connection", (socket) => {
  log("Incomming connection.");
  socket.emit("authRequest");
  socket.on("authorize", function (auth) {
    addSocket(auth, socket);
    socket.emit("authorized", auth);
  });
});
