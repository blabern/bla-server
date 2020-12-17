const bodyParser = require("body-parser");
const translation = require("./translation");
const socketio = require("./socketio");
const user = require("./user");
const features = require("./features");
const history = require("./history");
const purchase = require("./purchase");

const log = console.log.bind(console);
const error = console.error.bind(console);

exports.initRoutes = (app) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    req.state = {
      userId: req.get("x-user-id"),
    };
    next();
  });
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "content-type, authorization, x-user-id"
    );
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,DELETE");
    next();
  });

  app.get("/", (req, res) => {
    res.send("Ok.");
  });

  app.post("/purchase/:hookName", async (req, res) => {
    try {
      const data = await purchase.create(req.params.hookName, req.body);
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  // TODO add oauth token validation middleware here

  app.put("/user", async (req, res) => {
    try {
      const data = await user.update(req.body);
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  app.post("/subtitle", (req, res) => {
    const { subtitle } = req.body;
    // We used to send query.auth, but it doesn't work with "+" chars and probably others,
    // and we started to use email as auth.
    const auth = req.query.auth || req.body.auth;
    const connected = socketio.sendSubtitle({ auth, subtitle });
    res.send({ subtitle: subtitle, connected: connected });
  });

  app.get("/translation/:langs/:original", (req, res) => {
    const original = req.params.original;
    const langs = req.params.langs.split("-");
    const options = {
      src: langs[0],
      target: langs[1],
    };

    //log("Translating", original);
    translation.translate(original, options, (err, tr) => {
      if (err) {
        error(err);
        return res.status(400).send({ error: err.message });
      }
      res.send(tr);
    });
  });

  app.get("/features", async (req, res) => {
    try {
      const data = await features.get();
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  app.post("/history", async (req, res) => {
    try {
      const data = await history.create({
        userId: req.state.userId,
        ...req.body,
      });
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  app.get("/history", async (req, res) => {
    try {
      const data = await history.read(req.state.userId);
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  app.put("/history/:id", async (req, res) => {
    try {
      const data = await history.update(req.params.id, req.body);
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  app.delete("/history/:ids", async (req, res) => {
    try {
      const data = await history.delete(req.params.ids.split(","));
      res.send(data);
    } catch (err) {
      error(err);
      return res.status(400).send({ error: err.message });
    }
  });

  // Should always be the last.
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something bad happened.");
  });
};
