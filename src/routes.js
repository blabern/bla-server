const bodyParser = require("body-parser");
const translation = require("./translation");
const socketio = require("./socketio");
const user = require("./user");

const log = console.log.bind(console);
const error = console.error.bind(console);

exports.initRoutes = (app) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    res.send("Ok.");
  });

  app.all("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "content-type, authorization");
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  app.post("/subtitle", (req, res) => {
    const subtitle = req.body.subtitle;
    // We used to send query.auth, but it doesn't work with "+" chars and probably others,
    // and we started to use email as auth.
    const auth = req.query.auth || req.body.auth;
    const connected = socketio.sendSubtitle({ auth, subtitle });
    res.send({ subtitle: subtitle, connected: connected });
  });

  // TODO add oauth token validation middleware here

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

  app.post("/user", async (req, res) => {
    try {
      const data = await user.update(req.body);
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
